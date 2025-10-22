'use client';

import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Step {
  id: number;
  name: string;
  description: string;
}

interface WizardProgressProps {
  steps: Step[];
  currentStep: number;
  completedSteps: number[];
  onStepClick?: (step: number) => void;
}

export function WizardProgress({
  steps,
  currentStep,
  completedSteps,
  onStepClick,
}: WizardProgressProps) {
  return (
    <nav aria-label="Progress" className="mb-8">
      <ol role="list" className="space-y-4 md:flex md:space-x-8 md:space-y-0">
        {steps.map((step, index) => {
          const isCompleted = completedSteps.includes(step.id);
          const isCurrent = currentStep === step.id;
          const isAccessible = step.id <= currentStep || isCompleted;
          const isClickable = isAccessible && onStepClick;

          return (
            <li key={step.id} className="md:flex-1">
              <button
                type="button"
                onClick={() => isClickable && onStepClick(step.id)}
                disabled={!isClickable}
                className={cn(
                  'group flex w-full flex-col border-l-4 py-2 pl-4 md:border-l-0 md:border-t-4 md:pb-0 md:pl-0 md:pt-4 transition-all duration-200 rounded-lg',
                  // Current step - highly visible with background and shadow
                  isCurrent && 'border-primary bg-primary/10 md:bg-primary/5 shadow-md md:shadow-sm scale-105 md:scale-100',
                  // Completed step - primary border
                  isCompleted && !isCurrent && 'border-primary',
                  // Inactive step - muted
                  !isCompleted && !isCurrent && 'border-muted',
                  // Hover states
                  isClickable && 'hover:border-primary/70 cursor-pointer hover:bg-primary/5',
                  !isClickable && 'cursor-not-allowed opacity-60'
                )}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      'flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 text-sm font-semibold transition-all duration-200',
                      // Current step - filled with primary color and ring
                      isCurrent && 'border-primary bg-primary text-primary-foreground ring-4 ring-primary/20 shadow-lg',
                      // Completed step
                      isCompleted && !isCurrent && 'border-primary bg-primary text-primary-foreground',
                      // Inactive step
                      !isCompleted && !isCurrent && 'border-muted bg-background text-muted-foreground'
                    )}
                  >
                    {isCompleted && !isCurrent ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      <span>{step.id}</span>
                    )}
                  </div>
                  <div className="flex flex-col items-start text-left">
                    <span
                      className={cn(
                        'text-sm transition-all duration-200',
                        // Current step - larger, bolder, primary color
                        isCurrent && 'text-primary font-bold text-base',
                        // Completed step
                        isCompleted && !isCurrent && 'text-foreground font-semibold',
                        // Inactive step
                        !isCompleted && !isCurrent && 'text-muted-foreground font-semibold'
                      )}
                    >
                      {step.name}
                    </span>
                    <span
                      className={cn(
                        'text-xs transition-all duration-200 hidden sm:block',
                        isCurrent && 'text-primary/80 font-medium',
                        !isCurrent && 'text-muted-foreground'
                      )}
                    >
                      {step.description}
                    </span>
                  </div>
                </div>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
