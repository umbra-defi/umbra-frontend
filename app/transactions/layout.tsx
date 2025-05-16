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
import { useWallet } from '@solana/wallet-adapter-react';
import Image from 'next/image';
import WalletModal from '../components/ui/WalletModal';
import CornerBorders from '../components/corner';
import CornerDots from '../components/cornerDots';
import WalletConnectButton from '../components/WalletConnectbutton';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

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

    // useEffect(() => {
    //     const isWalletConnected = localStorage.getItem('walletAlreadyConnected');
    //     if (!isWalletConnected) {
    //         router.replace('/'); // Redirect to homepage or connect page
    //     }
    // }, []);

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
                                width={180}
                                height={150}
                            />
                        </div>
                    </Link>
                    <div className="flex items-center " data-oid="u07fqct">
                        {bs58.encode(Buffer.from(umbraAddress)) && umbraStore.walletConnected ? (
                            <div className="flex flex-col gap-2" data-oid="6zqx0vr">
                                <WalletModal
                                    formattedOnChainBalance={formattedOnChainBalance}
                                    selectedTokenTicker={selectedTokenTicker}
                                    walletAddress={umbraAddress}
                                />
                            </div>
                        ) : null}

                        <div
                            // onClick={handleConnect}
                            className="  px-8 py-3 font-medium "
                            data-oid="v5:x_xf"
                        >
                            <WalletConnectButton />

                            {/* <WalletMultiButton /> */}
                        </div>
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
                                        'py-4 w-full text-center text-white uppercase tracking-wider transition-colors  bg-[#0a0a0f]/40 backdrop-blur-lg border border-gray-600',
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
                                        <div className="absolute inset-0 pointer-events-none z-10">
                                            <CornerDots color="white" size={4} />
                                        </div>
                                    </>
                                )}
                            </div>

                            <div className="relative">
                                <button
                                    className={cn(
                                        'py-4 w-full text-center text-white uppercase tracking-wider transition-colors  bg-[#0a0a0f]/40 backdrop-blur-lg border border-gray-600',
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
                                        <div className="absolute inset-0 pointer-events-none z-10">
                                            <CornerDots color="white" size={4} />
                                        </div>
                                    </>
                                )}
                            </div>

                            <div className="relative">
                                <button
                                    className={cn(
                                        'py-4 w-full text-center text-white uppercase tracking-wider transition-colors  bg-[#0a0a0f]/40 backdrop-blur-lg border border-gray-600',
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
                                        <div className="absolute inset-0 pointer-events-none z-10">
                                            <CornerDots color="white" size={4} />
                                        </div>
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
                            className=" shadow-[inset_0_0_20px_rgba(255,255,255,0.2)] bg-[#0a0a0f]/40  backdrop-blur-3xl border border-gray-600 mt-6 p-7 space-y-5 inset-shadow-2xs inset-shadow-white"
                            data-oid="8w.djrx"
                        >
                            <div className="absolute inset-0 pointer-events-none z-10">
                                <CornerBorders color="white" />
                            </div>

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
