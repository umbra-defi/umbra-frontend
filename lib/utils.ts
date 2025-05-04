import { clsx, type ClassValue } from 'clsx';
import toast from 'react-hot-toast';
import { twMerge } from 'tailwind-merge';
import umbraOnChainIDL from '@/lib/umbra-program/umbra_onchain.json';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export type Bytes = Uint8Array;

export type UmbraDatabaseSchema = {
    user_wallet_address: Bytes;
    password: string;
    encrypted_data: Bytes;
};

export function toastError(error: string) {
    toast.error(error, {
        style: {
            border: '1px solid #713200',
            padding: '16px',
            color: '#713200',
            backgroundColor: '#FFEDD5',
        },
        iconTheme: {
            primary: '#713200',
            secondary: '#FFFAEE',
        },
    });
}

import { Connection, PublicKey } from '@solana/web3.js';
import { AnchorProvider, Program, setProvider, Wallet } from '@coral-xyz/anchor';
import { UmbraOnchain } from './umbra-program/umbra_onchain';
import { WalletProvider } from '@solana/wallet-adapter-react';
import { getAssociatedTokenAddress } from '@solana/spl-token';

export function getLocalnetConnection(): Connection {
    return new Connection('http://127.0.0.1:8899', 'confirmed');
}
export function getDevnetConnection(): Connection {
    return new Connection('https://api.devnet.solana.com', 'confirmed');
}

export function getMainnetConnection(): Connection {
    return new Connection('https://api.mainnet-beta.solana.com', 'confirmed');
}

export function getConnection() {
    const SELECTION = 'LOCALNET';
    if (SELECTION === 'LOCALNET') {
        return getLocalnetConnection();
    } else if (SELECTION === 'DEVNET') {
        return getDevnetConnection();
    } else {
        return getMainnetConnection();
    }
}

export function getUmbraProgram() {
    const program = new Program<UmbraOnchain>(umbraOnChainIDL, window.solana);
    return program;
}

export async function getTokenBalance(
    connection: Connection,
    mintAddress: string,
    ownerAddress: string,
) {
    // Convert string addresses to PublicKey if needed
    const mintPubkey = typeof mintAddress === 'string' ? new PublicKey(mintAddress) : mintAddress;
    const ownerPubkey =
        typeof ownerAddress === 'string' ? new PublicKey(ownerAddress) : ownerAddress;

    try {
        // Find the associated token account address
        const ataAddress = await getAssociatedTokenAddress(mintPubkey, ownerPubkey);

        // Get the token account info
        const tokenAccountInfo = await connection.getTokenAccountBalance(ataAddress);

        console.log('Fetched Balance for ', mintAddress, ': ', tokenAccountInfo.value.amount);
        // Return the balance as a number
        return Number(tokenAccountInfo.value.amount) / 10 ** tokenAccountInfo.value.decimals;
    } catch (error) {
        console.error('Error fetching token balance for:', mintAddress);
        return null;
    }
}
