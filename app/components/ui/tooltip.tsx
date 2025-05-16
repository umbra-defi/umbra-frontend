'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';

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
    highlightClass?: string;
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
    highlightClass,
}: TooltipProps) {
    const [position, setPosition] = React.useState({ top: 0, left: 0 });
    const tooltipRef = React.useRef<HTMLDivElement>(null);
    const [isMounted, setIsMounted] = React.useState(false);
    const [targetElement, setTargetElement] = React.useState<HTMLElement | null>(null);
    const [isFirstRender, setIsFirstRender] = React.useState(true);
    const [tooltipContent, setTooltipContent] = React.useState({ title, content });

    // Use refs to track previous position for animations
    const prevPositionRef = React.useRef({ top: 0, left: 0 });

    React.useEffect(() => {
        setIsMounted(true);
        return () => setIsMounted(false);
    }, []);

    // Update content with a slight delay to allow position animation to start first
    React.useEffect(() => {
        if (isFirstRender) {
            setTooltipContent({ title, content });
            setIsFirstRender(false);
            return;
        }

        // Small delay before updating content to allow position animation to start
        const timer = setTimeout(() => {
            setTooltipContent({ title, content });
        }, 150); // Half of the position transition time

        return () => clearTimeout(timer);
    }, [title, content, isFirstRender]);

    // Clean up any existing tooltip targets
    React.useEffect(() => {
        // Remove tooltip-target class from all elements
        const cleanup = () => {
            document.querySelectorAll('.tooltip-target').forEach((el) => {
                el.classList.remove('tooltip-target');
                // Also remove any custom highlight classes
                el.classList.remove(
                    'tab-highlight',
                    'input-highlight',
                    'button-highlight',
                    'div-highlight',
                );
            });
        };

        // Clean up when component unmounts or when targetSelector changes
        return cleanup;
    }, [targetSelector]);

    React.useEffect(() => {
        if (!isOpen || !isMounted) return;

        // Store the current position as the previous position for animation
        prevPositionRef.current = position;

        // Clean up any existing tooltip targets first
        document.querySelectorAll('.tooltip-target').forEach((el) => {
            el.classList.remove('tooltip-target');
            // Also remove any custom highlight classes
            el.classList.remove(
                'tab-highlight',
                'input-highlight',
                'button-highlight',
                'div-highlight',
            );
        });

        // Find the new target element
        const newTargetElement = document.querySelector(targetSelector) as HTMLElement;
        if (!newTargetElement || !tooltipRef.current) return;

        // Set the target element state
        setTargetElement(newTargetElement);

        // Add highlight class to target element
        newTargetElement.classList.add('tooltip-target');

        // Add custom highlight class if provided
        if (highlightClass) {
            newTargetElement.classList.add(highlightClass);
        }

        // Calculate position
        const newPosition = calculatePosition(newTargetElement, tooltipRef.current, placement);

        // Update position state (this will trigger the animation)
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
        const targetRect = newTargetElement.getBoundingClientRect();
        const isInViewport =
            targetRect.top >= 0 &&
            targetRect.left >= 0 &&
            targetRect.bottom <= window.innerHeight &&
            targetRect.right <= window.innerWidth;

        if (!isInViewport) {
            newTargetElement.scrollIntoView({
                behavior: 'smooth',
                block: 'center',
            });
        }

        return () => {
            // Clean up event listeners
            window.removeEventListener('keydown', handleEscape);
            window.removeEventListener('resize', updatePosition);

            // Remove highlight classes when tooltip is closed or moved
            if (newTargetElement) {
                newTargetElement.classList.remove('tooltip-target');
                if (highlightClass) {
                    newTargetElement.classList.remove(highlightClass);
                }
            }
        };
    }, [isOpen, targetSelector, placement, isMounted, onClose, highlightClass]);

    const updatePosition = React.useCallback(() => {
        if (!isOpen || !isMounted || !targetElement || !tooltipRef.current) return;

        const newPosition = calculatePosition(targetElement, tooltipRef.current, placement);
        setPosition(newPosition);
    }, [isOpen, targetElement, placement, isMounted]);

    if (!isMounted || !isOpen) return null;

    return createPortal(
        <motion.div
            ref={tooltipRef}
            className="fixed z-50 w-72 border border-[#1F2937] bg-[#0A0A0F] text-white shadow-lg"
            initial={isFirstRender ? { opacity: 0, scale: 0.9 } : false}
            animate={{
                opacity: 1,
                scale: 1,
                top: position.top,
                left: position.left,
            }}
            transition={{
                opacity: { duration: 0.2 },
                scale: { duration: 0.2 },
                top: { type: 'spring', stiffness: 300, damping: 30 },
                left: { type: 'spring', stiffness: 300, damping: 30 },
            }}
        >
            <div className="p-4">
                <div className="mb-2 flex items-center justify-between">
                    <motion.h3
                        className="font-semibold text-white"
                        key={`title-${currentStep}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.2, delay: 0.15 }}
                    >
                        {tooltipContent.title}
                    </motion.h3>
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
                <motion.p
                    className="text-sm text-gray-400"
                    key={`content-${currentStep}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2, delay: 0.2 }}
                >
                    {tooltipContent.content}
                </motion.p>
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
                        {currentStep === totalSteps - 1 ? 'Finish' : 'Next'}
                    </button>
                </div>
            </div>
        </motion.div>,
        document.body,
    );
}

export const TooltipProvider = ({ children }: { children: React.ReactNode }) => {
    return <>{children}</>;
};
