import { useEffect, useCallback } from 'react';
import { Program } from '@project-serum/anchor';
import { IdlEvents } from '@project-serum/anchor';

type Event = IdlEvents<(typeof program)['idl']>;

export const useProgramEvent = <E extends keyof Event>(
    program: Program,
    eventName: E,
    onEvent: (event: Event[E]) => void,
) => {
    const handleEvent = useCallback(
        (event: Event[E]) => {
            onEvent(event);
        },
        [onEvent],
    );

    useEffect(() => {
        const listenerId = program.addEventListener(eventName, handleEvent);

        // Cleanup function to remove the event listener
        return () => {
            program.removeEventListener(listenerId);
        };
    }, [program, eventName, handleEvent]);
};

// Example usage:
/*
const MyComponent = () => {
  const handleMyEvent = (event: Event['myEvent']) => {
    console.log('Event received:', event);
  };

  useProgramEvent(program, 'myEvent', handleMyEvent);

  return <div>Listening for events...</div>;
};
*/
