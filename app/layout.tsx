import type { Metadata } from 'next';
import './globals.css';
import { SolanaWalletProvider } from './providers/WalletProvider';
import { Toaster } from 'react-hot-toast';
export const metadata: Metadata = {
    title: 'Umbra - Solana Web3 App',
    description: 'A secure Solana web3 application for transactions',
    openGraph: {
        title: 'Umbra - Solana Web3 App',
        description: 'A secure Solana web3 application for transactions',
        images: [
            {
                url: 'https://umbra-frontend.vercel.app/IMG1.png',
                width: 800,
                height: 600,
                alt: 'Umbra',
            },
        ],
    },
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    return (
        <html lang="en" data-oid="h87ffk2">
            {/* <meta property="og:image" content="./IMG1.png" /> */}
            <body className="" data-oid="-x-.vry">
                <Toaster position="top-right" />
                <SolanaWalletProvider>{children}</SolanaWalletProvider>
            </body>
        </html>
    );
}
