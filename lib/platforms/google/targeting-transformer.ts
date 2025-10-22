/**
 * Google Ads Targeting Transformer
 *
 * Transforms unified targeting structure to Google Ads API format.
 * Google Ads offers extensive targeting including keywords, topics,
 * placements, and remarketing lists.
 */

import { UnifiedTargeting, UnifiedLocation } from '@/lib/types/unified-targeting';
import { getInterestId } from '../mappings/interest-mappings';
import { getGoogleLocationId } from '../mappings/location-mappings';

export interface GoogleAdsTargeting {
  // Location targeting
  locationIds?: number[]; // Google location criteria IDs
  excludedLocationIds?: number[];

  // Demographic targeting
  ageRanges?: string[]; // AGE_RANGE_18_24, AGE_RANGE_25_34, etc.
  genders?: string[]; // GENDER_MALE, GENDER_FEMALE, GENDER_UNDETERMINED
  parentalStatuses?: string[]; // PARENTAL_STATUS_PARENT, PARENTAL_STATUS_NOT_A_PARENT

  // Language targeting
  languageIds?: number[]; // Google language criterion IDs

  // Audience targeting
  affinityAudiences?: string[]; // Affinity audience IDs
  inMarketAudiences?: string[]; // In-market audience IDs
  customAudiences?: string[]; // Custom audience IDs
  remarketingLists?: string[]; // Remarketing list IDs

  // Content targeting
  keywords?: string[]; // Keyword targeting
  topics?: number[]; // Topic IDs
  placements?: string[]; // Specific website placements

  // Device targeting
  deviceTypes?: string[]; // DESKTOP, MOBILE, TABLET
  operatingSystems?: string[]; // WINDOWS, MAC_OS_X, ANDROID, IOS

  // Google-specific
  householdIncomes?: string[]; // HOUSEHOLD_INCOME_TOP_10_PERCENT, etc.

  // Network settings
  targetGoogleSearch?: boolean;
  targetSearchNetwork?: boolean;
  targetContentNetwork?: boolean;
  targetPartnerSearchNetwork?: boolean;
}

/**
 * Transform unified targeting to Google Ads targeting format
 */
export function transformToGoogleAdsTargeting(
  unified: UnifiedTargeting
): GoogleAdsTargeting {
  const targeting: GoogleAdsTargeting = {};

  // Age targeting (Google uses age range enums)
  if (unified.ageMin !== undefined && unified.ageMax !== undefined) {
    targeting.ageRanges = getGoogleAgeRanges(unified.ageMin, unified.ageMax);
  }

  // Gender targeting
  if (unified.genders && unified.genders.length > 0) {
    if (!unified.genders.includes('all')) {
      targeting.genders = unified.genders.map(gender => {
        if (gender === 'male') return 'GENDER_MALE';
        if (gender === 'female') return 'GENDER_FEMALE';
        return 'GENDER_UNDETERMINED';
      });
    }
  }

  // Location targeting
  if (unified.locations && unified.locations.length > 0) {
    targeting.locationIds = unified.locations
      .map(loc => getGoogleLocationId(loc))
      .filter((id): id is number => id !== null);
  }

  // Language targeting
  if (unified.languages && unified.languages.length > 0) {
    targeting.languageIds = unified.languages.map(lang => getLanguageId(lang));
  }

  // Interest targeting (map to Google affinity/in-market audiences)
  if (unified.interests && unified.interests.length > 0) {
    const affinityAudiences: string[] = [];
    const inMarketAudiences: string[] = [];

    unified.interests.forEach(interest => {
      const audienceId = getInterestId(interest, 'google');
      if (typeof audienceId === 'string') {
        // In Google, affinity audiences start with 'affinity_', in-market with 'in_market_'
        if (audienceId.startsWith('affinity_')) {
          affinityAudiences.push(audienceId);
        } else if (audienceId.startsWith('in_market_')) {
          inMarketAudiences.push(audienceId);
        }
      }
    });

    if (affinityAudiences.length > 0) {
      targeting.affinityAudiences = affinityAudiences;
    }
    if (inMarketAudiences.length > 0) {
      targeting.inMarketAudiences = inMarketAudiences;
    }
  }

  // Google-specific targeting
  if (unified.google) {
    // Keywords
    if (unified.google.keywords && unified.google.keywords.length > 0) {
      targeting.keywords = unified.google.keywords;
    }

    // Topics
    if (unified.google.topics && unified.google.topics.length > 0) {
      targeting.topics = unified.google.topics.map(topic => parseInt(topic));
    }

    // Placements
    if (unified.google.placements && unified.google.placements.length > 0) {
      targeting.placements = unified.google.placements;
    }

    // Custom audiences
    if (unified.google.customAudiences && unified.google.customAudiences.length > 0) {
      targeting.customAudiences = unified.google.customAudiences;
    }

    // Remarketing lists
    if (unified.google.remarketingLists && unified.google.remarketingLists.length > 0) {
      targeting.remarketingLists = unified.google.remarketingLists;
    }

    // Household income
    if (unified.google.householdIncome && unified.google.householdIncome.length > 0) {
      targeting.householdIncomes = unified.google.householdIncome.map(income =>
        getGoogleHouseholdIncomeId(income)
      );
    }

    // Device types
    if (unified.google.deviceTypes && unified.google.deviceTypes.length > 0) {
      targeting.deviceTypes = unified.google.deviceTypes.map(device =>
        device.toUpperCase()
      );
    }

    // Network settings
    if (unified.google.networkSettings) {
      targeting.targetGoogleSearch = unified.google.networkSettings.googleSearch ?? true;
      targeting.targetSearchNetwork = unified.google.networkSettings.searchPartners ?? false;
      targeting.targetContentNetwork = unified.google.networkSettings.displayNetwork ?? true;
    }
  }

  // Default network settings if not specified
  if (targeting.targetGoogleSearch === undefined) {
    targeting.targetGoogleSearch = true;
    targeting.targetSearchNetwork = false;
    targeting.targetContentNetwork = true;
    targeting.targetPartnerSearchNetwork = false;
  }

  return targeting;
}

/**
 * Convert age range to Google Ads age range enums
 */
function getGoogleAgeRanges(ageMin: number, ageMax: number): string[] {
  const ageRanges: string[] = [];

  // Google Ads age ranges
  const ranges = [
    { min: 18, max: 24, name: 'AGE_RANGE_18_24' },
    { min: 25, max: 34, name: 'AGE_RANGE_25_34' },
    { min: 35, max: 44, name: 'AGE_RANGE_35_44' },
    { min: 45, max: 54, name: 'AGE_RANGE_45_54' },
    { min: 55, max: 64, name: 'AGE_RANGE_55_64' },
    { min: 65, max: 120, name: 'AGE_RANGE_65_UP' },
    { min: 0, max: 17, name: 'AGE_RANGE_UNDETERMINED' }, // Under 18
  ];

  // Find all age ranges that overlap with the target range
  for (const range of ranges) {
    if (ageMin <= range.max && ageMax >= range.min) {
      ageRanges.push(range.name);
    }
  }

  return ageRanges.length > 0 ? ageRanges : ['AGE_RANGE_18_24']; // Default
}

/**
 * Convert language name to Google language criterion ID
 */
function getLanguageId(language: string): number {
  const languageIds: Record<string, number> = {
    'English': 1000, // English
    'Spanish': 1003, // Spanish
    'French': 1002, // French
    'German': 1001, // German
    'Italian': 1004, // Italian
    'Portuguese': 1014, // Portuguese
    'Chinese': 1017, // Chinese (Simplified)
    'Japanese': 1005, // Japanese
    'Korean': 1012, // Korean
    'Arabic': 1019, // Arabic
    'Russian': 1020, // Russian
    'Hindi': 1023, // Hindi
    'Dutch': 1010, // Dutch
    'Polish': 1025, // Polish
    'Turkish': 1037, // Turkish
  };
  return languageIds[language] || 1000; // Default to English
}

/**
 * Convert household income to Google Ads household income ID
 */
function getGoogleHouseholdIncomeId(income: string): string {
  const incomeMap: Record<string, string> = {
    'top-10': 'HOUSEHOLD_INCOME_TOP_10_PERCENT',
    'top-20': 'HOUSEHOLD_INCOME_11_20_PERCENT',
    'top-30': 'HOUSEHOLD_INCOME_21_30_PERCENT',
    'top-40': 'HOUSEHOLD_INCOME_31_40_PERCENT',
    'top-50': 'HOUSEHOLD_INCOME_41_50_PERCENT',
    'lower-50': 'HOUSEHOLD_INCOME_LOWER_50_PERCENT',
    'undetermined': 'HOUSEHOLD_INCOME_UNDETERMINED',
  };
  return incomeMap[income] || 'HOUSEHOLD_INCOME_UNDETERMINED';
}

/**
 * Validate Google Ads targeting
 */
export function validateGoogleAdsTargeting(targeting: GoogleAdsTargeting): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // At least one location is recommended (not strictly required for some campaign types)
  if (!targeting.locationIds || targeting.locationIds.length === 0) {
    errors.push('At least one location is recommended for better targeting');
  }

  // Must have at least one network selected
  const hasNetwork =
    targeting.targetGoogleSearch ||
    targeting.targetSearchNetwork ||
    targeting.targetContentNetwork ||
    targeting.targetPartnerSearchNetwork;

  if (!hasNetwork) {
    errors.push('At least one network (Search or Display) must be selected');
  }

  // If using keyword targeting, must target search network
  if (
    targeting.keywords &&
    targeting.keywords.length > 0 &&
    !targeting.targetGoogleSearch &&
    !targeting.targetSearchNetwork
  ) {
    errors.push('Keyword targeting requires Google Search or Search Network to be enabled');
  }

  // If using placements or topics, must target content network
  if (
    (targeting.placements || targeting.topics) &&
    !targeting.targetContentNetwork
  ) {
    errors.push('Placement and topic targeting require Display Network to be enabled');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Get Google Ads keyword match types
 */
export const GOOGLE_KEYWORD_MATCH_TYPES = [
  'BROAD', // broad match
  'PHRASE', // "phrase match"
  'EXACT', // [exact match]
] as const;

/**
 * Get Google Ads device types
 */
export const GOOGLE_DEVICE_TYPES = ['DESKTOP', 'MOBILE', 'TABLET'] as const;

/**
 * Get Google Ads targeting suggestions based on campaign objective
 */
export function getGoogleAdsTargetingSuggestions(objective: string): string[] {
  const suggestions: Record<string, string[]> = {
    awareness: [
      'Use affinity audiences to reach users with relevant interests',
      'Target Display Network for broad reach and visibility',
      'Consider demographic targeting to refine your audience',
    ],
    traffic: [
      'Use keyword targeting to capture search intent',
      'Target both Search and Display networks for maximum traffic',
      'Consider in-market audiences for users actively researching',
    ],
    conversions: [
      'Focus on high-intent keywords with exact or phrase match',
      'Use remarketing lists to re-engage previous visitors',
      'Target in-market audiences for users ready to purchase',
    ],
    leads: [
      'Combine keyword targeting with remarketing for best results',
      'Use custom audiences based on your customer data',
      'Consider targeting competitor placements',
    ],
  };

  return suggestions[objective] || suggestions.awareness;
}

/**
 * Get recommended bid strategies for Google Ads
 */
export function getGoogleBidStrategySuggestions(objective: string): {
  strategy: string;
  description: string;
}[] {
  const strategies: Record<string, { strategy: string; description: string }[]> = {
    awareness: [
      {
        strategy: 'TARGET_CPM',
        description: 'Optimize for impressions and brand visibility',
      },
      {
        strategy: 'MAXIMIZE_CONVERSIONS',
        description: 'Get the most conversions within your budget',
      },
    ],
    traffic: [
      {
        strategy: 'MAXIMIZE_CLICKS',
        description: 'Get the most clicks within your budget',
      },
      {
        strategy: 'MANUAL_CPC',
        description: 'Full control over individual keyword bids',
      },
    ],
    conversions: [
      {
        strategy: 'TARGET_CPA',
        description: 'Optimize for conversions at a target cost per acquisition',
      },
      {
        strategy: 'TARGET_ROAS',
        description: 'Optimize for return on ad spend',
      },
    ],
    leads: [
      {
        strategy: 'TARGET_CPA',
        description: 'Optimize for leads at a target cost per lead',
      },
      {
        strategy: 'MAXIMIZE_CONVERSION_VALUE',
        description: 'Maximize the total conversion value',
      },
    ],
  };

  return strategies[objective] || strategies.traffic;
}
