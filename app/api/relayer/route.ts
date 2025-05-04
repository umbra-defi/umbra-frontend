import { NextResponse } from 'next/server';
import relayerStore from './relayerList';
import { createClient } from '@supabase/supabase-js';
import path from 'path';
import { Keypair } from '@solana/web3.js';
import fs from 'fs';

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

export async function GET(request: Request) {
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

    const relayerKeypair = loadKeypair();

    const { data: existingRelayer, error: checkError } = await supabase
        .from('relayers')
        .select('public_key, pda_address, associated_token, uuid')
        .eq('public_key', relayerKeypair.publicKey.toBase58())
        .maybeSingle();

    return NextResponse.json({ existingRelayer });
}
