import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Types
export type CampaignObjective = 'awareness' | 'traffic' | 'leads' | 'conversions';
export type Platform = 'facebook' | 'instagram' | 'google' | 'linkedin' | 'tiktok';
export type BudgetType = 'daily' | 'lifetime';
export type BidStrategy = 'lowest_cost' | 'cost_cap' | 'bid_cap';
export type AdFormat = 'image' | 'video' | 'carousel' | 'story';
export type Gender = 'male' | 'female' | 'all';

export interface Location {
  type: 'country' | 'city' | 'region';
  name: string;
  radius?: number; // in miles, for city targeting
}

export interface Targeting {
  ageMin: number;
  ageMax: number;
  genders: Gender[];
  locations: Location[];
  interests: string[];
  behaviors: string[];
  languages?: string[];
}

export interface AdCreative {
  id?: string; // temporary ID for multiple ads
  format: AdFormat;
  platform: Platform;
  headline: string;
  primaryText: string;
  description?: string;
  callToAction: string;
  media: {
    url: string;
    type: 'image' | 'video';
    width?: number;
    height?: number;
    thumbnail?: string; // for videos
  }[];
  destinationUrl: string;
}

export interface WizardState {
  // Navigation
  currentStep: 1 | 2 | 3 | 4 | 5;
  completedSteps: number[];

  // Step 1: Campaign Setup
  campaignName: string;
  campaignDescription: string;
  objective: CampaignObjective;
  platforms: Platform[];

  // Step 2: Targeting
  targeting: Targeting;

  // Step 3: Budget & Schedule
  budgetType: BudgetType;
  budgetAmount: number;
  currency: 'USD' | 'GBP' | 'EUR' | 'CAD';
  startDate: string; // ISO date string
  endDate: string; // ISO date string
  bidStrategy: BidStrategy;
  bidCap?: number; // for cost_cap and bid_cap strategies

  // Step 4: Creative
  ads: AdCreative[];

  // Step 5: Review
  isDraft: boolean;
  validationErrors: Record<string, string[]>;

  // Metadata
  savedCampaignId?: number; // if saving draft
  lastSaved?: string; // ISO timestamp

  // Actions
  setStep: (step: 1 | 2 | 3 | 4 | 5) => void;
  goNext: () => void;
  goBack: () => void;
  markStepComplete: (step: number) => void;

  // Update data
  updateCampaignSetup: (data: {
    campaignName?: string;
    campaignDescription?: string;
    objective?: CampaignObjective;
    platforms?: Platform[];
  }) => void;

  updateTargeting: (targeting: Partial<Targeting>) => void;

  updateBudget: (data: {
    budgetType?: BudgetType;
    budgetAmount?: number;
    currency?: 'USD' | 'GBP' | 'EUR' | 'CAD';
    startDate?: string;
    endDate?: string;
    bidStrategy?: BidStrategy;
    bidCap?: number;
  }) => void;

  addAd: (ad: AdCreative) => void;
  updateAd: (id: string, ad: Partial<AdCreative>) => void;
  removeAd: (id: string) => void;

  setValidationErrors: (errors: Record<string, string[]>) => void;
  clearValidationErrors: () => void;

  // Validation
  validateStep: (step: number) => boolean;

  // Persistence
  setSavedCampaignId: (id: number) => void;
  updateLastSaved: () => void;

  // Reset
  reset: () => void;

  // Load existing campaign for editing
  loadCampaign: (campaignId: string) => void;
}

const initialState = {
  currentStep: 1 as const,
  completedSteps: [],

  campaignName: '',
  campaignDescription: '',
  objective: 'conversions' as CampaignObjective,
  platforms: [] as Platform[],

  targeting: {
    ageMin: 18,
    ageMax: 65,
    genders: ['all'] as Gender[],
    locations: [],
    interests: [],
    behaviors: [],
    languages: ['English'],
  },

  budgetType: 'daily' as BudgetType,
  budgetAmount: 50,
  currency: 'USD' as const,
  startDate: new Date().toISOString().split('T')[0],
  endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  bidStrategy: 'lowest_cost' as BidStrategy,
  bidCap: undefined,

  ads: [] as AdCreative[],

  isDraft: false,
  validationErrors: {},
};

export const useWizardStore = create<WizardState>()(
  persist(
    (set, get) => ({
      ...initialState,

      // Navigation
      setStep: (step) => {
        set({ currentStep: step });
      },

      goNext: () => {
        const { currentStep, completedSteps } = get();
        if (currentStep < 5) {
          const nextStep = (currentStep + 1) as 1 | 2 | 3 | 4 | 5;
          set({
            currentStep: nextStep,
            completedSteps: [...new Set([...completedSteps, currentStep])],
          });
        }
      },

      goBack: () => {
        const { currentStep } = get();
        if (currentStep > 1) {
          set({ currentStep: (currentStep - 1) as 1 | 2 | 3 | 4 | 5 });
        }
      },

      markStepComplete: (step) => {
        const { completedSteps } = get();
        if (!completedSteps.includes(step)) {
          set({ completedSteps: [...completedSteps, step] });
        }
      },

      // Update data
      updateCampaignSetup: (data) => {
        set((state) => ({
          ...state,
          ...data,
        }));
      },

      updateTargeting: (targeting) => {
        set((state) => ({
          targeting: {
            ...state.targeting,
            ...targeting,
          },
        }));
      },

      updateBudget: (data) => {
        set((state) => ({
          ...state,
          ...data,
        }));
      },

      addAd: (ad) => {
        set((state) => ({
          ads: [...state.ads, { ...ad, id: crypto.randomUUID() }],
        }));
      },

      updateAd: (id, updates) => {
        set((state) => ({
          ads: state.ads.map((ad) =>
            ad.id === id ? { ...ad, ...updates } : ad
          ),
        }));
      },

      removeAd: (id) => {
        set((state) => ({
          ads: state.ads.filter((ad) => ad.id !== id),
        }));
      },

      setValidationErrors: (errors) => {
        set({ validationErrors: errors });
      },

      clearValidationErrors: () => {
        set({ validationErrors: {} });
      },

      // Validation
      validateStep: (step) => {
        const state = get();
        const errors: Record<string, string[]> = {};

        switch (step) {
          case 1: {
            // Campaign Setup validation
            if (!state.campaignName.trim()) {
              errors.campaignName = ['Campaign name is required'];
            } else if (state.campaignName.length < 3) {
              errors.campaignName = ['Campaign name must be at least 3 characters'];
            } else if (state.campaignName.length > 100) {
              errors.campaignName = ['Campaign name must be less than 100 characters'];
            } else {
              // Check for duplicate campaign names (unless editing existing campaign)
              try {
                const stored = localStorage.getItem('campaigns');
                if (stored) {
                  const campaigns = JSON.parse(stored);
                  const duplicate = campaigns.find((c: any) =>
                    c.name.toLowerCase() === state.campaignName.toLowerCase() &&
                    c.id !== state.savedCampaignId?.toString()
                  );
                  if (duplicate) {
                    errors.campaignName = ['A campaign with this name already exists. Please choose a unique name.'];
                  }
                }
              } catch (error) {
                console.error('Error checking campaign name uniqueness:', error);
              }
            }

            if (!state.objective) {
              errors.objective = ['Campaign objective is required'];
            }

            if (state.platforms.length === 0) {
              errors.platforms = ['Select at least one platform'];
            }
            break;
          }

          case 2: {
            // Targeting validation
            if (state.targeting.ageMin < 13) {
              errors.ageMin = ['Minimum age must be at least 13'];
            }
            if (state.targeting.ageMax > 65) {
              errors.ageMax = ['Maximum age cannot exceed 65'];
            }
            if (state.targeting.ageMin >= state.targeting.ageMax) {
              errors.ageRange = ['Minimum age must be less than maximum age'];
            }

            if (state.targeting.locations.length === 0) {
              errors.locations = ['Add at least one location'];
            }

            // Warning if no interests (not blocking)
            if (state.targeting.interests.length === 0) {
              errors.interests = ['Consider adding interests for better targeting (optional)'];
            }
            break;
          }

          case 3: {
            // Budget validation
            const minBudget = state.budgetType === 'daily' ? 5 : 35;
            if (state.budgetAmount < minBudget) {
              errors.budgetAmount = [
                `Minimum ${state.budgetType} budget is $${minBudget}`
              ];
            }

            if (state.budgetAmount > 10000) {
              errors.budgetAmount = [
                'Budget exceeds $10,000. Please contact support for higher limits.'
              ];
            }

            const start = new Date(state.startDate);
            const end = new Date(state.endDate);
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            if (start < today) {
              errors.startDate = ['Start date cannot be in the past'];
            }

            if (end <= start) {
              errors.endDate = ['End date must be after start date'];
            }

            const duration = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
            if (duration < 1) {
              errors.duration = ['Campaign must run for at least 1 day'];
            }

            if (state.bidStrategy !== 'lowest_cost' && !state.bidCap) {
              errors.bidCap = ['Bid cap is required for this bid strategy'];
            }
            break;
          }

          case 4: {
            // Creative validation
            if (state.ads.length === 0) {
              errors.ads = ['Create at least one ad'];
            }

            // Check that all selected platforms have at least one ad
            const platformsWithAds = new Set(state.ads.map(ad => ad.platform));
            const platformsMissingAds = state.platforms.filter(
              platform => !platformsWithAds.has(platform)
            );

            if (platformsMissingAds.length > 0) {
              errors.platforms_missing_ads = [
                `Please create at least one ad for: ${platformsMissingAds.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(', ')}`
              ];
            }

            state.ads.forEach((ad, index) => {
              if (!ad.headline.trim()) {
                errors[`ad_${index}_headline`] = ['Headline is required'];
              }

              if (!ad.primaryText.trim()) {
                errors[`ad_${index}_primaryText`] = ['Primary text is required'];
              }

              if (!ad.callToAction) {
                errors[`ad_${index}_cta`] = ['Call-to-action is required'];
              }

              if (ad.media.length === 0) {
                errors[`ad_${index}_media`] = ['Upload at least one image or video'];
              }

              if (!ad.destinationUrl || !isValidUrl(ad.destinationUrl)) {
                errors[`ad_${index}_url`] = ['Valid destination URL is required'];
              }

              // Platform-specific validation
              const limits = getPlatformLimits(ad.platform);
              if (ad.headline.length > limits.headline) {
                errors[`ad_${index}_headline`] = [
                  `Headline must be ${limits.headline} characters or less`
                ];
              }
            });
            break;
          }

          case 5: {
            // Final validation - collect errors from all previous steps without recursive calls
            // This prevents duplicate error messages

            // Validate step 1 inline
            if (!state.campaignName.trim()) {
              errors.campaignName = ['Campaign name is required'];
            }
            if (!state.objective) {
              errors.objective = ['Campaign objective is required'];
            }
            if (state.platforms.length === 0) {
              errors.platforms = ['Select at least one platform'];
            }

            // Validate step 2 inline
            if (state.targeting.locations.length === 0) {
              errors.locations = ['Add at least one location'];
            }

            // Validate step 3 inline
            const minBudget = state.budgetType === 'daily' ? 5 : 35;
            if (state.budgetAmount < minBudget) {
              errors.budgetAmount = [`Minimum ${state.budgetType} budget is $${minBudget}`];
            }

            // Validate step 4 inline
            if (state.ads.length === 0) {
              errors.ads = ['Create at least one ad'];
            } else {
              // Check that all selected platforms have at least one ad
              const platformsWithAds = new Set(state.ads.map(ad => ad.platform));
              const platformsMissingAds = state.platforms.filter(
                platform => !platformsWithAds.has(platform)
              );

              if (platformsMissingAds.length > 0) {
                errors.platforms_missing_ads = [
                  `Please create at least one ad for: ${platformsMissingAds.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(', ')}`
                ];
              }

              state.ads.forEach((ad, index) => {
                if (!ad.headline.trim()) {
                  errors[`ad_${index}_headline`] = ['Headline is required'];
                }
                if (!ad.primaryText.trim()) {
                  errors[`ad_${index}_primaryText`] = ['Primary text is required'];
                }
                if (!ad.callToAction) {
                  errors[`ad_${index}_cta`] = ['Call-to-action is required'];
                }
                if (ad.media.length === 0) {
                  errors[`ad_${index}_media`] = ['Upload at least one image or video'];
                }
                if (!ad.destinationUrl || !isValidUrl(ad.destinationUrl)) {
                  errors[`ad_${index}_url`] = ['Valid destination URL is required'];
                }
              });
            }

            break;
          }
        }

        const hasErrors = Object.keys(errors).length > 0;
        set({ validationErrors: errors });
        return !hasErrors;
      },

      // Persistence
      setSavedCampaignId: (id) => {
        set({ savedCampaignId: id });
      },

      updateLastSaved: () => {
        set({ lastSaved: new Date().toISOString() });
      },

      // Reset
      reset: () => {
        set(initialState);
      },

      // Load existing campaign for editing
      loadCampaign: (campaignId) => {
        try {
          // 1. Read campaigns from localStorage
          const stored = localStorage.getItem('campaigns');
          if (!stored) return;

          const campaigns = JSON.parse(stored);
          const campaign = campaigns.find((c: any) => c.id === campaignId);
          if (!campaign) return;

          // 2. Load ads associated with this campaign
          const storedAds = localStorage.getItem('ads');
          let campaignAds: AdCreative[] = [];
          if (storedAds) {
            const allAds = JSON.parse(storedAds);
            const filteredAds = allAds.filter((ad: any) => ad.campaignId === campaignId);

            // Convert stored ads to AdCreative format
            campaignAds = filteredAds.map((ad: any) => ({
              id: ad.id,
              format: ad.format as AdFormat,
              platform: ad.platform as Platform,
              headline: ad.headline || '',
              primaryText: ad.body || '',
              description: '',
              callToAction: ad.callToAction || '',
              media: ad.imageUrl ? [{
                url: ad.imageUrl,
                type: 'image' as const,
              }] : ad.videoUrl ? [{
                url: ad.videoUrl,
                type: 'video' as const,
              }] : [],
              destinationUrl: ad.targetUrl || '',
            }));
          }

          // 3. Determine which step to return user to
          // Priority: saved currentStep > next incomplete step > first step
          let resumeStep: 1 | 2 | 3 | 4 | 5 = 1;
          let completedSteps: number[] = [];

          if (campaignAds.length > 0) {
            // All steps completed, go to review
            completedSteps = [1, 2, 3, 4];
            resumeStep = 5;
          } else if (campaign.budget && campaign.startDate && campaign.endDate) {
            // Steps 1-3 completed, go to creative
            completedSteps = [1, 2, 3];
            resumeStep = 4;
          } else if (campaign.targeting?.locations?.length > 0) {
            // Steps 1-2 completed, go to budget
            completedSteps = [1, 2];
            resumeStep = 3;
          } else if (campaign.platforms?.length > 0) {
            // Step 1 completed, go to targeting
            completedSteps = [1];
            resumeStep = 2;
          }

          // If campaign has a saved currentStep, use that instead
          if (campaign.currentStep && campaign.currentStep >= 1 && campaign.currentStep <= 5) {
            resumeStep = campaign.currentStep as 1 | 2 | 3 | 4 | 5;
          }

          // 4. Populate wizard store with campaign data
          set({
            campaignName: campaign.name || '',
            campaignDescription: campaign.description || '',
            objective: campaign.objective || 'conversions',
            platforms: campaign.platforms || [],
            budgetType: campaign.budgetType || 'daily',
            budgetAmount: parseFloat(campaign.budget || '50'),
            currency: campaign.currency || 'USD',
            startDate: campaign.startDate || new Date().toISOString().split('T')[0],
            endDate: campaign.endDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            bidStrategy: campaign.bidStrategy || 'lowest_cost',
            bidCap: campaign.bidCap,
            targeting: {
              ageMin: campaign.targeting?.ageMin || 18,
              ageMax: campaign.targeting?.ageMax || 65,
              genders: campaign.targeting?.genders || ['all'],
              locations: Array.isArray(campaign.targeting?.locations)
                ? campaign.targeting.locations.map((loc: any) =>
                    typeof loc === 'string'
                      ? { type: 'country' as const, name: loc }
                      : loc
                  )
                : [],
              interests: campaign.targeting?.interests || [],
              behaviors: campaign.targeting?.behaviors || [],
              languages: campaign.targeting?.languages || ['English'],
            },
            ads: campaignAds,
            savedCampaignId: parseInt(campaign.id),
            completedSteps,
            currentStep: resumeStep,
          });
        } catch (error) {
          console.error('Error loading campaign:', error);
        }
      },
    }),
    {
      name: 'campaign-wizard-storage',
      partialize: (state) => ({
        // Only persist certain fields
        currentStep: state.currentStep,
        completedSteps: state.completedSteps,
        campaignName: state.campaignName,
        campaignDescription: state.campaignDescription,
        objective: state.objective,
        platforms: state.platforms,
        targeting: state.targeting,
        budgetType: state.budgetType,
        budgetAmount: state.budgetAmount,
        currency: state.currency,
        startDate: state.startDate,
        endDate: state.endDate,
        bidStrategy: state.bidStrategy,
        bidCap: state.bidCap,
        ads: state.ads,
        savedCampaignId: state.savedCampaignId,
        lastSaved: state.lastSaved,
      }),
    }
  )
);

// Helper functions
function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

function getPlatformLimits(platform: Platform) {
  const limits = {
    facebook: { headline: 40, primaryText: 125, description: 30 },
    instagram: { headline: 40, primaryText: 2200, description: 30 },
    google: { headline: 30, primaryText: 90, description: 90 },
    linkedin: { headline: 70, primaryText: 150, description: 70 },
    tiktok: { headline: 100, primaryText: 1000, description: 80 },
  };
  return limits[platform] || limits.facebook;
}
