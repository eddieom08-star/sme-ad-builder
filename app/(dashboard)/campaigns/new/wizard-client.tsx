'use client';

import { useWizardStore } from '@/lib/stores/wizard-store';
import { CampaignSetupStep } from '@/components/campaign-wizard/steps/campaign-setup-step';
import { TargetingStep } from '@/components/campaign-wizard/steps/targeting-step';
import { BudgetScheduleStep } from '@/components/campaign-wizard/steps/budget-schedule-step';
import { CreativeStep } from '@/components/campaign-wizard/steps/creative-step';
import { PreviewStep } from '@/components/campaign-wizard/steps/preview-step';

export function CampaignWizardClient() {
  const { currentStep } = useWizardStore();

  return (
    <>
      {currentStep === 1 && <CampaignSetupStep />}
      {currentStep === 2 && <TargetingStep />}
      {currentStep === 3 && <BudgetScheduleStep />}
      {currentStep === 4 && <CreativeStep />}
      {currentStep === 5 && <PreviewStep />}
    </>
  );
}
