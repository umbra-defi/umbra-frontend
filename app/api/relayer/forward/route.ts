import { Keypair, LAMPORTS_PER_SOL, Transaction } from '@solana/web3.js';
import path from 'path';
import fs from 'fs';
import { getConnection } from '@/lib/utils';
import { NextResponse } from 'next/server';
import { getUmbraProgram } from '../setup/route';

type requestBody = {
    transaction: string;
};

// Function to load keypair from a file
function loadKeypair(): Keypair {
    try {
        // Path to your keypair file (keep this secure and outside public directories)
        const keypairPath = path.resolve(process.cwd(), 'private', 'relayer.json');
        const keypairData = JSON.parse(fs.readFileSync(keypairPath, 'utf-8'));
        return Keypair.fromSecretKey(new Uint8Array(keypairData));
    } catch (error) {
        console.error('Error loading keypair:', error);
        throw new Error('Failed to load keypair');
    }
}

const relayerKeypair = loadKeypair();

function convertTransactionStringToTransaction(transaction: string) {
    try {
        const transactionBuffer = Buffer.from(transaction, 'base64');
        return Transaction.from(transactionBuffer);
    } catch (error) {
        console.error('Error converting transaction string:', error);
        throw new Error('Invalid transaction string format');
    }
}

function removeSignatureFromTransaction(transaction: Transaction): Transaction {
    const updatedTransaction = new Transaction();
    updatedTransaction.instructions = transaction.instructions;
    updatedTransaction.recentBlockhash = transaction.recentBlockhash;
    updatedTransaction.feePayer = relayerKeypair.publicKey;
    return updatedTransaction;
}

async function sendUpdatedTransaction(transaction: Transaction): Promise<string> {
    const connection = getConnection();
    const signature = await connection.sendRawTransaction(transaction.serialize());
    await connection.confirmTransaction(signature, 'confirmed');
    return signature;
}

export async function POST(request: Request) {
    const body: requestBody = await request.json();
    const receivedTransaction = convertTransactionStringToTransaction(body.transaction);
    const relayerCreatedTransaction = removeSignatureFromTransaction(receivedTransaction);
    const recentDetails = await getConnection().getLatestBlockhash();
    relayerCreatedTransaction.recentBlockhash = recentDetails.blockhash;
    relayerCreatedTransaction.lastValidBlockHeight = recentDetails.lastValidBlockHeight;
    relayerCreatedTransaction.feePayer = relayerKeypair.publicKey;
    console.log(relayerCreatedTransaction);
    relayerCreatedTransaction.sign(relayerKeypair);
    const signature = await sendUpdatedTransaction(relayerCreatedTransaction);
    return NextResponse.json({ signature });
}
