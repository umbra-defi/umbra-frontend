import { Keypair, PublicKey } from '@solana/web3.js';
import fs from 'fs';

// Path to your keypair JSON file
const keypairPath = './private/mint-authority.json';

try {
    // Read and parse the keypair JSON file
    const keypairData = JSON.parse(fs.readFileSync(keypairPath, 'utf-8'));

    // Create a keypair from the secret key in the JSON file
    const keypair = Keypair.fromSecretKey(new Uint8Array(keypairData));

    // Get and print the public key
    console.log('Public Key:', keypair.publicKey.toString());
} catch (error) {
    console.error('Error:', error);
}
