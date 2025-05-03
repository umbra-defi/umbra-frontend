'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { toastError } from '@/lib/utils';
import { useWallet } from '@solana/wallet-adapter-react';
import { generateAesKey } from '../signup/utils';
import { PhantomWalletName, SolflareWalletName } from '@solana/wallet-adapter-wallets';
import { decryptUserInformationWithAesKey, tryLogin } from '@/app/auth/login/utils';
import { compare } from 'bcryptjs';
import { useUmbraStore } from '@/app/store/umbraStore';

export default function LoginPage() {
    const router = useRouter();
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const wallet = useWallet();
    const umbraStore = useUmbraStore();

    useEffect(() => {
        wallet.disconnect();
    }, [])

    const wallets = [
        { id: 'phantom', name: 'PHANTOM', icon: '🟣', wallet_name: PhantomWalletName },
        { id: 'solflare', name: 'SOLFLARE', icon: '🟡', wallet_name: SolflareWalletName },
    ];

    const connectWallet = async (walletName: any) => {
        setLoading(true);

        try {
            await wallet.select(walletName)
            await wallet.connect();
        } catch (err) {
            console.log(err);
        }

        setLoading(false);
    };

    const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!wallet.connected) {
            return;
        }

        if (!password) {
            toastError('Password is required');
            return;
        }

        setLoading(true);

        const walletDetails = await tryLogin(wallet.publicKey!.toBase58(), password);
        if (walletDetails === null) {
            toastError("Wallet is not registered! Redirecting to Signup...")
            setLoading(false);
            router.push('/auth/signup');
            return;
        }
        if (!(await compare(password, walletDetails.password))) {
            toastError("Incorrect Password!");
            setPassword('');
            return;
        }

        const aesKey = await generateAesKey(password);
        const {x25519Keypair, umbraAddress} = await decryptUserInformationWithAesKey(walletDetails.encrypted_data, aesKey);
        umbraStore.setX25519PrivKey(x25519Keypair.privateKey);
        umbraStore.setUmbraAddress(umbraAddress);
        router.push('/transactions/deposit');
        setLoading(false);

    };

    const resetState = () => {
        setPassword('');
    };

    return (
        <>
            {!wallet.connected ? (
                <div className="space-y-4" data-oid="3wsedef">
                    <p className="text-sm text-gray-400 mb-4" data-oid="i6nw670">
                        Select a wallet to login:
                    </p>

                    {wallets.map((wallet) => (
                        <motion.button
                            key={wallet.id}
                            onClick={() => connectWallet(wallet.wallet_name)}
                            disabled={loading}
                            className="w-full flex items-center justify-center space-x-2 py-3 px-4 border border-gray-800 hover:bg-[#111] transition-colors"
                            whileHover={{ backgroundColor: '#111' }}
                            whileTap={{ scale: 0.98 }}
                            data-oid="y5p4b2e"
                        >
                            <span className="text-xl" data-oid="j3t.bbf">
                                {wallet.icon}
                            </span>
                            <span
                                className="tracking-wide bg-[#FFFFFF00] text-[#FFFFFF]"
                                data-oid="4cw8s7u"
                            >
                                {wallet.name}
                            </span>
                        </motion.button>
                    ))}
                </div>
            ) : wallet.disconnecting ? "Wallet Disconnecting.." : (
                <div data-oid="06zufpo">
                    <form onSubmit={handleLogin} className="space-y-5" data-oid="6zp6d57">
                        <div
                            className="bg-black p-4 mb-4 border border-gray-800"
                            data-oid="t:5kwfg"
                        >
                            <p className="text-sm text-gray-400" data-oid="m7cvkt5">
                                Connected Wallet
                            </p>
                            <p className="text-sm text-gray-400 font-mono mt-1" data-oid="bwbjt2j">
                                {wallet.publicKey!.toBase58()}
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
