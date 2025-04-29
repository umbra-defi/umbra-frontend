'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { tokens, feeTypes } from '../layout';

export default function TransferPage() {
    const [amount, setAmount] = useState<string>('0');
    const [selectedToken, setSelectedToken] = useState<string>('SOL');
    const [recipientAddress, setRecipientAddress] = useState<string>('');
    const [showTokenDropdown, setShowTokenDropdown] = useState<boolean>(false);
    const [showFeeDropdown, setShowFeeDropdown] = useState<boolean>(false);
    const [searchToken, setSearchToken] = useState<string>('');

    const filteredTokens = tokens.filter(
        (token) =>
            token.symbol.toLowerCase().includes(searchToken.toLowerCase()) ||
            token.name.toLowerCase().includes(searchToken.toLowerCase()),
    );

    // Calculate total fees
    const totalFees = feeTypes.reduce((sum, fee) => sum + fee.amount, 0);

    const handleSubmit = () => {
        console.log({
            type: 'transfer',
            amount,
            token: selectedToken,
            recipientAddress,
        });
    };

    return (
        <>
            {/* Amount Input */}
            <div className="relative" data-oid="s0p7xr5">
                <div
                    className="flex justify-between items-center border border-gray-800 p-4"
                    data-oid="xrvd89a"
                >
                    <input
                        type="text"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="bg-transparent text-white outline-none w-full text-lg"
                        placeholder="0"
                        data-oid="4niihxp"
                    />

                    <div className="flex gap-2 mr-3" data-oid="1_2rwqj">
                        <button
                            className="text-white bg-black border border-gray-800 px-3 py-1 text-sm hover:bg-[#111] transition-colors"
                            data-oid="7_uvix1"
                        >
                            HALF
                        </button>
                        <button
                            className="text-white bg-black border border-gray-800 px-3 py-1 text-sm hover:bg-[#111] transition-colors"
                            data-oid="_f5:d00"
                        >
                            MAX
                        </button>
                    </div>
                    <div className="relative" data-oid="72dqznw">
                        <button
                            className="flex items-center gap-2 text-white"
                            onClick={() => setShowTokenDropdown(!showTokenDropdown)}
                            data-oid="5-ucg-f"
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
                                data-oid="o0mmxar"
                            >
                                <path
                                    d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z"
                                    data-oid="1-tkrmv"
                                />

                                <path
                                    d="m22 12.5-8.58 3.91a2 2 0 0 1-1.66 0L2.6 12.5"
                                    data-oid="hf3c8vv"
                                />

                                <path
                                    d="m22 17.5-8.58 3.91a2 2 0 0 1-1.66 0L2.6 17.5"
                                    data-oid="qhhl8um"
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
                                data-oid="7qn4cex"
                            >
                                <path d="m6 9 6 6 6-6" data-oid="tz-jks." />
                            </svg>
                        </button>

                        {showTokenDropdown && (
                            <motion.div
                                className="absolute right-0 mt-2 w-56 bg-black border border-gray-800 shadow-lg z-10"
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                                data-oid="_2g-.xf"
                            >
                                <div className="p-2" data-oid="ypmf-g8">
                                    <input
                                        type="text"
                                        placeholder="Search tokens..."
                                        className="w-full bg-[#0a0a0f] text-white p-2 border border-gray-800 outline-none"
                                        value={searchToken}
                                        onChange={(e) => setSearchToken(e.target.value)}
                                        data-oid="u6.os0_"
                                    />
                                </div>
                                <div className="max-h-48 overflow-y-auto" data-oid="bxqphc2">
                                    {filteredTokens.map((token) => (
                                        <button
                                            key={token.symbol}
                                            className="w-full text-left p-3 hover:bg-[#111] text-white"
                                            onClick={() => {
                                                setSelectedToken(token.symbol);
                                                setShowTokenDropdown(false);
                                            }}
                                            data-oid="w5qtxp:"
                                        >
                                            <div className="flex items-center" data-oid="ki-uf6s">
                                                <span className="font-medium" data-oid="qu9c-0q">
                                                    {token.symbol}
                                                </span>
                                                <span
                                                    className="ml-2 text-gray-400 text-sm"
                                                    data-oid="2qw3q-."
                                                >
                                                    {token.name}
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
            <div className="relative mt-4" data-oid=":v7pp9x">
                <input
                    type="text"
                    value={recipientAddress}
                    onChange={(e) => setRecipientAddress(e.target.value)}
                    className="w-full bg-transparent text-white border border-gray-800 p-4 outline-none"
                    placeholder="ENTER RECIPIENT ADDRESS"
                    data-oid="gi-.vj6"
                />
            </div>

            {/* Fees Section */}
            <div className="text-white mt-6" data-oid="9k:vavw">
                <div
                    className="flex justify-between items-center mb-2 cursor-pointer"
                    onClick={() => setShowFeeDropdown(!showFeeDropdown)}
                    data-oid="vg:.li."
                >
                    <span className="tracking-wide" data-oid="jlor54h">
                        TOTAL FEES
                    </span>
                    <div className="flex items-center" data-oid="p8i:eyh">
                        <span data-oid="3je67:k">${totalFees.toFixed(2)}</span>
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
                            data-oid="06l9sgu"
                        >
                            <path d="m6 9 6 6 6-6" data-oid="01_va.w" />
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
                        data-oid="tx5n2f8"
                    >
                        {feeTypes.map((fee) => (
                            <div
                                key={fee.id}
                                className="flex justify-between items-center text-sm text-gray-400 mb-3 last:mb-0"
                                data-oid="yrcus-g"
                            >
                                <div className="flex items-center gap-1" data-oid="jz943c6">
                                    <span data-oid="ohqk4sc">{fee.name}</span>
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
                                        title={fee.description}
                                        data-oid="w53d9cs"
                                    >
                                        <circle cx="12" cy="12" r="10" data-oid="h_jf88." />
                                        <path
                                            d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"
                                            data-oid="zzea:zs"
                                        />

                                        <path d="M12 17h.01" data-oid=".:3:8he" />
                                    </svg>
                                </div>
                                <div data-oid=":hnuze3">
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
                data-oid="kazhefk"
            >
                Transfer
            </motion.button>
        </>
    );
}
