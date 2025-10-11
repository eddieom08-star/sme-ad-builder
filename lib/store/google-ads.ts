import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface AdVersion {
  id: string;
  headline: string;
  description: string;
  imageUrl?: string;
  selected: boolean;
}

export interface Headline {
  id: string;
  text: string;
}

export interface Description {
  id: string;
  text: string;
}

export interface Keyword {
  id: string;
  text: string;
  type: "broad" | "phrase" | "exact";
}

export interface GeographicTarget {
  type: "nationwide" | "local";
  city?: string;
  state?: string;
  radius?: number; // in miles
}

export interface BudgetOption {
  dailyBudget: number;
  estimatedClicks: string;
  estimatedImpressions: string;
  estimatedCost: string;
}

export interface GoogleAdsState {
  // Step 1: Ad Versions
  adVersions: AdVersion[];
  selectedVersionCount: number;

  // Step 2-3: Educational (no state, just modals)
  hasSeenEducation: boolean;

  // Step 4: Headlines
  headlines: Headline[];

  // Step 5: Descriptions
  descriptions: Description[];

  // Step 6: Keywords
  keywords: Keyword[];

  // Step 7: URLs
  targetUrl: string;
  displayPath1: string;
  displayPath2: string;

  // Step 8: Geographic
  geographicTarget: GeographicTarget;

  // Step 9: Budget
  selectedBudget: BudgetOption | null;

  // Current step
  currentStep: number;

  // Actions
  setAdVersions: (versions: AdVersion[]) => void;
  toggleAdVersion: (id: string) => void;
  setHasSeenEducation: (seen: boolean) => void;
  addHeadline: (text: string) => void;
  updateHeadline: (id: string, text: string) => void;
  removeHeadline: (id: string) => void;
  addDescription: (text: string) => void;
  updateDescription: (id: string, text: string) => void;
  removeDescription: (id: string) => void;
  addKeyword: (text: string, type: Keyword["type"]) => void;
  removeKeyword: (id: string) => void;
  updateKeyword: (id: string, text: string, type: Keyword["type"]) => void;
  setTargetUrl: (url: string) => void;
  setDisplayPath: (path1: string, path2: string) => void;
  setGeographicTarget: (target: GeographicTarget) => void;
  setSelectedBudget: (budget: BudgetOption) => void;
  setCurrentStep: (step: number) => void;
  reset: () => void;
}

const initialState = {
  adVersions: [],
  selectedVersionCount: 0,
  hasSeenEducation: false,
  headlines: [],
  descriptions: [],
  keywords: [],
  targetUrl: "",
  displayPath1: "",
  displayPath2: "",
  geographicTarget: {
    type: "nationwide" as const,
  },
  selectedBudget: null,
  currentStep: 1,
};

export const useGoogleAdsStore = create<GoogleAdsState>()(
  persist(
    (set) => ({
      ...initialState,

      setAdVersions: (versions) =>
        set({
          adVersions: versions,
          selectedVersionCount: versions.filter((v) => v.selected).length,
        }),

      toggleAdVersion: (id) =>
        set((state) => {
          const updated = state.adVersions.map((v) =>
            v.id === id ? { ...v, selected: !v.selected } : v
          );
          return {
            adVersions: updated,
            selectedVersionCount: updated.filter((v) => v.selected).length,
          };
        }),

      setHasSeenEducation: (seen) => set({ hasSeenEducation: seen }),

      addHeadline: (text) =>
        set((state) => ({
          headlines: [
            ...state.headlines,
            { id: `h-${Date.now()}`, text },
          ],
        })),

      updateHeadline: (id, text) =>
        set((state) => ({
          headlines: state.headlines.map((h) =>
            h.id === id ? { ...h, text } : h
          ),
        })),

      removeHeadline: (id) =>
        set((state) => ({
          headlines: state.headlines.filter((h) => h.id !== id),
        })),

      addDescription: (text) =>
        set((state) => ({
          descriptions: [
            ...state.descriptions,
            { id: `d-${Date.now()}`, text },
          ],
        })),

      updateDescription: (id, text) =>
        set((state) => ({
          descriptions: state.descriptions.map((d) =>
            d.id === id ? { ...d, text } : d
          ),
        })),

      removeDescription: (id) =>
        set((state) => ({
          descriptions: state.descriptions.filter((d) => d.id !== id),
        })),

      addKeyword: (text, type) =>
        set((state) => ({
          keywords: [
            ...state.keywords,
            { id: `k-${Date.now()}`, text, type },
          ],
        })),

      removeKeyword: (id) =>
        set((state) => ({
          keywords: state.keywords.filter((k) => k.id !== id),
        })),

      updateKeyword: (id, text, type) =>
        set((state) => ({
          keywords: state.keywords.map((k) =>
            k.id === id ? { ...k, text, type } : k
          ),
        })),

      setTargetUrl: (url) => set({ targetUrl: url }),

      setDisplayPath: (path1, path2) =>
        set({ displayPath1: path1, displayPath2: path2 }),

      setGeographicTarget: (target) => set({ geographicTarget: target }),

      setSelectedBudget: (budget) => set({ selectedBudget: budget }),

      setCurrentStep: (step) => set({ currentStep: step }),

      reset: () => set(initialState),
    }),
    {
      name: "google-ads-storage",
    }
  )
);

// Helper functions
export const HEADLINE_MAX_LENGTH = 30;
export const DESCRIPTION_MAX_LENGTH = 90;
export const DISPLAY_PATH_MAX_LENGTH = 15;
export const MIN_HEADLINES = 3;
export const MAX_HEADLINES = 15;
export const MIN_DESCRIPTIONS = 2;
export const MAX_DESCRIPTIONS = 4;
export const MIN_KEYWORDS = 3;
export const RECOMMENDED_KEYWORDS = 5;
