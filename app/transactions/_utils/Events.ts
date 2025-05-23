import { Program, IdlEvents } from '@coral-xyz/anchor';
import { getUmbraProgram } from '@/lib/utils';
import { UmbraOnchain } from '@/lib/umbra-program/umbra_onchain';

const awaitEvent = async <E extends keyof Event>(eventName: E) => {
  let listenerId: number;
  const event = await new Promise<Event[E]>((res) => {
    listenerId = getUmbraProgram().addEventListener(eventName, (event) => {
      res(event);
    });
  });
  await getUmbraProgram().removeEventListener(listenerId);

  return event;
};

export const awaitDepositCallbackEvent = async (): Promise<
    IdlEvents<UmbraOnchain>['emittingEvent']
> => {
    return awaitEvent('emittingEvent');
};

export const awaitTransferCallbackEvent = async (): Promise<
    IdlEvents<UmbraOnchain>['emittingEvent']
> => {
    return awaitEvent('emittingEvent');
};

export const awaitWithdrawCallbackEvent = async (): Promise<
    IdlEvents<UmbraOnchain>['emittingEvent']
> => {
    return awaitEvent('emittingEvent');
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
