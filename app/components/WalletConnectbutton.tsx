'use client';

import { useState, useEffect, useRef } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal, WalletDisconnectButton } from '@solana/wallet-adapter-react-ui';
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
    const hasRunOperations = useRef(false);

    useEffect(() => {
        setMounted(true);
        disconnect().catch((err) => {
            console.error('Error disconnecting wallet on load:', err);
        });
    }, []);

    useEffect(() => {
        if (connected && !hasRunOperations.current) {
            const alreadyConnected = localStorage.getItem('walletAlreadyConnected');

            if (!alreadyConnected && publicKey) {
                console.log('🔗 Wallet connected - running operations...');
                // Run your one-time operations
                // ...
                handleWalletConnected(publicKey);
                umbraStore.setLoading(true);
            }

            hasRunOperations.current = true;
        }

        if (!connected) {
            console.log('❌ Wallet disconnected - resetting state');
            localStorage.removeItem('walletAlreadyConnected');
            hasRunOperations.current = false;
        }
    }, [connected]);

    const handleWalletConnected = async (publicKey: PublicKey) => {
        try {
            if (!signMessage) {
                toastError('Wallet does not support message signing.');
                return;
            }

            console.log('trigger 2');
            umbraStore.setLoading(true);
            setIsLoading(true);

            umbraStore.setLoadingMessage('Generating Umbra address...');
            setLoadingMessage('Generating Umbra address...');

            const umbraAddress = await generateUmbraAddress(signMessage);
            const x25519Keypair = generateX25519Keypair(umbraAddress);

            umbraStore.setUmbraAddress(umbraAddress);
            umbraStore.setX25519PrivKey(x25519Keypair.privateKey);

            umbraStore.setLoadingMessage('Checking user account...');
            setLoadingMessage('Checking user account...');
            const result = await tryFetchUserAccount(umbraAddress);

            if (result) {
                umbraStore.setLoadingMessage('Fetching tokens...');
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
                    umbraStore.setLoadingMessage('Fetching balance...');

                    setLoadingMessage('Fetching balance...');
                    await fetchWalletBalance(publicKey);
                }

                return;
            }

            umbraStore.setLoadingMessage('Creating account...');

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

            umbraStore.setLoadingMessage('Minting tokens...');

            setLoadingMessage('Minting tokens...');
            await MintTokensToUser(publicKey);

            umbraStore.setLoadingMessage('Fetching tokens...');

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
                umbraStore.setLoadingMessage('Fetching balance...');
                setLoadingMessage('Fetching balance...');
                await fetchWalletBalance(publicKey);
            }
        } catch (error: any) {
            console.error('Wallet connection error:', error);
            disconnect();
            toastError(error?.message || 'Wallet connection failed. Please try again.');
        } finally {
            umbraStore.setLoading(false);
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

    const handleDisconnect = async () => {
        await disconnect();
        umbraStore.reset();
        return;
    };

    // If loading
    if (isLoading) {
        return (
            <button
                disabled
                className=" bg-white text-black px-4 py-2  uppercase   flex items-center justify-center disabled:opacity-60 disabled:cursor-not-allowed"
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
            <motion.button
                className=" bg-white text-black px-4 py-2  uppercase   flex items-center justify-center disabled:opacity-60 disabled:cursor-not-allowed"
                onClick={handleDisconnect}
                whileHover={{ backgroundColor: '#f0f0f0' }}
                whileTap={{ scale: 0.98 }}
                data-oid=":xcq1mj"
            >
                Disconnect
            </motion.button>
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
