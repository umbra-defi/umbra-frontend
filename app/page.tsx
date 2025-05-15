'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import '@solana/wallet-adapter-react-ui/styles.css';
import Image from 'next/image';

export default function Page() {
    const router = useRouter();

    return (
        <div className="w-full min-h-screen flex flex-col text-white" data-oid="0ae9oo:">
            {/* Header */}
            <header className="w-full p-6 flex justify-between items-center " data-oid="169-oi4">
                <div className="text-white font-bold text-xl" data-oid="0dflmx4">
                    <Image src="/images/umbra.svg" alt="Umbra Logo" width={100} height={100} />
                </div>
                <div className="flex items-center gap-4" data-oid="k9zem8w">
                    {/* <Link href="/auth/login" data-oid="4nqdbn8">
                        <button
                            className="text-white border border-gray-900 px-4 py-2 hover:bg-gray-900 transition-colors"
                            data-oid="ssr7wcm"
                        >
                            Connect
                        </button>
                    </Link> */}
                    {/* <WalletConnectButton variant="navbar" /> */}
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
                    {/* <div
                        // onClick={handleConnect}
                        className=" text-black px-8 py-3 font-medium "
                        data-oid="v5:x_xf"
                    >
                        <WalletConnectButton />
                    </div> */}
                </div>
            </div>
        </div>
    );
}
