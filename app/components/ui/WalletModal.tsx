'use client';

import { bs58 } from '@coral-xyz/anchor/dist/cjs/utils/bytes';
import QrCode from 'react-qr-code';
import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import toast from 'react-hot-toast';
import { UmbraAddress } from '@/app/auth/signup/utils';

type WalletModalProps = {
    formattedOnChainBalance: string;
    selectedTokenTicker?: string;
    walletAddress: UmbraAddress;
};

const WalletModal = ({
    formattedOnChainBalance,
    selectedTokenTicker,
    walletAddress,
}: WalletModalProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const modalRef = useRef<HTMLDivElement>(null);

    const buf = Buffer.from(walletAddress);
    const addressStr = bs58.encode(buf);
    const minifiedAddress = `${addressStr.slice(0, 6)}...${addressStr.slice(-4)}`;

    const base58Address = bs58.encode(Buffer.from(walletAddress));

    const handleCopyAddress = async () => {
        const base58Address = bs58.encode(Buffer.from(walletAddress));
        await navigator.clipboard.writeText(base58Address);
        toast.success('Wallet address copied to clipboard', {
            style: {
                background: '#333',
                color: '#fff',
                border: '1px solid #444',
            },
            duration: 2000,
            position: 'bottom-right',
        });
    };

    // Close when clicking outside the modal
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className=" text-white px-4 py-2 border-[1px] border-[#4B5563]   bg-[#2D2E33]   uppercase   flex items-center justify-center"
            >
                Wallet Details
            </button>

            {isOpen &&
                createPortal(
                    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center">
                        <div
                            ref={modalRef}
                            className="relative bg-gray-900  p-6 max-w-md w-full shadow-xl"
                        >
                            {/* Top-right X button */}
                            <button
                                onClick={() => setIsOpen(false)}
                                className="absolute top-3 right-3 text-gray-400 hover:text-white transition"
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
                                >
                                    <line x1="18" y1="6" x2="6" y2="18" />
                                    <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                            </button>

                            <div className=" w-full text-center">
                                <h2 className="text-white text-lg font-semibold mb-4">
                                    Wallet Info
                                </h2>
                            </div>

                            <div
                                style={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    margin: '1.5rem auto',
                                    maxWidth: 256,
                                    width: '100%',
                                    padding: '1rem',
                                    boxShadow: '0 6px 12px rgba(0,0,0,0.15)',
                                    backgroundColor: '#fff',
                                    border: '2px solid #4B5563',
                                }}
                            >
                                <QrCode
                                    size={256}
                                    style={{ width: '100%', height: 'auto', display: 'block' }}
                                    value={base58Address}
                                    viewBox="0 0 256 256"
                                />
                            </div>

                            <div className="flex flex-col gap-2 ">
                                <div className="text-white/70 text-sm tracking-wide">
                                    Wallet Balance:
                                    <span className="ml-2 text-white font-medium">
                                        {formattedOnChainBalance} {selectedTokenTicker || ''}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between gap-2 ">
                                    <div className="text-white/70 text-sm tracking-wide">
                                        Wallet Address
                                        <span className="ml-2 text-white font-medium">
                                            {minifiedAddress}
                                        </span>
                                    </div>
                                    <button
                                        onClick={handleCopyAddress}
                                        className="p-1.5 hover:bg-gray-800 rounded-md transition-colors"
                                    >
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
                                            className="text-gray-400"
                                        >
                                            <rect
                                                width="14"
                                                height="14"
                                                x="8"
                                                y="8"
                                                rx="2"
                                                ry="2"
                                            />
                                            <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>,
                    document.body,
                )}
        </>
    );
};

export default WalletModal;
