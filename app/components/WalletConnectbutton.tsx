'use client';

import { useState, useEffect, useRef } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Connection, LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';
import { Loader2 } from 'lucide-react';
import { cn, getUmbraProgram, toastError } from '@/lib/utils';

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

type WalletConnectButtonProps = {
    variant?: 'default' | 'navbar' | 'minimal';
    showBalance?: boolean;
    className?: string;
    onConnect?: (publicKey: PublicKey) => void;
};

export default function WalletConnectButton({
    variant = 'default',
    showBalance = false,
    className = '',
    onConnect,
}: WalletConnectButtonProps) {
    const { connected, publicKey, disconnect, signMessage, signTransaction } = useWallet();
    const [balance, setBalance] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('Connecting...');
    const umbraStore = useUmbraStore();
    const router = useRouter();
    const hasRunOperations = useRef(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        disconnect().catch((err) => console.error('Error disconnecting wallet on load:', err));
    }, []);

    useEffect(() => {
        if (connected && !hasRunOperations.current) {
            const alreadyConnected = localStorage.getItem('walletAlreadyConnected');
            if (!alreadyConnected && publicKey) {
                handleWalletConnected(publicKey);
                localStorage.setItem('walletAlreadyConnected', 'true');
            }
            hasRunOperations.current = true;
        }

        if (!connected) {
            localStorage.removeItem('walletAlreadyConnected');
            hasRunOperations.current = false;
        }
    }, [connected]);

    const handleWalletConnected = async (publicKey: PublicKey) => {
        try {
            setIsLoading(true);
            setLoadingMessage('Generating Umbra address...');

            const umbraAddress = await generateUmbraAddress(signMessage!);
            const x25519Keypair = generateX25519Keypair(umbraAddress);

            umbraStore.setUmbraAddress(umbraAddress);
            umbraStore.setX25519PrivKey(x25519Keypair.privateKey);

            setLoadingMessage('Checking user account...');

            const result = tryFetchUserAccount(umbraAddress);

            if (await result) {
                setLoadingMessage('Fetching tokens...');
                let tokenListRaw = await fetchTokenList(publicKey);
                const tokenList = tokenListRaw.encrypted_token_list;
                const tokenListWithPubkeys = tokenList
                    ? tokenList.map((token: any) => ({
                          ...token,
                          mintAddress: new PublicKey(token.mintAddress),
                      }))
                    : [];

                umbraStore.setTokenList(tokenListWithPubkeys);

                router.push('/transactions/deposit');
                return;
            }

            setLoadingMessage('Creating account...');
            const tx = await createUserAccountCreationTransaction(
                x25519Keypair.publicKey,
                umbraAddress,
                publicKey,
            );
            await signTransaction!(tx);
            const response = await sendTransactionToRelayer(tx);
            console.log((await response.json()).signature);

            setLoadingMessage('Minting tokens...');
            await MintTokensToUser(publicKey);

            setLoadingMessage('Fetching tokens...');
            let tokenListRaw = await fetchTokenList(publicKey);
            const tokenList = tokenListRaw.encrypted_token_list;
            const tokenListWithPubkeys = tokenList
                ? tokenList.map((token: any) => ({
                      ...token,
                      mintAddress: new PublicKey(token.mintAddress),
                  }))
                : [];

            umbraStore.setTokenList(tokenListWithPubkeys);

            router.push('/transactions/deposit');

            if (showBalance) {
                setLoadingMessage('Fetching balance...');
                await fetchWalletBalance(publicKey);
            }

            if (onConnect) {
                onConnect(publicKey);
            }
        } catch (error) {
            console.error('Error handling wallet connection:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchWalletBalance = async (publicKey: PublicKey) => {
        try {
            const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
            const balance = await connection.getBalance(publicKey);
            const solBalance = balance / LAMPORTS_PER_SOL;
            setBalance(solBalance);
        } catch (error) {
            console.error('Error fetching balance:', error);
        }
    };

    const formatAddress = (address: string) => `${address.slice(0, 4)}...${address.slice(-4)}`;

    if (!mounted) {
        return (
            <div
                className={cn(
                    'h-10 bg-gray-700 rounded-md animate-pulse',
                    variant === 'navbar' ? 'w-32' : 'w-48',
                    className,
                )}
            ></div>
        );
    }

    if (connected && publicKey) {
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

        if (variant === 'minimal') {
            return (
                <div className={cn('flex items-center space-x-2', className)}>
                    <span className="px-3 py-1.5 bg-gray-700 rounded-md text-sm text-gray-200">
                        {formatAddress(publicKey.toString())}
                    </span>
                    <button
                        onClick={() => disconnect()}
                        className="px-3 py-1.5 text-sm bg-gray-700 hover:bg-gray-600 text-white rounded-md transition-colors"
                    >
                        Disconnect
                    </button>
                </div>
            );
        }

        if (variant === 'navbar') {
            return (
                <div className={cn('flex items-center space-x-2', className)}>
                    {showBalance && balance !== null && (
                        <div className="px-2 py-1 bg-gray-700 rounded-md text-xs">
                            <span className="text-gray-400">Balance: </span>
                            <span className="text-white">{balance.toFixed(4)} SOL</span>
                        </div>
                    )}
                    <span className="px-2 py-1 bg-gray-700 rounded-md text-xs text-gray-200">
                        {formatAddress(publicKey.toString())}
                    </span>
                    <button
                        onClick={() => disconnect()}
                        className="px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 text-white rounded-md transition-colors"
                    >
                        Disconnect
                    </button>
                </div>
            );
        }

        return (
            <div className={cn('flex flex-col space-y-2', className)}>
                <div className="flex items-center space-x-2">
                    <span className="px-4 py-2 bg-gray-700 rounded-md text-sm text-gray-200">
                        {formatAddress(publicKey.toString())}
                    </span>
                    <button
                        onClick={() => disconnect()}
                        className="px-4 py-2 text-sm bg-gray-700 hover:bg-gray-600 text-white rounded-md transition-colors"
                    >
                        Disconnect
                    </button>
                </div>

                {showBalance &&
                    (balance !== null ? (
                        <div className="px-4 py-2 bg-gray-700 rounded-md text-center">
                            <span className="text-sm text-gray-400">Balance: </span>
                            <span className="text-sm text-white font-medium">
                                {balance.toFixed(4)} SOL
                            </span>
                        </div>
                    ) : null)}
            </div>
        );
    }

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

    return (
        <WalletMultiButton
            className={cn(
                'wallet-adapter-button',
                variant === 'navbar' && 'text-xs px-3 py-1.5 h-auto',
                className,
            )}
        />
    );
}
