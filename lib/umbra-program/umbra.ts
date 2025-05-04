import { PublicKey, Signer, Transaction } from '@solana/web3.js';
import { UMBRA_PDA_DERIVATION_SEED, UMBRA_USER_ACCOUNT_DERIVATION_SEED } from '../constants';
import { Program } from '@coral-xyz/anchor';
import { UmbraOnchain } from './umbra_onchain';
import { getConnection, getDevnetConnection } from '../utils';
import { useWallet } from '@solana/wallet-adapter-react';

export async function createUserAccount(
    program: Program<UmbraOnchain>,

    signer: PublicKey,
    relayerAccountAddress: PublicKey,
    umbraAddress: Buffer,
    encryptionPublicKey: Buffer,

    clientSidePublicKey: PublicKey,
): Promise<Transaction> {
    // Basic validation for input lengths (matching common public key sizes)
    if (umbraAddress.length !== 32) {
        throw new Error('Invalid umbraAddress length, expected 32 bytes.');
    }
    if (encryptionPublicKey.length !== 32) {
        throw new Error('Invalid encryptionPublicKey length, expected 32 bytes.');
    }

    // Derive the PDA for the user account using the specified seeds and umbra address
    const [userAccountPda] = await PublicKey.findProgramAddress(
        [
            Buffer.from(UMBRA_PDA_DERIVATION_SEED),
            Buffer.from(UMBRA_USER_ACCOUNT_DERIVATION_SEED),
            umbraAddress, // The dynamic part of the seed based on the umbra address
        ],
        program.programId,
    );

    console.log(`Target User Account PDA: ${userAccountPda.toBase58()}`);
    console.log(`Using Relayer Account: ${relayerAccountAddress.toBase58()}`);
    // Construct and send the transaction calling the 'createUserAccount' instruction
    const tx = await program.methods
        // Pass arguments according to the Rust instruction definition.
        // The IDL likely expects struct wrappers like { bytes: ... } for byte arrays.
        .createUserAccount(
            { 0: Array.from(umbraAddress) }, // Corresponds to umbra_address: UmbraAddress
            { 0: Array.from(encryptionPublicKey) }, // Corresponds to encryption_pubkey: X25519PublicKey
        )
        .accounts({
            // Map the accounts required by the CreateUserAccountInstruction struct
            userAccount: userAccountPda, // The PDA derived above
            signer: signer, // The public key of the transaction signer
            relayer: relayerAccountAddress, // The PDA of the relayer account for constraint check
        })
        // The transaction must be signed by the keypair whose public key
        // matches the one stored in the `relayer` account.
        .transaction();

    const connection = getDevnetConnection();
    const recentData = await connection.getLatestBlockhash();
    tx.recentBlockhash = recentData.blockhash;
    tx.lastValidBlockHeight = recentData.lastValidBlockHeight;
    tx.feePayer = clientSidePublicKey;

    return tx;
}
