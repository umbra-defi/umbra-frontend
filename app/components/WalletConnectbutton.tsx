'use client';

import { useState, useEffect, useRef } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Connection, LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';
import { Loader2 } from 'lucide-react';
import { cn, getUmbraProgram, toastError } from '@/lib/utils';

// Import wallet adapter CSS
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
import { getUserAccountPDA } from '@/lib/umbra-program/umbra';
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
    const [trigger, setTrigger] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState(false);
    const umbraStore = useUmbraStore();
    const [mintingTokens, setMintingTokens] = useState<boolean>(false);
    const router = useRouter();
    const hasRunOperations = useRef(false);

    // Handle component mounting (to avoid hydration errors)
    const [mounted, setMounted] = useState(false);

    console.log(publicKey);

    // Set mounted to true to avoid hydration issues
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
                localStorage.setItem('walletAlreadyConnected', 'true');
            }

            hasRunOperations.current = true;
        }

        if (!connected) {
            console.log('❌ Wallet disconnected - resetting state');
            localStorage.removeItem('walletAlreadyConnected');
            hasRunOperations.current = false;
        }
    }, [connected]);

    // Function to handle actions when wallet connects
    const handleWalletConnected = async (publicKey: PublicKey) => {
        try {
            setIsLoading(true);
            // if (!connected) {
            //     toastError('Please connect a wallet first...');
            //     return;
            // }

            console.log('triggered');

            const umbraAddress = await generateUmbraAddress(signMessage!);
            const x25519Keypair = generateX25519Keypair(umbraAddress);
            console.log(x25519Keypair, 'x25519Keypair');

            umbraStore.setUmbraAddress(umbraAddress);
            umbraStore.setX25519PrivKey(x25519Keypair.privateKey);

            console.log('publickey', publicKey);
            console.log('umbraAddress', umbraAddress);

            // const userAccount = await program.account.umbraUserAccount.fetch(userAccountPDA);

            const result = tryFetchUserAccount(umbraAddress);

            if (await result) {
                let tokenListRaw = await fetchTokenList(publicKey!);
                const tokenList = tokenListRaw.encrypted_token_list;
                const tokenListWithPubkeys = tokenList
                    ? tokenList.map((token: any) => ({
                          ...token,
                          mintAddress: new PublicKey(token.mintAddress),
                      }))
                    : [];

                umbraStore.setTokenList(tokenListWithPubkeys);

                // do something with the result
                console.log('User account found:', result);
                router.push('/transactions/deposit');

                return;
            }

            // Sending the blockchain transactions
            const tx = await createUserAccountCreationTransaction(
                x25519Keypair.publicKey,
                umbraAddress,
                publicKey!,
            );
            await signTransaction!(tx);
            let response = await sendTransactionToRelayer(tx);
            console.log((await response.json()).signature);

            setMintingTokens(true);

            // Mint balances on equivalent mints
            await MintTokensToUser(publicKey!);

            let tokenListRaw = await fetchTokenList(publicKey!);
            const tokenList = tokenListRaw.encrypted_token_list;
            const tokenListWithPubkeys = tokenList
                ? tokenList.map((token: any) => ({
                      ...token,
                      mintAddress: new PublicKey(token.mintAddress),
                  }))
                : [];

            umbraStore.setTokenList(tokenListWithPubkeys);

            router.push('/transactions/deposit');
            setIsLoading(false);

            // 2. Fetch wallet SOL balance if needed
            if (showBalance) {
                await fetchWalletBalance(publicKey);
            }

            // 3. Call onConnect callback if provided
            if (onConnect) {
                onConnect(publicKey);
            }

            console.log('Wallet connected:', publicKey.toString());
        } catch (error) {
            console.error('Error handling wallet connection:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Fetch wallet SOL balance
    const fetchWalletBalance = async (publicKey: PublicKey) => {
        try {
            // Connect to Solana devnet (change to mainnet-beta for production)
            const connection = new Connection('https://api.devnet.solana.com', 'confirmed');

            // Get account balance
            const balance = await connection.getBalance(publicKey);

            // Convert lamports to SOL
            const solBalance = balance / LAMPORTS_PER_SOL;

            // Update state
            setBalance(solBalance);

            console.log('Wallet balance:', solBalance, 'SOL');
        } catch (error) {
            console.error('Error fetching balance:', error);
        }
    };

    // Format address for display
    const formatAddress = (address: string) => {
        return `${address.slice(0, 4)}...${address.slice(-4)}`;
    };

    // If not mounted yet, show a placeholder to avoid hydration mismatch
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

    // If connected, show the connected state with address
    if (connected && publicKey) {
        // Minimal variant (just address and disconnect)
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

        // Navbar variant (more compact)
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

        // Default variant
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
                    (isLoading ? (
                        <div className="flex items-center justify-center py-2">
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            <span className="text-sm text-gray-400">Loading balance...</span>
                        </div>
                    ) : balance !== null ? (
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

    // If connecting, show loading state
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
                Connecting...
            </button>
        );
    }

    // Default: show the wallet adapter button with appropriate styling
    return (
        <WalletMultiButton
            className={cn(
                'wallet-adapter-button',
                variant === 'navbar' && 'text-xs px-3 py-1.5 h-auto',
                className,
            )}
            onClick={() => setTrigger(!trigger)}
        />
    );
}
