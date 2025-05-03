import { create } from 'zustand';
import { UmbraAddress, X25519PrivateKey, X25519Keypair } from '@/app/auth/signup/utils';
import { x25519 } from '@arcium-hq/client';

export enum UmbraStoreError {
    UNINITIALIZED_PRIVATE_KEY,
    UNINITIALIZED_UMBRA_ADDRESS,
}

interface UmbraStoreState {
    // Example state values
    x25519PrivKey: X25519PrivateKey;
    umbraAddress: UmbraAddress;

    hasX25519PrivKeyBeenSet: boolean;
    hasUmbraAddressBeenSet: boolean;

    // Setters
    setX25519PrivKey: (newKey: X25519PrivateKey) => void;
    setUmbraAddress: (newAddress: UmbraAddress) => void;

    // Getters
    getX25519Keypair: () => X25519Keypair | UmbraStoreError;
    getUmbraAddress: () => UmbraAddress | UmbraStoreError;
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

export const useUmbraStore = create<UmbraStoreState>()((set, get) => ({
    // Initial state with garbage values
    x25519PrivKey: initialX25519PrivKey,
    umbraAddress: initialUmbraAddress,
    hasX25519PrivKeyBeenSet: false,
    hasUmbraAddressBeenSet: false,

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

    // Getters
    getX25519Keypair: () => {
        const state = get();

        if (!state.hasX25519PrivKeyBeenSet) {
            return UmbraStoreError.UNINITIALIZED_PRIVATE_KEY;
        }

        const x25519PublicKey = x25519.getPublicKey(state.x25519PrivKey);
        return { privateKey: state.x25519PrivKey, publicKey: x25519PublicKey };
    },

    getUmbraAddress: () => {
        const state = get();

        if (!state.hasUmbraAddressBeenSet) {
            return UmbraStoreError.UNINITIALIZED_UMBRA_ADDRESS;
        }

        return state.umbraAddress;
    },
}));
