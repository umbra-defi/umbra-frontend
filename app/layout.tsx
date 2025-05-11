import type { Metadata } from 'next';
import './globals.css';
import { SolanaWalletProvider } from './providers/WalletProvider';
import { Toaster } from 'react-hot-toast'
export const metadata: Metadata = {
    title: 'Umbra - Solana Web3 App',
    description: 'A secure Solana web3 application for transactions',
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {

    return (
        <html lang="en" data-oid="h87ffk2" suppressHydrationWarning={true}>
            <body className="" data-oid="-x-.vry">
                <Toaster position="top-right" />
                <SolanaWalletProvider>
                    {children}
                </SolanaWalletProvider>
            </body>
        </html>
    );
}
