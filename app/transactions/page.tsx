'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

// Mock data for tokens
const tokens = [
    { symbol: 'SOL', name: 'Solana' },
    { symbol: 'USDC', name: 'USD Coin' },
    { symbol: 'USDT', name: 'Tether' },
    { symbol: 'BTC', name: 'Bitcoin (Wrapped)' },
    { symbol: 'ETH', name: 'Ethereum (Wrapped)' },
];

// Fee types
const feeTypes = [
    {
        id: 'transaction',
        name: 'TRANSACTION FEE',
        description: 'Fee for processing the transaction on the blockchain',
        amount: 0,
        token: 'USDC',
    },
    {
        id: 'privacy',
        name: 'PRIVACY FEE',
        description: 'Fee for enhanced privacy features',
        amount: 0,
        token: 'USDC',
    },
    {
        id: 'rent',
        name: 'TOKEN ACCOUNT RENT',
        description: 'Fee for maintaining the token account on Solana',
        amount: 0,
        token: 'USDC',
    },
    {
        id: 'network',
        name: 'NETWORK FEE',
        description: 'Fee for network operations',
        amount: 0,
        token: 'USDC',
    },
];

type TabType = 'withdraw' | 'deposit' | 'transfer';

export default function Page() {
    const [activeTab, setActiveTab] = useState<TabType>('deposit');
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

    const handleTabChange = (tab: TabType) => {
        setActiveTab(tab);
    };

    const handleSubmit = () => {
        // This would be where you'd handle the transaction
        console.log({
            type: activeTab,
            amount,
            token: selectedToken,
            recipientAddress: activeTab === 'transfer' ? recipientAddress : undefined,
        });
    };

    // Calculate total fees
    const totalFees = feeTypes.reduce((sum, fee) => sum + fee.amount, 0);

    return (
        <div className="w-full min-h-screen flex flex-col bg-[#000000]" data-oid="nlvr7_2">
            {/* Header */}
            <header
                className="w-full p-6 flex justify-between items-center border-b border-gray-900"
                data-oid="0xr6r6g"
            >
                <div className="text-white font-bold text-xl" data-oid="umt-cdk">
                    UMBRA
                </div>
                <div className="flex items-center gap-4" data-oid="m8iz2n3">
                    <div className="text-white" data-oid="pt:3h:g">
                        WALLET BALANCE: •••••••••
                    </div>
                    <Link href="/auth" data-oid="728pki.">
                        <button
                            className="text-white border border-gray-900 px-4 py-2 hover:bg-gray-900 transition-colors"
                            data-oid="jb8928f"
                        >
                            Logout
                        </button>
                    </Link>
                </div>
            </header>

            {/* Main Content */}
            <div className="flex-1 flex items-center justify-center p-4" data-oid="jagnxs5">
                <div className="w-full max-w-[590px]" data-oid="rffc9w9">
                    {/* Tabs */}
                    <div className="grid grid-cols-3 border border-gray-900" data-oid="wpz3s6d">
                        <button
                            className={cn(
                                'py-3 text-center text-white uppercase',
                                activeTab === 'withdraw' && 'bg-[#0a0a0f]',
                            )}
                            onClick={() => handleTabChange('withdraw')}
                            data-oid="s._b3en"
                        >
                            Withdraw
                        </button>
                        <button
                            className={cn(
                                'py-3 text-center text-white uppercase',
                                activeTab === 'deposit' && 'bg-[#0a0a0f]',
                            )}
                            onClick={() => handleTabChange('deposit')}
                            data-oid="xg1acez"
                        >
                            Deposit
                        </button>
                        <button
                            className={cn(
                                'py-3 text-center text-white uppercase',
                                activeTab === 'transfer' && 'bg-[#0a0a0f]',
                            )}
                            onClick={() => handleTabChange('transfer')}
                            data-oid="cxozr0s"
                        >
                            Transfer
                        </button>
                    </div>

                    {/* Form Content */}
                    <div
                        className="bg-[#0a0a0f] border border-gray-900 border-t-0 p-6 space-y-4"
                        data-oid="oice0wl"
                    >
                        <div
                            className="flex justify-between items-center text-white mb-4"
                            data-oid="vrs978k"
                        >
                            <div data-oid="af-e.ta">WALLET BALANCE: •••••••••</div>
                            <div className="flex gap-2" data-oid="246sr5v">
                                <button className="p-1" data-oid="gvox4kq">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="24"
                                        height="24"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        className="lucide lucide-download"
                                        data-oid="tp3lhx7"
                                    >
                                        <path
                                            d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"
                                            data-oid="vb04imm"
                                        />

                                        <polyline points="7 10 12 15 17 10" data-oid="z2ya6e2" />
                                        <line x1="12" y1="15" x2="12" y2="3" data-oid="w.1wx.k" />
                                    </svg>
                                </button>
                                <button className="p-1" data-oid="mq-:ga3">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="24"
                                        height="24"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        className="lucide lucide-copy"
                                        data-oid="mhv17bd"
                                    >
                                        <rect
                                            width="14"
                                            height="14"
                                            x="8"
                                            y="8"
                                            rx="0"
                                            ry="0"
                                            data-oid="de5.a-q"
                                        />

                                        <path
                                            d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"
                                            data-oid="dszwee7"
                                        />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        {/* Amount Input */}
                        <div className="relative" data-oid="z0n-b-k">
                            <div
                                className="flex justify-between items-center border border-gray-900 p-3"
                                data-oid="dqm_f0k"
                            >
                                <input
                                    type="text"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    className="bg-transparent text-white outline-none w-full"
                                    placeholder="0"
                                    data-oid="j1k_og-"
                                />

                                {activeTab === 'transfer' && (
                                    <div className="flex gap-2" data-oid="48_00up">
                                        <button
                                            className="text-white bg-black border border-gray-900 px-3 py-1 text-sm"
                                            data-oid="dfd4uon"
                                        >
                                            HALF
                                        </button>
                                        <button
                                            className="text-white bg-black border border-gray-900 px-3 py-1 text-sm"
                                            data-oid="w4k-3bg"
                                        >
                                            MAX
                                        </button>
                                    </div>
                                )}
                                <div className="relative" data-oid="oa_0eo1">
                                    <button
                                        className="flex items-center gap-2 text-white"
                                        onClick={() => setShowTokenDropdown(!showTokenDropdown)}
                                        data-oid="qy:zu6p"
                                    >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="20"
                                            height="20"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            className="lucide lucide-layers"
                                            data-oid="v:631fl"
                                        >
                                            <path
                                                d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z"
                                                data-oid="w15_jc_"
                                            />

                                            <path
                                                d="m22 12.5-8.58 3.91a2 2 0 0 1-1.66 0L2.6 12.5"
                                                data-oid="j3q_h69"
                                            />

                                            <path
                                                d="m22 17.5-8.58 3.91a2 2 0 0 1-1.66 0L2.6 17.5"
                                                data-oid="qo.8eji"
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
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            className="lucide lucide-chevron-down"
                                            data-oid=":ezhg1y"
                                        >
                                            <path d="m6 9 6 6 6-6" data-oid="tm1jxai" />
                                        </svg>
                                    </button>

                                    {showTokenDropdown && (
                                        <div
                                            className="absolute right-0 mt-2 w-48 bg-black border border-gray-900 shadow-lg z-10"
                                            data-oid="whr:u9b"
                                        >
                                            <div className="p-2" data-oid="fgan3c1">
                                                <input
                                                    type="text"
                                                    placeholder="Search tokens..."
                                                    className="w-full bg-[#0a0a0f] text-white p-2 border border-gray-900 outline-none"
                                                    value={searchToken}
                                                    onChange={(e) => setSearchToken(e.target.value)}
                                                    data-oid=":jiz:c2"
                                                />
                                            </div>
                                            <div
                                                className="max-h-48 overflow-y-auto"
                                                data-oid="hlr-l.j"
                                            >
                                                {filteredTokens.map((token) => (
                                                    <button
                                                        key={token.symbol}
                                                        className="w-full text-left p-2 hover:bg-[#0a0a0f] text-white"
                                                        onClick={() => {
                                                            setSelectedToken(token.symbol);
                                                            setShowTokenDropdown(false);
                                                        }}
                                                        data-oid="y8nd6ky"
                                                    >
                                                        <div
                                                            className="flex items-center"
                                                            data-oid="2p5oa29"
                                                        >
                                                            <span
                                                                className="font-medium"
                                                                data-oid="luxlp-4"
                                                            >
                                                                {token.symbol}
                                                            </span>
                                                            <span
                                                                className="ml-2 text-gray-400 text-sm"
                                                                data-oid="xtm17tq"
                                                            >
                                                                {token.name}
                                                            </span>
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Recipient Address Input (only for Transfer) */}
                        {activeTab === 'transfer' && (
                            <div className="relative" data-oid="p2lzbp4">
                                <input
                                    type="text"
                                    value={recipientAddress}
                                    onChange={(e) => setRecipientAddress(e.target.value)}
                                    className="w-full bg-transparent text-white border border-gray-900 p-3 outline-none"
                                    placeholder="ENTER RECIPIENT ADDRESS"
                                    data-oid="qe6mgwk"
                                />
                            </div>
                        )}

                        {/* Fees Section */}
                        <div className="text-white" data-oid="kp_a-mx">
                            <div
                                className="flex justify-between items-center mb-2 cursor-pointer"
                                onClick={() => setShowFeeDropdown(!showFeeDropdown)}
                                data-oid="eehwxd1"
                            >
                                <span data-oid="nlt_rip">TOTAL FEES</span>
                                <div className="flex items-center" data-oid="cchdwoj">
                                    <span data-oid="qo8_aym">${totalFees.toFixed(2)}</span>
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="16"
                                        height="16"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        className={`lucide ml-1 transition-transform ${showFeeDropdown ? 'rotate-180' : ''}`}
                                        data-oid="wo3ozvn"
                                    >
                                        <path d="m6 9 6 6 6-6" data-oid="bhhh.-r" />
                                    </svg>
                                </div>
                            </div>

                            {showFeeDropdown && (
                                <div
                                    className="border border-gray-900 p-3 mb-3 bg-black"
                                    data-oid="3c8s1_e"
                                >
                                    {feeTypes.map((fee) => (
                                        <div
                                            key={fee.id}
                                            className="flex justify-between items-center text-sm text-gray-400 mb-2 last:mb-0"
                                            data-oid="kmq.a97"
                                        >
                                            <div
                                                className="flex items-center gap-1"
                                                data-oid="udqz5ol"
                                            >
                                                <span data-oid="ja:6a4j">{fee.name}</span>
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    width="14"
                                                    height="14"
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="2"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    className="lucide lucide-circle-help"
                                                    title={fee.description}
                                                    data-oid="l0hq0sn"
                                                >
                                                    <circle
                                                        cx="12"
                                                        cy="12"
                                                        r="10"
                                                        data-oid="evpnbjo"
                                                    />

                                                    <path
                                                        d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"
                                                        data-oid="bo.:h86"
                                                    />

                                                    <path d="M12 17h.01" data-oid="8w1yfw-" />
                                                </svg>
                                            </div>
                                            <div data-oid="eidjwm1">
                                                ${fee.amount.toFixed(2)} • {fee.amount} {fee.token}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Action Button */}
                        <button
                            className="w-full bg-white text-black py-3 font-medium uppercase"
                            onClick={handleSubmit}
                            data-oid="aculkbv"
                        >
                            {activeTab}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
