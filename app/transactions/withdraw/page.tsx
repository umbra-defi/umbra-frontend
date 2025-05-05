'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { feeTypes } from '../layout';
import { useWallet } from '@solana/wallet-adapter-react';
import { useUmbraStore } from '@/app/store/umbraStore';
import { getTokenAccountPDA, getUserAccountPDA, withdrawAmount } from '@/lib/umbra-program/umbra';
import { getConnection, getUmbraProgram, toastError } from '@/lib/utils';
import { mxePublicKey, UMBRA_ASSOCIATED_TOKEN_ACCOUNT_DERIVATION_SEED, UMBRA_PDA_DERIVATION_SEED } from '@/lib/constants';
import { awaitComputationFinalization, RescueCipher, x25519 } from '@arcium-hq/client';
import { randomBytes } from 'crypto';
import { getFirstRelayer, sendTransactionToRelayer } from '@/app/auth/signup/utils';
import { AnchorProvider, BN, Provider } from '@coral-xyz/anchor';
import { Connection, PublicKey } from '@solana/web3.js';
import { getAccount, getAssociatedTokenAddress, getMint } from '@solana/spl-token';

export default function WithdrawPage() {
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

    useEffect(() => {
        let isMounted = true;
        
        async function fetchOnChainBalance() {
            if (!wallet.publicKey || !selectedToken) return;
            
            try {
                const selectedTokenData = umbraStore.tokenList.find(token => token.ticker === selectedToken);
                if (!selectedTokenData) return;
                
                const connection = new Connection('http://localhost:8899');
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
                    const tokenAccount = await getAccount(connection, userAssociatedTokenAccount);
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

        const program = getUmbraProgram();

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

        const userAccountPDA = getUserAccountPDA(Buffer.from(umbraStore.umbraAddress));
        const userTokenAccountPDA = getTokenAccountPDA(userAccountPDA, mintAddress);

        const cipher = new RescueCipher(x25519.getSharedSecret(umbraStore.x25519PrivKey, mxePublicKey));
        const nonce = randomBytes(16);
        const withdrawalAmountEncrypted = cipher.encrypt([BigInt(rawAmount)], Uint8Array.from(nonce));

        const firstRelayer = await getFirstRelayer();

        const computationOffset = new BN(randomBytes(8), 'hex')

        const withdrawTx = await withdrawAmount(
            program,
            userAccountPDA,
            userTokenAccountPDA,
            Buffer.from(withdrawalAmountEncrypted[0]),
            nonce,
            firstRelayer.publicKey,
            computationOffset,
            wallet.publicKey!,
            new PublicKey(firstRelayer.pdaAddress),
        );

        const withdrawTxSigned = await wallet.signTransaction!(withdrawTx);
        const txSignature = await (await sendTransactionToRelayer(withdrawTxSigned)).json();
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

        const tokenAccount = await program.account.umbraTokenAccount.fetch(userTokenAccountPDA, 'confirmed');
        const encryptedBalance = tokenAccount.balance[0];
        const encryptionNonce = tokenAccount.nonce[0].toArray('le', 16)
        const decryptedBalance = cipher.decrypt([encryptedBalance], Uint8Array.from(encryptionNonce))
        console.log(decryptedBalance);

        const [umbraPDA, _bump] = PublicKey.findProgramAddressSync(
            [
                Buffer.from(UMBRA_PDA_DERIVATION_SEED),
                Buffer.from(UMBRA_ASSOCIATED_TOKEN_ACCOUNT_DERIVATION_SEED),
                mintAddress.toBuffer(),
            ], 
            getUmbraProgram().programId
        )

        const connection = getConnection();
        
        // Get the associated token account for the PDA
        const umbraPDAassociatedTokenAccount = await getAssociatedTokenAddress(
            mintAddress, 
            umbraPDA,
            true
        );

        const receiverATA = await getAssociatedTokenAddress(
            new PublicKey(mintAddress),
            new PublicKey(wallet.publicKey!),
        )

        const tx = await program.methods
            .claimTransfer(
                new BN(BigInt(rawAmount))
            )
            .accounts({
                mint: new PublicKey(mintAddress),
                umbraPda: new PublicKey(umbraPDA),
                umbraAtaAccount: umbraPDAassociatedTokenAccount,
                receiverAtaAccount: receiverATA,
            })
            .transaction();
        
        const recentData = await connection.getLatestBlockhash();
        tx.recentBlockhash = recentData.blockhash;
        tx.lastValidBlockHeight = recentData.lastValidBlockHeight;
        tx.feePayer = wallet.publicKey!;
    
        const signedTx = await wallet.signTransaction!(tx);
        const txSign = await (await sendTransactionToRelayer(signedTx)).json();
        console.log(txSign);

        try {
            // Update on-chain balance
            const connection = new Connection('http://localhost:8899', 'confirmed');
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
            <div className="relative" data-oid="_kzx3_s">
                <div
                    className="flex justify-between items-center border border-gray-800 p-4"
                    data-oid="_x4iyq7"
                >
                    <input
                        type="text"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="bg-transparent text-white outline-none w-full text-lg"
                        placeholder="0"
                        data-oid="8lswkbm"
                    />

                    <div className="flex gap-2 mr-3">
                        <button
                            className="text-white bg-black border border-gray-800 px-3 py-1 text-sm hover:bg-[#111] transition-colors"
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

                    <div className="relative" data-oid="mv8pw3k">
                        <button
                            className="flex items-center gap-2 text-white"
                            onClick={() => setShowTokenDropdown(!showTokenDropdown)}
                            data-oid="tmjaq0:"
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
                                data-oid="e.sq.c8"
                            >
                                <path
                                    d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z"
                                    data-oid="q3lic:g"
                                />

                                <path
                                    d="m22 12.5-8.58 3.91a2 2 0 0 1-1.66 0L2.6 12.5"
                                    data-oid="z:j0j6b"
                                />

                                <path
                                    d="m22 17.5-8.58 3.91a2 2 0 0 1-1.66 0L2.6 17.5"
                                    data-oid="7x5u.:1"
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
                                data-oid="k0aw:95"
                            >
                                <path d="m6 9 6 6 6-6" data-oid="5jjejoe" />
                            </svg>
                        </button>

                        {showTokenDropdown && (
                            <motion.div
                                className="absolute right-0 mt-2 w-56 bg-black border border-gray-800 shadow-lg z-10"
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                                data-oid="s2xrphz"
                            >
                                <div className="p-2" data-oid="fxf32_u">
                                    <input
                                        type="text"
                                        placeholder="Search tokens..."
                                        className="w-full bg-[#0a0a0f] text-white p-2 border border-gray-800 outline-none"
                                        value={searchToken}
                                        onChange={(e) => setSearchToken(e.target.value)}
                                        data-oid="j:k3eet"
                                    />
                                </div>
                                <div className="max-h-48 overflow-y-auto" data-oid="pf-j7yx">
                                    {filteredTokens.map((token) => (
                                        <button
                                            key={token.mintAddress.toBase58()}
                                            className="w-full text-left p-3 hover:bg-[#111] text-white"
                                            onClick={() => {
                                                setSelectedToken(token.ticker);
                                                setShowTokenDropdown(false);
                                                umbraStore.setSelectedTokenTicker(token.ticker);
                                            }}
                                            data-oid="zgkeh:v"
                                        >
                                            <div className="flex items-center" data-oid="fzq430:">
                                                <span className="font-medium" data-oid="k0bqvzy">
                                                    {token.ticker}
                                                </span>
                                                <span
                                                    className="ml-2 text-gray-400 text-sm"
                                                    data-oid="sex33pv"
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

            {/* Fees Section */}
            <div className="text-white mt-6" data-oid="1tciugg">
                <div
                    className="flex justify-between items-center mb-2 cursor-pointer"
                    onClick={() => setShowFeeDropdown(!showFeeDropdown)}
                    data-oid="uqbybxt"
                >
                    <span className="tracking-wide" data-oid="ppy_e3m">
                        TOTAL FEES
                    </span>
                    <div className="flex items-center" data-oid="e-cfw1a">
                        <span data-oid="1_v_ci7">${totalFees.toFixed(2)}</span>
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
                            data-oid="s_:p1ql"
                        >
                            <path d="m6 9 6 6 6-6" data-oid="qf6l6:h" />
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
                        data-oid="lrkz1mm"
                    >
                        {feeTypes.map((fee) => (
                            <div
                                key={fee.id}
                                className="flex justify-between items-center text-sm text-gray-400 mb-3 last:mb-0"
                                data-oid="3s9i2mz"
                            >
                                <div className="flex items-center gap-1" data-oid="jsotp53">
                                    <span data-oid="_r0h-3:">{fee.name}</span>
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
                                        data-oid="eh0l1kq"
                                    >
                                        <circle cx="12" cy="12" r="10" data-oid="_geffkx" />
                                        <path
                                            d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"
                                            data-oid="jp8mk9x"
                                        />

                                        <path d="M12 17h.01" data-oid="u-q9vgz" />
                                    </svg>
                                </div>
                                <div data-oid="u3b7-_r">
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
                data-oid="l--tjxg"
            >
                Withdraw
            </motion.button>
        </>
    );
}
