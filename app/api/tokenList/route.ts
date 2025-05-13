import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    const { walletAddress } = await request.json();

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

    const { data, error } = await supabase
        .from('new_users_table') // Replace with your actual table name
        .select('encrypted_token_list')
        .eq('user_wallet_address', walletAddress) // Replace with your actual column name
        .maybeSingle();

    return NextResponse.json(data);
}
