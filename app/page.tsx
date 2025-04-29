'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Page() {
    const router = useRouter();
    const [connecting, setConnecting] = useState(false);

    const handleConnect = async () => {
        setConnecting(true);

        // Simulate connection process
        setTimeout(() => {
            setConnecting(false);
            router.push('/auth');
        }, 1500);
    };

    return (
        <div
            className="w-full min-h-screen flex flex-col bg-[#000000] text-white"
            data-oid="wcfo:lo"
        >
            {/* Header */}
            <header
                className="w-full p-6 flex justify-between items-center border-b border-gray-900"
                data-oid="fk4o0sj"
            >
                <div className="text-white font-bold text-xl" data-oid="9p2kifk">
                    UMBRA
                </div>
                <div className="flex items-center gap-4" data-oid="dc06fhh">
                    <Link href="/auth" data-oid="5t_ibes">
                        <button
                            className="text-white border border-gray-900 px-4 py-2 hover:bg-gray-900 transition-colors"
                            data-oid="rfqnzj4"
                        >
                            Login
                        </button>
                    </Link>
                </div>
            </header>

            {/* Main Content */}
            <div className="flex-1 flex items-center justify-center p-4" data-oid="-xtyf8m">
                <div
                    className="flex flex-col items-center gap-8 max-w-md text-center"
                    data-oid="folwxlp"
                >
                    <h1 className="text-4xl font-bold" data-oid="kmj3v9u">
                        Secure Solana Transactions
                    </h1>
                    <p className="text-gray-400" data-oid="j8k4w86">
                        Connect your wallet to start making secure deposits, withdrawals, and
                        transfers on the Solana blockchain.
                    </p>
                    <button
                        onClick={handleConnect}
                        disabled={connecting}
                        className="bg-white text-black px-8 py-3 font-medium hover:bg-gray-200 transition-colors"
                        data-oid="3r539-0"
                    >
                        {connecting ? 'Connecting...' : 'Connect Wallet'}
                    </button>
                </div>
            </div>
        </div>
    );
}
