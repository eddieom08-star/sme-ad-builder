/**
 * TikTok Targeting Transformer
 *
 * Transforms unified targeting structure to TikTok Marketing API format.
 * TikTok has unique targeting options focused on mobile, video engagement,
 * and younger demographics.
 */

import { UnifiedTargeting, UnifiedLocation } from '@/lib/types/unified-targeting';
import { getInterestId } from '../mappings/interest-mappings';
import { getTikTokLocationId } from '../mappings/location-mappings';

export interface TikTokTargeting {
  location_ids?: number[]; // TikTok location IDs
  age_groups?: string[]; // AGE_13_17, AGE_18_24, AGE_25_34, AGE_35_44, AGE_45_54, AGE_55_100
  gender?: string; // GENDER_UNLIMITED, GENDER_MALE, GENDER_FEMALE
  languages?: string[]; // Language codes (e.g., 'en', 'es', 'fr')
  interest_category_ids?: number[]; // TikTok interest category IDs
  interest_keyword_ids?: number[]; // TikTok interest keyword IDs
  video_related_action?: string[]; // Video interaction behaviors
  hashtag_ids?: number[]; // Hashtag targeting
  device_model_ids?: string[]; // Specific device models
  operating_systems?: string[]; // IOS, ANDROID
  network_types?: string[]; // WIFI, 2G, 3G, 4G, 5G
  carrier_ids?: number[]; // Mobile carrier IDs
  min_android_version?: string; // Minimum Android version
  min_ios_version?: string; // Minimum iOS version
}

/**
 * Transform unified targeting to TikTok targeting format
 */
export function transformToTikTokTargeting(
  unified: UnifiedTargeting
): TikTokTargeting {
  const targeting: TikTokTargeting = {};

  // Age targeting (TikTok uses predefined age groups)
  if (unified.ageMin !== undefined && unified.ageMax !== undefined) {
    targeting.age_groups = getTikTokAgeGroups(unified.ageMin, unified.ageMax);
  }

  // Gender targeting
  if (unified.genders && unified.genders.length > 0) {
    if (unified.genders.includes('all')) {
      targeting.gender = 'GENDER_UNLIMITED';
    } else if (unified.genders.length === 1) {
      targeting.gender = `GENDER_${unified.genders[0].toUpperCase()}`;
    } else {
      // Multiple genders = unlimited
      targeting.gender = 'GENDER_UNLIMITED';
    }
  }

  // Location targeting
  if (unified.locations && unified.locations.length > 0) {
    targeting.location_ids = unified.locations
      .map(loc => getTikTokLocationId(loc))
      .filter((id): id is number => id !== null);
  }

  // Language targeting
  if (unified.languages && unified.languages.length > 0) {
    targeting.languages = unified.languages.map(lang => getLanguageCode(lang));
  }

  // Interest targeting
  if (unified.interests && unified.interests.length > 0) {
    targeting.interest_category_ids = unified.interests
      .map(interest => {
        const interestId = getInterestId(interest, 'tiktok');
        return typeof interestId === 'number' ? interestId : null;
      })
      .filter((id): id is number => id !== null);
  }

  // TikTok-specific targeting
  if (unified.tiktok) {
    // Hashtag targeting
    if (unified.tiktok.hashtags && unified.tiktok.hashtags.length > 0) {
      // In practice, you'd look up hashtag IDs from TikTok API
      // For now, we'll store them as placeholder numbers
      targeting.hashtag_ids = unified.tiktok.hashtags.map((tag, index) => index + 1);
    }

    // Video categories
    if (unified.tiktok.videoCategories && unified.tiktok.videoCategories.length > 0) {
      targeting.video_related_action = unified.tiktok.videoCategories;
    }

    // Device models
    if (unified.tiktok.deviceModels && unified.tiktok.deviceModels.length > 0) {
      targeting.device_model_ids = unified.tiktok.deviceModels;
    }

    // Operating systems
    if (unified.tiktok.operatingSystems && unified.tiktok.operatingSystems.length > 0) {
      targeting.operating_systems = unified.tiktok.operatingSystems.map(os =>
        os.toUpperCase()
      );
    }

    // Connection types
    if (unified.tiktok.connectionTypes && unified.tiktok.connectionTypes.length > 0) {
      targeting.network_types = unified.tiktok.connectionTypes.map(type =>
        type.toUpperCase()
      );
    }
  }

  return targeting;
}

/**
 * Convert age range to TikTok age groups
 */
function getTikTokAgeGroups(ageMin: number, ageMax: number): string[] {
  const ageGroups: string[] = [];

  // TikTok age groups
  const groups = [
    { min: 13, max: 17, name: 'AGE_13_17' },
    { min: 18, max: 24, name: 'AGE_18_24' },
    { min: 25, max: 34, name: 'AGE_25_34' },
    { min: 35, max: 44, name: 'AGE_35_44' },
    { min: 45, max: 54, name: 'AGE_45_54' },
    { min: 55, max: 100, name: 'AGE_55_100' },
  ];

  // Find all age groups that overlap with the target range
  for (const group of groups) {
    if (ageMin <= group.max && ageMax >= group.min) {
      ageGroups.push(group.name);
    }
  }

  return ageGroups.length > 0 ? ageGroups : ['AGE_18_24']; // Default to 18-24
}

/**
 * Convert language name to ISO code
 */
function getLanguageCode(language: string): string {
  const languageCodes: Record<string, string> = {
    'English': 'en',
    'Spanish': 'es',
    'French': 'fr',
    'German': 'de',
    'Italian': 'it',
    'Portuguese': 'pt',
    'Chinese': 'zh',
    'Japanese': 'ja',
    'Korean': 'ko',
    'Arabic': 'ar',
    'Russian': 'ru',
    'Hindi': 'hi',
  };
  return languageCodes[language] || 'en'; // Default to English
}

/**
 * Validate TikTok targeting
 */
export function validateTikTokTargeting(targeting: TikTokTargeting): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Must have at least one location
  if (!targeting.location_ids || targeting.location_ids.length === 0) {
    errors.push('At least one location is required');
  }

  // Age groups are required
  if (!targeting.age_groups || targeting.age_groups.length === 0) {
    errors.push('Age targeting is required');
  }

  // TikTok has minimum age of 13
  const hasUnder13 = targeting.age_groups?.some(group =>
    group === 'AGE_13_17' && parseInt(group.split('_')[1]) < 13
  );
  if (hasUnder13) {
    errors.push('TikTok minimum age is 13');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Get TikTok video interaction behaviors
 */
export const TIKTOK_VIDEO_ACTIONS = [
  'VIDEO_VIEW',
  'VIDEO_VIEW_6S',
  'LIKED_VIDEO',
  'COMMENTED_VIDEO',
  'SHARED_VIDEO',
  'PROFILE_VIEW',
  'FOLLOWED_CREATOR',
];

/**
 * Get TikTok network types
 */
export const TIKTOK_NETWORK_TYPES = ['WIFI', '2G', '3G', '4G', '5G'];

/**
 * Get TikTok operating systems
 */
export const TIKTOK_OPERATING_SYSTEMS = ['ANDROID', 'IOS'];

/**
 * Get TikTok targeting suggestions based on campaign objective
 */
export function getTikTokTargetingSuggestions(objective: string): string[] {
  const suggestions: Record<string, string[]> = {
    awareness: [
      'Target broad age ranges (18-44) for maximum reach',
      'Use video interaction behaviors to find engaged users',
      'Consider targeting users who have watched similar content',
    ],
    traffic: [
      'Target users who have clicked on ads before',
      'Use hashtag targeting for relevant topics',
      'Focus on users with high engagement rates',
    ],
    conversions: [
      'Target users who have completed video views (100%)',
      'Use lookalike audiences based on converters',
      'Focus on users who have shared or liked shopping content',
    ],
    app_promotion: [
      'Target users with compatible devices',
      'Focus on WiFi users for app downloads',
      'Target users who have installed similar apps',
    ],
  };

  return suggestions[objective] || suggestions.awareness;
}
