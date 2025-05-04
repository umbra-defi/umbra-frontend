import { PublicKey } from '@solana/web3.js';

// Define the interface for a relayer
export interface Relayer {
    publicKey: PublicKey;
    pdaAddress: PublicKey;
    id: string;
}

// In-memory store as a singleton
class RelayerStore {
    private relayers: Map<string, Relayer> = new Map();

    // Add a new relayer
    addRelayer(relayer: Relayer): boolean {
        if (this.relayers.has(relayer.id)) {
            return false;
        }
        this.relayers.set(relayer.id, relayer);
        return true;
    }

    // Get a specific relayer by ID
    getRelayer(id: string): Relayer | undefined {
        return this.relayers.get(id);
    }

    // Get all relayers
    getAllRelayers(): Relayer[] {
        return Array.from(this.relayers.values());
    }

    // Update a relayer
    updateRelayer(id: string, updates: Partial<Relayer>): boolean {
        const relayer = this.relayers.get(id);
        if (!relayer) {
            return false;
        }

        this.relayers.set(id, { ...relayer, ...updates });
        return true;
    }

    // Remove a relayer
    removeRelayer(id: string): boolean {
        return this.relayers.delete(id);
    }

    // Clear all relayers
    clearAll(): void {
        this.relayers.clear();
    }
}

// Export a singleton instance
export const relayerStore = new RelayerStore();

// Default export for ease of use
export default relayerStore;
