'use client';

import { useEffect, useRef } from 'react';
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
  const hasInitialized = useRef(false);

  // Check for edit mode and load campaign data, or reset for new campaign
  useEffect(() => {
    // Only run once on mount
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    const editCampaignId = searchParams.get('edit');

    if (editCampaignId) {
      // Load existing campaign for editing
      loadCampaign(editCampaignId);
    } else if (!savedCampaignId) {
      // Reset for new campaign creation ONLY if no draft in progress
      reset();
    }
    // If savedCampaignId exists and no edit param, preserve in-progress draft
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
