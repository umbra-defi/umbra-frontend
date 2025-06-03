'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { feeTypes } from '../layout';
import { useWallet } from '@solana/wallet-adapter-react';
import { useUmbraStore } from '@/app/store/umbraStore';
import { getTokenAccountPDA, getUserAccountPDA, withdrawAmount } from '@/lib/umbra-program/umbra';
import { getConnection, getUmbraProgram, toastError, toastSuccess } from '@/lib/utils';
import {
    mxePublicKey,
    UMBRA_ASSOCIATED_TOKEN_ACCOUNT_DERIVATION_SEED,
    UMBRA_PDA_DERIVATION_SEED,
} from '@/lib/constants';
import { awaitComputationFinalization, RescueCipher, x25519 } from '@arcium-hq/client';
import { randomBytes } from 'crypto';
import { getFirstRelayer, sendTransactionToRelayer } from '@/app/auth/signup/utils';
import { AnchorProvider, BN, Provider } from '@coral-xyz/anchor';
import { Connection, PublicKey } from '@solana/web3.js';
import { getAccount, getAssociatedTokenAddress, getMint } from '@solana/spl-token';
import React from 'react';
import CornerBorders from '@/app/components/corner';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { StyledWalletMultiButton } from '@/app/components/styledButton';

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
    const [loading, setLoading] = useState(false);
    const [balanceLoading, setBalanceLoading] = useState(false);

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
            setBalanceLoading(true);
            try {
                const selectedTokenData = umbraStore.tokenList.find(
                    (token) => token.ticker === selectedToken,
                );
                if (!selectedTokenData) return;

                const connection = getConnection();
                const selectedTokenMintAddress = selectedTokenData!.mintAddress;
                const mintAddress = new PublicKey(selectedTokenMintAddress);

                // Get mint info to get decimals
                try {
                    const mintInfo = await getMint(connection, mintAddress);
                    // Update token with decimals if it's not already set
                    if (selectedTokenData.decimals === undefined) {
                        const updatedTokenList = [...umbraStore.tokenList];
                        const tokenIndex = updatedTokenList.findIndex(
                            (t) => t.ticker === selectedToken,
                        );
                        if (tokenIndex >= 0) {
                            updatedTokenList[tokenIndex] = {
                                ...updatedTokenList[tokenIndex],
                                decimals: mintInfo.decimals,
                            };
                            umbraStore.setTokenList(updatedTokenList);
                        }
                    }
                    // Set selected token decimals
                    umbraStore.setSelectedTokenDecimals(mintInfo.decimals);
                } catch (error) {
                    console.error('Error fetching mint info:', error);
                }

                const userAssociatedTokenAccount = await getAssociatedTokenAddress(
                    mintAddress,
                    wallet.publicKey,
                );

                try {
                    const tokenAccount = await getAccount(connection, userAssociatedTokenAccount);
                    if (isMounted) {
                        const balance = Number(tokenAccount.amount);
                        umbraStore.setAvailableOnChainBalance(balance);
                        umbraStore.setSelectedTokenTicker(selectedToken);
                    }
                } catch (error) {
                    console.log('Token account not found:', error);
                    if (isMounted) {
                        umbraStore.setAvailableOnChainBalance(0);
                        umbraStore.setSelectedTokenTicker(selectedToken);
                    }
                }
            } catch (error) {
                console.error('Error fetching on-chain balance:', error);
            } finally {
                if (isMounted) setBalanceLoading(false);
            }
        }

        fetchOnChainBalance();

        return () => {
            isMounted = false;
        };
    }, [selectedToken]);

    // Fetch Umbra wallet balance
    useEffect(() => {
        let isMounted = true;

        async function fetchUmbraWalletBalance() {
            if (!selectedToken) return;
            setBalanceLoading(true);
            try {
                const selectedTokenData = umbraStore.tokenList.find(
                    (token) => token.ticker === selectedToken,
                );
                if (!selectedTokenData) return;

                const selectedTokenMintAddress = selectedTokenData!.mintAddress;
                const mintAddress = new PublicKey(selectedTokenMintAddress);
                const userAccountPDA = getUserAccountPDA(Buffer.from(umbraStore.umbraAddress));
                const tokenAccountPDA = getTokenAccountPDA(userAccountPDA, mintAddress);

                const privKey = new Uint8Array(Object.values(umbraStore.x25519PrivKey));

                const program = getUmbraProgram();
                const cipher = new RescueCipher(x25519.getSharedSecret(privKey, mxePublicKey));

                try {
                    const tokenAccount =
                        await program.account.umbraTokenAccount.fetch(tokenAccountPDA);
                    const nonce = tokenAccount.nonce[0].toArray('le', 16);
                    const decryptedBalance = cipher.decrypt(
                        [tokenAccount.balance[0]],
                        Uint8Array.from(nonce),
                    );

                    if (isMounted) {
                        umbraStore.setUmbraWalletBalance(Number(decryptedBalance[0]));
                        umbraStore.setSelectedTokenTicker(selectedToken);
                    }
                } catch (error) {
                    console.log('Umbra token account not found:', error);
                    if (isMounted) {
                        umbraStore.setUmbraWalletBalance(0);
                        umbraStore.setSelectedTokenTicker(selectedToken);
                    }
                }
            } catch (error) {
                console.error('Error fetching Umbra wallet balance:', error);
            } finally {
                if (isMounted) setBalanceLoading(false);
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
        if (loading) return;
        setLoading(true);
        try {
            // Input validation
            if (!amount || amount === '0') {
                toastError('Please enter an amount greater than zero');
                return;
            }

            const amountNum = parseFloat(amount);
            if (isNaN(amountNum)) {
                toastError('Please enter a valid number');
                return;
            }

            if (amountNum < 0) {
                toastError('Amount cannot be negative');
                return;
            }

            const program = getUmbraProgram();

            const selectedTokenData = umbraStore.tokenList.find(
                (token) => token.ticker === selectedToken,
            );

            const selectedTokenMintAddress = selectedTokenData!.mintAddress;
            const mintAddress = new PublicKey(selectedTokenMintAddress);
            const decimals = selectedTokenData?.decimals || 9;

            // Check if user has enough balance in Umbra wallet
            if (
                umbraStore.umbraWalletBalance !== undefined &&
                umbraStore.selectedTokenDecimals !== undefined
            ) {
                const maxBalance =
                    umbraStore.umbraWalletBalance / 10 ** umbraStore.selectedTokenDecimals;
                if (amountNum > maxBalance) {
                    toastError(
                        `Insufficient balance. Maximum available: ${maxBalance.toFixed(6)} ${selectedToken}`,
                    );
                    return;
                }
            }

            // Convert input amount to token amount with proper decimals
            const rawAmount = Math.floor(parseFloat(amount) * 10 ** decimals);

            const userAccountPDA = getUserAccountPDA(Buffer.from(umbraStore.umbraAddress));
            const userTokenAccountPDA = getTokenAccountPDA(userAccountPDA, mintAddress);

            const privKey = new Uint8Array(Object.values(umbraStore.x25519PrivKey));

            const cipher = new RescueCipher(x25519.getSharedSecret(privKey, mxePublicKey));
            const nonce = randomBytes(16);
            const withdrawalAmountEncrypted = cipher.encrypt(
                [BigInt(rawAmount)],
                Uint8Array.from(nonce),
            );

            const firstRelayer = await getFirstRelayer();

            const computationOffset = new BN(randomBytes(8), 'hex');

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

            // const withdrawTxSigned = await wallet.signTransaction!(withdrawTx);
            const txSignature = await (await sendTransactionToRelayer(withdrawTx)).json();
            await awaitComputationFinalization(
                new AnchorProvider(program.provider.connection, program.provider.wallet!, {
                    commitment: 'confirmed',
                }),
                computationOffset,
                program.programId,
                'confirmed',
            );

            console.log(txSignature);

            const tokenAccount = await program.account.umbraTokenAccount.fetch(
                userTokenAccountPDA,
                'confirmed',
            );
            const encryptedBalance = tokenAccount.balance[0];
            const encryptionNonce = tokenAccount.nonce[0].toArray('le', 16);
            const decryptedBalance = cipher.decrypt(
                [encryptedBalance],
                Uint8Array.from(encryptionNonce),
            );
            console.log(decryptedBalance);

            const [umbraPDA, _bump] = PublicKey.findProgramAddressSync(
                [
                    Buffer.from(UMBRA_PDA_DERIVATION_SEED),
                    Buffer.from(UMBRA_ASSOCIATED_TOKEN_ACCOUNT_DERIVATION_SEED),
                    mintAddress.toBuffer(),
                ],
                getUmbraProgram().programId,
            );

            const connection = getConnection();

            // Get the associated token account for the PDA
            const umbraPDAassociatedTokenAccount = await getAssociatedTokenAddress(
                mintAddress,
                umbraPDA,
                true,
            );

            const receiverATA = await getAssociatedTokenAddress(
                new PublicKey(mintAddress),
                new PublicKey(wallet.publicKey!),
            );

            const tx = await program.methods
                .claimTransfer(new BN(BigInt(rawAmount)))
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

            // const signedTx = await wallet.signTransaction!(tx);
            const txSign = await (await sendTransactionToRelayer(tx)).json();
            // Get transaction information
            try {
                // Confirm transaction
                await connection.confirmTransaction(txSign.signature, 'confirmed');
                console.log('Transaction confirmed!');

                // Log details for debugging
                const txDetails = await connection.getTransaction(txSign.signature, {
                    commitment: 'confirmed',
                    maxSupportedTransactionVersion: 0,
                });

                if (txDetails?.meta?.err) {
                    console.log('Transaction execution failed:', txDetails.meta.err);
                    if (txDetails?.meta?.logMessages) {
                        console.log('Transaction logs:', txDetails.meta.logMessages);
                    }
                } else {
                    console.log('Transaction executed successfully!');
                }
            } catch (confirmError) {
                toastError(`Transaction failed. Please try again. ${confirmError}`);
            }

            try {
                // Update on-chain balance
                const connection = getConnection();
                const userAssociatedTokenAccount = await getAssociatedTokenAddress(
                    mintAddress,
                    wallet.publicKey!,
                );

                const tokenAccount = await getAccount(
                    connection,
                    userAssociatedTokenAccount,
                    'confirmed',
                );
                umbraStore.setAvailableOnChainBalance(Number(tokenAccount.amount));
                umbraStore.setUmbraWalletBalance(Number(decryptedBalance));
                umbraStore.setSelectedTokenTicker(selectedToken);
                toastSuccess('Withdrawal successful!');
            } catch (error) {
                console.error('Error updating balances after deposit:', error);
            }
        } catch (error) {
            toastError('Withdrawal failed. Please try again.');
            console.error('Error processing withdrawal:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {/* Amount Input */}
            <div className="relative" data-oid="yw2qv2b" data-deposit-amount>
                <div className="absolute inset-0 pointer-events-none z-10">
                    <CornerBorders color="white" />
                </div>

                <div
                    className="flex flex-col sm:flex-row sm:justify-between sm:items-center border border-[#4B5563] p-3 sm:p-4 gap-3 sm:gap-0"
                    data-oid="9zh0u1."
                >
                    <input
                        type="text"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="bg-transparent text-white outline-none w-full text-base sm:text-lg px-3 py-2"
                        placeholder="0"
                        data-oid="uuak1lj"
                    />

                    <div className="flex gap-2 justify-between sm:justify-start sm:mr-3">
                        <button
                            className="text-white bg-black border border-gray-800 px-3 py-1 text-sm hover:bg-[#111] transition-colors w-full sm:w-auto"
                            onClick={() => {
                                if (
                                    umbraStore.availableOnChainBalance !== undefined &&
                                    umbraStore.selectedTokenDecimals !== undefined
                                ) {
                                    const halfBalance =
                                        umbraStore.availableOnChainBalance /
                                        (2 * 10 ** umbraStore.selectedTokenDecimals);
                                    setAmount(halfBalance.toString());
                                }
                            }}
                        >
                            HALF
                        </button>
                        <button
                            className="text-white bg-black border border-gray-800 px-3 py-1 text-sm hover:bg-[#111] transition-colors w-full sm:w-auto"
                            onClick={() => {
                                if (
                                    umbraStore.availableOnChainBalance !== undefined &&
                                    umbraStore.selectedTokenDecimals !== undefined
                                ) {
                                    const maxBalance =
                                        umbraStore.availableOnChainBalance /
                                        10 ** umbraStore.selectedTokenDecimals;
                                    setAmount(maxBalance.toString());
                                }
                            }}
                        >
                            MAX
                        </button>
                    </div>

                    <div className="relative w-full sm:w-auto" data-oid="i6:f:9y">
                        <button
                            className="flex justify-between sm:justify-start items-center w-full sm:w-auto gap-2 text-white"
                            onClick={() => setShowTokenDropdown(!showTokenDropdown)}
                            data-oid="5kfplm5"
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
                                data-oid="rz79tvk"
                            >
                                <path
                                    d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z"
                                    data-oid="18nx49-"
                                />
                                <path
                                    d="m22 12.5-8.58 3.91a2 2 0 0 1-1.66 0L2.6 12.5"
                                    data-oid=".yy:gc0"
                                />
                                <path
                                    d="m22 17.5-8.58 3.91a2 2 0 0 1-1.66 0L2.6 17.5"
                                    data-oid="gkw8438"
                                />
                            </svg>
                            <span className="truncate">{selectedToken}</span>
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
                                data-oid="mf4j:va"
                            >
                                <path d="m6 9 6 6 6-6" data-oid="1d2brj6" />
                            </svg>
                        </button>

                        {showTokenDropdown && (
                            <motion.div
                                className="absolute right-0 mt-2 w-full sm:w-56 bg-black border border-gray-800 shadow-lg z-10"
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                                data-oid="g5mmiw:"
                            >
                                <div className="p-2" data-oid="tp9e5s_">
                                    <input
                                        type="text"
                                        placeholder="Search tokens..."
                                        className="w-full bg-[#0a0a0f] text-white p-2 border border-gray-800 outline-none"
                                        value={searchToken}
                                        onChange={(e) => setSearchToken(e.target.value)}
                                        data-oid="88usrkm"
                                    />
                                </div>
                                <div className="max-h-48 overflow-y-auto" data-oid="z0c:7z.">
                                    {filteredTokens.map((token) => (
                                        <button
                                            key={token.ticker}
                                            className="w-full text-left p-3 hover:bg-[#111] text-white"
                                            onClick={() => {
                                                setSelectedToken(token.ticker);
                                                setShowTokenDropdown(false);
                                                umbraStore.setSelectedTokenTicker(token.ticker);
                                            }}
                                            data-oid="cr8rcui"
                                        >
                                            <div className="flex items-center" data-oid="ouzqjc0">
                                                <span className="font-medium" data-oid="25fbdnk">
                                                    {token.ticker}
                                                </span>
                                                <span
                                                    className="ml-2 text-gray-400 text-sm"
                                                    data-oid="pslpd:q"
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

            {/* Example balance display */}
            {/* <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
                Balance:
                {balanceLoading ? (
                    <span className="inline-block w-4 h-4 border-2 border-gray-300 border-t-black rounded-full animate-spin"></span>
                ) : (
                    <span className="text-white">
                        {typeof umbraStore.umbraWalletBalance === 'number' &&
                        typeof umbraStore.selectedTokenDecimals === 'number'
                            ? umbraStore.umbraWalletBalance / 10 ** umbraStore.selectedTokenDecimals
                            : '-'}
                    </span>
                )}
                {selectedToken}
            </div> */}

            {/* Fees Section */}
            {/* <div className="text-white mt-6" data-oid="1tciugg">
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
            </div> */}

            {/* Action Button */}
            {wallet.connected && !umbraStore.loading ? (
                <motion.button
                    className="w-full bg-white text-black py-3 font-medium uppercase tracking-wider mt-6 flex items-center justify-center disabled:opacity-60 disabled:cursor-not-allowed"
                    onClick={handleSubmit}
                    whileHover={{ backgroundColor: '#f0f0f0' }}
                    whileTap={{ scale: 0.98 }}
                    data-oid=":xcq1mj"
                    disabled={loading}
                    data-deposit-submit
                >
                    {loading ? (
                        <span className="flex items-center gap-2">
                            <span className="loader-spinner"></span>
                            Processing...
                        </span>
                    ) : (
                        'Withdraw'
                    )}
                </motion.button>
            ) : (
                <StyledWalletMultiButton />
            )}
            <style jsx global>{`
                .loader-spinner {
                    border: 3px solid #f3f3f3;
                    border-top: 3px solid #222;
                    border-radius: 50%;
                    width: 18px;
                    height: 18px;
                    animation: spin 0.8s linear infinite;
                    display: inline-block;
                }
                @keyframes spin {
                    0% {
                        transform: rotate(0deg);
                    }
                    100% {
                        transform: rotate(360deg);
                    }
                }
            `}</style>
        </>
    );
}
