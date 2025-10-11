import { create } from "zustand";
import { persist } from "zustand/middleware";

export type SocialPlatform = "facebook" | "instagram" | "linkedin" | "tiktok";

export interface PlatformContent {
  platform: SocialPlatform;
  copy: string; // 120-150 chars
  cta: string;
  useEmojis: boolean;
  hashtags: string[];
}

export interface AudienceTargeting {
  locations: string[];
  ageRange: {
    min: number;
    max: number;
  };
  interests: string[];
  gender: "all" | "male" | "female";
}

export interface BudgetAllocation {
  platform: SocialPlatform;
  percentage: number;
  dailyBudget: number;
}

export interface LeadFormField {
  id: string;
  type: "text" | "email" | "phone" | "select";
  label: string;
  required: boolean;
  options?: string[];
}

export interface LeadForm {
  enabled: boolean;
  platforms: SocialPlatform[];
  headline: string;
  description: string;
  fields: LeadFormField[];
  privacyPolicyUrl: string;
  thankYouMessage: string;
}

export interface SocialMediaState {
  // Platform Selection
  selectedPlatforms: SocialPlatform[];

  // Content for each platform
  platformContent: PlatformContent[];

  // Audience Targeting
  audienceTargeting: AudienceTargeting;

  // Budget
  totalDailyBudget: number;
  budgetAllocations: BudgetAllocation[];

  // Lead Form
  leadForm: LeadForm;

  // Current step
  currentStep: number;

  // Actions
  togglePlatform: (platform: SocialPlatform) => void;
  setPlatformContent: (content: PlatformContent) => void;
  updatePlatformContent: (platform: SocialPlatform, updates: Partial<PlatformContent>) => void;
  setAudienceTargeting: (targeting: Partial<AudienceTargeting>) => void;
  setTotalBudget: (budget: number) => void;
  updateBudgetAllocation: (platform: SocialPlatform, percentage: number) => void;
  setLeadForm: (form: Partial<LeadForm>) => void;
  addLeadFormField: (field: LeadFormField) => void;
  removeLeadFormField: (fieldId: string) => void;
  updateLeadFormField: (fieldId: string, updates: Partial<LeadFormField>) => void;
  setCurrentStep: (step: number) => void;
  reset: () => void;
}

const initialState = {
  selectedPlatforms: [] as SocialPlatform[],
  platformContent: [] as PlatformContent[],
  audienceTargeting: {
    locations: [],
    ageRange: { min: 18, max: 65 },
    interests: [],
    gender: "all" as const,
  },
  totalDailyBudget: 10,
  budgetAllocations: [] as BudgetAllocation[],
  leadForm: {
    enabled: false,
    platforms: [] as SocialPlatform[],
    headline: "",
    description: "",
    fields: [] as LeadFormField[],
    privacyPolicyUrl: "",
    thankYouMessage: "",
  },
  currentStep: 1,
};

export const useSocialMediaStore = create<SocialMediaState>()(
  persist(
    (set) => ({
      ...initialState,

      togglePlatform: (platform) =>
        set((state) => {
          const isSelected = state.selectedPlatforms.includes(platform);
          const newPlatforms = isSelected
            ? state.selectedPlatforms.filter((p) => p !== platform)
            : [...state.selectedPlatforms, platform];

          // Update budget allocations
          const equalPercentage = newPlatforms.length > 0 ? 100 / newPlatforms.length : 0;
          const newAllocations = newPlatforms.map((p) => ({
            platform: p,
            percentage: equalPercentage,
            dailyBudget: (state.totalDailyBudget * equalPercentage) / 100,
          }));

          return {
            selectedPlatforms: newPlatforms,
            budgetAllocations: newAllocations,
          };
        }),

      setPlatformContent: (content) =>
        set((state) => {
          const existing = state.platformContent.find(
            (c) => c.platform === content.platform
          );
          if (existing) {
            return {
              platformContent: state.platformContent.map((c) =>
                c.platform === content.platform ? content : c
              ),
            };
          }
          return {
            platformContent: [...state.platformContent, content],
          };
        }),

      updatePlatformContent: (platform, updates) =>
        set((state) => ({
          platformContent: state.platformContent.map((c) =>
            c.platform === platform ? { ...c, ...updates } : c
          ),
        })),

      setAudienceTargeting: (targeting) =>
        set((state) => ({
          audienceTargeting: { ...state.audienceTargeting, ...targeting },
        })),

      setTotalBudget: (budget) =>
        set((state) => {
          const newAllocations = state.budgetAllocations.map((alloc) => ({
            ...alloc,
            dailyBudget: (budget * alloc.percentage) / 100,
          }));
          return {
            totalDailyBudget: budget,
            budgetAllocations: newAllocations,
          };
        }),

      updateBudgetAllocation: (platform, percentage) =>
        set((state) => {
          const newAllocations = state.budgetAllocations.map((alloc) =>
            alloc.platform === platform
              ? {
                  ...alloc,
                  percentage,
                  dailyBudget: (state.totalDailyBudget * percentage) / 100,
                }
              : alloc
          );
          return { budgetAllocations: newAllocations };
        }),

      setLeadForm: (form) =>
        set((state) => ({
          leadForm: { ...state.leadForm, ...form },
        })),

      addLeadFormField: (field) =>
        set((state) => ({
          leadForm: {
            ...state.leadForm,
            fields: [...state.leadForm.fields, field],
          },
        })),

      removeLeadFormField: (fieldId) =>
        set((state) => ({
          leadForm: {
            ...state.leadForm,
            fields: state.leadForm.fields.filter((f) => f.id !== fieldId),
          },
        })),

      updateLeadFormField: (fieldId, updates) =>
        set((state) => ({
          leadForm: {
            ...state.leadForm,
            fields: state.leadForm.fields.map((f) =>
              f.id === fieldId ? { ...f, ...updates } : f
            ),
          },
        })),

      setCurrentStep: (step) => set({ currentStep: step }),

      reset: () => set(initialState),
    }),
    {
      name: "social-media-storage",
    }
  )
);

// Helper constants
export const PLATFORM_CONFIGS = {
  facebook: {
    name: "Facebook",
    color: "#1877F2",
    icon: "📘",
    maxCopy: 150,
    supportsCTA: true,
    supportsLeadForm: true,
    supportedFormats: ["feed", "story", "reel"],
  },
  instagram: {
    name: "Instagram",
    color: "#E4405F",
    icon: "📸",
    maxCopy: 150,
    supportsCTA: true,
    supportsLeadForm: true,
    supportedFormats: ["feed", "story", "reel"],
  },
  linkedin: {
    name: "LinkedIn",
    color: "#0A66C2",
    icon: "💼",
    maxCopy: 150,
    supportsCTA: true,
    supportsLeadForm: false,
    supportedFormats: ["feed"],
  },
  tiktok: {
    name: "TikTok",
    color: "#000000",
    icon: "🎵",
    maxCopy: 120,
    supportsCTA: true,
    supportsLeadForm: false,
    supportedFormats: ["feed"],
  },
} as const;

export const PLATFORM_CTAS = {
  facebook: ["Learn More", "Shop Now", "Sign Up", "Get Quote", "Contact Us", "Book Now"],
  instagram: ["Learn More", "Shop Now", "Sign Up", "Get Quote", "Contact Us", "Book Now"],
  linkedin: ["Learn More", "Apply Now", "Register", "Download", "Contact Us", "Get Started"],
  tiktok: ["Shop Now", "Learn More", "Sign Up", "Download", "Visit Website"],
} as const;

export const EMOJI_SUGGESTIONS = {
  plumber: ["🔧", "💧", "🚰", "⚡", "🏠", "✅", "📞", "⭐"],
  electrician: ["⚡", "💡", "🔌", "🏠", "✅", "📞", "⭐"],
  hvac: ["❄️", "🔥", "🌡️", "💨", "🏠", "✅", "📞", "⭐"],
  contractor: ["🏗️", "🔨", "🏠", "✅", "📞", "⭐"],
  general: ["✨", "🎯", "💯", "🏆", "✅", "📞", "⭐", "💪"],
} as const;
