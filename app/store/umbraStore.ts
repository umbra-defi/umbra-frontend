import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
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
    loading: boolean;
    loadingMessage: string;

    // Setters
    setX25519PrivKey: (newKey: X25519PrivateKey) => void;
    setUmbraAddress: (newAddress: UmbraAddress) => void;
    setLastScannedAddress: (address: string) => void;
    setTokenList: (tokenList: Array<TokenListing>) => void;
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
    setLoading: (val: boolean) => void;
    setLoadingMessage: (msg: string) => void;

    // Reset all state
    reset: () => void;
}

// Helper to create new garbage key/address
const createInitialGarbageValues = (): {
    x25519PrivKey: X25519PrivateKey;
    umbraAddress: UmbraAddress;
} => {
    const garbagePrivKey = new Uint8Array(32);
    const garbageAddress = new Uint8Array(32);
    crypto.getRandomValues(garbagePrivKey);
    crypto.getRandomValues(garbageAddress);

    return {
        x25519PrivKey: garbagePrivKey,
        umbraAddress: garbageAddress,
    };
};

// Create store
const { x25519PrivKey: initialX25519PrivKey, umbraAddress: initialUmbraAddress } =
    createInitialGarbageValues();

export const useUmbraStore = create<UmbraStoreState>()(
    persist(
        (set, get) => ({
            x25519PrivKey: initialX25519PrivKey,
            umbraAddress: initialUmbraAddress,
            tokenList: [],
            umbraWalletBalance: undefined,
            availableOnChainBalance: undefined,
            selectedTokenTicker: undefined,
            selectedTokenDecimals: undefined,
            hasX25519PrivKeyBeenSet: false,
            hasUmbraAddressBeenSet: false,
            hasTokenListBeenSet: false,
            lastScannedAddress: undefined,
            loading: false,
            loadingMessage: '',

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
                    tokenList,
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
                return {
                    privateKey: state.x25519PrivKey,
                    publicKey: x25519PublicKey,
                };
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
                const formatted = state.umbraWalletBalance / 10 ** state.selectedTokenDecimals;
                return formatted.toLocaleString(undefined, {
                    maximumFractionDigits: state.selectedTokenDecimals,
                });
            },

            getFormattedOnChainBalance: () => {
                const state = get();
                if (
                    state.availableOnChainBalance === undefined ||
                    state.selectedTokenDecimals === undefined
                ) {
                    return '—';
                }
                const formatted = state.availableOnChainBalance / 10 ** state.selectedTokenDecimals;
                return formatted.toLocaleString(undefined, {
                    maximumFractionDigits: state.selectedTokenDecimals,
                });
            },
            setLoading: (val: boolean) => set(() => ({ loading: val })),
            setLoadingMessage: (msg: string) => set(() => ({ loadingMessage: msg })),

            // ✅ Reset method
            reset: () => {
                const emptyPrivKey = new Uint8Array(0);
                const emptyAddress = new Uint8Array(0);

                set(() => ({
                    emptyPrivKey,
                    emptyAddress,
                    hasX25519PrivKeyBeenSet: false,
                    hasUmbraAddressBeenSet: false,
                    hasTokenListBeenSet: false,
                    tokenList: [],
                    umbraWalletBalance: undefined,
                    availableOnChainBalance: undefined,
                    selectedTokenTicker: undefined,
                    selectedTokenDecimals: undefined,
                    lastScannedAddress: undefined,
                }));
            },
        }),
        {
            name: 'umbra-store',
            storage: createJSONStorage(() => sessionStorage),
        },
    ),
);
