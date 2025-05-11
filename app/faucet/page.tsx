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

    // List of famous tokens with their mint addresses
    const famousTokens = [
        { label: 'Solana (SOL)', symbol: 'SOL', mint: 'So11111111111111111111111111111111111111112' },
        { label: 'USD Coin (USDC)', symbol: 'USDC', mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v' },
        { label: 'Tether (USDT)', symbol: 'USDT', mint: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB' },
        { label: 'Jupiter (JUP)', symbol: 'JUP', mint: 'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN' },
        { label: 'Raydium (RAY)', symbol: 'RAY', mint: '4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R' },
        { label: 'Jito (JTO)', symbol: 'JTO', mint: 'jtojtomepa8beP8AuQc6eXt5FriJwfFMwQx2v2f9mCL' },
        { label: 'Orca (ORCA)', symbol: 'ORCA', mint: 'orcaEKta1tGJ5yY6zTz6z5QdE5Q3QkektZE' },
        { label: 'Other token', symbol: '', mint: '' },
    ];
    const [selectedToken, setSelectedToken] = useState<string>('');

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
                
                {/* Token Dropdown */}
                <div className="mb-4">
                    <label htmlFor="tokenDropdown" className="block text-sm text-gray-400 mb-2">
                        Select a Token (optional)
                    </label>
                    <select
                        id="tokenDropdown"
                        value={selectedToken}
                        onChange={(e) => {
                            const selected = famousTokens.find(t => t.mint === e.target.value);
                            setSelectedToken(e.target.value);
                            if (selected && selected.label !== 'Other token') {
                                setMintAddress(selected.mint);
                                setMintTicker(selected.symbol);
                            } else {
                                setMintAddress('');
                                setMintTicker('');
                            }
                        }}
                        className="w-full bg-[#18181b] text-white border border-gray-800 p-3 outline-none rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-150 appearance-none"
                        style={{
                            backgroundColor: '#18181b',
                            color: '#fff',
                        }}
                    >
                        <option value="" className="bg-[#18181b] text-gray-400">-- Select a token --</option>
                        {famousTokens.map(token => (
                            <option key={token.label} value={token.mint} className="bg-[#18181b] text-white">
                                {token.label}
                            </option>
                        ))}
                    </select>
                </div>
                
                {/* Mint Address and Ticker Inputs: Only show if 'Other token' is selected */}
                {selectedToken === '' || famousTokens.find(t => t.mint === selectedToken)?.label === 'Other token' ? (
                    <>
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
                    </>
                ) : null}
                
                {/* Amount Input: Always show */}
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