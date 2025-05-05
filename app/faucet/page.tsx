'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useWallet } from '@solana/wallet-adapter-react';
import Link from 'next/link';

export default function FaucetPage() {
    const [mintAddress, setMintAddress] = useState<string>('');
    const [amount, setAmount] = useState<string>('');
    const [mintTicker, setMintTicker] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [result, setResult] = useState<string>('');

    const wallet = useWallet();

    const handleAirdrop = async () => {
        if (!mintAddress || !amount) {
            setResult('Please enter a mint address and amount');
            return;
        }
        
        setIsLoading(true);
        setResult('');
        
        try {
            const response = await fetch('/api/launchMint', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    amountToMint: parseFloat(amount),
                    mintAddressOnMainnet: mintAddress,
                    mintTicker: mintTicker || 'Unknown',
                    recipient: wallet.publicKey,
                }),
            });
            
            const data = await response.json();
            
            if (data.success) {
                setResult(
                    `Success! Token ${data.tokenName ? `"${data.tokenName}" (${data.tokenSymbol})` : mintTicker} minted at address: ${data.mintAddress}`
                );
            } else {
                setResult(`Error: ${data.error}`);
            }
        } catch (error) {
            setResult(`Request failed: ${error}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-black">
            <div className="w-full max-w-md p-6 border border-gray-800 bg-black">
                <div className="mb-4">
                    <Link href="/transactions/deposit" className="text-sm text-gray-400 hover:text-white">
                        ← Back to Deposits
                    </Link>
                </div>
                <h1 className="text-2xl font-bold text-white mb-2 text-center">Token Simulator</h1>
                <p className="text-gray-400 text-sm text-center mb-6">
                    Simulate your main-net tokens on devnet by minting your current balance. 
                    This allows you to test and experiment with your tokens in a safe environment.
                </p>
                
                {/* Mint Address Input */}
                <div className="mb-4">
                    <label htmlFor="mintAddress" className="block text-sm text-gray-400 mb-2">
                        Mint Address
                    </label>
                    <input
                        id="mintAddress"
                        type="text"
                        value={mintAddress}
                        onChange={(e) => setMintAddress(e.target.value)}
                        className="w-full bg-transparent text-white border border-gray-800 p-3 outline-none"
                        placeholder="Enter mint address"
                    />
                </div>
                
                {/* Mint Ticker Input */}
                <div className="mb-4">
                    <label htmlFor="mintTicker" className="block text-sm text-gray-400 mb-2">
                        Mint Ticker (Optional)
                    </label>
                    <input
                        id="mintTicker"
                        type="text"
                        value={mintTicker}
                        onChange={(e) => setMintTicker(e.target.value)}
                        className="w-full bg-transparent text-white border border-gray-800 p-3 outline-none"
                        placeholder="Enter token symbol (e.g. SOL) - only if metadata cannot be found"
                    />
                </div>
                
                {/* Amount Input */}
                <div className="mb-6">
                    <label htmlFor="amount" className="block text-sm text-gray-400 mb-2">
                        Amount
                    </label>
                    <input
                        id="amount"
                        type="text"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="w-full bg-transparent text-white border border-gray-800 p-3 outline-none"
                        placeholder="Enter amount"
                    />
                </div>
                
                {/* Airdrop Button */}
                <motion.button
                    className="w-full bg-white text-black py-3 font-medium uppercase tracking-wider disabled:opacity-50"
                    onClick={handleAirdrop}
                    whileHover={{ backgroundColor: '#f0f0f0' }}
                    whileTap={{ scale: 0.98 }}
                    disabled={isLoading}
                >
                    {isLoading ? 'Processing...' : 'Airdrop'}
                </motion.button>
                
                {/* Result Message */}
                {result && (
                    <div className="mt-4 p-3 text-sm border border-gray-800 text-white">
                        {result}
                    </div>
                )}
            </div>
        </div>
    );
} 