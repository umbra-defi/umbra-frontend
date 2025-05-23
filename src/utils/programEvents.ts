import { Program, IdlEvents } from '@coral-xyz/anchor';
import { getUmbraProgram } from '@/lib/utils';
import { UmbraOnchain } from '@/lib/umbra-program/umbra_onchain';

export const awaitEvent = async <E extends keyof IdlEvents<UmbraOnchain>>(
    eventName: E,
): Promise<IdlEvents<UmbraOnchain>[E]> => {
    const program = getUmbraProgram();
    let listenerId: number | undefined;

    const event = await new Promise<IdlEvents<UmbraOnchain>[E]>((resolve) => {
        listenerId = program.addEventListener(eventName, (event) => {
            resolve(event);
        });
    });

    if (listenerId !== undefined) {
        await program.removeEventListener(listenerId);
    }

    return event;
};

export const awaitDepositCallbackEvent = async (): Promise<
    IdlEvents<UmbraOnchain>['despositCallbackEvent']
> => {
    return awaitEvent('despositCallbackEvent');
};

export const awaitTransferCallbackEvent = async (): Promise<
    IdlEvents<UmbraOnchain>['transferCallbackEvent']
> => {
    return awaitEvent('transferCallbackEvent');
};

export const awaitWithdrawCallbackEvent = async (): Promise<
    IdlEvents<UmbraOnchain>['withdrawCallbackEvent']
> => {
    return awaitEvent('withdrawCallbackEvent');
};

// Example usage:
/*
const handleCallbackEvents = async () => {
  try {
    // Listen for deposit callback
    const depositCallback = await awaitDepositCallbackEvent();
    console.log('Deposit callback received:', depositCallback);
    // depositCallback will have: { tokenAccount: PublicKey, message: string }

    // Listen for transfer callback
    const transferCallback = await awaitTransferCallbackEvent();
    console.log('Transfer callback received:', transferCallback);
    // transferCallback will have: { tokenAccount: PublicKey, message: string }

    // Listen for withdraw callback
    const withdrawCallback = await awaitWithdrawCallbackEvent();
    console.log('Withdraw callback received:', withdrawCallback);
    // withdrawCallback will have: { tokenAccount: PublicKey, message: string }
  } catch (error) {
    console.error('Error waiting for callback events:', error);
  }
};
*/
