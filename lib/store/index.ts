import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

// ============================================================================
// UI Store - for global UI state
// ============================================================================

interface UIState {
  sidebarOpen: boolean;
  theme: "light" | "dark" | "system";
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  setTheme: (theme: "light" | "dark" | "system") => void;
}

export const useUIStore = create<UIState>()(
  devtools(
    persist(
      (set) => ({
        sidebarOpen: true,
        theme: "system",
        setSidebarOpen: (open) => set({ sidebarOpen: open }),
        toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
        setTheme: (theme) => set({ theme }),
      }),
      {
        name: "ui-storage",
      }
    )
  )
);

// ============================================================================
// Campaign Store - for campaign management
// ============================================================================

interface CampaignFilter {
  status?: string;
  platform?: string;
  dateRange?: {
    from: Date;
    to: Date;
  };
}

interface CampaignState {
  selectedCampaignId: number | null;
  filters: CampaignFilter;
  setSelectedCampaign: (id: number | null) => void;
  setFilters: (filters: CampaignFilter) => void;
  clearFilters: () => void;
}

export const useCampaignStore = create<CampaignState>()(
  devtools((set) => ({
    selectedCampaignId: null,
    filters: {},
    setSelectedCampaign: (id) => set({ selectedCampaignId: id }),
    setFilters: (filters) => set({ filters }),
    clearFilters: () => set({ filters: {} }),
  }))
);

// ============================================================================
// Ad Builder Store - for ad creation workflow
// ============================================================================

interface AdBuilderState {
  currentStep: number;
  campaignId: number | null;
  adFormat: "image" | "video" | "carousel" | "story" | null;
  platform: string | null;
  draft: {
    name?: string;
    headline?: string;
    body?: string;
    callToAction?: string;
    imageUrl?: string;
    videoUrl?: string;
    targetUrl?: string;
  };
  setCurrentStep: (step: number) => void;
  setCampaignId: (id: number | null) => void;
  setAdFormat: (format: "image" | "video" | "carousel" | "story" | null) => void;
  setPlatform: (platform: string | null) => void;
  updateDraft: (data: Partial<AdBuilderState["draft"]>) => void;
  resetBuilder: () => void;
}

const initialAdBuilderState = {
  currentStep: 0,
  campaignId: null,
  adFormat: null,
  platform: null,
  draft: {},
};

export const useAdBuilderStore = create<AdBuilderState>()(
  devtools((set) => ({
    ...initialAdBuilderState,
    setCurrentStep: (step) => set({ currentStep: step }),
    setCampaignId: (id) => set({ campaignId: id }),
    setAdFormat: (format) => set({ adFormat: format }),
    setPlatform: (platform) => set({ platform }),
    updateDraft: (data) =>
      set((state) => ({ draft: { ...state.draft, ...data } })),
    resetBuilder: () => set(initialAdBuilderState),
  }))
);

// ============================================================================
// Analytics Store - for analytics dashboard state
// ============================================================================

interface AnalyticsState {
  dateRange: {
    from: Date;
    to: Date;
  };
  selectedMetrics: string[];
  comparisonMode: boolean;
  setDateRange: (range: { from: Date; to: Date }) => void;
  setSelectedMetrics: (metrics: string[]) => void;
  toggleComparisonMode: () => void;
}

export const useAnalyticsStore = create<AnalyticsState>()(
  devtools(
    persist(
      (set) => ({
        dateRange: {
          from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
          to: new Date(),
        },
        selectedMetrics: ["impressions", "clicks", "conversions"],
        comparisonMode: false,
        setDateRange: (range) => set({ dateRange: range }),
        setSelectedMetrics: (metrics) => set({ selectedMetrics: metrics }),
        toggleComparisonMode: () =>
          set((state) => ({ comparisonMode: !state.comparisonMode })),
      }),
      {
        name: "analytics-storage",
      }
    )
  )
);
