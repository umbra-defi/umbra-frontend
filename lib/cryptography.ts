import bcrypt from 'bcryptjs';

export async function generateAesKeyFromString(input: string): Promise<CryptoKey> {
    const encoder = new TextEncoder();
    const data = encoder.encode(input);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hash = new Uint8Array(hashBuffer);

    // Import the hash as a raw key for AES-256
    const key = await crypto.subtle.importKey(
        'raw',
        hash,
        { name: 'AES-GCM', length: 256 },
        false,
        ['encrypt', 'decrypt'],
    );

    return key;
}

/**
 * Encrypt data using AES-GCM
 * @param key CryptoKey to use for encryption
 * @param data Data to encrypt
 * @returns Promise resolving to { ciphertext: ArrayBuffer, iv: Uint8Array }
 */
export async function encryptWithAes(
    key: CryptoKey,
    data: ArrayBuffer | string,
): Promise<{ ciphertext: Uint8Array<ArrayBuffer>; iv: Uint8Array }> {
    // Generate a random initialization vector
    const iv = crypto.getRandomValues(new Uint8Array(12));

    // Convert string to ArrayBuffer if needed
    const dataBuffer = typeof data === 'string' ? new TextEncoder().encode(data) : data;

    // Encrypt the data
    const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, dataBuffer);

    return {
        ciphertext: new Uint8Array(ciphertext),
        iv,
    };
}

/**
 * Decrypt data using AES-GCM
 * @param key CryptoKey to use for decryption
 * @param ciphertext Encrypted data
 * @param iv Initialization vector used for encryption
 * @returns Promise resolving to decrypted data as ArrayBuffer
 */
export async function decryptWithAes(
    key: CryptoKey,
    ciphertext: ArrayBuffer,
    iv: Uint8Array,
): Promise<ArrayBuffer> {
    return crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ciphertext);
}

/**
 * Hash a password using bcrypt
 * @param password Plaintext password to hash
 * @param saltRounds Number of salt rounds to use (default: 10)
 * @returns Promise resolving to hashed password
 */
export async function hashPassword(password: string, saltRounds: number = 10): Promise<string> {
    return await bcrypt.hash(password, saltRounds);
}

/**
 * Verify a password against a bcrypt hash
 * @param password Plaintext password to verify
 * @param hash Bcrypt hash to verify against
 * @returns Promise resolving to boolean indicating if password matches hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash);
}

export type X25519PrivateKey = Uint8Array<ArrayBufferLike>;
export type X25519PublicKey = Uint8Array<ArrayBufferLike>;
export type X25519Keypair = {
    privateKey: X25519PrivateKey;
    publicKey: X25519PublicKey;
};
