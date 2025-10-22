/**
 * Interest Mappings
 *
 * Maps normalized interest categories to platform-specific interest IDs.
 * These mappings allow us to use human-readable interest names in our UI
 * and convert them to the correct platform-specific identifiers.
 */

// Facebook/Instagram Interest IDs
// https://developers.facebook.com/docs/marketing-api/audiences/reference/targeting-search
export const FACEBOOK_INTEREST_MAPPING: Record<string, string> = {
  // Technology & Computing
  'Technology': '6003020834693',
  'Computers': '6003020834493',
  'Mobile devices': '6003348662891',
  'Software': '6003462882570',
  'Consumer electronics': '6002991069090',

  // Business & Industry
  'Business': '6003348662692',
  'Entrepreneurship': '6003291330804',
  'Small business': '6003353709227',
  'Marketing': '6003139266461',
  'Advertising': '6003127297061',

  // Sports & Fitness
  'Sports': '6003138928398',
  'Fitness and wellness': '6003139266461',
  'Running': '6003020834893',
  'Yoga': '6003195050025',
  'Gym': '6003139266561',

  // Entertainment
  'Movies': '6003139266461',
  'Music': '6003020834593',
  'Television': '6003442462270',
  'Gaming': '6003354699376',
  'Video games': '6003354699376',

  // Food & Dining
  'Food': '6003020834393',
  'Restaurants': '6003348662792',
  'Cooking': '6003020834793',
  'Coffee': '6003348662892',
  'Healthy eating': '6003195050125',

  // Travel & Places
  'Travel': '6003348662993',
  'Tourism': '6003348663093',
  'Hotels': '6003348663193',
  'Airlines': '6003348663293',
  'Adventure travel': '6003348663393',

  // Fashion & Beauty
  'Fashion': '6003349076252',
  'Beauty': '6003020834193',
  'Cosmetics': '6003020834293',
  'Clothing': '6003349076352',

  // Home & Garden
  'Home improvement': '6003348663493',
  'Gardening': '6003020834093',
  'Interior design': '6003020833993',
  'Real estate': '6003348662592',

  // Shopping & Retail
  'Shopping': '6003348662392',
  'Online shopping': '6003348662492',
  'Retail': '6003348662292',
  'E-commerce': '6003348662192',
};

// Google Ads Affinity Audience IDs
// https://developers.google.com/google-ads/api/reference/rpc/latest/AffinityUserListEnum.AffinityUserList
export const GOOGLE_INTEREST_MAPPING: Record<string, string> = {
  // Technology
  'Technology': '30000',
  'Computers': '30001',
  'Mobile devices': '30002',
  'Software': '30003',
  'Consumer electronics': '30004',

  // Business
  'Business': '20000',
  'Entrepreneurship': '20001',
  'Small business': '20002',
  'Marketing': '20003',
  'Advertising': '20004',

  // Sports & Fitness
  'Sports': '10000',
  'Fitness and wellness': '10001',
  'Running': '10002',
  'Yoga': '10003',
  'Gym': '10004',

  // Entertainment
  'Movies': '40000',
  'Music': '40001',
  'Television': '40002',
  'Gaming': '40003',
  'Video games': '40003',

  // Food & Dining
  'Food': '50000',
  'Restaurants': '50001',
  'Cooking': '50002',
  'Coffee': '50003',
  'Healthy eating': '50004',

  // Travel
  'Travel': '60000',
  'Tourism': '60001',
  'Hotels': '60002',
  'Airlines': '60003',
  'Adventure travel': '60004',
};

// LinkedIn Interest Categories
// https://docs.microsoft.com/en-us/linkedin/marketing/integrations/ads/account-structure/create-and-manage-audience#interests
export const LINKEDIN_INTEREST_MAPPING: Record<string, string> = {
  // Professional interests
  'Business': 'urn:li:interest:1',
  'Entrepreneurship': 'urn:li:interest:2',
  'Marketing': 'urn:li:interest:3',
  'Technology': 'urn:li:interest:4',
  'Software': 'urn:li:interest:5',
  'Leadership': 'urn:li:interest:6',
  'Management': 'urn:li:interest:7',
  'Sales': 'urn:li:interest:8',
  'Finance': 'urn:li:interest:9',
  'Human resources': 'urn:li:interest:10',
};

// TikTok Interest Categories
// https://ads.tiktok.com/marketing_api/docs?id=1739940506015746
export const TIKTOK_INTEREST_MAPPING: Record<string, number> = {
  // Lifestyle & Entertainment
  'Entertainment': 100001,
  'Music': 100002,
  'Gaming': 100003,
  'Sports': 100004,
  'Food': 100005,
  'Travel': 100006,
  'Fashion': 100007,
  'Beauty': 100008,

  // Technology
  'Technology': 200001,
  'Mobile devices': 200002,
  'Consumer electronics': 200003,

  // Business
  'Business': 300001,
  'E-commerce': 300002,
  'Marketing': 300003,
};

// Helper function to get interest ID for a platform
export function getInterestId(
  interest: string,
  platform: 'facebook' | 'google' | 'linkedin' | 'tiktok'
): string | number | null {
  switch (platform) {
    case 'facebook':
      return FACEBOOK_INTEREST_MAPPING[interest] || null;
    case 'google':
      return GOOGLE_INTEREST_MAPPING[interest] || null;
    case 'linkedin':
      return LINKEDIN_INTEREST_MAPPING[interest] || null;
    case 'tiktok':
      return TIKTOK_INTEREST_MAPPING[interest] || null;
    default:
      return null;
  }
}

// Get all supported interests for a platform
export function getSupportedInterests(
  platform: 'facebook' | 'google' | 'linkedin' | 'tiktok'
): string[] {
  switch (platform) {
    case 'facebook':
      return Object.keys(FACEBOOK_INTEREST_MAPPING);
    case 'google':
      return Object.keys(GOOGLE_INTEREST_MAPPING);
    case 'linkedin':
      return Object.keys(LINKEDIN_INTEREST_MAPPING);
    case 'tiktok':
      return Object.keys(TIKTOK_INTEREST_MAPPING);
    default:
      return [];
  }
}
