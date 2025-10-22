/**
 * Campaign Objective Mappings
 *
 * Maps unified campaign objectives to platform-specific objective values.
 * Each platform has different objective names and capabilities.
 */

import { CampaignObjective } from '@/lib/types/unified-targeting';

// Facebook/Instagram Campaign Objectives
// https://developers.facebook.com/docs/marketing-api/reference/ad-campaign-group
export const FACEBOOK_OBJECTIVE_MAPPING: Record<CampaignObjective, string> = {
  'awareness': 'OUTCOME_AWARENESS',
  'traffic': 'OUTCOME_TRAFFIC',
  'engagement': 'OUTCOME_ENGAGEMENT',
  'leads': 'OUTCOME_LEADS',
  'conversions': 'OUTCOME_SALES',
  'app_promotion': 'OUTCOME_APP_PROMOTION',
};

// Google Ads Campaign Goals
// https://developers.google.com/google-ads/api/reference/rpc/latest/AdvertisingChannelTypeEnum.AdvertisingChannelType
export const GOOGLE_OBJECTIVE_MAPPING: Record<CampaignObjective, string> = {
  'awareness': 'DISPLAY', // For brand awareness
  'traffic': 'SEARCH', // Website traffic via search
  'engagement': 'VIDEO', // Video engagement
  'leads': 'SEARCH', // Lead generation
  'conversions': 'SHOPPING', // E-commerce conversions
  'app_promotion': 'MULTI_CHANNEL', // App install campaigns
};

// LinkedIn Campaign Objectives
// https://docs.microsoft.com/en-us/linkedin/marketing/integrations/ads/account-structure/create-and-manage-campaigns
export const LINKEDIN_OBJECTIVE_MAPPING: Record<CampaignObjective, string> = {
  'awareness': 'BRAND_AWARENESS',
  'traffic': 'WEBSITE_VISITS',
  'engagement': 'ENGAGEMENT',
  'leads': 'LEAD_GENERATION',
  'conversions': 'WEBSITE_CONVERSIONS',
  'app_promotion': 'JOB_APPLICANTS', // LinkedIn doesn't have direct app promotion
};

// TikTok Campaign Objectives
// https://ads.tiktok.com/marketing_api/docs?id=1739953377508354
export const TIKTOK_OBJECTIVE_MAPPING: Record<CampaignObjective, string> = {
  'awareness': 'REACH',
  'traffic': 'TRAFFIC',
  'engagement': 'VIDEO_VIEWS',
  'leads': 'LEAD_GENERATION',
  'conversions': 'CONVERSIONS',
  'app_promotion': 'APP_PROMOTION',
};

// Helper functions to get platform-specific objective
export function getFacebookObjective(objective: CampaignObjective): string {
  return FACEBOOK_OBJECTIVE_MAPPING[objective];
}

export function getGoogleObjective(objective: CampaignObjective): string {
  return GOOGLE_OBJECTIVE_MAPPING[objective];
}

export function getLinkedInObjective(objective: CampaignObjective): string {
  return LINKEDIN_OBJECTIVE_MAPPING[objective];
}

export function getTikTokObjective(objective: CampaignObjective): string {
  return TIKTOK_OBJECTIVE_MAPPING[objective];
}

// Get supported objectives for a platform
export function getSupportedObjectives(
  platform: 'facebook' | 'google' | 'linkedin' | 'tiktok'
): CampaignObjective[] {
  // All platforms support all our unified objectives
  // (though the implementation may vary)
  return [
    'awareness',
    'traffic',
    'engagement',
    'leads',
    'conversions',
    'app_promotion',
  ];
}

// Platform-specific optimization goals
export const FACEBOOK_OPTIMIZATION_GOALS: Record<string, string[]> = {
  'OUTCOME_AWARENESS': ['REACH', 'IMPRESSIONS'],
  'OUTCOME_TRAFFIC': ['LINK_CLICKS', 'LANDING_PAGE_VIEWS'],
  'OUTCOME_ENGAGEMENT': ['POST_ENGAGEMENT', 'VIDEO_VIEWS'],
  'OUTCOME_LEADS': ['LEAD_GENERATION', 'CONVERSATIONS'],
  'OUTCOME_SALES': ['CONVERSIONS', 'VALUE'],
  'OUTCOME_APP_PROMOTION': ['APP_INSTALLS', 'APP_EVENTS'],
};

export function getFacebookOptimizationGoal(objective: string): string {
  const goals = FACEBOOK_OPTIMIZATION_GOALS[objective];
  return goals ? goals[0] : 'REACH'; // Default to REACH
}
