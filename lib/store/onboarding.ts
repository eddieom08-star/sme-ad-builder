import { create } from "zustand";
import { persist } from "zustand/middleware";

// Business categories
export const BUSINESS_CATEGORIES = [
  "Plumber",
  "Electrician",
  "HVAC",
  "General Contractor",
  "Carpenter",
  "Painter",
  "Landscaper",
  "Roofer",
  "Flooring Specialist",
  "Handyman",
  "Pool Service",
  "Cleaning Service",
  "Other",
] as const;

export type BusinessCategory = (typeof BUSINESS_CATEGORIES)[number];

// Onboarding steps
export const ONBOARDING_STEPS = [
  { id: 1, title: "Business Profile", path: "/onboarding/business-profile" },
  { id: 2, title: "Target Audience", path: "/onboarding/target-audience" },
  { id: 3, title: "Marketing Goals", path: "/onboarding/marketing-goals" },
  { id: 4, title: "Budget & Timeline", path: "/onboarding/budget-timeline" },
  { id: 5, title: "Campaign Preferences", path: "/onboarding/campaign-preferences" },
  { id: 6, title: "Review & Launch", path: "/onboarding/review" },
] as const;

// Business profile data
export interface BusinessProfileData {
  businessName: string;
  category: BusinessCategory | "";
  services: string[];
  description: string;
  location: {
    address: string;
    city: string;
    state: string;
    zipCode: string;
    serviceRadius: number; // in miles
  };
  contact: {
    phone: string;
    email: string;
    website: string;
  };
  hours: {
    monday: { open: string; close: string; closed: boolean };
    tuesday: { open: string; close: string; closed: boolean };
    wednesday: { open: string; close: string; closed: boolean };
    thursday: { open: string; close: string; closed: boolean };
    friday: { open: string; close: string; closed: boolean };
    saturday: { open: string; close: string; closed: boolean };
    sunday: { open: string; close: string; closed: boolean };
  };
}

// Target audience data
export interface TargetAudienceData {
  demographics: {
    ageRanges: string[];
    incomeLevel: string;
    homeownership: string[];
  };
  interests: string[];
  painPoints: string[];
  targetLocations: string[];
}

// Marketing goals data
export interface MarketingGoalsData {
  primaryGoal: string;
  secondaryGoals: string[];
  keyMetrics: string[];
  competitorInfo: string;
}

// Budget & timeline data
export interface BudgetTimelineData {
  monthlyBudget: number;
  campaignDuration: number;
  startDate: string;
  expectedROI: string;
}

// Campaign preferences data
export interface CampaignPreferencesData {
  platforms: string[];
  adFormats: string[];
  creativeStyle: string;
  callToAction: string;
}

// Complete onboarding state
export interface OnboardingState {
  currentStep: number;
  completedSteps: number[];
  businessProfile: Partial<BusinessProfileData>;
  targetAudience: Partial<TargetAudienceData>;
  marketingGoals: Partial<MarketingGoalsData>;
  budgetTimeline: Partial<BudgetTimelineData>;
  campaignPreferences: Partial<CampaignPreferencesData>;
  isCompleted: boolean;
  lastSaved: string | null;

  // Actions
  setCurrentStep: (step: number) => void;
  markStepComplete: (step: number) => void;
  updateBusinessProfile: (data: Partial<BusinessProfileData>) => void;
  updateTargetAudience: (data: Partial<TargetAudienceData>) => void;
  updateMarketingGoals: (data: Partial<MarketingGoalsData>) => void;
  updateBudgetTimeline: (data: Partial<BudgetTimelineData>) => void;
  updateCampaignPreferences: (data: Partial<CampaignPreferencesData>) => void;
  completeOnboarding: () => void;
  resetOnboarding: () => void;
  updateLastSaved: () => void;
}

const defaultBusinessHours = {
  monday: { open: "09:00", close: "17:00", closed: false },
  tuesday: { open: "09:00", close: "17:00", closed: false },
  wednesday: { open: "09:00", close: "17:00", closed: false },
  thursday: { open: "09:00", close: "17:00", closed: false },
  friday: { open: "09:00", close: "17:00", closed: false },
  saturday: { open: "10:00", close: "14:00", closed: false },
  sunday: { open: "", close: "", closed: true },
};

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      currentStep: 1,
      completedSteps: [],
      businessProfile: {
        hours: defaultBusinessHours,
      },
      targetAudience: {},
      marketingGoals: {},
      budgetTimeline: {},
      campaignPreferences: {},
      isCompleted: false,
      lastSaved: null,

      setCurrentStep: (step) => set({ currentStep: step }),

      markStepComplete: (step) =>
        set((state) => ({
          completedSteps: state.completedSteps.includes(step)
            ? state.completedSteps
            : [...state.completedSteps, step],
        })),

      updateBusinessProfile: (data) =>
        set((state) => ({
          businessProfile: { ...state.businessProfile, ...data },
        })),

      updateTargetAudience: (data) =>
        set((state) => ({
          targetAudience: { ...state.targetAudience, ...data },
        })),

      updateMarketingGoals: (data) =>
        set((state) => ({
          marketingGoals: { ...state.marketingGoals, ...data },
        })),

      updateBudgetTimeline: (data) =>
        set((state) => ({
          budgetTimeline: { ...state.budgetTimeline, ...data },
        })),

      updateCampaignPreferences: (data) =>
        set((state) => ({
          campaignPreferences: { ...state.campaignPreferences, ...data },
        })),

      completeOnboarding: () => set({ isCompleted: true }),

      resetOnboarding: () =>
        set({
          currentStep: 1,
          completedSteps: [],
          businessProfile: { hours: defaultBusinessHours },
          targetAudience: {},
          marketingGoals: {},
          budgetTimeline: {},
          campaignPreferences: {},
          isCompleted: false,
          lastSaved: null,
        }),

      updateLastSaved: () =>
        set({ lastSaved: new Date().toISOString() }),
    }),
    {
      name: "onboarding-storage",
    }
  )
);
