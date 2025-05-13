'use client';

import { useTooltip } from '../context/tooltip-context';

export function TourButton() {
    const { startTour, hasSeenTour } = useTooltip();

    return (
        <button
            onClick={startTour}
            className="fixed bottom-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-full shadow-lg hover:bg-blue-700 flex items-center gap-2 z-30"
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <circle cx="12" cy="12" r="10" />
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                <path d="M12 17h.01" />
            </svg>
            {hasSeenTour ? 'Restart Tour' : 'Start Tour'}
        </button>
    );
}
