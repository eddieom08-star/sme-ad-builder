/**
 * Unified Targeting Types
 *
 * These types represent a normalized targeting structure that works across
 * all advertising platforms (Facebook, Instagram, Google Ads, LinkedIn, TikTok).
 * Platform-specific transformers will convert this unified structure to
 * each platform's required format.
 */

export type Gender = 'male' | 'female' | 'all';
export type LocationType = 'country' | 'city' | 'region' | 'zip';

export interface UnifiedLocation {
  type: LocationType;
  name: string;
  code?: string; // ISO country code (e.g., 'US', 'GB')
  radius?: number; // For city/zip targeting (in miles)
  latitude?: number; // For precise geo-targeting
  longitude?: number; // For precise geo-targeting
}

export interface UnifiedTargeting {
  // Demographics - Common across all platforms
  ageMin: number;
  ageMax: number;
  genders: Gender[];

  // Location - Normalized across platforms
  locations: UnifiedLocation[];

  // Interests - Normalized categories that map to platform-specific IDs
  interests: string[];

  // Behaviors - User behaviors and characteristics
  behaviors: string[];

  // Languages - ISO language codes
  languages: string[];

  // Platform-specific extensions
  linkedin?: LinkedInTargeting;
  tiktok?: TikTokTargeting;
  facebook?: FacebookTargeting;
  google?: GoogleTargeting;
}

// LinkedIn-specific targeting (B2B focus)
export interface LinkedInTargeting {
  jobTitles?: string[];
  jobFunctions?: string[];
  companies?: string[];
  companySize?: string[];
  industries?: string[];
  seniority?: string[];
  skills?: string[];
  degrees?: string[];
  fieldsOfStudy?: string[];
}

// TikTok-specific targeting
export interface TikTokTargeting {
  hashtags?: string[];
  videoCategories?: string[];
  deviceModels?: string[];
  operatingSystems?: string[];
  connectionTypes?: ('wifi' | 'cellular')[];
}

// Facebook-specific targeting
export interface FacebookTargeting {
  lifeEvents?: string[];
  relationshipStatuses?: string[];
  education?: {
    schools?: string[];
    educationStatuses?: string[];
    majors?: string[];
  };
  work?: {
    employers?: string[];
    jobTitles?: string[];
    industries?: string[];
  };
}

// Google Ads-specific targeting
export interface GoogleTargeting {
  keywords?: string[];
  topics?: string[];
  placements?: string[]; // Specific websites/apps
  remarketingLists?: string[];
  customAffinity?: string[];
  customIntent?: string[];
  customAudiences?: string[];
  householdIncome?: string[];
  deviceTypes?: string[];
  networkSettings?: {
    googleSearch?: boolean;
    searchPartners?: boolean;
    displayNetwork?: boolean;
  };
}

// Unified Creative (for ad content)
export interface UnifiedCreative {
  headline: string;
  primaryText: string;
  description?: string;
  callToAction: string;
  destinationUrl: string;
  media: UnifiedMedia[];
}

export interface UnifiedMedia {
  url: string;
  type: 'image' | 'video';
  width?: number;
  height?: number;
  duration?: number; // For videos (in seconds)
  thumbnail?: string; // For videos
}

// Campaign data structure
export interface UnifiedCampaignData {
  name: string;
  objective: CampaignObjective;
  budget: {
    type: 'daily' | 'lifetime';
    amount: number; // In dollars
    currency: string; // ISO currency code (USD, GBP, EUR, etc.)
  };
  schedule: {
    startDate: string; // ISO date string
    endDate: string; // ISO date string
  };
  targeting: UnifiedTargeting;
  creative: UnifiedCreative;
  bidding?: {
    strategy: 'lowest_cost' | 'cost_cap' | 'bid_cap';
    bidCap?: number; // Optional bid cap in dollars
  };
}

// Campaign objectives mapped across platforms
export type CampaignObjective =
  | 'awareness'      // Brand awareness, reach
  | 'traffic'        // Website visits, link clicks
  | 'engagement'     // Post engagement, video views
  | 'leads'          // Lead generation
  | 'conversions'    // Sales, app installs
  | 'app_promotion'; // Mobile app installs/engagement

// Platform distribution result
export interface PlatformCampaignResult {
  platform: 'facebook' | 'instagram' | 'google' | 'linkedin' | 'tiktok';
  success: boolean;
  campaignId?: string;
  adSetId?: string;
  adId?: string;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

// Full distribution result
export interface DistributionResult {
  totalPlatforms: number;
  successful: number;
  failed: number;
  results: PlatformCampaignResult[];
}
