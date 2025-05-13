'use client';

import type React from 'react';
import { createContext, useContext, useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';

type TooltipStep = {
    id: string;
    title: string;
    content: string;
    targetSelector: string;
    placement?: 'top' | 'right' | 'bottom' | 'left';
    tab?: 'deposit' | 'transfer' | 'withdraw';
};

type TooltipContextType = {
    steps: TooltipStep[];
    currentStepIndex: number;
    isOpen: boolean;
    startTour: () => void;
    endTour: () => void;
    nextStep: () => void;
    prevStep: () => void;
    skipToStep: (index: number) => void;
    closeTooltip: () => void;
    hasSeenTour: boolean;
    setHasSeenTour: (value: boolean) => void;
};

const TooltipContext = createContext<TooltipContextType | undefined>(undefined);

// Define all tour steps
const tourSteps: TooltipStep[] = [
    // Deposit tab steps
    {
        id: 'deposit-intro',
        title: 'Deposit Funds',
        content: 'Start by depositing funds into your account.',
        targetSelector: '[data-tab="deposit"]',
        tab: 'deposit',
    },
    {
        id: 'deposit-amount',
        title: 'Enter Amount',
        content: 'Enter the amount you want to deposit.',
        targetSelector: '[data-deposit-amount]',
        tab: 'deposit',
    },
    {
        id: 'deposit-submit',
        title: 'Submit Deposit',
        content: 'Click here to complete your deposit.',
        targetSelector: '[data-deposit-submit]',
        tab: 'deposit',
    },

    // Transfer tab steps
    {
        id: 'transfer-intro',
        title: 'Transfer Funds',
        content: "Now let's transfer funds to another account.",
        targetSelector: '[data-tab="transfer"]',
        tab: 'transfer',
    },
    {
        id: 'transfer-amount',
        title: 'Transfer Amount',
        content: 'Enter the amount you want to transfer.',
        targetSelector: '[data-transfer-amount]',
        tab: 'transfer',
    },
    {
        id: 'transfer-recipient',
        title: 'Enter Recipient',
        content: "Enter the recipient's address here.",
        targetSelector: '[data-transfer-recipient]',
        tab: 'transfer',
    },

    {
        id: 'transfer-submit',
        title: 'Submit Transfer',
        content: 'Click here to complete your transfer.',
        targetSelector: '[data-transfer-submit]',
        tab: 'transfer',
    },

    // Withdraw tab steps
    {
        id: 'withdraw-intro',
        title: 'Withdraw Funds',
        content: "Finally, let's withdraw funds from your account.",
        targetSelector: '[data-tab="withdraw"]',
        tab: 'withdraw',
    },
    {
        id: 'withdraw-amount',
        title: 'Withdraw Amount',
        content: 'Enter the amount you want to withdraw.',
        targetSelector: '[data-withdraw-amount]',
        tab: 'withdraw',
    },
    {
        id: 'withdraw-submit',
        title: 'Submit Withdrawal',
        content: 'Click here to complete your withdrawal.',
        targetSelector: '[data-withdraw-submit]',
        tab: 'withdraw',
    },
];

export const TooltipProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [hasSeenTour, setHasSeenTour] = useState<boolean>(false);
    const router = useRouter();
    const pathname = usePathname();

    // Check if we need to navigate to a different tab
    useEffect(() => {
        if (!isOpen) return;

        const currentStep = tourSteps[currentStepIndex];
        if (!currentStep?.tab) return;

        const currentTab = pathname.split('/').pop();
        if (currentTab !== currentStep.tab) {
            router.push(`/transactions/${currentStep.tab}`);
        }
    }, [currentStepIndex, isOpen, pathname, router]);

    const startTour = () => {
        setCurrentStepIndex(0);
        setIsOpen(true);
    };

    const endTour = () => {
        setIsOpen(false);
        setHasSeenTour(true);
        // Save to localStorage that user has seen the tour
        if (typeof window !== 'undefined') {
            localStorage.setItem('hasSeenTour', 'true');
        }
    };

    const nextStep = () => {
        if (currentStepIndex < tourSteps.length - 1) {
            setCurrentStepIndex(currentStepIndex + 1);
        } else {
            endTour();
        }
    };

    const prevStep = () => {
        if (currentStepIndex > 0) {
            setCurrentStepIndex(currentStepIndex - 1);
        }
    };

    const skipToStep = (index: number) => {
        if (index >= 0 && index < tourSteps.length) {
            setCurrentStepIndex(index);
        }
    };

    const closeTooltip = () => {
        setIsOpen(false);
    };

    // Check if user has seen tour before
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const seen = localStorage.getItem('hasSeenTour') === 'true';
            setHasSeenTour(seen);
        }
    }, []);

    return (
        <TooltipContext.Provider
            value={{
                steps: tourSteps,
                currentStepIndex,
                isOpen,
                startTour,
                endTour,
                nextStep,
                prevStep,
                skipToStep,
                closeTooltip,
                hasSeenTour,
                setHasSeenTour,
            }}
        >
            {children}
        </TooltipContext.Provider>
    );
};

export const useTooltip = () => {
    const context = useContext(TooltipContext);
    if (context === undefined) {
        throw new Error('useTooltip must be used within a TooltipProvider');
    }
    return context;
};
