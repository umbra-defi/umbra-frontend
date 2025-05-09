'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Page() {
    const router = useRouter();

    const handleConnect = async () => {
        router.push('/auth/signup')
    };

    return (
        <div
            className="w-full min-h-screen flex flex-col text-white"
            data-oid="0ae9oo:"
        >
            {/* Header */}
            <header
                className="w-full p-6 flex justify-between items-center border-b border-gray-900 bg-black"
                data-oid="169-oi4"
            >
                <div className="text-white font-bold text-xl" data-oid="0dflmx4">
                    UMBRA
                </div>
                <div className="flex items-center gap-4" data-oid="k9zem8w">
                    <Link href="/auth/login" data-oid="4nqdbn8">
                        <button
                            className="text-white border border-gray-900 px-4 py-2 hover:bg-gray-900 transition-colors"
                            data-oid="ssr7wcm"
                        >
                            Login
                        </button>
                    </Link>
                </div>
            </header>

            {/* Main Content */}
            <div className="flex-1 flex items-center justify-center p-4" data-oid="sw.m-sy">
                <div
                    className="flex flex-col items-center gap-8 max-w-md text-center"
                    data-oid="gehco4a"
                >
                    <h1 className="text-4xl font-bold" data-oid="22.v:je">
                        Secure Solana Transactions
                    </h1>
                    <p className="text-gray-400" data-oid="djreipr">
                        Connect your wallet to start making secure deposits, withdrawals, and
                        transfers on the Solana blockchain.
                    </p>
                    <button
                        onClick={handleConnect}
                        className="bg-white text-black px-8 py-3 font-medium hover:bg-gray-200 transition-colors"
                        data-oid="v5:x_xf"
                    >
                        {'Connect Wallet'}
                    </button>
                </div>
            </div>
        </div>
    );
}
