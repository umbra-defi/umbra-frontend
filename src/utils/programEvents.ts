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

// Example usage:
/*
const handleEvent = async () => {
  try {
    const event = await awaitEvent('myEvent');
    console.log('Event received:', event);
  } catch (error) {
    console.error('Error waiting for event:', error);
  }
};
*/
