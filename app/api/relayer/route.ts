import path from 'path';
import fs from 'fs';
import { Keypair } from '@solana/web3.js';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

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

export async function POST(request: Request) {
    const relayerKeypair = loadKeypair();

    console.log(relayerKeypair.publicKey.toBase58(), 'relayer-accountttt');

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

    return NextResponse.json({ existingRelayer: existingRelayer });
}
