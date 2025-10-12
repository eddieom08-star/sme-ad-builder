'use client';

import { useWizardStore } from '@/lib/stores/wizard-store';
import { CampaignSetupStep } from '@/components/campaign-wizard/steps/campaign-setup-step';
import { Card, CardContent } from '@/components/ui/card';
import { Construction } from 'lucide-react';

export function CampaignWizardClient() {
  const { currentStep } = useWizardStore();

  return (
    <>
      {currentStep === 1 && <CampaignSetupStep />}

      {currentStep === 2 && (
        <div className="p-12 text-center">
          <Construction className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Audience Targeting</h3>
          <p className="text-sm text-muted-foreground">
            Step 2 coming soon...
          </p>
        </div>
      )}

      {currentStep === 3 && (
        <div className="p-12 text-center">
          <Construction className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Budget & Schedule</h3>
          <p className="text-sm text-muted-foreground">
            Step 3 coming soon...
          </p>
        </div>
      )}

      {currentStep === 4 && (
        <div className="p-12 text-center">
          <Construction className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Ad Creative</h3>
          <p className="text-sm text-muted-foreground">
            Step 4 coming soon...
          </p>
        </div>
      )}

      {currentStep === 5 && (
        <div className="p-12 text-center">
          <Construction className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Review & Launch</h3>
          <p className="text-sm text-muted-foreground">
            Step 5 coming soon...
          </p>
        </div>
      )}
    </>
  );
}
