'use client';

import { useWizardStore } from '@/lib/stores/wizard-store';
import { WizardProgress } from './wizard-progress';
import { WizardNavigation } from './wizard-navigation';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

const WIZARD_STEPS = [
  { id: 1, name: 'Campaign Setup', description: 'Name, objective & platforms' },
  { id: 2, name: 'Audience', description: 'Target demographics & interests' },
  { id: 3, name: 'Budget', description: 'Budget & schedule' },
  { id: 4, name: 'Creative', description: 'Ad copy & media' },
  { id: 5, name: 'Review', description: 'Review & launch' },
];

interface WizardContainerProps {
  children: React.ReactNode;
}

export function WizardContainer({ children }: WizardContainerProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [isLaunching, setIsLaunching] = useState(false);

  const {
    currentStep,
    completedSteps,
    setStep,
    validationErrors,
    campaignName,
    objective,
    platforms,
    targeting,
    budgetType,
    budgetAmount,
    currency,
    startDate,
    endDate,
    bidStrategy,
    ads,
    setSavedCampaignId,
    updateLastSaved,
  } = useWizardStore();

  const handleStepClick = (step: number) => {
    if (step <= currentStep || completedSteps.includes(step)) {
      setStep(step as 1 | 2 | 3 | 4 | 5);
    }
  };

  const handleSaveDraft = async () => {
    setIsSaving(true);
    try {
      // Prepare campaign data
      const campaignData = {
        name: campaignName,
        description: '',
        platforms: platforms.map(p => p as string),
        budget: budgetAmount.toFixed(2),
        budgetType,
        startDate,
        endDate,
        targeting: {
          ageMin: targeting.ageMin,
          ageMax: targeting.ageMax,
          genders: targeting.genders,
          locations: targeting.locations.map(l => l.name),
          interests: targeting.interests,
          behaviors: targeting.behaviors,
        },
        status: 'draft' as const,
      };

      // Call API to save campaign
      const response = await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(campaignData),
      });

      if (!response.ok) {
        throw new Error('Failed to save campaign');
      }

      const { campaignId } = await response.json();
      setSavedCampaignId(campaignId);
      updateLastSaved();

      toast({
        title: 'Draft saved',
        description: `Campaign "${campaignName}" saved as draft`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save draft. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleLaunch = async () => {
    setIsLaunching(true);
    try {
      // First create/update the campaign
      const campaignData = {
        name: campaignName,
        description: '',
        platforms: platforms.map(p => p as string),
        budget: budgetAmount.toFixed(2),
        budgetType,
        startDate,
        endDate,
        targeting: {
          ageMin: targeting.ageMin,
          ageMax: targeting.ageMax,
          genders: targeting.genders,
          locations: targeting.locations.map(l => l.name),
          interests: targeting.interests,
          behaviors: targeting.behaviors,
        },
        status: 'active' as const,
      };

      const campaignResponse = await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(campaignData),
      });

      if (!campaignResponse.ok) {
        throw new Error('Failed to create campaign');
      }

      const { campaignId } = await campaignResponse.json();

      // Create all ads for the campaign
      for (const ad of ads) {
        const adData = {
          campaignId,
          name: `${campaignName} - ${ad.platform} - ${ad.format}`,
          format: ad.format,
          platform: ad.platform,
          headline: ad.headline,
          body: ad.primaryText,
          callToAction: ad.callToAction,
          imageUrl: ad.media[0]?.type === 'image' ? ad.media[0].url : undefined,
          videoUrl: ad.media[0]?.type === 'video' ? ad.media[0].url : undefined,
          targetUrl: ad.destinationUrl,
          status: 'active' as const,
        };

        const adResponse = await fetch('/api/ads', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(adData),
        });

        if (!adResponse.ok) {
          console.error('Failed to create ad:', adData);
        }
      }

      toast({
        title: 'Campaign launched!',
        description: `"${campaignName}" is now live with ${ads.length} ad(s)`,
      });

      // Redirect to campaign details
      router.push(`/campaigns/${campaignId}`);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to launch campaign. Please try again.',
        variant: 'destructive',
      });
      setIsLaunching(false);
    }
  };

  const hasErrors = Object.keys(validationErrors).length > 0;

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-1 space-y-6 p-4 lg:p-8 pb-24">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight lg:text-3xl">
            Create Campaign
          </h1>
          <p className="text-sm text-muted-foreground lg:text-base">
            Build your advertising campaign step by step
          </p>
        </div>

        {/* Progress Indicator */}
        <WizardProgress
          steps={WIZARD_STEPS}
          currentStep={currentStep}
          completedSteps={completedSteps}
          onStepClick={handleStepClick}
        />

        {/* Validation Errors */}
        {hasErrors && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="font-semibold mb-2">Please fix the following errors:</div>
              <ul className="list-disc list-inside space-y-1">
                {Object.entries(validationErrors).map(([field, errors]) => (
                  <li key={field} className="text-sm">
                    {errors.join(', ')}
                  </li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {/* Step Content */}
        <div className="bg-card rounded-lg border shadow-sm">
          {children}
        </div>
      </div>

      {/* Navigation */}
      <WizardNavigation
        onSaveDraft={currentStep < 5 ? handleSaveDraft : undefined}
        onLaunch={currentStep === 5 ? handleLaunch : undefined}
        isSaving={isSaving}
        isLaunching={isLaunching}
      />
    </div>
  );
}
