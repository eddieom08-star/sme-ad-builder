'use client';

import { useWizardStore } from '@/lib/stores/wizard-store';
import { WizardProgress } from './wizard-progress';
import { WizardNavigation } from './wizard-navigation';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';
import { useState } from 'react';
import confetti from 'canvas-confetti';

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
    bidCap,
    ads,
    savedCampaignId,
    setSavedCampaignId,
    updateLastSaved,
    reset,
  } = useWizardStore();

  const handleStepClick = (step: number) => {
    if (step <= currentStep || completedSteps.includes(step)) {
      setStep(step as 1 | 2 | 3 | 4 | 5);
    }
  };

  // Confetti celebration for successful campaign launch
  const celebrateSuccess = () => {
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min;
    }

    const interval: NodeJS.Timeout = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);

      // Fire confetti from random positions
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
      });
    }, 250);
  };

  const handleSaveDraft = async () => {
    setIsSaving(true);
    try {
      // Use existing savedCampaignId if available, otherwise get new one from API
      let campaignId = savedCampaignId;

      if (!campaignId) {
        // Only call API if we don't have a campaignId yet
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

        const response = await fetch('/api/campaigns', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(campaignData),
        });

        if (!response.ok) {
          throw new Error('Failed to save campaign');
        }

        const result = await response.json();
        campaignId = result.campaignId;
      }

      // Ensure we have a campaignId at this point
      if (!campaignId) {
        throw new Error('No campaign ID available');
      }

      // Save draft to localStorage for display and editing
      // IMPORTANT: Save currentStep and completedSteps so user can resume where they left off
      const fullCampaignData = {
        id: campaignId.toString(),
        name: campaignName,
        description: '',
        status: 'draft' as const,
        objective,
        budget: budgetAmount.toFixed(2),
        budgetType,
        currency,
        platforms: platforms.map(p => p as string),
        startDate,
        endDate,
        bidStrategy,
        bidCap,
        createdAt: new Date().toISOString(),
        currentStep, // Save where user was when they saved
        completedSteps, // Save progress through wizard
        targeting: {
          ageMin: targeting.ageMin,
          ageMax: targeting.ageMax,
          genders: targeting.genders,
          locations: targeting.locations, // Save full location objects
          interests: targeting.interests,
          behaviors: targeting.behaviors,
          languages: targeting.languages,
        },
      };

      // Get existing campaigns and upsert draft (prevent duplicates)
      const existingCampaigns = JSON.parse(localStorage.getItem('campaigns') || '[]');
      const existingIndex = existingCampaigns.findIndex((c: any) => c.id === campaignId.toString());

      if (existingIndex !== -1) {
        // Update existing draft
        existingCampaigns[existingIndex] = fullCampaignData;
      } else {
        // Add new draft
        existingCampaigns.push(fullCampaignData);
      }

      localStorage.setItem('campaigns', JSON.stringify(existingCampaigns));

      // Show success message
      toast({
        title: 'Draft saved successfully!',
        description: `"${campaignName}" has been saved as a draft. You can continue editing anytime.`,
      });

      // CRITICAL FIX: Reset wizard state BEFORE redirect
      // This ensures next visit to wizard starts fresh, preventing:
      // 1. Duplicate drafts (no stale savedCampaignId)
      // 2. Wrong step on return (currentStep reset to 1)
      // 3. Stale wizard data
      reset();

      // FORCE CLEAR: Remove Zustand persist storage to prevent async race condition
      // where persist middleware might save old state after reset()
      try {
        localStorage.removeItem('campaign-wizard-storage');
      } catch (error) {
        console.error('Failed to clear wizard storage:', error);
      }

      // Redirect to campaigns list after a short delay for toast visibility
      setTimeout(() => {
        router.push('/campaigns');
      }, 800);
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
      const isEditMode = !!savedCampaignId;

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

      const { campaignId: newCampaignId } = await campaignResponse.json();
      const campaignId = isEditMode ? savedCampaignId : newCampaignId;

      // Save campaign to localStorage for display
      const fullCampaignData = {
        id: campaignId.toString(),
        name: campaignName,
        description: '',
        status: 'active',
        budget: budgetAmount.toFixed(2),
        budgetType,
        platforms: platforms.map(p => p as string),
        startDate,
        endDate,
        createdAt: new Date().toISOString(),
        targeting: {
          ageMin: targeting.ageMin,
          ageMax: targeting.ageMax,
          genders: targeting.genders,
          locations: targeting.locations.map(l => l.name),
          interests: targeting.interests,
          behaviors: targeting.behaviors,
        },
      };

      // Get existing campaigns
      const existingCampaigns = JSON.parse(localStorage.getItem('campaigns') || '[]');

      if (isEditMode) {
        // Update existing campaign
        const campaignIndex = existingCampaigns.findIndex((c: any) => c.id === campaignId.toString());
        if (campaignIndex !== -1) {
          existingCampaigns[campaignIndex] = {
            ...existingCampaigns[campaignIndex],
            ...fullCampaignData,
          };
        }
      } else {
        // Add new campaign
        existingCampaigns.push(fullCampaignData);
      }

      localStorage.setItem('campaigns', JSON.stringify(existingCampaigns));

      // Handle ads for the campaign
      let existingAds = JSON.parse(localStorage.getItem('ads') || '[]');

      if (isEditMode) {
        // Remove old ads for this campaign
        existingAds = existingAds.filter((ad: any) => ad.campaignId !== campaignId.toString());
      }

      // Create all ads for the campaign and save to localStorage
      const createdAds = [];
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

        if (adResponse.ok) {
          const { adId } = await adResponse.json();
          createdAds.push({
            id: ad.id || adId.toString(),
            campaignId: campaignId.toString(),
            name: adData.name,
            format: adData.format,
            platform: adData.platform,
            headline: adData.headline,
            body: adData.body,
            callToAction: adData.callToAction,
            imageUrl: adData.imageUrl,
            videoUrl: adData.videoUrl,
            targetUrl: adData.targetUrl,
            status: adData.status,
            createdAt: new Date().toISOString(),
            impressions: 0,
            clicks: 0,
            spend: '0.00',
          });
        } else {
          console.error('Failed to create ad:', adData);
        }
      }

      // Save ads to localStorage
      existingAds.push(...createdAds);
      localStorage.setItem('ads', JSON.stringify(existingAds));

      // 🎉 CELEBRATE SUCCESS! Trigger confetti animation
      celebrateSuccess();

      toast({
        title: isEditMode ? 'Campaign updated!' : 'Campaign launched!',
        description: isEditMode
          ? `"${campaignName}" has been updated with ${ads.length} ad(s)`
          : `"${campaignName}" is now live with ${ads.length} ad(s)`,
      });

      // Reset wizard state to allow creating new campaigns
      reset();

      // Redirect to campaign details after a short delay to enjoy the confetti
      setTimeout(() => {
        router.push(`/campaigns/${campaignId}`);
      }, 2000);
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
        isEditMode={!!savedCampaignId}
      />
    </div>
  );
}
