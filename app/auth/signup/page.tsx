'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
    generateX25519Keypair,
    generateUmbraAddress, 
    generateAesKey, 
    encryptUserInformationWithAesKey, 
    pushRegistrationToUmbraBackend, 
    checkIfDatabaseEntryExists, 
    getFirstRelayer,
    createUserAccountCreationTransaction,
    MintTokensToUser,
    fetchTokenList,
    sendTransactionToRelayer} 
from '@/app/auth/signup/utils';
import { useUmbraStore } from '@/app/store/umbraStore';
import { useWallet } from '@solana/wallet-adapter-react';
import { PhantomWalletName, SolflareWalletName } from '@solana/wallet-adapter-wallets';
import { getTokenBalance, getUmbraProgram, toastError } from '@/lib/utils';
import { createUserAccount } from '@/lib/umbra-program/umbra';
import { Connection, PublicKey } from '@solana/web3.js';

export default function SignupPage() {
    const router = useRouter();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [mintingTokens, setMintingTokens] = useState<boolean>(false);
 
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

    const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!wallet.connected) {
            toastError('Please connect a wallet first...')
            return;
        }

        if (password !== confirmPassword) {
            toastError('Passwords do not match');
            return;
        }

        if (password.length < 8) {
            toastError('Password must be at least 8 characters');
            return;
        }

        setLoading(true);
        const isUserRegistered = await checkIfDatabaseEntryExists(wallet.publicKey!.toBase58())
        if (isUserRegistered) {
            toastError('User with this wallet already exists! Redirecting to Login...')
            setLoading(false);
            wallet.disconnect();
            while (wallet.disconnecting);
            router.push('/auth/login')
            return;
        }

        // Client Side Creation!
        const x25519Keypair = generateX25519Keypair();
        const umbraAddress = generateUmbraAddress();
        const aesKey = await generateAesKey(password);
        const encryptedUserInformation = await encryptUserInformationWithAesKey(
            x25519Keypair.privateKey,
            umbraAddress,
            aesKey
        );
        const walletAddress = wallet.publicKey!;

        // Setting the Zustand Store
        umbraStore.setUmbraAddress(umbraAddress);
        umbraStore.setX25519PrivKey(x25519Keypair.privateKey);


        // Sending the blockchain transactions
        const tx = await createUserAccountCreationTransaction(x25519Keypair.publicKey, umbraAddress, wallet.publicKey!)
        await wallet.signTransaction!(tx);
        let response = await sendTransactionToRelayer(tx);
        console.log((await response.json()).signature);

        await pushRegistrationToUmbraBackend(
            walletAddress,
            password,
            encryptedUserInformation
        );
        setMintingTokens(true)

        // Mint balances on equivalent mints
        await MintTokensToUser(wallet.publicKey!)

        let tokenListRaw = await fetchTokenList(wallet.publicKey!)
        const tokenList = JSON.parse(tokenListRaw.encrypted_token_list);
        const tokenListWithPubkeys = tokenList ? tokenList.map((token: any) => ({
            ...token,
            mintAddress: new PublicKey(token.mintAddress)
        })): [];

        umbraStore.setTokenList(tokenListWithPubkeys);
        router.push('/transactions/deposit');
        setLoading(false);
    };

    const resetState = () => {

        if (wallet.connected) {
            wallet.disconnect();
        }
    
        setPassword('');
        setConfirmPassword('');
    };

    return (
        <>
            {!wallet.connected ? (
                <div className="space-y-4" data-oid="zjirn2w">
                    <p className="text-sm text-gray-400 mb-4" data-oid="91pkuwn">
                        Select a wallet to sign up:
                    </p>

                    {wallets.map((wallet) => (
                        <motion.button
                            key={wallet.id}
                            onClick={() => connectWallet(wallet.wallet_name)}
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
            ) : wallet.disconnecting? "Wallet Disconnecting" : (
                <div data-oid="b8uatyb">
                    <form onSubmit={handleSignup} className="space-y-5" data-oid="u9di9hc">
                        <div
                            className="bg-black p-4 mb-4 border border-gray-800"
                            data-oid="--k:-9w"
                        >
                            <p className="text-sm text-gray-400" data-oid="r.jh0lo">
                                {wallet.connected ? "Connected Wallet Address" : wallet.connecting ? "Connecting Your Wallet..." : "Connect Your Wallet..."}
                            </p>
                            <p className="text-sm text-gray-400 font-mono mt-1" data-oid="jny3uj5">
                                {wallet.publicKey?.toBase58()}
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

                        <motion.button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-white text-black py-3 font-medium tracking-wider"
                            whileHover={{ backgroundColor: '#f0f0f0' }}
                            whileTap={{ scale: 0.98 }}
                            data-oid="13v3tdl"
                        >
                            {loading ? mintingTokens ? 'Minting Your Tokens...' : "Processing..." : 'Create Account'}
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
