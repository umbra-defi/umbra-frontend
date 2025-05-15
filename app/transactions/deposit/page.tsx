'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { feeTypes } from '../layout';
import Link from 'next/link';
import { ConnectionProvider, useWallet, WalletProvider } from '@solana/wallet-adapter-react';
import { useUmbraStore } from '@/app/store/umbraStore';
import { Commitment, Connection, PublicKey, Transaction } from '@solana/web3.js';
import {
    mxePublicKey,
    UMBRA_ASSOCIATED_TOKEN_ACCOUNT_DERIVATION_SEED,
    UMBRA_PDA_DERIVATION_SEED,
    UMBRA_TOKEN_ACCOUNT_DERIVATION_SEED,
} from '@/lib/constants';
import {
    createTokenAccount,
    depositAmount,
    getTokenAccountPDA,
    getUserAccountPDA,
} from '@/lib/umbra-program/umbra';
import {
    getConnection,
    getDevnetConnection,
    getUmbraProgram,
    toastError,
    toastSuccess,
} from '@/lib/utils';
import { awaitComputationFinalization, RescueCipher, x25519 } from '@arcium-hq/client';
import { randomBytes, sign } from 'crypto';
import { getFirstRelayer, sendTransactionToRelayer } from '@/app/auth/signup/utils';
import { AnchorProvider, BN, Provider } from '@coral-xyz/anchor';
import {
    createTransferInstruction,
    getAssociatedTokenAddress,
    getAccount,
    getMint,
} from '@solana/spl-token';
import React from 'react';
import CornerBorders from '@/app/components/corner';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { StyledWalletMultiButton } from '@/app/components/styledButton';

export default function DepositPage() {
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
    const [selectedToken, setSelectedToken] = useState<string>(
        filteredTokens.length > 0 ? filteredTokens[0]?.ticker : 'SOL',
    );
    const [showTokenDropdown, setShowTokenDropdown] = useState<boolean>(false);
    const [showFeeDropdown, setShowFeeDropdown] = useState<boolean>(false);
    const [loading, setLoading] = useState(false);
    const [balanceLoading, setBalanceLoading] = useState(false);

    // If the token list changes and selected token is not in the list, update it
    useEffect(() => {
        if (
            filteredTokens.length > 0 &&
            !filteredTokens.some((token) => token.ticker === selectedToken)
        ) {
            setSelectedToken(filteredTokens[0].ticker);
            umbraStore.setSelectedTokenTicker(filteredTokens[0].ticker);
        }
    }, [filteredTokens, selectedToken]);

    // Update umbraStore selected token when it changes
    useEffect(() => {
        if (selectedToken) {
            umbraStore.setSelectedTokenTicker(selectedToken);
        }
    }, [selectedToken]);

    // Calculate total fees
    const totalFees = feeTypes.reduce((sum, fee) => sum + fee.amount, 0);

    // Fetch on-chain balance when wallet or selected token changes
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
                const mintAddress = selectedTokenData.mintAddress;

                const mintPub = new PublicKey(mintAddress);

                // Get mint info to get decimals
                try {
                    const mintInfo = await getMint(connection, mintPub);
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
                    new PublicKey(mintAddress),
                    wallet.publicKey,
                );

                try {
                    const tokenAccount = await getAccount(
                        connection,
                        userAssociatedTokenAccount,
                        'confirmed',
                    );
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
    }, [wallet.publicKey, selectedToken]);

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

                const mintAddress = selectedTokenData.mintAddress;
                console.log(mintAddress, 'mintadress deposit tab');
                const userAccountPDA = getUserAccountPDA(Buffer.from(umbraStore.umbraAddress));
                const tokenAccountPDA = getTokenAccountPDA(userAccountPDA, mintAddress);

                const program = getUmbraProgram();

                console.log(mxePublicKey, 'mxePublicKey');

                const privKey = new Uint8Array(Object.values(umbraStore.x25519PrivKey));
                console.log(privKey, 'priv key');
                const cipher = new RescueCipher(
                    x25519.getSharedSecret(Uint8Array.from(privKey), Uint8Array.from(mxePublicKey)),
                );

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

            const selectedTokenData = umbraStore.tokenList.find(
                (token) => token.ticker === selectedToken,
            );
            const mintAddress = selectedTokenData!.mintAddress;
            const mintPub = new PublicKey(mintAddress);
            const decimals = selectedTokenData?.decimals || 9;

            // Check if user has enough balance
            if (
                umbraStore.availableOnChainBalance !== undefined &&
                umbraStore.selectedTokenDecimals !== undefined
            ) {
                const maxBalance =
                    umbraStore.availableOnChainBalance / 10 ** umbraStore.selectedTokenDecimals;
                if (amountNum > maxBalance) {
                    toastError(
                        `Insufficient balance. Maximum available: ${maxBalance.toFixed(6)} ${selectedToken}`,
                    );
                    return;
                }
            }

            // Convert input amount to token amount with proper decimals
            const rawAmount = Math.floor(parseFloat(amount) * 10 ** decimals);

            const [umbraPDA, _bump] = PublicKey.findProgramAddressSync(
                [
                    Buffer.from(UMBRA_PDA_DERIVATION_SEED),
                    Buffer.from(UMBRA_ASSOCIATED_TOKEN_ACCOUNT_DERIVATION_SEED),
                    mintPub.toBuffer(),
                ],
                getUmbraProgram().programId,
            );

            const connection = getConnection();
            // Get the associated token account for the PDA
            const umbraPDAassociatedTokenAccount = await getAssociatedTokenAddress(
                new PublicKey(mintAddress),
                umbraPDA,
                true,
            );

            console.log(umbraPDA.toBase58());

            const userAssociatedTokenAccount = await getAssociatedTokenAddress(
                new PublicKey(mintAddress),
                wallet.publicKey!,
            );

            // Create transfer instruction
            const transferInstruction = createTransferInstruction(
                userAssociatedTokenAccount,
                umbraPDAassociatedTokenAccount,
                wallet.publicKey!,
                BigInt(rawAmount),
            );

            // Create and sign transaction
            const transaction = new Transaction().add(transferInstruction);
            const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
            transaction.recentBlockhash = blockhash;
            transaction.feePayer = wallet.publicKey!;
            transaction.lastValidBlockHeight = lastValidBlockHeight;

            try {
                console.log('triggered deposit', transaction);
                const signedTx = await wallet.signTransaction!(transaction);
                console.log('triggered deposit again');
                const signature = await connection.sendRawTransaction(signedTx.serialize());
                await connection.confirmTransaction(signature);
            } catch (error) {
                console.log(error);
            }

            const userAccountPDA = getUserAccountPDA(Buffer.from(umbraStore.umbraAddress));
            const tokenAccountPDA = getTokenAccountPDA(userAccountPDA, mintAddress);

            const privKey = new Uint8Array(Object.values(umbraStore.x25519PrivKey));
            const cipher = new RescueCipher(x25519.getSharedSecret(privKey, mxePublicKey));

            const firstRelayer: { publicKey: string; id: string; pdaAddress: string } =
                await getFirstRelayer();
            const program = getUmbraProgram();

            let tokenAccount = undefined;
            try {
                tokenAccount = await program.account.umbraTokenAccount.fetch(tokenAccountPDA);
                const nonce = tokenAccount.nonce[0].toArray('le', 16);
                const decryptedBalance = cipher.decrypt(
                    [tokenAccount.balance[0]],
                    Uint8Array.from(nonce),
                );
                console.log(decryptedBalance[0]);
            } catch (error) {
                console.log(error);

                const nonce = randomBytes(16);
                const zeroBalanceCipherText = cipher.encrypt([BigInt(0)], Uint8Array.from(nonce));

                const createTokenTx = await createTokenAccount(
                    getUmbraProgram(),
                    new PublicKey(mintAddress),
                    Buffer.from(zeroBalanceCipherText[0]),
                    nonce,
                    userAccountPDA,
                    new PublicKey(firstRelayer.pdaAddress),
                    new PublicKey(firstRelayer.publicKey),
                    tokenAccountPDA,
                    wallet.publicKey!,
                );

                // const signedTransaction = await wallet.signTransaction!(createTokenTx);
                const txSignature = await (await sendTransactionToRelayer(createTokenTx)).json();
                console.log(txSignature);
            }

            const nonce = randomBytes(16);
            const newDepositCipherText = cipher.encrypt(
                [BigInt(rawAmount)],
                Uint8Array.from(nonce),
            );

            const computationOffset = new BN(randomBytes(8), 'hex');
            const depositTx = await depositAmount(
                program,
                new PublicKey(firstRelayer.pdaAddress),
                userAccountPDA,
                tokenAccountPDA,
                Buffer.from(newDepositCipherText[0]),
                nonce,
                new PublicKey(firstRelayer.publicKey),
                computationOffset,
                wallet.publicKey!,
            );
            console.log('Signing');
            // const depositTxSigned = await wallet.signTransaction!(depositTx);
            console.log('Signing Done');
            const txSignature = await (await sendTransactionToRelayer(depositTx)).json();
            console.log('Transaction Signature Finalization: ', txSignature);
            await awaitComputationFinalization(
                new AnchorProvider(getDevnetConnection(), program.provider.wallet!, {
                    commitment: 'confirmed',
                }),
                computationOffset,
                program.programId,
                'confirmed',
            );
            console.log(txSignature);

            tokenAccount = await program.account.umbraTokenAccount.fetch(
                tokenAccountPDA,
                'confirmed',
            );
            const encryptedBalance = tokenAccount.balance[0];
            const encryptionNonce = tokenAccount.nonce[0].toArray('le', 16);
            const decryptedBalance = cipher.decrypt(
                [encryptedBalance],
                Uint8Array.from(encryptionNonce),
            );
            console.log(decryptedBalance);

            // After the transaction is complete, update balances
            try {
                // Update on-chain balance
                const connection = getConnection();
                const userAssociatedTokenAccount = await getAssociatedTokenAddress(
                    new PublicKey(mintAddress),
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
                toastSuccess('Deposit successful!');
            } catch (error) {
                console.error('Error updating balances after deposit:', error);
            }
        } catch (error) {
            toastError('Deposit failed. Please try again.');
            console.error('Error during deposit:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {/* Faucet Link */}
            <div className="text-center mb-4">
                <Link
                    href="/faucet"
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                >
                    Need test tokens? Visit our <span className="underline">Token Simulator</span>{' '}
                    to mint tokens of your choice.
                </Link>
            </div>

            {/* Example balance display */}
            <div
                className="flex items-center gap-2 text-gray-400 text-sm mb-2"
                data-deposit-balance
            >
                Balance:
                {balanceLoading ? (
                    <span className="inline-block w-4 h-4 border-2 border-gray-300 border-t-black rounded-full animate-spin"></span>
                ) : (
                    <span className="text-white">
                        {typeof umbraStore.availableOnChainBalance === 'number' &&
                        typeof umbraStore.selectedTokenDecimals === 'number'
                            ? umbraStore.availableOnChainBalance /
                              10 ** umbraStore.selectedTokenDecimals
                            : '-'}
                    </span>
                )}
                {selectedToken}
            </div>

            {/* Amount Input */}
            <div className="relative" data-oid="yw2qv2b">
                <div className="absolute inset-0 pointer-events-none z-10">
                    <CornerBorders color="white" />
                </div>
                <div
                    className="flex justify-between items-center border border-[#4B5563] p-4"
                    data-oid="9zh0u1."
                >
                    <input
                        data-deposit-amount
                        type="text"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="bg-transparent text-white outline-none w-full text-lg px-3 py-2"
                        placeholder="0"
                        data-oid="uuak1lj"
                    />

                    <div className="flex gap-2 mr-3">
                        <button
                            className="text-white bg-black border border-gray-800 px-3 py-1 text-sm hover:bg-[#111] transition-colors"
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
                            className="text-white bg-black border border-gray-800 px-3 py-1 text-sm hover:bg-[#111] transition-colors"
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

                    <div className="relative" data-oid="i6:f:9y">
                        <button
                            className="flex items-center gap-2 text-white"
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
                                data-oid="mf4j:va"
                            >
                                <path d="m6 9 6 6 6-6" data-oid="1d2brj6" />
                            </svg>
                        </button>

                        {showTokenDropdown && (
                            <motion.div
                                className="absolute right-0 mt-2 w-56 bg-black border border-gray-800 shadow-lg z-10"
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

            {/* Fees Section */}
            {/* <div className="text-white mt-6" data-oid="wjk33:0">
                <div
                    className="flex justify-between items-center mb-2 cursor-pointer"
                    onClick={() => setShowFeeDropdown(!showFeeDropdown)}
                    data-oid="5a4x-z6"
                >
                    <span className="tracking-wide" data-oid="4j79dxo">
                        TOTAL FEES
                    </span>
                    <div className="flex items-center" data-oid="8hw80fs">
                        <span data-oid="erjlplp">${totalFees.toFixed(2)}</span>
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
                            data-oid="ojgbtxe"
                        >
                            <path d="m6 9 6 6 6-6" data-oid="34e8_wq" />
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
                        data-oid="rb16mu7"
                    >
                        {feeTypes.map((fee) => (
                            <div
                                key={fee.id}
                                className="flex justify-between items-center text-sm text-gray-400 mb-3 last:mb-0"
                                data-oid="6boj_cl"
                            >
                                <div className="flex items-center gap-1" data-oid="x9elb6t">
                                    <span data-oid="yohebe0">{fee.name}</span>
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
                                        data-oid="t3wwaw:"
                                    >
                                        <circle cx="12" cy="12" r="10" data-oid="bbj8dm1" />
                                        <path
                                            d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"
                                            data-oid="shmb.85"
                                        />

                                        <path d="M12 17h.01" data-oid="z2n40u4" />
                                    </svg>
                                </div>
                                <div data-oid="8-q47ty">
                                    ${fee.amount.toFixed(2)} • {fee.amount} {fee.token}
                                </div>
                            </div>
                        ))}
                    </motion.div>
                )}
            </div> */}

            {/* Action Button */}
            {wallet.connected && wallet.publicKey ? (
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
                        'Deposit'
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
