import { decryptWithAes, hashPassword } from '@/lib/cryptography';
import {
    Aes256EncryptedData,
    UmbraAddress,
    X25519Keypair,
    X25519PrivateKey,
} from '@/app/auth/signup/utils';
import { x25519 } from '@arcium-hq/client';

export async function tryLogin(walletAddress: string, password: string) {
    try {
        const response = await fetch(`/api/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                walletAddress,
                hashedPassword: await hashPassword(password),
            }),
        });

        if (!response.ok) {
            console.error('Network response was not ok');
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error checking wallet:', error);
        return false;
    }
}

export async function deserializeDecryptedData(
    decryptedDataBuffer: ArrayBuffer,
): Promise<{ userPrivateKey: X25519PrivateKey; umbraAddress: UmbraAddress }> {
    // Decrypt the combined data
    const decryptedData = new Uint8Array(decryptedDataBuffer);

    // Split the data back into userPrivateKey and umbraPrivateKey (both 32 bytes)
    const userPrivateKey = decryptedData.slice(0, 32);
    const umbraAddress = decryptedData.slice(32, 64);

    return {
        userPrivateKey,
        umbraAddress,
    };
}

export async function decryptUserInformationWithAesKey(
    encrypted_data: string,
    aesKey: CryptoKey,
): Promise<{ x25519Keypair: X25519Keypair; umbraAddress: UmbraAddress }> {
    const encryptedBytes = Uint8Array.from(Buffer.from(encrypted_data, 'hex'));
    console.log(encryptedBytes);
    const convertBytesToAesEncryptedData = (combinedBytes: Uint8Array): Aes256EncryptedData => {
        // AES-256 uses a 16-byte (128-bit) IV
        const ivLength = 12;
        const ciphertextLength = combinedBytes.length - ivLength;

        // Extract the ciphertext (comes first in the combined array)
        const ciphertext = combinedBytes.slice(0, ciphertextLength);

        // Extract the IV (comes after the ciphertext)
        const iv = combinedBytes.slice(ciphertextLength);

        return {
            ciphertext,
            iv,
        };
    };

    const { ciphertext, iv } = convertBytesToAesEncryptedData(encryptedBytes);
    const decryptedBytes = await decryptWithAes(aesKey, ciphertext.buffer, iv);
    const { userPrivateKey, umbraAddress } = await deserializeDecryptedData(decryptedBytes);
    const x25519PublicKey = x25519.getPublicKey(userPrivateKey);

    const x25519Keypair: X25519Keypair = {
        privateKey: userPrivateKey,
        publicKey: x25519PublicKey,
    };

    return { x25519Keypair, umbraAddress };
}
