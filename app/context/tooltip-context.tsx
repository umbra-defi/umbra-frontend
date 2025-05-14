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
        content:
            'Click Deposit to move tokens from your connected wallet into your Umbra’s private wallet.',
        targetSelector: '[data-tab="deposit"]',
        tab: 'deposit',
    },
    {
        id: 'deposit-balance',
        title: 'Check Balances',
        content:
            'Your private (Umbra) vs. on-chain (connected) balances—so you know what you can deposit.',
        targetSelector: '[data-deposit-balance]',
        tab: 'deposit',
    },

    {
        id: 'deposit-amount',
        title: 'Set Amount & Token',
        content: 'Enter (or shortcut) how much you want to deposit, and choose your token.',
        targetSelector: '[data-deposit-amount]',
        tab: 'deposit',
    },
    {
        id: 'deposit-submit',
        title: 'Confirm Deposit',
        content:
            'Press Deposit and approve in your wallet. Funds will be privately deposited to your Umbra wallet.',
        targetSelector: '[data-deposit-submit]',
        tab: 'deposit',
    },

    // Transfer tab steps
    {
        id: 'transfer-intro',
        title: 'Transfer Funds',
        content:
            'Switch to Transfer when you’re ready to send private funds to another Umbra user.',
        targetSelector: '[data-tab="transfer"]',
        tab: 'transfer',
    },
    {
        id: 'transfer-amount',
        title: 'Enter Amount & Token',
        content: 'Specify how much SOL or another token you want to send.',
        targetSelector: '[data-transfer-amount]',
        tab: 'transfer',
    },
    {
        id: 'transfer-recipient',
        title: 'Recipient Address',
        content: 'Paste your recipient’s Umbra address here.',
        targetSelector: '[data-transfer-recipient]',
        tab: 'transfer',
    },

    {
        id: 'transfer-submit',
        title: 'Confirm Transfer',
        content: 'Click Transfer and confirm in your wallet to send privately.',
        targetSelector: '[data-transfer-submit]',
        tab: 'transfer',
    },

    // Withdraw tab steps
    {
        id: 'withdraw-intro',
        title: 'Withdraw Funds',
        content: 'To take funds back on-chain, select Withdraw.',
        targetSelector: '[data-tab="withdraw"]',
        tab: 'withdraw',
    },
    {
        id: 'withdraw-amount',
        title: 'Set Amount & Token',
        content: 'Enter how much you’d like to withdraw.',
        targetSelector: '[data-withdraw-amount]',
        tab: 'withdraw',
    },
    {
        id: 'withdraw-submit',
        title: 'Confirm Withdraw',
        content: 'Hit Withdraw and your token returns to your connected on-chain wallet.',
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
