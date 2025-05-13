'use client';

import { FC, ReactNode, useMemo } from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import {
    CoinbaseWalletAdapter,
    PhantomWalletAdapter,
    SolflareWalletAdapter,
    TorusWalletAdapter,
} from '@solana/wallet-adapter-wallets';
import { clusterApiUrl } from '@solana/web3.js';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';

export const SolanaWalletProvider: FC<{ children: ReactNode }> = ({ children }) => {
    // The network can be set to 'devnet', 'testnet', or 'mainnet-beta'
    const network = WalletAdapterNetwork.Devnet;

    // You can also provide a custom RPC endpoint
    const endpoint = useMemo(() => 'http://localhost:8899', []);

    // @solana/wallet-adapter-wallets includes all the adapters but supports tree shaking
    const wallets = useMemo(
        () => [
            new PhantomWalletAdapter(),
            new SolflareWalletAdapter(),
            new CoinbaseWalletAdapter(),
            new TorusWalletAdapter(),
        ],
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [network],
    );

    return (
        <ConnectionProvider endpoint={endpoint}>
            <WalletProvider wallets={wallets} autoConnect>
                <WalletModalProvider> {children}</WalletModalProvider>
            </WalletProvider>
        </ConnectionProvider>
    );
};
