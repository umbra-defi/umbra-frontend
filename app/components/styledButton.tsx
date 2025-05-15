'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal, WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { motion } from 'framer-motion';

export function StyledWalletMultiButton({ loading = false }: { loading?: boolean }) {
    const { connected } = useWallet();
    const { setVisible } = useWalletModal();

    const handleClick = () => {
        if (connected) {
        } else {
            setVisible(true);
        }
    };
    // This wrapper will apply the exact styling to the WalletMultiButton
    return (
        <motion.button
            className="w-full bg-white text-black py-3 font-medium uppercase tracking-wider mt-6 flex items-center justify-center disabled:opacity-60 disabled:cursor-not-allowed"
            onClick={handleClick}
            whileHover={{ backgroundColor: '#f0f0f0' }}
            whileTap={{ scale: 0.98 }}
            data-oid=":xcq1mj"
        >
            Connect Wallet
        </motion.button>
    );
}
