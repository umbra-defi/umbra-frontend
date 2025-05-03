import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        // Parse the request body
        const body = await request.json();
        const {
            walletAddress,
            hashedPassword,
            aesEncryptedData,
        }: { walletAddress: string; hashedPassword: string; aesEncryptedData: string } = body;

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

        // Prepare data for insertion
        const userData = {
            user_wallet_address: walletAddress,
            password: hashedPassword,
            encrypted_data: aesEncryptedData,
        };

        console.log(userData);

        // Insert into database
        const { data, error } = await supabase.from('umbra_users').insert(userData).select();

        if (error) {
            console.error('Database error:', error);
            return NextResponse.json({ error: error.message }, { status: 400 });
        }

        return NextResponse.json({ success: true, data });
    } catch (error) {
        console.error('Server error:', error);
        return NextResponse.json({ error: 'Failed to process registration' }, { status: 500 });
    }
}
