'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn, toastError } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useUmbraStore } from '../store/umbraStore';

// // Mock data for tokens
// export const tokens = [
//     { symbol: 'SOL', name: 'Solana' },
//     { symbol: 'USDC', name: 'USD Coin' },
//     { symbol: 'USDT', name: 'Tether' },
//     { symbol: 'BTC', name: 'Bitcoin (Wrapped)' },
//     { symbol: 'ETH', name: 'Ethereum (Wrapped)' },
// ];

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

    const umbraStore = useUmbraStore();
    const { selectedTokenTicker } = umbraStore;
    const formattedUmbraBalance = umbraStore.getFormattedUmbraWalletBalance();
    const formattedOnChainBalance = umbraStore.getFormattedOnChainBalance();
    const tokenList = umbraStore.getTokenList();
    const tokens = Array.isArray(tokenList) ? tokenList : [];
    const activeToken = tokens.length > 0 ? tokens[0].ticker : '';

    return (
        <div className="w-full min-h-screen flex flex-col bg-[#000000]" data-oid="-.s3a6:">
            {/* Header */}
            <motion.header
                className="w-full p-6 flex justify-between items-center border-b border-gray-800"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                data-oid=".joyuax"
            >
                <div className="text-white font-bold text-xl tracking-wide" data-oid=".7xj-a8">
                    UMBRA
                </div>
                <div className="flex items-center gap-6" data-oid="u07fqct">
                    <div className="text-white tracking-wide" data-oid="6zqx0vr">
                        WALLET BALANCE: {}
                    </div>
                    <Link href="/auth" data-oid="e3vl4-z">
                        <button
                            className="text-white border border-gray-800 px-5 py-2 hover:bg-gray-900 transition-colors"
                            data-oid="muq2emp"
                        >
                            Logout
                        </button>
                    </Link>
                </div>
            </motion.header>

            {/* Main Content */}
            <div className="flex-1 flex items-center justify-center p-6" data-oid="vfsf9yc">
                <motion.div
                    className="w-full max-w-[590px]"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    data-oid="a7tr4c_"
                >
                    {/* Tabs */}
                    <div className="grid grid-cols-3 border border-gray-800" data-oid="_30p856">
                        <button
                            className={cn(
                                'py-4 text-center text-white uppercase tracking-wider transition-colors',
                                activeTab === 'withdraw' && 'bg-[#111]',
                            )}
                            onClick={() => handleTabChange('withdraw')}
                            data-oid="k66ti06"
                        >
                            Withdraw
                        </button>
                        <button
                            className={cn(
                                'py-4 text-center text-white uppercase tracking-wider transition-colors',
                                activeTab === 'deposit' && 'bg-[#111]',
                            )}
                            onClick={() => handleTabChange('deposit')}
                            data-oid="uzxgac-"
                        >
                            Deposit
                        </button>
                        <button
                            className={cn(
                                'py-4 text-center text-white uppercase tracking-wider transition-colors',
                                activeTab === 'transfer' && 'bg-[#111]',
                            )}
                            onClick={() => handleTabChange('transfer')}
                            data-oid="wfa_9-6"
                        >
                            Transfer
                        </button>
                    </div>

                    {/* Form Content */}
                    <div
                        className="bg-[#0a0a0f] border border-gray-800 border-t-0 p-7 space-y-5"
                        data-oid="8w.djrx"
                    >
                        <div
                            className="flex justify-between items-center text-white mb-4"
                            data-oid="r6s9t_7"
                        >
                            <div className="flex flex-col">
                                <div className="tracking-wide" data-oid="g9ygc3n">
                                    UMBRA WALLET BALANCE: {formattedUmbraBalance} {selectedTokenTicker || ''}
                                </div>
                                <div className="tracking-wide mt-1 text-gray-400">
                                    AVAILABLE ON-CHAIN BALANCE: {formattedOnChainBalance} {selectedTokenTicker || ''}
                                </div>
                            </div>
                            <div className="flex gap-3" data-oid=".5vit.a">
                                <button
                                    className="p-1 hover:text-gray-300 transition-colors"
                                    data-oid="nu_x:by"
                                    onClick={() => {
                                        const hexAddress = Buffer.from(umbraStore.umbraAddress).toString('hex');
                                        navigator.clipboard.writeText(hexAddress);
                                    }}
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
                                        data-oid="5s-7heq"
                                    >
                                        <rect
                                            width="14"
                                            height="14"
                                            x="8"
                                            y="8"
                                            rx="0"
                                            ry="0"
                                            data-oid="7vtxoaz"
                                        />

                                        <path
                                            d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"
                                            data-oid=":iq44jv"
                                        />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        <AnimatePresence mode="wait" data-oid="2whknka">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.2 }}
                                data-oid="nsvx_xd"
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
