import {
    encryptWithAes,
    generateAesKeyFromString,
    hashPassword,
    X25519Keypair,
    X25519PrivateKey,
    X25519PublicKey,
} from '@/lib/cryptography';
import { createUserAccount } from '@/lib/umbra-program/umbra';
import { getMainnetConnection, getTokenBalance, getUmbraProgram } from '@/lib/utils';
import { x25519 } from '@arcium-hq/client';
import { PublicKey, Transaction } from '@solana/web3.js';
import { tokens } from '@/lib/constants';

export function generateX25519Keypair(umbraAddress: UmbraAddress): X25519Keypair {
    // const x25519PrivKey = x25519.utils.randomPrivateKey();
    const x25519PrivKey = x25519.scalarMultBase(umbraAddress);
    const x25519PublicKey = x25519.getPublicKey(x25519PrivKey);

    return {
        privateKey: x25519PrivKey,
        publicKey: x25519PublicKey,
    };
}

export type UmbraAddress = Uint8Array<ArrayBuffer>;

export async function generateUmbraAddress(
    signer: (message: Uint8Array) => Promise<Uint8Array>,
): Promise<UmbraAddress> {
    const message = new TextEncoder().encode('UmbraPrivacy');
    const signature = await signer(message);
    // Ed25519 signatures are 64 bytes, but UmbraAddress expects 32 bytes. We'll use the first 32 bytes.
    // If you want to hash instead, replace this with a hash function.
    return signature.slice(0, 32);
}

export async function generateAesKey(password: string): Promise<CryptoKey> {
    return await generateAesKeyFromString(password);
}

export type Aes256Ciphertext = Uint8Array<ArrayBuffer>;
export type InitializationVector = Uint8Array<ArrayBufferLike>;

export type Aes256EncryptedData = { ciphertext: Aes256Ciphertext; iv: InitializationVector };

export async function encryptUserInformationWithAesKey(
    userPrivateKey: X25519PrivateKey,
    umbraPrivateKey: UmbraAddress,
    aesKey: CryptoKey,
): Promise<Aes256EncryptedData> {
    // Concatenate the two arrays
    const combinedData = new Uint8Array(userPrivateKey.length + umbraPrivateKey.length);
    combinedData.set(userPrivateKey);
    combinedData.set(umbraPrivateKey, userPrivateKey.length);

    // Encrypt the combined data
    return await encryptWithAes(aesKey, combinedData.buffer);
}

export async function pushRegistrationToUmbraBackend(
    walletAddress: PublicKey,
    password: string,
    aesEncryptedData: Aes256EncryptedData,
) {
    // Helper Function Definitions
    const convertAesEncryptedDataToBytes = (aesEncryptedData: Aes256EncryptedData) => {
        const ciphertext = aesEncryptedData.ciphertext;
        const iv = aesEncryptedData.iv;

        const combinedLength = ciphertext.length + iv.length;
        const combinedBytes = new Uint8Array(combinedLength);
        combinedBytes.set(ciphertext);
        combinedBytes.set(iv, ciphertext.length);
        return combinedBytes;
    };

    try {
        // Convert the wallet address to a string representation that can be sent over JSON
        const walletAddressStr = walletAddress.toBase58();
        const aesEncryptedDataAsBytes = convertAesEncryptedDataToBytes(aesEncryptedData);
        const aesEncryptedDataAsHex = Buffer.from(aesEncryptedDataAsBytes).toString('hex');

        // Call our API endpoint instead of directly using Supabase
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                walletAddress: walletAddressStr,
                hashedPassword: await hashPassword(password),
                aesEncryptedData: aesEncryptedDataAsHex,
            }),
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || 'Failed to register user');
        }

        return result.data;
    } catch (error) {
        console.error('Registration error:', error);
        throw error;
    }
}

export async function checkIfDatabaseEntryExists(walletAddress: string): Promise<boolean> {
    try {
        const response = await fetch(`/api/auth/checkRegistration`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                walletAddress,
            }),
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();
        console.log(data);
        return data.exists;
    } catch (error) {
        console.error('Error checking wallet:', error);
        return false;
    }
}

export async function getFirstRelayer() {
    try {
        const response = await fetch('/api/relayer', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                uuid: crypto.randomUUID(),
            }),
        });

        if (!response.ok) {
            throw new Error('Failed to fetch relayer');
        }

        const relayer = await response.json();
        return {
            publicKey: relayer.existingRelayer.public_key,
            pdaAddress: relayer.existingRelayer.pda_address,
            id: relayer.existingRelayer.uuid,
        };
    } catch (error) {
        console.error('Error fetching relayer:', error);
        throw error;
    }
}

export async function createUserAccountCreationTransaction(
    x25519PublicKey: X25519PublicKey,
    umbraAddress: UmbraAddress,
    connectedWalletAddress: PublicKey,
): Promise<Transaction> {
    const firstRelayer: { publicKey: string; id: string; pdaAddress: string } =
        await getFirstRelayer();

    console.log(firstRelayer);

    const program = getUmbraProgram();
    const tx = await createUserAccount(
        program,
        new PublicKey(firstRelayer.publicKey),
        new PublicKey(firstRelayer.pdaAddress),
        Buffer.from(umbraAddress),
        Buffer.from(x25519PublicKey),
        connectedWalletAddress,
    );

    return tx;
}

export async function sendTransactionToRelayer(tx: Transaction): Promise<Response> {
    const serializedTx = tx.serialize({ requireAllSignatures: false });
    const base64Tx = serializedTx.toString('base64');

    // Send transaction to relayer for forwarding
    try {
        const response = await fetch('/api/relayer/forward', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                transaction: base64Tx,
            }),
        });

        if (!response.ok) {
            throw new Error(`Relayer forwarding failed: ${response.statusText}`);
        }

        return await response;
    } catch (error) {
        throw error;
    }
}

export async function MintTokensToUser(userPublicKey: PublicKey) {
    try {
        const response = await fetch('/api/mintTokens', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userPublicKey: userPublicKey.toBase58() }),
        });

        if (!response.ok) {
            throw new Error(`Failed to mint tokens: ${response.statusText}`);
        }

        return response;
    } catch (error) {
        throw error;
    }
}

export async function fetchTokenList(userPublicKey: PublicKey) {
    try {
        const response = await fetch('/api/tokenList', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ walletAddress: userPublicKey.toBase58() }),
        });

        if (!response.ok) {
            throw new Error(`Failed to mint tokens: ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        throw error;
    }
}
