import { PublicKey } from '@solana/web3.js';
import { createClient } from '@supabase/supabase-js';
import { clsx, type ClassValue } from 'clsx';
import toast from 'react-hot-toast';
import { twMerge } from 'tailwind-merge';

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
