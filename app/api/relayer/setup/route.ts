import { Keypair, LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';
import path from 'path';
import fs from 'fs';
import { NextResponse } from 'next/server';
import { UmbraOnchain } from '@/lib/umbra-program/umbra_onchain';
import { AnchorProvider, BN, Program } from '@coral-xyz/anchor';
import { getConnection } from '@/lib/utils';
import { UMBRA_PDA_DERIVATION_SEED, UMBRA_RELAYER_ACCOUNT_DERIVATION_SEED } from '@/lib/constants';
import { v4 as uuidv4 } from 'uuid';
import relayerStore from '../relayerList';
import umbraOnChainIDL from '@/lib/umbra-program/umbra_onchain.json';
import NodeWallet from '@coral-xyz/anchor/dist/cjs/nodewallet';
import { createClient } from '@supabase/supabase-js';

export function getUmbraProgram(anchorWalletKeypair: Keypair) {
    let wallet = new NodeWallet(anchorWalletKeypair);

    const program = new Program<UmbraOnchain>(
        umbraOnChainIDL,
        new AnchorProvider(getConnection(), wallet),
    );
    return program;
}

// Function to load keypair from a file
function loadKeypair(): Keypair {
    try {
        // Path to your keypair file (keep this secure and outside public directories)
        const relayerKeypairData = process.env.RELAYER_KEY;
        if (!relayerKeypairData) {
            throw new Error('RELAYER_KEY environment variable is not set');
        }
        const keypairData = JSON.parse(relayerKeypairData);
        // const keypairPath = path.resolve(process.cwd(), 'private', 'relayer.json');
        // const keypairData = JSON.parse(fs.readFileSync(keypairPath, 'utf-8'));
        return Keypair.fromSecretKey(new Uint8Array(keypairData));
    } catch (error) {
        console.error('Error loading keypair:', error);
        throw new Error('Failed to load keypair');
    }
}

let alreadySetup = false;

async function createRelayer(
    program: Program<UmbraOnchain>,

    relayerKeypair: Keypair,
    relayerFee: BN,
    associatedToken: PublicKey,
    unique_identifier: Buffer,
): Promise<PublicKey> {
    // Calculate the PDA for the relayer account with the hash as a seed
    const [relayerPDA] = PublicKey.findProgramAddressSync(
        [
            Buffer.from(UMBRA_PDA_DERIVATION_SEED),
            Buffer.from(UMBRA_RELAYER_ACCOUNT_DERIVATION_SEED),
            unique_identifier, // Add the hash buffer as an additional seed
        ],
        program.programId,
    );

    // Convert the buffer to hex for logging
    const hashHex = unique_identifier.toString('hex');
    console.log('Creating relayer at:', relayerPDA.toString());
    console.log('Using hash buffer (hex):', hashHex);

    // Call the create_relayer instruction
    const sig = await program.methods
        .createRelayer(
            { 0: relayerKeypair.publicKey }, // WalletPublicKey expects a PublicKey
            { 0: relayerFee }, // RelayerFee expects a BN
            { 0: associatedToken }, // MintAddress expects a PublicKey
            { 0: Array.from(unique_identifier) }, // Pass the hash buffer as bytes array
        )
        .accounts({
            relayer: relayerPDA,
            signer: relayerKeypair.publicKey,
        })
        .signers([relayerKeypair])
        .rpc({
            commitment: 'confirmed',
            preflightCommitment: 'confirmed',
        });

    console.log('Relayer created with signature:', sig);

    return relayerPDA;
}

export type RelayerSetupBody = {
    relayerFee: number;
    relayerAssociatedToken: string;
};

export async function POST(request: Request) {
    const relayerKeypair = loadKeypair();

    const supabaseUrl =
        process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://frfrwohcdmwwtpcibcqh.supabase.co';
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseServiceKey) {
        return NextResponse.json(
            { error: 'Server configuration error: Missing service role key' },
            { status: 500 },
        );
    }
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { data: existingRelayer, error: checkError } = await supabase
        .from('relayers')
        .select('*')
        .eq('public_key', relayerKeypair.publicKey.toBase58())
        .maybeSingle();
    console.log(existingRelayer);
    if (existingRelayer) {
        return NextResponse.json({ error: 'Already Exists!' });
    }

    const program = getUmbraProgram(relayerKeypair);

    const body: RelayerSetupBody = await request.json();
    const unique_identifier = Buffer.from(crypto.getRandomValues(new Uint8Array(32)));

    const relayerFeeBN = new BN(body.relayerFee);
    const relayerAssociatedTokenPublicKey = new PublicKey(body.relayerAssociatedToken);

    const relayerPDA = await createRelayer(
        program,
        relayerKeypair,
        relayerFeeBN,
        relayerAssociatedTokenPublicKey,
        unique_identifier,
    );

    const unique_identifier_string = unique_identifier.toString('hex');
    relayerStore.addRelayer({
        pdaAddress: relayerPDA,
        id: unique_identifier_string,
        publicKey: relayerKeypair.publicKey,
    });

    await supabase.from('relayers').insert({
        public_key: relayerKeypair.publicKey.toBase58(),
        pda_address: relayerPDA.toBase58(),
        associated_token: relayerAssociatedTokenPublicKey.toBase58(),
        uuid: unique_identifier_string,
    });

    return NextResponse.json({ unique_identifier_string, relayerPDA });
}
