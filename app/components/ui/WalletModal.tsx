'use client';

import { bs58 } from '@coral-xyz/anchor/dist/cjs/utils/bytes';
import QrCode from 'react-qr-code';
import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import toast from 'react-hot-toast';
import type { UmbraAddress } from '@/app/auth/signup/utils';

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
    const buttonRef = useRef<HTMLButtonElement>(null);
    const [modalPosition, setModalPosition] = useState({ top: 0, left: 0 });

    const buf = Buffer.from(walletAddress);
    const addressStr = bs58.encode(buf);
    const minifiedAddress = `${addressStr.slice(0, 6)}...${addressStr.slice(-4)}`;

    const base58Address = bs58.encode(Buffer.from(walletAddress));

    const handleCopyAddress = async () => {
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

    // Calculate position when opening modal
    const calculatePosition = () => {
        if (buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            const isMobile = window.innerWidth < 640;

            if (isMobile) {
                // On mobile, center the modal horizontally
                setModalPosition({
                    top: rect.bottom + window.scrollY,
                    left: window.innerWidth / 2,
                });
            } else {
                setModalPosition({
                    top: rect.bottom + window.scrollY,
                    left: rect.left + window.scrollX,
                });
            }
        }
    };

    const handleOpenModal = () => {
        calculatePosition();
        setIsOpen(true);
    };

    // Close when clicking outside the modal
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (
                modalRef.current &&
                !modalRef.current.contains(event.target as Node) &&
                buttonRef.current &&
                !buttonRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        }

        // Recalculate position on window resize
        function handleResize() {
            if (isOpen) {
                calculatePosition();
            }
        }

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            window.addEventListener('resize', handleResize);
            window.addEventListener('scroll', handleResize);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('scroll', handleResize);
        };
    }, [isOpen]);

    return (
        <div className="relative">
            <button
                ref={buttonRef}
                onClick={handleOpenModal}
                className="text-black px-4 py-2 bg-white uppercase flex items-center justify-center"
            >
                Receive
            </button>

            {isOpen &&
                createPortal(
                    <div
                        className="fixed inset-0 z-50 mt-4 bg-transparent pointer-events-none"
                        style={{ backdropFilter: 'none' }}
                    >
                        <div
                            ref={modalRef}
                            className="absolute pointer-events-auto bg-gray-900 p-4 shadow-xl rounded-lg border border-gray-800"
                            style={{
                                top: `${modalPosition.top}px`,
                                left: `${modalPosition.left}px`,
                                transform:
                                    window.innerWidth < 640
                                        ? 'translateX(-50%)'
                                        : 'translateX(-25%)',
                                width: 'calc(min(90vw, 320px))',
                                maxHeight: '90vh',
                                overflowY: 'auto',
                            }}
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

                            <div className="w-full text-center">
                                <h2 className="text-white text-base font-semibold mb-2">
                                    Wallet Info
                                </h2>
                            </div>

                            <div
                                style={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    margin: '1rem auto',
                                    maxWidth: '200px',
                                    width: '100%',
                                    padding: '0.75rem',
                                    boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
                                    backgroundColor: '#fff',
                                    border: '2px solid #4B5563',
                                }}
                            >
                                <QrCode
                                    size={200}
                                    style={{ width: '100%', height: 'auto', display: 'block' }}
                                    value={base58Address}
                                    viewBox="0 0 256 256"
                                />
                            </div>

                            <div className="flex flex-col gap-1 text-sm">
                                <div className="text-white/70 text-xs tracking-wide">
                                    Wallet Balance:
                                    <span className="ml-2 text-white font-medium">
                                        {formattedOnChainBalance} {selectedTokenTicker || ''}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between gap-2">
                                    <div className="text-white/70 text-xs tracking-wide">
                                        Wallet Address
                                        <span className="ml-2 text-white font-medium">
                                            {minifiedAddress}
                                        </span>
                                    </div>
                                    <button
                                        onClick={handleCopyAddress}
                                        className="p-1 hover:bg-gray-800 rounded-md transition-colors"
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
        </div>
    );
};

export default WalletModal;
