import { PublicKey } from '@solana/web3.js';

export const UMBRA_PDA_DERIVATION_SEED = 'Umbra_Cal_Pranay_Froggie_Pata';

export const UMBRA_RELAYER_ACCOUNT_DERIVATION_SEED = 'Relayer_Account';
export const UMBRA_USER_ACCOUNT_DERIVATION_SEED = 'User_Account';
export const UMBRA_TOKEN_ACCOUNT_DERIVATION_SEED = 'Token_Account';
export const UMBRA_ASSOCIATED_TOKEN_ACCOUNT_DERIVATION_SEED = 'Associated_Token_Account';

export const arciumClusterKey = new PublicKey('GgSqqAyH7AVY3Umcv8NvncrjFaNJuQLmxzxFxPoPW2Yd');

export const tokens = [
    { symbol: 'wSOL', mint: 'So11111111111111111111111111111111111111112' },
    { symbol: 'USDC', mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v' },
    { symbol: 'USDT', mint: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB' },
    { symbol: 'JUP', mint: 'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN' },
    { symbol: 'RAY', mint: '4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R' },
];

export const mxePublicKey = new Uint8Array([
    34, 56, 246, 3, 165, 122, 74, 68, 14, 81, 107, 73, 129, 145, 196, 4, 98, 253, 120, 15, 235, 108,
    37, 198, 124, 111, 38, 1, 210, 143, 72, 87,
]);
