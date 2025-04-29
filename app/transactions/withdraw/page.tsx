'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { tokens, feeTypes } from '../layout';

export default function WithdrawPage() {
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
            type: 'withdraw',
            amount,
            token: selectedToken,
        });
    };

    return (
        <>
            {/* Amount Input */}
            <div className="relative" data-oid="d_xq1nu">
                <div
                    className="flex justify-between items-center border border-gray-800 p-4"
                    data-oid="-uj_zsq"
                >
                    <input
                        type="text"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="bg-transparent text-white outline-none w-full text-lg"
                        placeholder="0"
                        data-oid="df_22na"
                    />

                    <div className="relative" data-oid="n8ijbac">
                        <button
                            className="flex items-center gap-2 text-white"
                            onClick={() => setShowTokenDropdown(!showTokenDropdown)}
                            data-oid="ct-i.lq"
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
                                data-oid="-c2cc2o"
                            >
                                <path
                                    d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z"
                                    data-oid="nanmgbh"
                                />

                                <path
                                    d="m22 12.5-8.58 3.91a2 2 0 0 1-1.66 0L2.6 12.5"
                                    data-oid="nau-f8-"
                                />

                                <path
                                    d="m22 17.5-8.58 3.91a2 2 0 0 1-1.66 0L2.6 17.5"
                                    data-oid="_.n2m21"
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
                                data-oid="dl2g-mm"
                            >
                                <path d="m6 9 6 6 6-6" data-oid="jvihih." />
                            </svg>
                        </button>

                        {showTokenDropdown && (
                            <motion.div
                                className="absolute right-0 mt-2 w-56 bg-black border border-gray-800 shadow-lg z-10"
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                                data-oid="-js_jfn"
                            >
                                <div className="p-2" data-oid="kzj_qug">
                                    <input
                                        type="text"
                                        placeholder="Search tokens..."
                                        className="w-full bg-[#0a0a0f] text-white p-2 border border-gray-800 outline-none"
                                        value={searchToken}
                                        onChange={(e) => setSearchToken(e.target.value)}
                                        data-oid="jofxr_:"
                                    />
                                </div>
                                <div className="max-h-48 overflow-y-auto" data-oid="d_:clhc">
                                    {filteredTokens.map((token) => (
                                        <button
                                            key={token.symbol}
                                            className="w-full text-left p-3 hover:bg-[#111] text-white"
                                            onClick={() => {
                                                setSelectedToken(token.symbol);
                                                setShowTokenDropdown(false);
                                            }}
                                            data-oid="y7ry1t-"
                                        >
                                            <div className="flex items-center" data-oid="jxhlnjk">
                                                <span className="font-medium" data-oid="l:8o-yd">
                                                    {token.symbol}
                                                </span>
                                                <span
                                                    className="ml-2 text-gray-400 text-sm"
                                                    data-oid="8n6dku6"
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
            <div className="text-white mt-6" data-oid="2f9sr8m">
                <div
                    className="flex justify-between items-center mb-2 cursor-pointer"
                    onClick={() => setShowFeeDropdown(!showFeeDropdown)}
                    data-oid="9zlrcfw"
                >
                    <span className="tracking-wide" data-oid="sa6ix-e">
                        TOTAL FEES
                    </span>
                    <div className="flex items-center" data-oid=".8a5irr">
                        <span data-oid="z4lgwvf">${totalFees.toFixed(2)}</span>
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
                            data-oid="uqawn5o"
                        >
                            <path d="m6 9 6 6 6-6" data-oid="u7h_xii" />
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
                        data-oid="f9p71y5"
                    >
                        {feeTypes.map((fee) => (
                            <div
                                key={fee.id}
                                className="flex justify-between items-center text-sm text-gray-400 mb-3 last:mb-0"
                                data-oid="aoqsbnl"
                            >
                                <div className="flex items-center gap-1" data-oid="7cjmy8-">
                                    <span data-oid="mmannw7">{fee.name}</span>
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
                                        data-oid="q4a694n"
                                    >
                                        <circle cx="12" cy="12" r="10" data-oid=":sd5q1b" />
                                        <path
                                            d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"
                                            data-oid="ltq0__4"
                                        />

                                        <path d="M12 17h.01" data-oid="e7678ei" />
                                    </svg>
                                </div>
                                <div data-oid="4i3ds41">
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
                data-oid="03_6g55"
            >
                Withdraw
            </motion.button>
        </>
    );
}
