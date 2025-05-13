'use client';

import { useTooltip } from '../context/tooltip-context';
import { Tooltip, TooltipProvider } from './ui/tooltip';

// import { Tooltip, TooltipProvider } from "@/components/ui/tooltip"
// import { useTooltip } from "@/contexts/tooltip-context"

export function TooltipTour() {
    const { steps, currentStepIndex, isOpen, nextStep, prevStep, endTour } = useTooltip();

    const currentStep = steps[currentStepIndex];

    if (!isOpen || !currentStep) return null;

    return (
        <TooltipProvider>
            <Tooltip
                title={currentStep.title}
                content={currentStep.content}
                targetSelector={currentStep.targetSelector}
                isOpen={isOpen}
                onClose={endTour}
                onNext={nextStep}
                onPrev={currentStepIndex > 0 ? prevStep : undefined}
                placement={currentStep.placement || 'bottom'}
                currentStep={currentStepIndex}
                totalSteps={steps.length}
            />
        </TooltipProvider>
    );
}
