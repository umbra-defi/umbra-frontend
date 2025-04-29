'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function SignupPage() {
    const router = useRouter();
    const [selectedWallet, setSelectedWallet] = useState(null);
    const [walletConnected, setWalletConnected] = useState(false);
    const [walletAddress, setWalletAddress] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
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

    const handleSignup = async (e) => {
        e.preventDefault();
        setError('');

        if (!walletConnected) {
            setError('Please connect a wallet first');
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (password.length < 8) {
            setError('Password must be at least 8 characters');
            return;
        }

        setLoading(true);

        try {
            // Simulate API call to create user
            await new Promise((resolve) => setTimeout(resolve, 1000));

            // Redirect to transactions page
            router.push('/transactions');
        } catch (err) {
            setError('Failed to create account. Please try again.');
            setLoading(false);
        }
    };

    const resetState = () => {
        setSelectedWallet(null);
        setWalletConnected(false);
        setWalletAddress('');
        setPassword('');
        setConfirmPassword('');
        setError('');
    };

    return (
        <>
            {!walletConnected ? (
                <div className="space-y-4" data-oid="zjirn2w">
                    <p className="text-sm text-gray-400 mb-4" data-oid="91pkuwn">
                        Select a wallet to sign up:
                    </p>

                    {wallets.map((wallet) => (
                        <motion.button
                            key={wallet.id}
                            onClick={() => connectWallet(wallet.id)}
                            disabled={loading}
                            className="w-full flex items-center justify-center space-x-2 py-3 px-4 border border-gray-800 hover:bg-[#111] transition-colors"
                            whileHover={{ backgroundColor: '#111' }}
                            whileTap={{ scale: 0.98 }}
                            data-oid="oib2y4q"
                        >
                            <span className="text-xl" data-oid="8b.ak_m">
                                {wallet.icon}
                            </span>
                            <span className="tracking-wide text-[#FFFFFF]" data-oid="khd6p7e">
                                {wallet.name}
                            </span>
                        </motion.button>
                    ))}
                </div>
            ) : (
                <div data-oid="b8uatyb">
                    <form onSubmit={handleSignup} className="space-y-5" data-oid="u9di9hc">
                        <div
                            className="bg-black p-4 mb-4 border border-gray-800"
                            data-oid="--k:-9w"
                        >
                            <p className="text-sm text-gray-400" data-oid="r.jh0lo">
                                Connected Wallet
                            </p>
                            <p className="text-sm font-mono mt-1" data-oid="jny3uj5">
                                {walletAddress}
                            </p>
                        </div>

                        <div data-oid="350atx3">
                            <label className="block text-sm text-gray-400 mb-2" data-oid="wwu1niw">
                                Set Password
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-black border border-gray-800 p-3 text-white outline-none"
                                placeholder="Enter password"
                                required
                                data-oid="llgllf-"
                            />
                        </div>

                        <div data-oid="tez3fh8">
                            <label className="block text-sm text-gray-400 mb-2" data-oid="joben9c">
                                Confirm Password
                            </label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full bg-black border border-gray-800 p-3 text-white outline-none"
                                placeholder="Confirm password"
                                required
                                data-oid="f6tcr5n"
                            />
                        </div>

                        {error && (
                            <motion.p
                                className="text-red-500 text-sm"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.3 }}
                                data-oid="bxv81ej"
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
                            data-oid="13v3tdl"
                        >
                            {loading ? 'Processing...' : 'Create Account'}
                        </motion.button>
                    </form>

                    <button
                        onClick={resetState}
                        className="w-full mt-5 text-sm text-gray-400 hover:text-gray-300 py-2"
                        data-oid="fo:29ty"
                    >
                        Disconnect wallet and try another
                    </button>
                </div>
            )}
        </>
    );
}
