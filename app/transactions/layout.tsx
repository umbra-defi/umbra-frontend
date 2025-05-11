'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn, toastError } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useUmbraStore } from '../store/umbraStore';
import { bs58 } from '@coral-xyz/anchor/dist/cjs/utils/bytes';
import toast from 'react-hot-toast';

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
    const umbraWalletBalance = umbraStore.umbraWalletBalance;
    const umbraAddress = umbraStore.umbraAddress;
    // Check if umbraAddress exists and is in the correct format
    const base58WalletAddress = umbraStore.umbraAddress
        ? bs58.encode(Buffer.from(JSON.stringify(umbraStore.umbraAddress)))
        : 'No address available';
    const minifiedAddress = base58WalletAddress
        ? `${base58WalletAddress.slice(0, 4)}...${base58WalletAddress.slice(-4)}`
        : 'No address available';

    const handleCopyAddress = () => {
        const base58Address = bs58.encode(Buffer.from(JSON.stringify(umbraAddress)));
        navigator.clipboard.writeText(base58Address);
        toast.success('Wallet address copied to clipboard', {
            style: {
                background: '#333',
                color: '#fff',
                border: '1px solid #444',
            },
            duration: 2000,
            position: 'bottom-right',
        });
    };

    console.log({ umbraStore });

    return (
        <div className="w-full min-h-screen flex flex-col" data-oid="-.s3a6:">
            {/* Header */}
            <motion.header
                className="w-full p-6 flex justify-between items-center border-b border-gray-800 bg-black"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                data-oid=".joyuax"
            >
                <div className="text-white font-bold text-xl tracking-wide" data-oid=".7xj-a8">
                    UMBRA
                </div>
                <div className="flex items-center gap-6" data-oid="u07fqct">
                    <div className="flex flex-col gap-2" data-oid="6zqx0vr">
                        <div className="text-white/70 text-sm tracking-wide">
                            Wallet Balance:
                            <span className="ml-2 text-white font-medium">
                                {formattedOnChainBalance} {selectedTokenTicker || ''}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="text-white/70 text-sm tracking-wide">
                                Wallet Address
                                <span className="ml-2 text-white font-medium">
                                    {minifiedAddress}
                                </span>
                            </div>
                            <button
                                onClick={handleCopyAddress}
                                className="p-1.5 hover:bg-gray-800 rounded-md transition-colors"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="16"
                                    height="16"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="text-gray-400"
                                >
                                    <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                                    <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                                </svg>
                            </button>
                        </div>
                    </div>
                    <Link href="/auth/login" data-oid="e3vl4-z">
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
                                    Umbra Wallet Balance: {formattedUmbraBalance}{' '}
                                    {selectedTokenTicker || ''}
                                </div>
                                {activeTab !== 'transfer' && (
                                    <div className="tracking-wide mt-1 text-gray-400">
                                        Connected wallet balance: {formattedOnChainBalance}{' '}
                                        {selectedTokenTicker || ''}
                                    </div>
                                )}
                            </div>
                            <div className="flex gap-3" data-oid=".5vit.a">
                                <button
                                    className="p-1 hover:text-gray-300 transition-colors"
                                    data-oid="nu_x:by"
                                    onClick={() => {
                                        const hexAddress = Buffer.from(
                                            umbraStore.umbraAddress,
                                        ).toString('hex');
                                        const base58Address = bs58.encode(
                                            Buffer.from(umbraStore.umbraAddress),
                                        );
                                        navigator.clipboard.writeText(base58Address);
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
