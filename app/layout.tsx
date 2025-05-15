import type { Metadata } from 'next';
import './globals.css';
import { Instrument_Sans, Inter } from 'next/font/google';

import { SolanaWalletProvider } from './providers/WalletProvider';
import { Toaster } from 'react-hot-toast';
export const metadata: Metadata = {
    title: 'Umbra',
    description: 'End-to-end encrypted transfers on Solana powered by Arcium',
    openGraph: {
        title: 'Umbra',
        description: 'End-to-end encrypted transfers on Solana powered by Arcium',
        images: [
            {
                url: 'images/social.jpg',
                width: 800,
                height: 600,
                alt: 'Umbra',
            },
        ],
    },
};

const instrument_Sans = Instrument_Sans({ subsets: ['latin'] });

// const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    return (
        <html lang="en" data-oid="h87ffk2" suppressHydrationWarning={true}>
            <body className={instrument_Sans.className} data-oid="-x-.vry">
                <Toaster position="top-right" />
                <SolanaWalletProvider>{children}</SolanaWalletProvider>
            </body>
        </html>
    );
}
