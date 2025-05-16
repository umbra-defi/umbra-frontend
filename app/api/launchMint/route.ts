import { Connection, Keypair, LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';
import { createMint, getOrCreateAssociatedTokenAccount, mintTo, getMint } from '@solana/spl-token';
import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import {
    UMBRA_ASSOCIATED_TOKEN_ACCOUNT_DERIVATION_SEED,
    UMBRA_PDA_DERIVATION_SEED,
} from '@/lib/constants';
import { getUmbraProgram } from '../relayer/setup/route';

export type CreateMintPostRequestBody = {
    amountToMint: number;
    mintAddressOnMainnet: string;
    mintTicker: string;
    recipient?: string; // Public key of recipient for minted tokens
};

// Function to load keypair from a file
function loadKeypair(): Keypair {
    try {
        // Path to your keypair file (keep this secure and outside public directories
        const mintAuthorityEnv = process.env.MINT_AUTHORITY;
        if (!mintAuthorityEnv) {
            throw new Error('MINT_AUTHORITY environment variable is not set');
        }
        const keypairData = JSON.parse(mintAuthorityEnv);
        // const keypairPath = path.resolve(process.cwd(), 'private', 'mint-authority.json');
        // const keypairData = JSON.parse(fs.readFileSync(keypairPath, 'utf-8'));
        return Keypair.fromSecretKey(new Uint8Array(keypairData));
    } catch (error) {
        console.error('Error loading keypair:', error);
        throw new Error('Failed to load keypair');
    }
}

// Initialize Supabase client
function initSupabase() {
    const supabaseUrl =
        process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://frfrwohcdmwwtpcibcqh.supabase.co';
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseServiceKey) {
        throw new Error('Missing Supabase service role key');
    }

    return createClient(supabaseUrl, supabaseServiceKey);
}

async function updateTokenListOnDb(
    mintAddress: string,
    mintTicker: string,
    userWalletAddress: string,
) {
    try {
        const supabase = initSupabase();

        await supabase.from('new_users_table').upsert(
            {
                user_wallet_address: userWalletAddress,
            },
            {
                onConflict: 'user_wallet_address',
                ignoreDuplicates: true,
            },
        );

        const { data, error } = await supabase
            .from('new_users_table')
            .select('encrypted_token_list')
            .eq('user_wallet_address', userWalletAddress)
            .single();

        if (error) {
            console.error('Error fetching user record:', error);
            throw error;
        }

        // Prepare the new token entry
        const newTokenEntry = {
            mintAddress,
            ticker: mintTicker,
        };

        let updatedTokenList;

        // If token list exists, add to it, otherwise create new one
        if (data?.encrypted_token_list) {
            try {
                const currentTokenList = data.encrypted_token_list;
                updatedTokenList = Array.isArray(currentTokenList)
                    ? currentTokenList.some(
                          (token) => token.mintAddress === newTokenEntry.mintAddress,
                      )
                        ? currentTokenList
                        : [...currentTokenList, newTokenEntry]
                    : [newTokenEntry];
            } catch (e) {
                // If JSON parsing fails, create new array
                updatedTokenList = [newTokenEntry];
            }
        } else {
            // Create new array if no existing data
            updatedTokenList = [newTokenEntry];
        }

        // Update the user record
        const { error: updateError } = await supabase
            .from('new_users_table')
            .update({ encrypted_token_list: updatedTokenList })
            .eq('user_wallet_address', userWalletAddress);

        if (updateError) {
            console.error('Error updating token list:', updateError);
            throw updateError;
        }

        return true;
    } catch (error) {
        console.error('Error updating token list in DB:', error);
        throw error;
    }
}

// Add token to the token_list table
async function addToTokenListTable(
    mintAddressOnMainnet: string,
    mintAddressOnDevnet: string,
    mintTickerSymbol: string,
) {
    try {
        const supabase = initSupabase();

        // Insert into token_list table
        const { error } = await supabase.from('token_list').upsert(
            {
                mint_address_on_mainnet: mintAddressOnMainnet,
                mint_address_on_devnet: mintAddressOnDevnet,
                mint_ticker_symbol: mintTickerSymbol,
            },
            { onConflict: 'mint_address_on_mainnet' },
        );

        if (error) {
            console.error('Error inserting into token_list:', error);
            throw error;
        }

        return true;
    } catch (error) {
        console.error('Error updating token_list table:', error);
        throw error;
    }
}

export async function createLaunchAndMintTokens(
    amountToMint: number,
    mintAddressOnMainnet: string,
    mintTicker: string,
    recipient: string,
) {
    try {
        // Load payer keypair from file (never expose this in requests)
        const payerKeypair = loadKeypair();

        // Create connection to Solana networks
        const mainnetConnection = new Connection(
            process.env.SOLANA_MAINNET_RPC_URL || 'https://api.mainnet-beta.solana.com',
            'confirmed',
        );

        const devnetConnection = new Connection(
            process.env.NEXT_PUBLIC_HELIUS_URL || 'https://api.devnet.solana.com',
            'confirmed',
        );

        // Check if token already exists in token_list table
        const supabase = initSupabase();
        const { data: existingToken, error: fetchError } = await supabase
            .from('token_list')
            .select('mint_address_on_devnet')
            .eq('mint_address_on_mainnet', mintAddressOnMainnet)
            .single();

        if (fetchError && fetchError.code !== 'PGRST116') {
            console.error('Error checking for existing token:', fetchError);
            throw fetchError;
        }

        let mintAddress: PublicKey;
        console.log(existingToken);

        if (existingToken?.mint_address_on_devnet) {
            // Use existing devnet mint address
            mintAddress = new PublicKey(existingToken.mint_address_on_devnet);
            console.log('Using existing devnet mint:', mintAddress.toBase58());
        } else {
            // Get the original mint info from mainnet
            const mainnetMintPubkey = new PublicKey(mintAddressOnMainnet);
            const mainnetMintInfo = await getMint(mainnetConnection, mainnetMintPubkey);

            // Create a new mint on devnet with the same properties
            mintAddress = await createMint(
                devnetConnection,
                payerKeypair,
                payerKeypair.publicKey, // Mint authority
                payerKeypair.publicKey, // Freeze authority
                mainnetMintInfo.decimals, // Use the same decimals as the mainnet token
            );

            const [umbraPDA, _bump] = PublicKey.findProgramAddressSync(
                [
                    Buffer.from(UMBRA_PDA_DERIVATION_SEED),
                    Buffer.from(UMBRA_ASSOCIATED_TOKEN_ACCOUNT_DERIVATION_SEED),
                    mintAddress.toBuffer(),
                ],
                getUmbraProgram(payerKeypair).programId,
            );

            const umbraTokenAccount = await getOrCreateAssociatedTokenAccount(
                devnetConnection,
                payerKeypair,
                mintAddress,
                umbraPDA,
                true,
                'confirmed',
                {
                    commitment: 'confirmed',
                },
            );

            await mintTo(
                devnetConnection,
                payerKeypair,
                mintAddress,
                umbraTokenAccount.address,
                payerKeypair,
                1 * 10 ** mainnetMintInfo.decimals,
            );

            // Add entry to token_list table
            await addToTokenListTable(mintAddressOnMainnet, mintAddress.toBase58(), mintTicker);
        }

        // If recipient is provided, mint tokens to them
        if (amountToMint >= 0 && recipient) {
            const recipientPubkey = new PublicKey(recipient);

            // Get mainnet mint info for decimals (needed for both new and existing mints)
            const mainnetMintPubkey = new PublicKey(mintAddressOnMainnet);
            const mainnetMintInfo = await getMint(mainnetConnection, mainnetMintPubkey);

            console.log('Here');
            // Get or create an Associated Token Account for the recipient
            const recipientTokenAccount = await getOrCreateAssociatedTokenAccount(
                devnetConnection,
                payerKeypair,
                mintAddress,
                recipientPubkey,
                false,
                'confirmed',
                {
                    commitment: 'confirmed',
                },
            );
            console.log('here');

            // Mint tokens to the recipient's token account
            await mintTo(
                devnetConnection,
                payerKeypair,
                mintAddress,
                recipientTokenAccount.address,
                payerKeypair,
                amountToMint * 10 ** mainnetMintInfo.decimals,
            );

            // Update the token list in the database if there's a recipient
            if (recipient) {
                // Extract token ticker from the mainnet mint address (simplified)
                // In a real application, you might want to fetch this from a token registry
                const tokenTicker = mintTicker;
                // Update the database with the new token
                await updateTokenListOnDb(mintAddress.toBase58(), tokenTicker, recipient);
            }
        }

        // Return the mint address
        return Response.json({
            success: true,
            mintAddress: mintAddress.toBase58(),
            isNewMint: !existingToken?.mint_address_on_devnet,
            decimals: (await getMint(devnetConnection, mintAddress)).decimals,
        });
    } catch (error) {
        console.error('Error creating mint:', error);
        return Response.json(
            {
                success: false,
                error: error,
            },
            { status: 500 },
        );
    }
}

export async function POST(request: Request) {
    const body: CreateMintPostRequestBody = await request.json();
    const { amountToMint, mintAddressOnMainnet, mintTicker, recipient } = body;
    return createLaunchAndMintTokens(amountToMint, mintAddressOnMainnet, mintTicker, recipient!);
}
