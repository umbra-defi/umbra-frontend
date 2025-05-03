import { encryptWithAes, generateAesKeyFromString, hashPassword } from '@/lib/cryptography';
import { UmbraDatabaseSchema } from '@/lib/utils';
import { x25519 } from '@arcium-hq/client';
import { PublicKey } from '@solana/web3.js';
import { createClient } from '@supabase/supabase-js';
import { hash } from 'bcryptjs';

export type X25519PrivateKey = Uint8Array<ArrayBufferLike>;
export type X25519PublicKey = Uint8Array<ArrayBufferLike>;
export type X25519Keypair = {
    privateKey: X25519PrivateKey;
    publicKey: X25519PublicKey;
};

export function generateX25519Keypair(): X25519Keypair {
    const x25519PrivKey = x25519.utils.randomPrivateKey();
    const x25519PublicKey = x25519.getPublicKey(x25519PrivKey);

    return {
        privateKey: x25519PrivKey,
        publicKey: x25519PublicKey,
    };
}

export type UmbraAddress = Uint8Array<ArrayBuffer>;

export function generateUmbraAddress(): UmbraAddress {
    const randomBytes = new Uint8Array(32);
    crypto.getRandomValues(randomBytes);
    return randomBytes;
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
