'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn, toastError } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useUmbraStore } from '../store/umbraStore';
import { bs58 } from '@coral-xyz/anchor/dist/cjs/utils/bytes';
import toast from 'react-hot-toast';
import { TooltipProvider } from '../context/tooltip-context';
import { TooltipTour } from '../components/tooltip-tour';
import { TourButton } from '../components/tour-button';
import WalletConnectButton from '../components/WalletConnectbutton';
import { WalletDisconnectButton } from '@solana/wallet-adapter-react-ui';
import { useWallet } from '@solana/wallet-adapter-react';
import Image from 'next/image';

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
    const { connected, publicKey, disconnect } = useWallet();

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

    const handleDisconnect = async () => {
        try {
            // Disconnect wallet using Solana wallet adapter
            await disconnect();

            // Show toast notification
            // showToast('Wallet disconnected successfully', 'success');

            // Redirect to home page
            router.push('/');
        } catch (error) {
            console.error('Error disconnecting wallet:', error);
            // showToast('Failed to disconnect wallet', 'error');
        }
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
        ? bs58.encode(Buffer.from(umbraStore.umbraAddress))
        : 'No address available';
    const minifiedAddress = base58WalletAddress
        ? `${base58WalletAddress.slice(0, 4)}...${base58WalletAddress.slice(-4)}`
        : 'No address available';

    const handleCopyAddress = () => {
        const base58Address = bs58.encode(Buffer.from(umbraAddress));
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
        <TooltipProvider>
            <div className="w-full min-h-screen flex flex-col" data-oid="-.s3a6:">
                {/* Header */}
                <motion.header
                    className="w-full p-6 flex justify-between items-center"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    data-oid=".joyuax"
                >
                    <Link href="/" data-oid="e3vl4-z">
                        <div
                            className="text-white font-bold text-xl tracking-wide hover:cursor:pointer"
                            data-oid=".7xj-a8"
                        >
                            <Image
                                src="/images/umbra.svg"
                                alt="Umbra Logo"
                                width={100}
                                height={100}
                            />
                        </div>
                    </Link>
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
                        <Link href="/" data-oid="e3vl4-z">
                            <button
                                className=" border border-gray-800 px-5 py-2 text-white bg-[#2D2E34] transition-colors"
                                data-oid="muq2emp"
                                onClick={handleDisconnect}
                            >
                                Disconnect
                            </button>
                        </Link>
                    </div>
                </motion.header>

                {/* Main Content */}
                <div className="flex-1 flex items-center justify-center p-6">
                    <motion.div
                        className="w-full max-w-[590px]"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3 }}
                    >
                        {/* Tabs */}
                        <div className="grid grid-cols-3 border border-gray-800">
                            <div className="relative">
                                <button
                                    className={cn(
                                        'py-4 w-full text-center text-white uppercase tracking-wider transition-colors shadow-[inset_0_0_10px_rgba(255,255,255,0.2)] bg-[#0a0a0f]/40 backdrop-blur-lg border border-gray-600',
                                        activeTab === 'deposit' && 'bg-[#2D2E34]',
                                    )}
                                    onClick={() => handleTabChange('deposit')}
                                    data-tab="deposit"
                                >
                                    Deposit
                                </button>

                                {/* Dots for deposit tab */}
                                {activeTab === 'deposit' && (
                                    <>
                                        <div className="absolute w-1 h-1 bg-white rounded-full -top-1 -left-1"></div>
                                        <div className="absolute w-1 h-1 bg-white rounded-full -top-1 -right-1"></div>
                                        <div className="absolute w-1 h-1 bg-white rounded-full -bottom-1 -left-1"></div>
                                        <div className="absolute w-1 h-1 bg-white rounded-full -bottom-1 -right-1"></div>
                                    </>
                                )}
                            </div>

                            <div className="relative">
                                <button
                                    className={cn(
                                        'py-4 w-full text-center text-white uppercase tracking-wider transition-colors shadow-[inset_0_0_10px_rgba(255,255,255,0.2)] bg-[#0a0a0f]/40 backdrop-blur-lg border border-gray-600',
                                        activeTab === 'transfer' && 'bg-[#2D2E34]',
                                    )}
                                    onClick={() => handleTabChange('transfer')}
                                    data-tab="transfer"
                                >
                                    Transfer
                                </button>

                                {/* Dots for transfer tab */}
                                {activeTab === 'transfer' && (
                                    <>
                                        <div className="absolute w-1 h-1 bg-white rounded-full -top-1 -left-1"></div>
                                        <div className="absolute w-1 h-1 bg-white rounded-full -top-1 -right-1"></div>
                                        <div className="absolute w-1 h-1 bg-white rounded-full -bottom-1 -left-1"></div>
                                        <div className="absolute w-1 h-1 bg-white rounded-full -bottom-1 -right-1"></div>
                                    </>
                                )}
                            </div>

                            <div className="relative">
                                <button
                                    className={cn(
                                        'py-4 w-full text-center text-white uppercase tracking-wider transition-colors shadow-[inset_0_0_10px_rgba(255,255,255,0.2)] bg-[#0a0a0f]/40 backdrop-blur-lg border border-gray-600',
                                        activeTab === 'withdraw' && 'bg-[#2D2E34]',
                                    )}
                                    onClick={() => handleTabChange('withdraw')}
                                    data-tab="withdraw"
                                >
                                    Withdraw
                                </button>

                                {/* Dots for withdraw tab */}
                                {activeTab === 'withdraw' && (
                                    <>
                                        <div className="absolute w-1 h-1 bg-white rounded-full -top-1 -left-1"></div>
                                        <div className="absolute w-1 h-1 bg-white rounded-full -top-1 -right-1"></div>
                                        <div className="absolute w-1 h-1 bg-white rounded-full -bottom-1 -left-1"></div>
                                        <div className="absolute w-1 h-1 bg-white rounded-full -bottom-1 -right-1"></div>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Form Content */}
                        {/* <div
                            className=" bg-gradient-to-br from-white/10 via-transparent to-white/10 border border-gray-600 mt-5 p-7 space-y-5 inset-shadow-2xs inset-shadow-white"
                            data-oid="8w.djrx"
                        > */}
                        <div
                            className=" shadow-[inset_0_0_20px_rgba(255,255,255,0.2)] bg-[#0a0a0f]/40  backdrop-blur-lg border border-gray-600 mt-2 p-7 space-y-5 inset-shadow-2xs inset-shadow-white"
                            data-oid="8w.djrx"
                        >
                            <div className="absolute top-0 left-0 w-4 h-0.5 bg-white"></div>
                            <div className="absolute top-[-20px] left-0 w-0.5 h-4 bg-white"></div>

                            <div className="absolute top-[-20px] right-0 w-0.5 h-4 bg-white"></div>
                            <div className="absolute top-[-20px] right-0 w-4 h-0.5 bg-white"></div>

                            <div className="absolute bottom-0 left-0 w-0.5 h-4 bg-white"></div>
                            <div className="absolute bottom-0 left-0 w-4 h-0.5 bg-white"></div>

                            <div className="absolute bottom-0 right-0 w-0.5 h-4 bg-white"></div>
                            <div className="absolute bottom-0 right-0 w-4 h-0.5 bg-white"></div>

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
                                        onClick={handleCopyAddress}
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
                <TooltipTour />
                <TourButton />
            </div>
        </TooltipProvider>
    );
}
