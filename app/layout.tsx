import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {
    title: 'Umbra - Solana Web3 App',
    description: 'A secure Solana web3 application for transactions',
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    return (
        <html lang="en" data-oid="7641w5t">
            <body className="" data-oid="rqu3tam">
                {children}
            </body>
        </html>
    );
}
