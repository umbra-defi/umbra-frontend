'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

// Mock data for tokens
export const tokens = [
    { symbol: 'SOL', name: 'Solana' },
    { symbol: 'USDC', name: 'USD Coin' },
    { symbol: 'USDT', name: 'Tether' },
    { symbol: 'BTC', name: 'Bitcoin (Wrapped)' },
    { symbol: 'ETH', name: 'Ethereum (Wrapped)' },
];

// Fee types
export const feeTypes = [
    {
        id: 'transaction',
        name: 'TRANSACTION FEE',
        description: 'Fee for processing the transaction on the blockchain',
        amount: 0,
        token: 'USDC',
    },
    {
        id: 'privacy',
        name: 'PRIVACY FEE',
        description: 'Fee for enhanced privacy features',
        amount: 0,
        token: 'USDC',
    },
    {
        id: 'rent',
        name: 'TOKEN ACCOUNT RENT',
        description: 'Fee for maintaining the token account on Solana',
        amount: 0,
        token: 'USDC',
    },
    {
        id: 'network',
        name: 'NETWORK FEE',
        description: 'Fee for network operations',
        amount: 0,
        token: 'USDC',
    },
];

export default function TransactionsLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<string>('deposit');

    // Determine active tab from URL
    useEffect(() => {
        if (pathname === '/transactions') {
            router.push('/transactions/deposit');
            return;
        }

        const path = pathname.split('/').pop();
        if (path === 'deposit' || path === 'withdraw' || path === 'transfer') {
            setActiveTab(path);
        }
    }, [pathname, router]);

    const handleTabChange = (tab: string) => {
        router.push(`/transactions/${tab}`);
    };

    return (
        <div className="w-full min-h-screen flex flex-col bg-[#000000]" data-oid="9s6.lwx">
            {/* Header */}
            <motion.header
                className="w-full p-6 flex justify-between items-center border-b border-gray-800"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                data-oid="8brp709"
            >
                <div className="text-white font-bold text-xl tracking-wide" data-oid="b4vjcyw">
                    UMBRA
                </div>
                <div className="flex items-center gap-6" data-oid="cw0hvlv">
                    <div className="text-white tracking-wide" data-oid="92d2dm3">
                        WALLET BALANCE: •••••••••
                    </div>
                    <Link href="/auth" data-oid="xnyx4w8">
                        <button
                            className="text-white border border-gray-800 px-5 py-2 hover:bg-gray-900 transition-colors"
                            data-oid="m5ecd8d"
                        >
                            Logout
                        </button>
                    </Link>
                </div>
            </motion.header>

            {/* Main Content */}
            <div className="flex-1 flex items-center justify-center p-6" data-oid="tiegxqn">
                <motion.div
                    className="w-full max-w-[590px]"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    data-oid="x4qeblc"
                >
                    {/* Tabs */}
                    <div className="grid grid-cols-3 border border-gray-800" data-oid="iptr65f">
                        <button
                            className={cn(
                                'py-4 text-center text-white uppercase tracking-wider transition-colors',
                                activeTab === 'withdraw' && 'bg-[#111]',
                            )}
                            onClick={() => handleTabChange('withdraw')}
                            data-oid="h8z16ox"
                        >
                            Withdraw
                        </button>
                        <button
                            className={cn(
                                'py-4 text-center text-white uppercase tracking-wider transition-colors',
                                activeTab === 'deposit' && 'bg-[#111]',
                            )}
                            onClick={() => handleTabChange('deposit')}
                            data-oid="2:t20yl"
                        >
                            Deposit
                        </button>
                        <button
                            className={cn(
                                'py-4 text-center text-white uppercase tracking-wider transition-colors',
                                activeTab === 'transfer' && 'bg-[#111]',
                            )}
                            onClick={() => handleTabChange('transfer')}
                            data-oid="6i08:x:"
                        >
                            Transfer
                        </button>
                    </div>

                    {/* Form Content */}
                    <div
                        className="bg-[#0a0a0f] border border-gray-800 border-t-0 p-7 space-y-5"
                        data-oid="qjvf-:z"
                    >
                        <div
                            className="flex justify-between items-center text-white mb-4"
                            data-oid="nb4-.kn"
                        >
                            <div className="tracking-wide" data-oid="b_zk4of">
                                WALLET BALANCE: •••••••••
                            </div>
                            <div className="flex gap-3" data-oid="o60ap8h">
                                <button
                                    className="p-1 hover:text-gray-300 transition-colors"
                                    data-oid="cbyegpp"
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="22"
                                        height="22"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="1.5"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        className="lucide lucide-download"
                                        data-oid="b7k:ha7"
                                    >
                                        <path
                                            d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"
                                            data-oid="x7d01h5"
                                        />

                                        <polyline points="7 10 12 15 17 10" data-oid="irm0-1m" />
                                        <line x1="12" y1="15" x2="12" y2="3" data-oid="0mwq7wf" />
                                    </svg>
                                </button>
                                <button
                                    className="p-1 hover:text-gray-300 transition-colors"
                                    data-oid="47ohb8f"
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="22"
                                        height="22"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="1.5"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        className="lucide lucide-copy"
                                        data-oid="d5gk8:."
                                    >
                                        <rect
                                            width="14"
                                            height="14"
                                            x="8"
                                            y="8"
                                            rx="0"
                                            ry="0"
                                            data-oid="s7ayzyc"
                                        />

                                        <path
                                            d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"
                                            data-oid="pc24te:"
                                        />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        <AnimatePresence mode="wait" data-oid="ns4is9c">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.2 }}
                                data-oid="j:j9ijj"
                            >
                                {children}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
