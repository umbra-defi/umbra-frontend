'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';

type TooltipProps = {
    title: string;
    content: string;
    targetSelector: string;
    isOpen: boolean;
    onClose: () => void;
    onNext: () => void;
    onPrev?: () => void;
    placement?: 'top' | 'right' | 'bottom' | 'left';
    currentStep: number;
    totalSteps: number;
};

const calculatePosition = (
    targetElement: HTMLElement,
    tooltipElement: HTMLElement,
    placement: 'top' | 'right' | 'bottom' | 'left',
) => {
    const targetRect = targetElement.getBoundingClientRect();
    const tooltipRect = tooltipElement.getBoundingClientRect();

    // Add a small offset to create space between target and tooltip
    const offset = 12;

    let top = 0;
    let left = 0;

    switch (placement) {
        case 'top':
            top = targetRect.top - tooltipRect.height - offset;
            left = targetRect.left + (targetRect.width - tooltipRect.width) / 2;
            break;
        case 'right':
            top = targetRect.top + (targetRect.height - tooltipRect.height) / 2;
            left = targetRect.right + offset;
            break;
        case 'bottom':
            top = targetRect.bottom + offset;
            left = targetRect.left + (targetRect.width - tooltipRect.width) / 2;
            break;
        case 'left':
            top = targetRect.top + (targetRect.height - tooltipRect.height) / 2;
            left = targetRect.left - tooltipRect.width - offset;
            break;
    }

    // Ensure tooltip stays within viewport
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Adjust horizontal position if needed
    if (left < 10) {
        left = 10;
    } else if (left + tooltipRect.width > viewportWidth - 10) {
        left = viewportWidth - tooltipRect.width - 10;
    }

    // Adjust vertical position if needed
    if (top < 10) {
        top = 10;
    } else if (top + tooltipRect.height > viewportHeight - 10) {
        top = viewportHeight - tooltipRect.height - 10;
    }

    return { top, left };
};

export function Tooltip({
    title,
    content,
    targetSelector,
    isOpen,
    onClose,
    onNext,
    onPrev,
    placement = 'bottom',
    currentStep,
    totalSteps,
}: TooltipProps) {
    const [position, setPosition] = React.useState({ top: 0, left: 0 });
    const tooltipRef = React.useRef<HTMLDivElement>(null);
    const [isMounted, setIsMounted] = React.useState(false);

    React.useEffect(() => {
        setIsMounted(true);
        return () => setIsMounted(false);
    }, []);

    React.useEffect(() => {
        if (!isOpen || !isMounted) return;

        const targetElement = document.querySelector(targetSelector) as HTMLElement;
        if (!targetElement || !tooltipRef.current) return;

        // Add highlight class to target element
        targetElement.classList.add('tooltip-target');

        // Calculate position
        const newPosition = calculatePosition(targetElement, tooltipRef.current, placement);
        setPosition(newPosition);

        // Handle escape key
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        window.addEventListener('keydown', handleEscape);
        window.addEventListener('resize', updatePosition);

        // Scroll target into view if needed
        const targetRect = targetElement.getBoundingClientRect();
        const isInViewport =
            targetRect.top >= 0 &&
            targetRect.left >= 0 &&
            targetRect.bottom <= window.innerHeight &&
            targetRect.right <= window.innerWidth;

        if (!isInViewport) {
            targetElement.scrollIntoView({
                behavior: 'smooth',
                block: 'center',
            });
        }

        return () => {
            targetElement.classList.remove('tooltip-target');
            window.removeEventListener('keydown', handleEscape);
            window.removeEventListener('resize', updatePosition);
        };
    }, [isOpen, targetSelector, placement, isMounted, onClose]);

    const updatePosition = React.useCallback(() => {
        if (!isOpen || !isMounted) return;

        const targetElement = document.querySelector(targetSelector) as HTMLElement;
        if (!targetElement || !tooltipRef.current) return;

        const newPosition = calculatePosition(targetElement, tooltipRef.current, placement);
        setPosition(newPosition);
    }, [isOpen, targetSelector, placement, isMounted]);

    if (!isMounted || !isOpen) return null;

    return createPortal(
        <div
            ref={tooltipRef}
            className="fixed z-50 w-72 border border-[#1F2937] bg-[#0A0A0F] text-white shadow-lg"
            style={{
                top: `${position.top}px`,
                left: `${position.left}px`,
            }}
        >
            <div className="p-4">
                <div className="mb-2 flex items-center justify-between">
                    <h3 className="font-semibold text-white">{title}</h3>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-[#1F2937] transition-colors"
                        aria-label="Close tooltip"
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
                            <path d="M18 6 6 18" />
                            <path d="m6 6 12 12" />
                        </svg>
                    </button>
                </div>
                <p className="text-sm text-gray-400">{content}</p>
            </div>
            <div className="flex items-center justify-between border-t border-[#1F2937] p-3">
                <div className="text-xs text-gray-500">
                    Step {currentStep + 1} of {totalSteps}
                </div>
                <div className="flex gap-2">
                    {onPrev && (
                        <button
                            onClick={onPrev}
                            className="border border-[#1F2937] px-3 py-1 text-sm hover:bg-[#1F2937] transition-colors"
                        >
                            Back
                        </button>
                    )}
                    <button
                        onClick={onNext}
                        className="bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700 transition-colors"
                    >
                        {currentStep === totalSteps - 1 ? 'Finish 🎉' : 'Next ➔'}
                    </button>
                </div>
            </div>
        </div>,
        document.body,
    );
}

export const TooltipProvider = ({ children }: { children: React.ReactNode }) => {
    return <>{children}</>;
};
