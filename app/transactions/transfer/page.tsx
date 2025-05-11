'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { feeTypes } from '../layout';
import { useWallet } from '@solana/wallet-adapter-react';
import { useUmbraStore } from '@/app/store/umbraStore';
import { getTokenAccountPDA, getUserAccountPDA, transferAmount } from '@/lib/umbra-program/umbra';
import { getConnection, getLocalnetConnection, getUmbraProgram, toastError } from '@/lib/utils';
import { awaitComputationFinalization, RescueCipher, x25519 } from '@arcium-hq/client';
import { mxePublicKey } from '@/lib/constants';
import { randomBytes } from 'crypto';
import { AnchorProvider, BN } from '@coral-xyz/anchor';
import { getFirstRelayer, sendTransactionToRelayer } from '@/app/auth/signup/utils';
import { Connection } from '@solana/web3.js';
import { getAccount, getAssociatedTokenAddress, getMint } from '@solana/spl-token';

export default function TransferPage() {
    const [recipientAddress, setRecipientAddress] = useState<string>('');
    const [searchToken, setSearchToken] = useState<string>('');
    const wallet = useWallet();
    const umbraStore = useUmbraStore();
    const tokenList = umbraStore.getTokenList();
    const tokens = Array.isArray(tokenList) ? tokenList : [];
    const filteredTokens = tokens.filter(
        (token) =>
            token.ticker.toLowerCase().includes(searchToken.toLowerCase()) ||
            token.ticker.toLowerCase().includes(searchToken.toLowerCase()),
    );


    const [amount, setAmount] = useState<string>('0');
    const [selectedToken, setSelectedToken] = useState<string>(filteredTokens[0]?.ticker);
    const [showTokenDropdown, setShowTokenDropdown] = useState<boolean>(false);
    const [showFeeDropdown, setShowFeeDropdown] = useState<boolean>(false);

    // Update umbraStore selected token when it changes
    useEffect(() => {
        if (selectedToken) {
            umbraStore.setSelectedTokenTicker(selectedToken);
        }
    }, [selectedToken]);

    // Fetch on-chain balance when wallet or selected token changes
    useEffect(() => {
        let isMounted = true;
        
        async function fetchOnChainBalance() {
            if (!wallet.publicKey || !selectedToken) return;
            
            try {
                const selectedTokenData = umbraStore.tokenList.find(token => token.ticker === selectedToken);
                if (!selectedTokenData) return;
                
                const connection = getConnection();
                const mintAddress = selectedTokenData.mintAddress;
                
                // Get mint info to get decimals
                try {
                    const mintInfo = await getMint(connection, mintAddress);
                    // Update token with decimals if it's not already set
                    if (selectedTokenData.decimals === undefined) {
                        const updatedTokenList = [...umbraStore.tokenList];
                        const tokenIndex = updatedTokenList.findIndex(t => t.ticker === selectedToken);
                        if (tokenIndex >= 0) {
                            updatedTokenList[tokenIndex] = {
                                ...updatedTokenList[tokenIndex],
                                decimals: mintInfo.decimals
                            };
                            umbraStore.setTokenList(updatedTokenList);
                        }
                    }
                    // Set selected token decimals
                    umbraStore.setSelectedTokenDecimals(mintInfo.decimals);
                } catch (error) {
                    console.error("Error fetching mint info:", error);
                }
                
                const userAssociatedTokenAccount = await getAssociatedTokenAddress(
                    mintAddress,
                    wallet.publicKey
                );
                
                try {
                    const tokenAccount = await getAccount(connection, userAssociatedTokenAccount, 'confirmed');
                    if (isMounted) {
                        const balance = Number(tokenAccount.amount);
                        umbraStore.setAvailableOnChainBalance(balance);
                        umbraStore.setSelectedTokenTicker(selectedToken);
                    }
                } catch (error) {
                    console.log("Token account not found:", error);
                    if (isMounted) {
                        umbraStore.setAvailableOnChainBalance(0);
                        umbraStore.setSelectedTokenTicker(selectedToken);
                    }
                }
            } catch (error) {
                console.error("Error fetching on-chain balance:", error);
            }
        }
        
        fetchOnChainBalance();
        
        return () => {
            isMounted = false;
        };
    }, [wallet.publicKey, selectedToken]);
    
    // Fetch Umbra wallet balance
    useEffect(() => {
        let isMounted = true;
        
        async function fetchUmbraWalletBalance() {
            if (!selectedToken) return;
            
            try {
                const selectedTokenData = umbraStore.tokenList.find(token => token.ticker === selectedToken);
                if (!selectedTokenData) return;
                
                const mintAddress = selectedTokenData.mintAddress;
                const userAccountPDA = getUserAccountPDA(Buffer.from(umbraStore.umbraAddress));
                const tokenAccountPDA = getTokenAccountPDA(userAccountPDA, mintAddress);
                
                const program = getUmbraProgram();
                const cipher = new RescueCipher(x25519.getSharedSecret(umbraStore.x25519PrivKey, mxePublicKey));
                
                try {
                    const tokenAccount = await program.account.umbraTokenAccount.fetch(tokenAccountPDA);
                    const nonce = tokenAccount.nonce[0].toArray('le', 16);
                    const decryptedBalance = cipher.decrypt([tokenAccount.balance[0]], Uint8Array.from(nonce));
                    
                    if (isMounted) {
                        umbraStore.setUmbraWalletBalance(Number(decryptedBalance[0]));
                        umbraStore.setSelectedTokenTicker(selectedToken);
                    }
                } catch (error) {
                    console.log("Umbra token account not found:", error);
                    if (isMounted) {
                        umbraStore.setUmbraWalletBalance(0);
                        umbraStore.setSelectedTokenTicker(selectedToken);
                    }
                }
            } catch (error) {
                console.error("Error fetching Umbra wallet balance:", error);
            }
        }
        
        fetchUmbraWalletBalance();
        
        return () => {
            isMounted = false;
        };
    }, [selectedToken]);

    // Calculate total fees
    const totalFees = feeTypes.reduce((sum, fee) => sum + fee.amount, 0);

    const handleSubmit = async () => {
        // Input validation
        if (!amount || amount === '0') {
            toastError("Please enter an amount greater than zero");
            return;
        }

        const amountNum = parseFloat(amount);
        if (isNaN(amountNum)) {
            toastError("Please enter a valid number");
            return;
        }

        if (amountNum < 0) {
            toastError("Amount cannot be negative");
            return;
        }

        if (!recipientAddress || recipientAddress.trim() === '') {
            toastError("Please enter a recipient address");
            return;
        }

        // Validate recipient address format (basic check)
        if (recipientAddress.length !== 64) {
            toastError("Invalid recipient address format");
            return;
        }

        const selectedTokenData = umbraStore.tokenList.find(token => token.ticker === selectedToken);
        const mintAddress = selectedTokenData!.mintAddress;
        const decimals = selectedTokenData?.decimals || 9;
        
        // Check if user has enough balance in Umbra wallet
        if (umbraStore.umbraWalletBalance !== undefined && 
            umbraStore.selectedTokenDecimals !== undefined) {
            const maxBalance = umbraStore.umbraWalletBalance / (10 ** umbraStore.selectedTokenDecimals);
            if (amountNum > maxBalance) {
                toastError(`Insufficient balance. Maximum available: ${maxBalance.toFixed(6)} ${selectedToken}`);
                return;
            }
        }
        
        // Convert input amount to token amount with proper decimals
        const rawAmount = Math.floor(parseFloat(amount) * (10 ** decimals));

        const program = getUmbraProgram();
        const userAccountPDA = getUserAccountPDA(Buffer.from(umbraStore.umbraAddress));
        const userTokenAccountPDA = getTokenAccountPDA(userAccountPDA, mintAddress);

        const receiverAccountPDA = getUserAccountPDA(Buffer.from(recipientAddress, 'hex'))
        const receiverTokenAccountPDA = getTokenAccountPDA(receiverAccountPDA, mintAddress);

        const cipher = new RescueCipher(x25519.getSharedSecret(umbraStore.x25519PrivKey, mxePublicKey));
        let tokenAccount = await program.account.umbraTokenAccount.fetch(userTokenAccountPDA);
        const nonce = tokenAccount.nonce[0].toArray('le', 16);
        let decryptedBalance = cipher.decrypt([tokenAccount.balance[0]], Uint8Array.from(nonce))[0]
        console.log(decryptedBalance)
        let encryptedBalance = cipher.encrypt([decryptedBalance, BigInt(rawAmount)], Uint8Array.from(nonce))

        const firstRelayer = await getFirstRelayer();

        const computationOffset = new BN(randomBytes(8), 'hex')
        const tx = await transferAmount(
            program,
            userAccountPDA,
            userTokenAccountPDA,
            receiverAccountPDA,
            receiverTokenAccountPDA,
            Buffer.from(encryptedBalance[1]),
            firstRelayer.publicKey,
            computationOffset,
            wallet.publicKey!
        )

        // const withdrawTxSigned = await wallet.signTransaction!(tx);
        const txSignature = await (await sendTransactionToRelayer(tx)).json();
        await awaitComputationFinalization(
            new AnchorProvider(
                program.provider.connection,
                program.provider.wallet!,
                { commitment: 'confirmed' }
            ), 
            computationOffset,
            program.programId,
            'confirmed'
        );
        console.log(txSignature);

        tokenAccount = await program.account.umbraTokenAccount.fetch(userTokenAccountPDA, 'confirmed');
        encryptedBalance = tokenAccount.balance;
        const encryptionNonce = tokenAccount.nonce[0].toArray('le', 16)
        decryptedBalance = cipher.decrypt([encryptedBalance[0]], Uint8Array.from(encryptionNonce))[0]
        console.log(decryptedBalance);

        // After the transaction is complete, update balances
        try {
            // Update on-chain balance
            const connection = getConnection();
            const userAssociatedTokenAccount = await getAssociatedTokenAddress(
                mintAddress,
                wallet.publicKey!
            );
            
            const tokenAccount = await getAccount(connection, userAssociatedTokenAccount, 'confirmed');
            umbraStore.setAvailableOnChainBalance(Number(tokenAccount.amount));
            umbraStore.setUmbraWalletBalance(Number(decryptedBalance));
            umbraStore.setSelectedTokenTicker(selectedToken);
            
            // Umbra wallet balance was already updated in the existing code
        } catch (error) {
            console.error("Error updating balances after deposit:", error);
        }
    };

    return (
        <>
            {/* Amount Input */}
            <div className="relative" data-oid="9.izn3.">
                <div
                    className="flex justify-between items-center border border-gray-800 p-4"
                    data-oid="enfy:jn"
                >
                    <input
                        type="text"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="bg-transparent text-white outline-none w-full text-lg"
                        placeholder="0"
                        data-oid="5mng-xb"
                    />

                    <div className="flex gap-2 mr-3" data-oid="_njm51w">
                        <button
                            className="text-white bg-black border border-gray-800 px-3 py-1 text-sm hover:bg-[#111] transition-colors"
                            data-oid="fq8d-zn"
                            onClick={() => {
                                if (umbraStore.umbraWalletBalance !== undefined && umbraStore.selectedTokenDecimals !== undefined) {
                                    const halfBalance = umbraStore.umbraWalletBalance / (2 * (10 ** umbraStore.selectedTokenDecimals));
                                    setAmount(halfBalance.toString());
                                }
                            }}
                        >
                            HALF
                        </button>
                        <button
                            className="text-white bg-black border border-gray-800 px-3 py-1 text-sm hover:bg-[#111] transition-colors"
                            data-oid="jxatzrh"
                            onClick={() => {
                                if (umbraStore.umbraWalletBalance !== undefined && umbraStore.selectedTokenDecimals !== undefined) {
                                    const maxBalance = umbraStore.umbraWalletBalance / (10 ** umbraStore.selectedTokenDecimals);
                                    setAmount(maxBalance.toString());
                                }
                            }}
                        >
                            MAX
                        </button>
                    </div>
                    <div className="relative" data-oid="xsrjvjn">
                        <button
                            className="flex items-center gap-2 text-white"
                            onClick={() => setShowTokenDropdown(!showTokenDropdown)}
                            data-oid="bhvrc.h"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="lucide lucide-layers"
                                data-oid="0f3:vm."
                            >
                                <path
                                    d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z"
                                    data-oid="1:v5ijx"
                                />

                                <path
                                    d="m22 12.5-8.58 3.91a2 2 0 0 1-1.66 0L2.6 12.5"
                                    data-oid="ro8i95y"
                                />

                                <path
                                    d="m22 17.5-8.58 3.91a2 2 0 0 1-1.66 0L2.6 17.5"
                                    data-oid="j.2zbo:"
                                />
                            </svg>
                            {selectedToken}
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="lucide lucide-chevron-down"
                                data-oid="7m5lq1-"
                            >
                                <path d="m6 9 6 6 6-6" data-oid="lycs_a9" />
                            </svg>
                        </button>

                        {showTokenDropdown && (
                            <motion.div
                                className="absolute right-0 mt-2 w-56 bg-black border border-gray-800 shadow-lg z-10"
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                                data-oid="mxl._19"
                            >
                                <div className="p-2" data-oid="btritay">
                                    <input
                                        type="text"
                                        placeholder="Search tokens..."
                                        className="w-full bg-[#0a0a0f] text-white p-2 border border-gray-800 outline-none"
                                        value={searchToken}
                                        onChange={(e) => setSearchToken(e.target.value)}
                                        data-oid="8ivbyyo"
                                    />
                                </div>
                                <div className="max-h-48 overflow-y-auto" data-oid="9fsjin:">
                                    {filteredTokens.map((token) => (
                                        <button
                                            key={token.mintAddress.toBase58()}
                                            className="w-full text-left p-3 hover:bg-[#111] text-white"
                                            onClick={() => {
                                                setSelectedToken(token.ticker);
                                                setShowTokenDropdown(false);
                                                umbraStore.setSelectedTokenTicker(token.ticker);
                                            }}
                                            data-oid="50h46l7"
                                        >
                                            <div className="flex items-center" data-oid="6i25est">
                                                <span className="font-medium" data-oid="0:n6erx">
                                                    {token.ticker}
                                                </span>
                                                <span
                                                    className="ml-2 text-gray-400 text-sm"
                                                    data-oid="-of71fw"
                                                >
                                                    {token.ticker}
                                                </span>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </div>
                </div>
            </div>

            {/* Recipient Address Input */}
            <div className="relative mt-4" data-oid="xaaa9:-">
                <input
                    type="text"
                    value={recipientAddress}
                    onChange={(e) => setRecipientAddress(e.target.value)}
                    className="w-full bg-transparent text-white border border-gray-800 p-4 outline-none"
                    placeholder="Enter recipient umbra address"
                    data-oid="0fslce."
                />
            </div>

            {/* Fees Section */}
            <div className="text-white mt-6" data-oid="hwzhc18">
                <div
                    className="flex justify-between items-center mb-2 cursor-pointer"
                    onClick={() => setShowFeeDropdown(!showFeeDropdown)}
                    data-oid="2d61rrd"
                >
                    <span className="tracking-wide" data-oid="ka-itau">
                        TOTAL FEES
                    </span>
                    <div className="flex items-center" data-oid="l2n.m:j">
                        <span data-oid="aopo0bz">${totalFees.toFixed(2)}</span>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className={`lucide ml-1 transition-transform ${showFeeDropdown ? 'rotate-180' : ''}`}
                            data-oid="6qm:5w-"
                        >
                            <path d="m6 9 6 6 6-6" data-oid="e9k008a" />
                        </svg>
                    </div>
                </div>

                {showFeeDropdown && (
                    <motion.div
                        className="border border-gray-800 p-4 mb-3 bg-black"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        data-oid="d_ktt_r"
                    >
                        {feeTypes.map((fee) => (
                            <div
                                key={fee.id}
                                className="flex justify-between items-center text-sm text-gray-400 mb-3 last:mb-0"
                                data-oid="e:ekti8"
                            >
                                <div className="flex items-center gap-1" data-oid="l1pafnf">
                                    <span data-oid="9fm0_.c">{fee.name}</span>
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="14"
                                        height="14"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="1.5"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        className="lucide lucide-circle-help"
                                        // title={fee.description}
                                        data-oid="5-50s07"
                                    >
                                        <circle cx="12" cy="12" r="10" data-oid="u70nznr" />
                                        <path
                                            d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"
                                            data-oid="cyukzs1"
                                        />

                                        <path d="M12 17h.01" data-oid="xcudk5a" />
                                    </svg>
                                </div>
                                <div data-oid="29iqf_p">
                                    ${fee.amount.toFixed(2)} • {fee.amount} {fee.token}
                                </div>
                            </div>
                        ))}
                    </motion.div>
                )}
            </div>

            {/* Action Button */}
            <motion.button
                className="w-full bg-white text-black py-3 font-medium uppercase tracking-wider mt-6"
                onClick={handleSubmit}
                whileHover={{ backgroundColor: '#f0f0f0' }}
                whileTap={{ scale: 0.98 }}
                data-oid="x-bpec_"
            >
                Transfer
            </motion.button>
        </>
    );
}
