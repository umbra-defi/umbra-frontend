import { Keypair, PublicKey, Signer, SystemProgram, Transaction } from '@solana/web3.js';
import {
    arciumClusterKey,
    UMBRA_PDA_DERIVATION_SEED,
    UMBRA_TOKEN_ACCOUNT_DERIVATION_SEED,
    UMBRA_USER_ACCOUNT_DERIVATION_SEED,
} from '../constants';
import { BN, Program } from '@coral-xyz/anchor';
import { UmbraOnchain } from './umbra_onchain';
import { getConnection, getDevnetConnection, getUmbraProgram } from '../utils';
import { useWallet } from '@solana/wallet-adapter-react';
import {
    deserializeLE,
    getCompDefAcc,
    getCompDefAccOffset,
    getComputationAcc,
    getExecutingPoolAcc,
    getMempoolAcc,
    getMXEAccAcc,
} from '@arcium-hq/client';

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

    const connection = getConnection();
    const recentData = await connection.getLatestBlockhash();
    tx.recentBlockhash = recentData.blockhash;
    tx.lastValidBlockHeight = recentData.lastValidBlockHeight;
    tx.feePayer = clientSidePublicKey;

    return tx;
}

export async function depositAmount(
    program: Program<UmbraOnchain>,

    relayerPDA: PublicKey,
    userAccountPDA: PublicKey,
    tokenAccountPDA: PublicKey,

    depositAmount: Buffer,
    nonce: Buffer,
    payer: PublicKey,

    computation_offset: BN,

    clientSidePublicKey: PublicKey,
): Promise<Transaction> {
    const compDefOffset = getCompDefAccOffset('deposit_amount');
    const compDefPDA = getCompDefAcc(program.programId, Buffer.from(compDefOffset).readUInt32LE());

    const tx = await program.methods
        .depositAmount(
            { 0: Array.from(depositAmount) },
            { 0: new BN(deserializeLE(Uint8Array.from(nonce)).toString()) },
            computation_offset,
        )
        .accounts({
            relayer: relayerPDA,
            userAccount: userAccountPDA,
            tokenAccount: tokenAccountPDA,
            payer: payer,

            computationAccount: getComputationAcc(program.programId, computation_offset),
            clusterAccount: arciumClusterKey,
            mxeAccount: getMXEAccAcc(program.programId),
            mempoolAccount: getMempoolAcc(program.programId),
            executingPool: getExecutingPoolAcc(program.programId),
            compDefAccount: compDefPDA,
        })
        .transaction();

    const connection = getConnection();
    const recentData = await connection.getLatestBlockhash();
    tx.recentBlockhash = recentData.blockhash;
    tx.lastValidBlockHeight = recentData.lastValidBlockHeight;
    tx.feePayer = clientSidePublicKey;

    return tx;
}

export async function createTokenAccount(
    program: Program<UmbraOnchain>,

    mintAddress: PublicKey,
    balance: Buffer, // Corresponds to RescueCiphertext
    nonce: Buffer, // Corresponds to X25519Nonce

    userAccount: PublicKey,
    relayerAccount: PublicKey,
    signer: PublicKey,
    tokenAccountPDA: PublicKey, // Add the expected PDA as an argument

    clientSidePublicKey: PublicKey,
) {
    // Build the instruction
    const tx = await program.methods
        .createTokenAccount(
            { 0: mintAddress }, // Wrap in expected structure if needed by IDL/Anchor codegen
            { 0: Array.from(balance) }, // Wrap in expected structure if needed
            { 0: new BN(deserializeLE(Uint8Array.from(nonce)).toString()) }, // Convert nonce Buffer to BN with little-endian format
        )
        .accountsStrict({
            userAccount: userAccount,
            tokenAccount: tokenAccountPDA, // Explicitly provide the PDA for the init account
            signer: signer,
            relayer: relayerAccount,
            systemProgram: SystemProgram.programId,
        })
        .transaction();

    const connection = getConnection();
    const recentData = await connection.getLatestBlockhash();
    tx.recentBlockhash = recentData.blockhash;
    tx.lastValidBlockHeight = recentData.lastValidBlockHeight;
    tx.feePayer = clientSidePublicKey;

    return tx;
}

export function getUserAccountPDA(umbraAddress: Buffer): PublicKey {
    const program = getUmbraProgram();
    const [userAccountPda] = PublicKey.findProgramAddressSync(
        [
            Buffer.from(UMBRA_PDA_DERIVATION_SEED),
            Buffer.from(UMBRA_USER_ACCOUNT_DERIVATION_SEED),
            umbraAddress, // The dynamic part of the seed based on the umbra address
        ],
        program.programId,
    );
    return userAccountPda;
}

export function getTokenAccountPDA(userAccountPDA: PublicKey, mintAddress: PublicKey): PublicKey {
    console.log(mintAddress);
    const [tokenAccountPDA, _bump] = PublicKey.findProgramAddressSync(
        [
            Buffer.from(UMBRA_PDA_DERIVATION_SEED),
            Buffer.from(UMBRA_TOKEN_ACCOUNT_DERIVATION_SEED),
            userAccountPDA.toBuffer(),
            mintAddress.toBuffer(),
        ],
        getUmbraProgram().programId,
    );

    console.log(tokenAccountPDA);
    return tokenAccountPDA;
}

export async function transferAmount(
    program: Program<UmbraOnchain>,
    senderUserAccountPDA: PublicKey,
    senderTokenAccountPDA: PublicKey,
    receiverUserAccountPDA: PublicKey,
    receiverTokenAccountPDA: PublicKey,
    transferAmount: Buffer,
    payer: PublicKey,
    computation_offset: BN,
    clientSidePublicKey: PublicKey,
): Promise<Transaction> {
    const compDefOffset = getCompDefAccOffset('transfer_amount');
    const compDefPDA = getCompDefAcc(program.programId, Buffer.from(compDefOffset).readUInt32LE());

    const tx = await program.methods
        .transferAmount({ 0: Array.from(transferAmount) }, computation_offset)
        .accounts({
            senderUserAccount: senderUserAccountPDA,
            tokenAccountSender: senderTokenAccountPDA,
            receiverUserAccount: receiverUserAccountPDA,
            tokenAccountReceiver: receiverTokenAccountPDA,
            payer: payer,

            computationAccount: getComputationAcc(program.programId, computation_offset),
            clusterAccount: arciumClusterKey,
            mxeAccount: getMXEAccAcc(program.programId),
            mempoolAccount: getMempoolAcc(program.programId),
            executingPool: getExecutingPoolAcc(program.programId),
            compDefAccount: compDefPDA,
        })
        .transaction();

    const connection = getConnection();
    const recentData = await connection.getLatestBlockhash();
    tx.recentBlockhash = recentData.blockhash;
    tx.lastValidBlockHeight = recentData.lastValidBlockHeight;
    tx.feePayer = clientSidePublicKey;

    return tx;
}

export async function withdrawAmount(
    program: Program<UmbraOnchain>,
    userAccountPDA: PublicKey,
    tokenAccountPDA: PublicKey,
    withdrawalAmount: Buffer,
    nonce: Buffer,
    payer: PublicKey,
    computation_offset: BN,
    clientSidePublicKey: PublicKey,
    relayerPDA: PublicKey,
): Promise<Transaction> {
    const compDefOffset = getCompDefAccOffset('withdraw_amount');
    const compDefPDA = getCompDefAcc(program.programId, Buffer.from(compDefOffset).readUInt32LE());

    const tx = await program.methods
        .withdrawAmount(
            { 0: Array.from(withdrawalAmount) },
            { 0: new BN(deserializeLE(Uint8Array.from(nonce)).toString()) },
            computation_offset,
        )
        .accounts({
            withdrawerUserAccount: userAccountPDA,
            withdrawerTokenAccount: tokenAccountPDA,
            payer: payer,
            relayer: relayerPDA,

            computationAccount: getComputationAcc(program.programId, computation_offset),
            clusterAccount: arciumClusterKey,
            mxeAccount: getMXEAccAcc(program.programId),
            mempoolAccount: getMempoolAcc(program.programId),
            executingPool: getExecutingPoolAcc(program.programId),
            compDefAccount: compDefPDA,
        })
        .transaction();

    const connection = getConnection();
    const recentData = await connection.getLatestBlockhash();
    tx.recentBlockhash = recentData.blockhash;
    tx.lastValidBlockHeight = recentData.lastValidBlockHeight;
    tx.feePayer = clientSidePublicKey;

    return tx;
}
