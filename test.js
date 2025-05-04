import { Connection, PublicKey } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { getAssociatedTokenAddress } from '@solana/spl-token';

/**
 * Get the token balance for a specific mint and owner
 * @param connection Solana connection
 * @param mintAddress The mint address as a string or PublicKey
 * @param ownerAddress The owner's address as a string or PublicKey
 * @returns The token balance as a number (or null if ATA doesn't exist)
 */
async function getTokenBalance(
    connection,
    mintAddress,
    ownerAddress,
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

        // Return the balance as a number
        return Number(tokenAccountInfo.value.amount) / 10 ** tokenAccountInfo.value.decimals;
    } catch (error) {
        console.error('Error fetching token balance:', error);
        return null;
    }
}

const connection = new Connection('https://api.mainnet-beta.solana.com');
const mintAddress = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'; // USDC mint
const ownerAddress = 'DqXcKJzBpD3DwYM4zyyCKqqWsChXRaVQnToQ5BLtWJkS'; // Some wallet address
getTokenBalance(connection, mintAddress, 'D15YraLnfJQ6ggE4t7xrCcTYBzU8s7amuV4KiywZBho2').then((balance) => {
    console.log(`Token balance: ${balance}`);
});
