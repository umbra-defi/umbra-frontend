'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { tokens, feeTypes } from '../layout';

export default function DepositPage() {
    const [amount, setAmount] = useState<string>('0');
    const [selectedToken, setSelectedToken] = useState<string>('SOL');
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
            type: 'deposit',
            amount,
            token: selectedToken,
        });
    };

    return (
        <>
            {/* Amount Input */}
            <div className="relative" data-oid="hvsv3b5">
                <div
                    className="flex justify-between items-center border border-gray-800 p-4"
                    data-oid="00cpimj"
                >
                    <input
                        type="text"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="bg-transparent text-white outline-none w-full text-lg"
                        placeholder="0"
                        data-oid="nq8_v_j"
                    />

                    <div className="relative" data-oid="bsy-8vu">
                        <button
                            className="flex items-center gap-2 text-white"
                            onClick={() => setShowTokenDropdown(!showTokenDropdown)}
                            data-oid=":klkkiq"
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
                                data-oid="kbwhhhv"
                            >
                                <path
                                    d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z"
                                    data-oid="0k1kous"
                                />

                                <path
                                    d="m22 12.5-8.58 3.91a2 2 0 0 1-1.66 0L2.6 12.5"
                                    data-oid="4izwoyj"
                                />

                                <path
                                    d="m22 17.5-8.58 3.91a2 2 0 0 1-1.66 0L2.6 17.5"
                                    data-oid="c22bd9k"
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
                                data-oid="yq3ee1u"
                            >
                                <path d="m6 9 6 6 6-6" data-oid="g.rd9wd" />
                            </svg>
                        </button>

                        {showTokenDropdown && (
                            <motion.div
                                className="absolute right-0 mt-2 w-56 bg-black border border-gray-800 shadow-lg z-10"
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                                data-oid="h2rbx:h"
                            >
                                <div className="p-2" data-oid="kdrl5oj">
                                    <input
                                        type="text"
                                        placeholder="Search tokens..."
                                        className="w-full bg-[#0a0a0f] text-white p-2 border border-gray-800 outline-none"
                                        value={searchToken}
                                        onChange={(e) => setSearchToken(e.target.value)}
                                        data-oid="r2v1f1_"
                                    />
                                </div>
                                <div className="max-h-48 overflow-y-auto" data-oid="hhhm-0e">
                                    {filteredTokens.map((token) => (
                                        <button
                                            key={token.symbol}
                                            className="w-full text-left p-3 hover:bg-[#111] text-white"
                                            onClick={() => {
                                                setSelectedToken(token.symbol);
                                                setShowTokenDropdown(false);
                                            }}
                                            data-oid="mxoklbx"
                                        >
                                            <div className="flex items-center" data-oid="q3.wxqv">
                                                <span className="font-medium" data-oid="v6fd2sq">
                                                    {token.symbol}
                                                </span>
                                                <span
                                                    className="ml-2 text-gray-400 text-sm"
                                                    data-oid="5axzn4c"
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

            {/* Fees Section */}
            <div className="text-white mt-6" data-oid="8x866oh">
                <div
                    className="flex justify-between items-center mb-2 cursor-pointer"
                    onClick={() => setShowFeeDropdown(!showFeeDropdown)}
                    data-oid="yw1k9-u"
                >
                    <span className="tracking-wide" data-oid="5fh0p9n">
                        TOTAL FEES
                    </span>
                    <div className="flex items-center" data-oid="0gb8nko">
                        <span data-oid="6ppoul4">${totalFees.toFixed(2)}</span>
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
                            data-oid="5_98b0n"
                        >
                            <path d="m6 9 6 6 6-6" data-oid="bm7ikmw" />
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
                        data-oid="r41k23."
                    >
                        {feeTypes.map((fee) => (
                            <div
                                key={fee.id}
                                className="flex justify-between items-center text-sm text-gray-400 mb-3 last:mb-0"
                                data-oid="7pbp0g."
                            >
                                <div className="flex items-center gap-1" data-oid="ngpzs9o">
                                    <span data-oid="jnoz1.k">{fee.name}</span>
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
                                        data-oid="zizege5"
                                    >
                                        <circle cx="12" cy="12" r="10" data-oid="_ws1jwf" />
                                        <path
                                            d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"
                                            data-oid="kxn_1nj"
                                        />

                                        <path d="M12 17h.01" data-oid="q150:ip" />
                                    </svg>
                                </div>
                                <div data-oid="1he1lqs">
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
                data-oid="v-mp319"
            >
                Deposit
            </motion.button>
        </>
    );
}
