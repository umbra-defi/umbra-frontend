import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {
    title: 'Umbra - Solana Web3 App',
    description: 'A secure Solana web3 application for transactions',
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    return (
        <html lang="en" data-oid="h87ffk2">
            <body className="" data-oid="-x-.vry">
                {children}
            </body>
        </html>
    );
}
