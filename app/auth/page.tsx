'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AuthPage() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('signup');
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
            // In a real app, you would use the actual web3.js and wallet adapter libraries
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
                setActiveTab('signup');
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
        setConfirmPassword('');
        setError('');
    };

    useEffect(() => {
        resetState();
    }, [activeTab]);

    return (
        <div
            className="w-full min-h-screen flex flex-col bg-[#000000] text-white"
            data-oid="ealykgi"
        >
            {/* Header */}
            <header
                className="w-full p-6 flex justify-between items-center border-b border-gray-900"
                data-oid="njjsk9t"
            >
                <div className="text-white font-bold text-xl" data-oid="o022w:z">
                    UMBRA
                </div>
                <div className="flex items-center gap-4" data-oid="m529abf">
                    <Link href="/" data-oid="a1l4:eo">
                        <button
                            className="text-white border border-gray-900 px-4 py-2 hover:bg-gray-900 transition-colors"
                            data-oid="7qgq_a5"
                        >
                            Home
                        </button>
                    </Link>
                </div>
            </header>

            {/* Main Content */}
            <div className="flex-1 flex items-center justify-center p-4" data-oid="vj0ka-8">
                <div className="w-full max-w-md" data-oid="6af.5.l">
                    {/* Auth Container */}
                    <div className="border border-gray-900 overflow-hidden" data-oid="aoyu3_8">
                        {/* Tabs */}
                        <div
                            className="grid grid-cols-2 border-b border-gray-900"
                            data-oid="cgfdvxe"
                        >
                            <button
                                className={`py-3 text-center transition-colors ${
                                    activeTab === 'signup'
                                        ? 'bg-[#0a0a0f] text-white'
                                        : 'bg-transparent text-gray-400 hover:text-gray-300'
                                }`}
                                onClick={() => setActiveTab('signup')}
                                data-oid="e3b0776"
                            >
                                SIGN UP
                            </button>
                            <button
                                className={`py-3 text-center transition-colors ${
                                    activeTab === 'login'
                                        ? 'bg-[#0a0a0f] text-white'
                                        : 'bg-transparent text-gray-400 hover:text-gray-300'
                                }`}
                                onClick={() => setActiveTab('login')}
                                data-oid="rh.cdyq"
                            >
                                LOGIN
                            </button>
                        </div>

                        {/* Content */}
                        <div className="bg-[#0a0a0f] p-6" data-oid="rvb4iy0">
                            {!walletConnected ? (
                                <div className="space-y-3" data-oid="lsdy6y1">
                                    <p className="text-sm text-gray-400 mb-4" data-oid="jhrh52f">
                                        {activeTab === 'signup'
                                            ? 'Select a wallet to sign up:'
                                            : 'Select a wallet to login:'}
                                    </p>

                                    {wallets.map((wallet) => (
                                        <button
                                            key={wallet.id}
                                            onClick={() => connectWallet(wallet.id)}
                                            disabled={loading}
                                            className="w-full flex items-center justify-center space-x-2 py-3 px-4 border border-gray-900 hover:bg-[#111] transition-colors"
                                            data-oid="b:3m-2c"
                                        >
                                            <span className="text-xl" data-oid="e86so.y">
                                                {wallet.icon}
                                            </span>
                                            <span data-oid="rjnv.:n">{wallet.name}</span>
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <div data-oid="a6i9:2f">
                                    {activeTab === 'signup' ? (
                                        <form
                                            onSubmit={handleSignup}
                                            className="space-y-4"
                                            data-oid="g0hn.1r"
                                        >
                                            <div
                                                className="bg-black p-3 mb-4 border border-gray-900"
                                                data-oid="-41.5tu"
                                            >
                                                <p
                                                    className="text-sm text-gray-400"
                                                    data-oid="yl58xo8"
                                                >
                                                    Connected Wallet
                                                </p>
                                                <p className="text-sm font-mono" data-oid="p2_lmsb">
                                                    {walletAddress}
                                                </p>
                                            </div>

                                            <div data-oid="2hm3-82">
                                                <label
                                                    className="block text-sm text-gray-400 mb-1"
                                                    data-oid="fsqjjfo"
                                                >
                                                    Set Password
                                                </label>
                                                <input
                                                    type="password"
                                                    value={password}
                                                    onChange={(e) => setPassword(e.target.value)}
                                                    className="w-full bg-black border border-gray-900 p-2 text-white outline-none"
                                                    placeholder="Enter password"
                                                    required
                                                    data-oid="lj0b::1"
                                                />
                                            </div>

                                            <div data-oid="1:0vbiu">
                                                <label
                                                    className="block text-sm text-gray-400 mb-1"
                                                    data-oid="a0tty-y"
                                                >
                                                    Confirm Password
                                                </label>
                                                <input
                                                    type="password"
                                                    value={confirmPassword}
                                                    onChange={(e) =>
                                                        setConfirmPassword(e.target.value)
                                                    }
                                                    className="w-full bg-black border border-gray-900 p-2 text-white outline-none"
                                                    placeholder="Confirm password"
                                                    required
                                                    data-oid="wdei07c"
                                                />
                                            </div>

                                            {error && (
                                                <p
                                                    className="text-red-500 text-sm"
                                                    data-oid=".3c43v9"
                                                >
                                                    {error}
                                                </p>
                                            )}

                                            <button
                                                type="submit"
                                                disabled={loading}
                                                className="w-full bg-white text-black py-2 transition-colors"
                                                data-oid="4t6e9p_"
                                            >
                                                {loading ? 'Processing...' : 'Proceed'}
                                            </button>
                                        </form>
                                    ) : (
                                        <form
                                            onSubmit={handleLogin}
                                            className="space-y-4"
                                            data-oid=":iqqzvp"
                                        >
                                            <div
                                                className="bg-black p-3 mb-4 border border-gray-900"
                                                data-oid="79paon_"
                                            >
                                                <p
                                                    className="text-sm text-gray-400"
                                                    data-oid="pqh674m"
                                                >
                                                    Connected Wallet
                                                </p>
                                                <p className="text-sm font-mono" data-oid="e.xmd8d">
                                                    {walletAddress}
                                                </p>
                                            </div>

                                            <div data-oid="jj9b8se">
                                                <label
                                                    className="block text-sm text-gray-400 mb-1"
                                                    data-oid="33klc-8"
                                                >
                                                    Password
                                                </label>
                                                <input
                                                    type="password"
                                                    value={password}
                                                    onChange={(e) => setPassword(e.target.value)}
                                                    className="w-full bg-black border border-gray-900 p-2 text-white outline-none"
                                                    placeholder="Enter your password"
                                                    required
                                                    data-oid="_e4ybxv"
                                                />
                                            </div>

                                            {error && (
                                                <p
                                                    className="text-red-500 text-sm"
                                                    data-oid="bgfpc1:"
                                                >
                                                    {error}
                                                </p>
                                            )}

                                            <button
                                                type="submit"
                                                disabled={loading}
                                                className="w-full bg-white text-black py-2 transition-colors"
                                                data-oid="62ur1p5"
                                            >
                                                {loading ? 'Verifying...' : 'Login'}
                                            </button>
                                        </form>
                                    )}

                                    <button
                                        onClick={resetState}
                                        className="w-full mt-4 text-sm text-gray-400 hover:text-gray-300"
                                        data-oid="bx4zg7w"
                                    >
                                        Disconnect wallet and try another
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
