import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { PublicKey } from '@solana/web3.js';

export async function POST(request: Request) {
    const body = await request.json();
    const { walletAddress }: { walletAddress: string } = body;

    console.log(walletAddress);

    // Connect to Supabase with service role key for admin privileges
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

    if (!walletAddress) {
        return NextResponse.json({ error: 'Wallet address is required' }, { status: 400 });
    }

    const walletAddressPublicKey = new PublicKey(walletAddress);
    const walletAddressBytes = walletAddressPublicKey.toBuffer();

    try {
        const { data, error } = await supabase
            .from('umbra_users') // Replace with your actual table name
            .select('user_wallet_address')
            .eq('user_wallet_address', walletAddressBytes) // Replace with your actual column name
            .maybeSingle();

        if (error) throw error;

        return NextResponse.json({ exists: !!data });
    } catch (error) {
        console.error('Error checking wallet:', error);
        return NextResponse.json({ error: 'Failed to check wallet' }, { status: 500 });
    }
}
