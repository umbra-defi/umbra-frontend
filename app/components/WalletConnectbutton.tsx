'use client';

import { useState, useEffect, useRef } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import {
    useWalletModal,
    WalletDisconnectButton,
    WalletMultiButton,
} from '@solana/wallet-adapter-react-ui';
import { Connection, LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';
import { Loader2 } from 'lucide-react';
import { cn, toastError } from '@/lib/utils';

import '@solana/wallet-adapter-react-ui/styles.css';

import {
    createUserAccountCreationTransaction,
    fetchTokenList,
    generateUmbraAddress,
    generateX25519Keypair,
    MintTokensToUser,
    sendTransactionToRelayer,
} from '../auth/signup/utils';

import { useUmbraStore } from '../store/umbraStore';
import { useRouter } from 'next/navigation';
import { tryFetchUserAccount } from './utils';
import { motion } from 'framer-motion';

type WalletConnectButtonProps = {
    variant?: 'default' | 'navbar' | 'minimal';
    showBalance?: boolean;
    className?: string;
};

export default function WalletConnectButton({
    variant = 'default',
    showBalance = false,
    className = '',
}: WalletConnectButtonProps) {
    const { connected, publicKey, disconnect, signMessage, signTransaction } = useWallet();
    const [balance, setBalance] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('Connecting...');
    const umbraStore = useUmbraStore();
    const [mounted, setMounted] = useState(false);
    const { setVisible } = useWalletModal();

    useEffect(() => {
        setMounted(true);
        disconnect().catch((err) => {
            console.error('Error disconnecting wallet on load:', err);
        });
    }, []);

    const umbraAddress = useUmbraStore((state) => state.umbraAddress);
    const x25519PrivKey = useUmbraStore((state) => state.x25519PrivKey);
    useEffect(() => {
        if (connected && publicKey) {
            const isUmbraAddressEmpty = umbraAddress.length === 0;
            const isPrivKeyEmpty = x25519PrivKey.length === 0;

            if (!isUmbraAddressEmpty && !isPrivKeyEmpty) {
                console.log('🔗 Wallet connected - running operations...');
                handleWalletConnected(publicKey);
            }
        } else {
            umbraStore.reset();
        }
    }, [connected]);

    const handleWalletConnected = async (publicKey: PublicKey) => {
        try {
            if (!signMessage) {
                toastError('Wallet does not support message signing.');
                return;
            }

            console.log('trigger 2');
            setIsLoading(true);
            setLoadingMessage('Generating Umbra address...');

            const umbraAddress = await generateUmbraAddress(signMessage);
            const x25519Keypair = generateX25519Keypair(umbraAddress);

            umbraStore.setUmbraAddress(umbraAddress);
            umbraStore.setX25519PrivKey(x25519Keypair.privateKey);

            setLoadingMessage('Checking user account...');
            const result = await tryFetchUserAccount(umbraAddress);

            if (result) {
                setLoadingMessage('Fetching tokens...');
                const tokenListRaw = await fetchTokenList(publicKey);
                const tokenList = tokenListRaw.encrypted_token_list ?? [];

                umbraStore.setTokenList(
                    tokenList.map((token: any) => ({
                        ...token,
                        mintAddress: new PublicKey(token.mintAddress),
                    })),
                );

                if (showBalance) {
                    setLoadingMessage('Fetching balance...');
                    await fetchWalletBalance(publicKey);
                }

                return;
            }

            setLoadingMessage('Creating account...');
            const tx = await createUserAccountCreationTransaction(
                x25519Keypair.publicKey,
                umbraAddress,
                publicKey,
            );

            const signedTx = await signTransaction?.(tx);
            if (!signedTx) throw new Error('Transaction signing failed.');

            const response = await sendTransactionToRelayer(signedTx);
            const data = await response.json();
            console.log('Relayer Signature:', data.signature);

            setLoadingMessage('Minting tokens...');
            await MintTokensToUser(publicKey);

            setLoadingMessage('Fetching tokens...');
            const updatedTokenListRaw = await fetchTokenList(publicKey);
            const updatedTokenList = updatedTokenListRaw.encrypted_token_list ?? [];

            umbraStore.setTokenList(
                updatedTokenList.map((token: any) => ({
                    ...token,
                    mintAddress: new PublicKey(token.mintAddress),
                })),
            );

            if (showBalance) {
                setLoadingMessage('Fetching balance...');
                await fetchWalletBalance(publicKey);
            }
        } catch (error: any) {
            console.error('Wallet connection error:', error);
            disconnect();
            toastError(error?.message || 'Wallet connection failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const fetchWalletBalance = async (publicKey: PublicKey) => {
        try {
            const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
            const balance = await connection.getBalance(publicKey);
            setBalance(balance / LAMPORTS_PER_SOL);
        } catch (error) {
            console.error('Error fetching balance:', error);
        }
    };

    const formatAddress = (address: string) => `${address.slice(0, 4)}...${address.slice(-4)}`;

    // While mounting: show skeleton
    if (!mounted) {
        return (
            <div
                className={cn(
                    'h-10 bg-gray-700 rounded-md animate-pulse',
                    variant === 'navbar' ? 'w-32' : 'w-48',
                    className,
                )}
            />
        );
    }

    // If loading
    if (isLoading) {
        return (
            <button
                disabled
                className={cn(
                    'flex items-center justify-center px-4 py-2 bg-gray-700 text-gray-300 rounded-md',
                    variant === 'navbar' ? 'text-xs px-3 py-1.5' : 'text-sm',
                    className,
                )}
            >
                <Loader2
                    className={cn(
                        'animate-spin mr-2',
                        variant === 'navbar' ? 'h-3 w-3' : 'h-4 w-4',
                    )}
                />
                {loadingMessage}
            </button>
        );
    }

    // If connected
    if (connected && publicKey) {
        return (
            <div className={cn('flex flex-col space-y-2', className)}>
                <div className="flex items-center space-x-2">
                    <WalletDisconnectButton />
                </div>
            </div>
        );
    }

    const handleClick = () => {
        if (connected) {
        } else {
            setVisible(true);
        }
    };

    // If not connected
    return (
        <motion.button
            className=" bg-white text-black px-4 py-2  uppercase   flex items-center justify-center disabled:opacity-60 disabled:cursor-not-allowed"
            onClick={handleClick}
            whileHover={{ backgroundColor: '#f0f0f0' }}
            whileTap={{ scale: 0.98 }}
            data-oid=":xcq1mj"
        >
            Connect Wallet
        </motion.button>
    );
}
