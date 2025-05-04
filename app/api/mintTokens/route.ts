import { tokens } from '@/lib/constants';
import { getMainnetConnection, getTokenBalance } from '@/lib/utils';
import { createAndMintTokens } from '../launchMint/route';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    const { userPublicKey } = await request.json();
    for (const token of tokens) {
        let amount = undefined;
        try {
            console.log('Trying to get balance for ', userPublicKey, ' at mint ', token.mint);
            amount = await getTokenBalance(getMainnetConnection(), token.mint, userPublicKey);
        } catch (error) {}

        console.log('minting: ', amount);
        createAndMintTokens(amount ? amount : 0, token.mint, token.symbol, userPublicKey);
    }
    return NextResponse.json({});
}
