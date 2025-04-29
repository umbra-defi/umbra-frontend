'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function LoginPage() {
    const router = useRouter();
    const [selectedWallet, setSelectedWallet] = useState(null);
    const [walletConnected, setWalletConnected] = useState(false);
    const [walletAddress, setWalletAddress] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const wallets = [
        { id: 'phantom', name: 'PHANTOM', icon: '🟣' },
        { id: 'solflare', name: 'SOLFLARE', icon: '🟡' },
        { id: 'brave', name: 'BRAVE WALLET', icon: '🟠' },
    ];

    const connectWallet = async (walletId) => {
        setLoading(true);
        setError('');

        try {
            // Simulating wallet connection with web3.js
            await new Promise((resolve) => setTimeout(resolve, 1000));

            // Mock successful connection
            setSelectedWallet(walletId);
            setWalletConnected(true);
            setWalletAddress('8xH4ck...F9jKm'); // Mock wallet address
            setLoading(false);
        } catch (err) {
            setError('Failed to connect wallet. Please try again.');
            setLoading(false);
        }
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');

        if (!walletConnected) {
            setError('Please connect a wallet first');
            return;
        }

        if (!password) {
            setError('Password is required');
            return;
        }

        setLoading(true);

        try {
            // Simulate API call to verify user
            await new Promise((resolve) => setTimeout(resolve, 1000));

            // Mock user verification
            const userExists = true; // In real app, check if user exists in database

            if (userExists) {
                // Redirect to transactions page
                router.push('/transactions');
            } else {
                setError('Wallet not registered. Please sign up first.');
                router.push('/auth/signup');
                setLoading(false);
            }
        } catch (err) {
            setError('Login failed. Please check your credentials and try again.');
            setLoading(false);
        }
    };

    const resetState = () => {
        setSelectedWallet(null);
        setWalletConnected(false);
        setWalletAddress('');
        setPassword('');
        setError('');
    };

    return (
        <>
            {!walletConnected ? (
                <div className="space-y-4" data-oid="3wsedef">
                    <p className="text-sm text-gray-400 mb-4" data-oid="i6nw670">
                        Select a wallet to login:
                    </p>

                    {wallets.map((wallet) => (
                        <motion.button
                            key={wallet.id}
                            onClick={() => connectWallet(wallet.id)}
                            disabled={loading}
                            className="w-full flex items-center justify-center space-x-2 py-3 px-4 border border-gray-800 hover:bg-[#111] transition-colors"
                            whileHover={{ backgroundColor: '#111' }}
                            whileTap={{ scale: 0.98 }}
                            data-oid="y5p4b2e"
                        >
                            <span className="text-xl" data-oid="j3t.bbf">
                                {wallet.icon}
                            </span>
                            <span className="tracking-wide" data-oid="4cw8s7u">
                                {wallet.name}
                            </span>
                        </motion.button>
                    ))}
                </div>
            ) : (
                <div data-oid="06zufpo">
                    <form onSubmit={handleLogin} className="space-y-5" data-oid="6zp6d57">
                        <div
                            className="bg-black p-4 mb-4 border border-gray-800"
                            data-oid="t:5kwfg"
                        >
                            <p className="text-sm text-gray-400" data-oid="m7cvkt5">
                                Connected Wallet
                            </p>
                            <p className="text-sm font-mono mt-1" data-oid="bwbjt2j">
                                {walletAddress}
                            </p>
                        </div>

                        <div data-oid="fkq-tpj">
                            <label className="block text-sm text-gray-400 mb-2" data-oid="jy1s-3:">
                                Password
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-black border border-gray-800 p-3 text-white outline-none"
                                placeholder="Enter your password"
                                required
                                data-oid="-gredc5"
                            />
                        </div>

                        {error && (
                            <motion.p
                                className="text-red-500 text-sm"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.3 }}
                                data-oid="4wkz5bp"
                            >
                                {error}
                            </motion.p>
                        )}

                        <motion.button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-white text-black py-3 font-medium tracking-wider"
                            whileHover={{ backgroundColor: '#f0f0f0' }}
                            whileTap={{ scale: 0.98 }}
                            data-oid="9i4y1f:"
                        >
                            {loading ? 'Verifying...' : 'Login'}
                        </motion.button>
                    </form>

                    <button
                        onClick={resetState}
                        className="w-full mt-5 text-sm text-gray-400 hover:text-gray-300 py-2"
                        data-oid="l5qn85y"
                    >
                        Disconnect wallet and try another
                    </button>
                </div>
            )}
        </>
    );
}
