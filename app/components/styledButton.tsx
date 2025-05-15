'use client';

import { cn } from '@/lib/utils';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal, WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { useUmbraStore } from '../store/umbraStore';

export function StyledWalletMultiButton({ loading = false }: { loading?: boolean }) {
    const { connected } = useWallet();
    const { setVisible } = useWalletModal();

    const handleClick = () => {
        if (connected) {
        } else {
            setVisible(true);
        }
    };

    const umbraStore = useUmbraStore();

    if (umbraStore.loading) {
        return (
            <button
                disabled
                className="w-full bg-white text-black py-3 font-medium uppercase tracking-wider mt-6 flex items-center justify-center disabled:opacity-60 disabled:cursor-not-allowed"
            >
                <Loader2 className={cn('animate-spin mr-2')} />
                {umbraStore.loadingMessage}
            </button>
        );
    }

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
