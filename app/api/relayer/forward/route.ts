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

// CORS preflight handler
export async function OPTIONS() {
    return new Response(null, {
        status: 204,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        },
    });
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
    relayerCreatedTransaction.partialSign(relayerKeypair);
    const signature = await sendUpdatedTransaction(relayerCreatedTransaction);
    return NextResponse.json({ signature });
}
