import { NextResponse } from 'next/server';
import relayerStore from './relayerList';

export function GET(request: Request) {
    return NextResponse.json({ relayerList: relayerStore.getAllRelayers() });
}
