import { z } from "zod";

// ============================================================================
// Database Entity Types (imported from schema)
// ============================================================================

export type User = {
  id: number;
  username: string;
  email: string;
  password: string;
  businessId: number | null;
  role: "owner" | "admin" | "member";
  createdAt: Date;
  updatedAt: Date;
};

export type Business = {
  id: number;
  name: string;
  industry: string;
  description: string | null;
  website: string | null;
  ownerId: number;
  createdAt: Date;
  updatedAt: Date;
};

export type Campaign = {
  id: number;
  businessId: number;
  name: string;
  platforms: string[];
  budget: number;
  spent: number;
  status: "draft" | "active" | "paused" | "completed" | "archived";
  startDate: Date;
  endDate: Date;
  createdAt: Date;
  updatedAt: Date;
};

export type Ad = {
  id: number;
  campaignId: number;
  name: string;
  format: "image" | "video" | "carousel" | "story";
  platform: string;
  status: "draft" | "active" | "paused" | "rejected";
  headline: string | null;
  body: string | null;
  callToAction: string | null;
  imageUrl: string | null;
  videoUrl: string | null;
  targetUrl: string | null;
  metrics: AdMetrics | null;
  createdAt: Date;
  updatedAt: Date;
};

export type Lead = {
  id: number;
  businessId: number;
  campaignId: number | null;
  adId: number | null;
  name: string | null;
  email: string;
  phone: string | null;
  source: string;
  status: "new" | "contacted" | "qualified" | "converted" | "lost";
  notes: string | null;
  metadata: Record<string, any> | null;
  createdAt: Date;
  updatedAt: Date;
};

// ============================================================================
// Nested Types & Interfaces
// ============================================================================

export interface AdMetrics {
  impressions: number;
  clicks: number;
  conversions: number;
  spend: number;
  ctr: number; // Click-through rate
  cpc: number; // Cost per click
  cpa: number; // Cost per acquisition
  roas: number; // Return on ad spend
}

export interface AudienceTargeting {
  ageMin?: number;
  ageMax?: number;
  genders?: ("male" | "female" | "all")[];
  locations?: string[];
  interests?: string[];
  behaviors?: string[];
  customAudiences?: string[];
}

export interface CampaignMetrics {
  totalImpressions: number;
  totalClicks: number;
  totalConversions: number;
  totalSpend: number;
  averageCTR: number;
  averageCPC: number;
  averageCPA: number;
  totalROAS: number;
}

// ============================================================================
// Form Schemas & Validation
// ============================================================================

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const registerSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  businessName: z.string().min(2, "Business name must be at least 2 characters"),
  industry: z.string().min(2, "Industry is required"),
});

export const businessSchema = z.object({
  name: z.string().min(2, "Business name must be at least 2 characters"),
  industry: z.string().min(2, "Industry is required"),
  description: z.string().optional(),
  website: z.string().url("Must be a valid URL").optional().or(z.literal("")),
});

export const campaignSchema = z.object({
  name: z.string().min(3, "Campaign name must be at least 3 characters"),
  platforms: z.array(z.string()).min(1, "Select at least one platform"),
  budget: z.number().min(1, "Budget must be at least $1"),
  startDate: z.date(),
  endDate: z.date(),
  status: z.enum(["draft", "active", "paused", "completed", "archived"]).default("draft"),
});

export const adSchema = z.object({
  campaignId: z.number(),
  name: z.string().min(3, "Ad name must be at least 3 characters"),
  format: z.enum(["image", "video", "carousel", "story"]),
  platform: z.string().min(1, "Platform is required"),
  headline: z.string().max(100, "Headline must be 100 characters or less").optional(),
  body: z.string().max(500, "Body must be 500 characters or less").optional(),
  callToAction: z.string().optional(),
  imageUrl: z.string().url("Must be a valid URL").optional(),
  videoUrl: z.string().url("Must be a valid URL").optional(),
  targetUrl: z.string().url("Must be a valid URL").optional(),
});

export const leadSchema = z.object({
  businessId: z.number(),
  campaignId: z.number().optional(),
  adId: z.number().optional(),
  name: z.string().optional(),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  source: z.string(),
  status: z.enum(["new", "contacted", "qualified", "converted", "lost"]).default("new"),
  notes: z.string().optional(),
  metadata: z.record(z.any()).optional(),
});

// ============================================================================
// Inferred Types from Schemas
// ============================================================================

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type BusinessInput = z.infer<typeof businessSchema>;
export type CampaignInput = z.infer<typeof campaignSchema>;
export type AdInput = z.infer<typeof adSchema>;
export type LeadInput = z.infer<typeof leadSchema>;

// ============================================================================
// API Response Types
// ============================================================================

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ============================================================================
// UI/Component Types
// ============================================================================

export interface SelectOption {
  label: string;
  value: string;
}

export interface DashboardStats {
  totalCampaigns: number;
  activeCampaigns: number;
  totalLeads: number;
  totalSpend: number;
  totalROAS: number;
  changePercentage?: {
    campaigns?: number;
    leads?: number;
    spend?: number;
    roas?: number;
  };
}

export interface ChartDataPoint {
  date: string;
  impressions?: number;
  clicks?: number;
  conversions?: number;
  spend?: number;
  [key: string]: any;
}

// ============================================================================
// Platform & Format Constants
// ============================================================================

export const PLATFORMS = [
  "facebook",
  "instagram",
  "google",
  "linkedin",
  "twitter",
  "tiktok",
] as const;

export const AD_FORMATS = ["image", "video", "carousel", "story"] as const;

export const CAMPAIGN_STATUSES = [
  "draft",
  "active",
  "paused",
  "completed",
  "archived",
] as const;

export const LEAD_STATUSES = [
  "new",
  "contacted",
  "qualified",
  "converted",
  "lost",
] as const;

export type Platform = (typeof PLATFORMS)[number];
export type AdFormat = (typeof AD_FORMATS)[number];
export type CampaignStatus = (typeof CAMPAIGN_STATUSES)[number];
export type LeadStatus = (typeof LEAD_STATUSES)[number];
