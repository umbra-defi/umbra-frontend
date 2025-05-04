'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { feeTypes } from '../layout';
import Link from 'next/link';
import { ConnectionProvider, useWallet, WalletProvider } from '@solana/wallet-adapter-react';
import { useUmbraStore } from '@/app/store/umbraStore';
import { Commitment, PublicKey } from '@solana/web3.js';
import { mxePublicKey, UMBRA_PDA_DERIVATION_SEED, UMBRA_TOKEN_ACCOUNT_DERIVATION_SEED } from '@/lib/constants';
import { createTokenAccount, depositAmount, getTokenAccountPDA, getUserAccountPDA } from '@/lib/umbra-program/umbra';
import { getUmbraProgram } from '@/lib/utils';
import { awaitComputationFinalization, RescueCipher, x25519 } from '@arcium-hq/client';
import { randomBytes, sign } from 'crypto';
import { getFirstRelayer, sendTransactionToRelayer } from '@/app/auth/signup/utils';
import { AnchorProvider, BN, Provider } from '@coral-xyz/anchor';

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
    const [selectedToken, setSelectedToken] = useState<string>(filteredTokens[0]?.ticker);
    const [showTokenDropdown, setShowTokenDropdown] = useState<boolean>(false);
    const [showFeeDropdown, setShowFeeDropdown] = useState<boolean>(false);

    // Calculate total fees
    const totalFees = feeTypes.reduce((sum, fee) => sum + fee.amount, 0);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        const selectedTokenData = umbraStore.tokenList.find(token => token.ticker === selectedToken);
        const mintAddress = selectedTokenData!.mintAddress;
        
        const userAccountPDA = getUserAccountPDA(Buffer.from(umbraStore.umbraAddress));
        const tokenAccountPDA = getTokenAccountPDA(userAccountPDA, mintAddress);
        
        const cipher = new RescueCipher(x25519.getSharedSecret(umbraStore.x25519PrivKey, mxePublicKey));

        const firstRelayer: { publicKey: string; id: string; pdaAddress: string } = await getFirstRelayer();
        const program = getUmbraProgram();

        let tokenAccount = undefined;
        try {
            tokenAccount = await program.account.umbraTokenAccount.fetch(tokenAccountPDA);
            console.log(tokenAccount);
        } catch (error) {

            console.log(error);

            const nonce = randomBytes(16);
            const zeroBalanceCipherText = cipher.encrypt([BigInt(0)], Uint8Array.from(nonce));

            const createTokenTx = await createTokenAccount(
                getUmbraProgram(),
                mintAddress,
                Buffer.from(zeroBalanceCipherText[0]),
                nonce,
                userAccountPDA,
                new PublicKey(firstRelayer.pdaAddress),
                new PublicKey(firstRelayer.publicKey),
                tokenAccountPDA,
                wallet.publicKey!
            )
    
            const signedTransaction = await wallet.signTransaction!(createTokenTx);
            const txSignature = await (await sendTransactionToRelayer(signedTransaction)).json();
            console.log(txSignature);
        }

        const nonce = randomBytes(16);
        const newDepositCipherText = cipher.encrypt([BigInt(amount)], Uint8Array.from(nonce))

        const computationOffset = new BN(randomBytes(8), 'hex')
        const depositTx = await depositAmount(
            program,
            new PublicKey(firstRelayer.pdaAddress),
            userAccountPDA, tokenAccountPDA,
            Buffer.from(newDepositCipherText[0]),
            nonce,
            new PublicKey(firstRelayer.publicKey),
            computationOffset,
            wallet.publicKey!
        );
        const depositTxSigned = await wallet.signTransaction!(depositTx);
        const txSignature = await (await sendTransactionToRelayer(depositTxSigned)).json();
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

        tokenAccount = await program.account.umbraTokenAccount.fetch(tokenAccountPDA, 'confirmed');
        const encryptedBalance = tokenAccount.balance[0];
        const encryptionNonce = Buffer.alloc(16);
        tokenAccount.nonce[0].toBuffer('le', 16).copy(encryptionNonce);
        const decryptedBalance = cipher.decrypt([encryptedBalance], Uint8Array.from(encryptionNonce))
        console.log(decryptedBalance);
    };
    
    return (
        <>
            {/* Faucet Link */}
            <div className="text-center mb-4">
                <Link href="/faucet" className="text-sm text-gray-400 hover:text-white transition-colors">
                    Need test tokens? Visit our <span className="underline">Token Simulator</span> to mint tokens of your choice.
                </Link>
            </div>
            
            {/* Amount Input */}
            <div className="relative" data-oid="yw2qv2b">
                <div
                    className="flex justify-between items-center border border-gray-800 p-4"
                    data-oid="9zh0u1."
                >
                    <input
                        type="text"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="bg-transparent text-white outline-none w-full text-lg"
                        placeholder="0"
                        data-oid="uuak1lj"
                    />

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
            <div className="text-white mt-6" data-oid="wjk33:0">
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
            </div>

            {/* Action Button */}
            <motion.button
                className="w-full bg-white text-black py-3 font-medium uppercase tracking-wider mt-6"
                onClick={handleSubmit}
                whileHover={{ backgroundColor: '#f0f0f0' }}
                whileTap={{ scale: 0.98 }}
                data-oid=":xcq1mj"
            >
                Deposit
            </motion.button>
        </>
    );
}
