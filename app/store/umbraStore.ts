import { create } from 'zustand';
import { persist } from 'zustand/middleware'; // <-- Add this import
import { UmbraAddress } from '@/app/auth/signup/utils';
import { X25519Keypair, X25519PrivateKey } from '@/lib/cryptography';
import { x25519 } from '@arcium-hq/client';
import { PublicKey } from '@solana/web3.js';

export enum UmbraStoreError {
    UNINITIALIZED_PRIVATE_KEY,
    UNINITIALIZED_UMBRA_ADDRESS,
    UNINITIALIZED_TOKEN_LIST,
}

export type TokenListing = {
    mintAddress: PublicKey;
    ticker: string;
    decimals?: number;
};

interface UmbraStoreState {
    // Example state values
    x25519PrivKey: X25519PrivateKey;
    umbraAddress: UmbraAddress;
    tokenList: Array<TokenListing>;
    umbraWalletBalance: number | undefined;
    availableOnChainBalance: number | undefined;
    selectedTokenTicker: string | undefined;
    selectedTokenDecimals: number | undefined;

    hasX25519PrivKeyBeenSet: boolean;
    hasUmbraAddressBeenSet: boolean;
    hasTokenListBeenSet: boolean;
    lastScannedAddress: string | undefined;

    // Setters
    setX25519PrivKey: (newKey: X25519PrivateKey) => void;
    setUmbraAddress: (newAddress: UmbraAddress) => void;
    setLastScannedAddress: (address: string) => void;
    setTokenList: (
        tokenList: Array<{ mintAddress: PublicKey; ticker: string; decimals?: number }>,
    ) => void;
    setUmbraWalletBalance: (balance: number) => void;
    setAvailableOnChainBalance: (balance: number) => void;
    setSelectedTokenTicker: (ticker: string) => void;
    setSelectedTokenDecimals: (decimals: number) => void;

    // Getters
    getX25519Keypair: () => X25519Keypair | UmbraStoreError;
    getUmbraAddress: () => UmbraAddress | UmbraStoreError;
    getTokenList: () => Array<TokenListing> | UmbraStoreError;
    getFormattedUmbraWalletBalance: () => string;
    getFormattedOnChainBalance: () => string;
}

// Create initial garbage values (random bytes)
const createInitialGarbageValues = (): {
    x25519PrivKey: X25519PrivateKey;
    umbraAddress: UmbraAddress;
} => {
    // Create garbage X25519 private key (32 bytes)
    const garbagePrivKey = new Uint8Array(32);
    crypto.getRandomValues(garbagePrivKey);

    // Create garbage Umbra address (32 bytes)
    const garbageAddress = new Uint8Array(32);
    crypto.getRandomValues(garbageAddress);

    return {
        x25519PrivKey: garbagePrivKey,
        umbraAddress: garbageAddress,
    };
};

// Initial garbage values
const { x25519PrivKey: initialX25519PrivKey, umbraAddress: initialUmbraAddress } =
    createInitialGarbageValues();

export const useUmbraStore = create<UmbraStoreState>()(
    persist(
        (set, get) => ({
            // Initial state with garbage values
            x25519PrivKey: initialX25519PrivKey,
            umbraAddress: initialUmbraAddress,
            hasX25519PrivKeyBeenSet: false,
            hasUmbraAddressBeenSet: false,
            hasTokenListBeenSet: false,
            tokenList: [],
            umbraWalletBalance: undefined,
            availableOnChainBalance: undefined,
            selectedTokenTicker: undefined,
            selectedTokenDecimals: undefined,
            lastScannedAddress: undefined,

            // Setters
            setX25519PrivKey: (newKey: X25519PrivateKey) =>
                set(() => ({
                    x25519PrivKey: newKey,
                    hasX25519PrivKeyBeenSet: true,
                })),

            setUmbraAddress: (newAddress: UmbraAddress) =>
                set(() => ({
                    umbraAddress: newAddress,
                    hasUmbraAddressBeenSet: true,
                })),

            setLastScannedAddress: (address: string) =>
                set(() => ({
                    lastScannedAddress: address,
                })),

            setTokenList: (tokenList: Array<TokenListing>) =>
                set(() => ({
                    tokenList: tokenList,
                    hasTokenListBeenSet: true,
                })),

            setUmbraWalletBalance: (balance: number) =>
                set(() => ({
                    umbraWalletBalance: balance,
                })),

            setAvailableOnChainBalance: (balance: number) =>
                set(() => ({
                    availableOnChainBalance: balance,
                })),

            setSelectedTokenTicker: (ticker: string) =>
                set((state) => {
                    const tokenData = state.tokenList.find((token) => token.ticker === ticker);
                    return {
                        selectedTokenTicker: ticker,
                        selectedTokenDecimals: tokenData?.decimals,
                    };
                }),

            setSelectedTokenDecimals: (decimals: number) =>
                set(() => ({
                    selectedTokenDecimals: decimals,
                })),

            // Getters
            getX25519Keypair: () => {
                const state = get();
                const x25519PublicKey = x25519.getPublicKey(state.x25519PrivKey);
                return { privateKey: state.x25519PrivKey, publicKey: x25519PublicKey };
            },

            getUmbraAddress: () => {
                const state = get();
                return state.umbraAddress;
            },

            getTokenList: () => {
                const state = get();
                if (!state.hasTokenListBeenSet) {
                    return UmbraStoreError.UNINITIALIZED_TOKEN_LIST;
                }
                return state.tokenList;
            },

            getFormattedUmbraWalletBalance: () => {
                const state = get();
                if (
                    state.umbraWalletBalance === undefined ||
                    state.selectedTokenDecimals === undefined
                ) {
                    return '—';
                }
                const decimals = state.selectedTokenDecimals || 9;
                const formatted = state.umbraWalletBalance / 10 ** decimals;
                return formatted.toLocaleString(undefined, { maximumFractionDigits: decimals });
            },

            getFormattedOnChainBalance: () => {
                const state = get();
                if (
                    state.availableOnChainBalance === undefined ||
                    state.selectedTokenDecimals === undefined
                ) {
                    return '—';
                }
                const decimals = state.selectedTokenDecimals || 9;
                const formatted = state.availableOnChainBalance / 10 ** decimals;
                return formatted.toLocaleString(undefined, { maximumFractionDigits: decimals });
            },
        }),
        {
            name: 'umbra-store', // unique name
            // Optionally, you can whitelist/blacklist state keys, or use custom storage
            // partialize: (state) => ({ ... }), // to persist only part of the state
        },
    ),
);
