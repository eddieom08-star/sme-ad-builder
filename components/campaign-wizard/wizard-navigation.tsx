'use client';

import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Save, Rocket } from 'lucide-react';
import { useWizardStore } from '@/lib/stores/wizard-store';
import { useState } from 'react';

interface WizardNavigationProps {
  onSaveDraft?: () => Promise<void>;
  onLaunch?: () => Promise<void>;
  isSaving?: boolean;
  isLaunching?: boolean;
}

export function WizardNavigation({
  onSaveDraft,
  onLaunch,
  isSaving = false,
  isLaunching = false,
}: WizardNavigationProps) {
  const { currentStep, goBack, goNext, validateStep } = useWizardStore();
  const [isValidating, setIsValidating] = useState(false);

  const isFirstStep = currentStep === 1;
  const isLastStep = currentStep === 5;

  const handleNext = async () => {
    setIsValidating(true);
    const isValid = validateStep(currentStep);
    setIsValidating(false);

    if (isValid) {
      goNext();
    }
  };

  const handleBack = () => {
    goBack();
  };

  return (
    <div className="flex items-center justify-between gap-4 border-t bg-background p-4 sticky bottom-0 z-10">
      <div className="flex gap-2">
        {!isFirstStep && (
          <Button
            type="button"
            variant="outline"
            onClick={handleBack}
            disabled={isSaving || isLaunching || isValidating}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        )}
      </div>

      <div className="flex gap-2">
        {onSaveDraft && (
          <Button
            type="button"
            variant="outline"
            onClick={onSaveDraft}
            disabled={isSaving || isLaunching || isValidating}
          >
            {isSaving ? (
              <>
                <Save className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Draft
              </>
            )}
          </Button>
        )}

        {!isLastStep ? (
          <Button
            type="button"
            onClick={handleNext}
            disabled={isSaving || isLaunching || isValidating}
          >
            {isValidating ? 'Validating...' : 'Next'}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        ) : (
          onLaunch && (
            <Button
              type="button"
              onClick={onLaunch}
              disabled={isSaving || isLaunching || isValidating}
              className="bg-green-600 hover:bg-green-700"
            >
              {isLaunching ? (
                <>
                  <Rocket className="mr-2 h-4 w-4 animate-bounce" />
                  Launching...
                </>
              ) : (
                <>
                  <Rocket className="mr-2 h-4 w-4" />
                  Launch Campaign
                </>
              )}
            </Button>
          )
        )}
      </div>
    </div>
  );
}
