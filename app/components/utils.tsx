import { getUserAccountPDA } from '@/lib/umbra-program/umbra';
import { UmbraAddress } from '../auth/signup/utils';
import { getUmbraProgram } from '@/lib/utils';

export async function tryFetchUserAccount(umbraAddress: UmbraAddress) {
    const program = getUmbraProgram();
    const userAccountPDA = getUserAccountPDA(Buffer.from(umbraAddress));

    try {
        const tokenAccount = await program.account.umbraUserAccount.fetch(userAccountPDA);
        // Success: do something with the fetched account
        return tokenAccount; // or call another function with it
    } catch (error) {
        console.warn('Failed to fetch user account:', error);
        // Handle the error case gracefully
        return null;
    }
}
