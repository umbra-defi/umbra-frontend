import type { Metadata } from 'next';
import { Space_Grotesk } from 'next/font/google';
import './globals.css';
const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700']
});
export const metadata: Metadata = {
  title: 'Umbra - Solana Web3 App',
  description: 'A secure Solana web3 application for transactions'
};
export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <html lang="en" data-oid="7641w5t">
            <body className={spaceGrotesk.className} data-oid="rqu3tam">
                {children}</body>
        </html>;
}