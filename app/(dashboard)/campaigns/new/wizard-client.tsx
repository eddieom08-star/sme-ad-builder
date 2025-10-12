'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useWizardStore } from '@/lib/stores/wizard-store';
import { CampaignSetupStep } from '@/components/campaign-wizard/steps/campaign-setup-step';
import { TargetingStep } from '@/components/campaign-wizard/steps/targeting-step';
import { BudgetScheduleStep } from '@/components/campaign-wizard/steps/budget-schedule-step';
import { CreativeStep } from '@/components/campaign-wizard/steps/creative-step';
import { PreviewStep } from '@/components/campaign-wizard/steps/preview-step';

export function CampaignWizardClient() {
  const searchParams = useSearchParams();
  const { currentStep, savedCampaignId, reset, loadCampaign } = useWizardStore();

  // Check for edit mode and load campaign data, or reset for new campaign
  useEffect(() => {
    const editCampaignId = searchParams.get('edit');

    if (editCampaignId) {
      // Load existing campaign for editing
      loadCampaign(editCampaignId);
    } else if (!savedCampaignId) {
      // Only reset if we don't have an in-progress draft
      // If savedCampaignId exists, user is working on a draft - preserve it
      reset();
    }
    // Otherwise, preserve the in-progress wizard session (draft in progress)
  }, [searchParams, reset, loadCampaign, savedCampaignId]);

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
