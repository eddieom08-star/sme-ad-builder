/**
 * Location Mappings
 *
 * Maps normalized location names to platform-specific location IDs.
 * This allows us to use consistent location names across platforms.
 */

import { UnifiedLocation } from '@/lib/types/unified-targeting';

// Facebook Location Keys (Geo Targeting)
// Use Facebook's Targeting Search API to find location keys
// https://developers.facebook.com/docs/marketing-api/audiences/reference/targeting-search
export const FACEBOOK_LOCATION_MAPPING: Record<string, { key: string; type: string }> = {
  // Countries
  'United States': { key: 'US', type: 'countries' },
  'United Kingdom': { key: 'GB', type: 'countries' },
  'Canada': { key: 'CA', type: 'countries' },
  'Australia': { key: 'AU', type: 'countries' },
  'Germany': { key: 'DE', type: 'countries' },
  'France': { key: 'FR', type: 'countries' },

  // Major Cities
  'New York': { key: '2490299', type: 'cities' },
  'Los Angeles': { key: '2442047', type: 'cities' },
  'Chicago': { key: '2379574', type: 'cities' },
  'London': { key: '2418046', type: 'cities' },
  'Paris': { key: '2988507', type: 'cities' },
  'Toronto': { key: '293912', type: 'cities' },
  'Sydney': { key: '1105779', type: 'cities' },
};

// Google Ads Location Criteria IDs
// https://developers.google.com/google-ads/api/reference/data/geotargets
export const GOOGLE_LOCATION_MAPPING: Record<string, number> = {
  // Countries
  'United States': 2840,
  'United Kingdom': 2826,
  'Canada': 2124,
  'Australia': 2036,
  'Germany': 2276,
  'France': 2250,

  // Major Cities
  'New York': 1023191,
  'Los Angeles': 1013962,
  'Chicago': 1014044,
  'London': 1006886,
  'Paris': 1006094,
  'Toronto': 9062410,
  'Sydney': 1007849,
};

// LinkedIn Location URNs
// https://docs.microsoft.com/en-us/linkedin/marketing/integrations/ads/account-structure/create-and-manage-audience#locations
export const LINKEDIN_LOCATION_MAPPING: Record<string, string> = {
  // Countries
  'United States': 'urn:li:geo:103644278',
  'United Kingdom': 'urn:li:geo:101165590',
  'Canada': 'urn:li:geo:101174742',
  'Australia': 'urn:li:geo:101452733',
  'Germany': 'urn:li:geo:101282230',
  'France': 'urn:li:geo:105015875',

  // Major Cities
  'New York': 'urn:li:geo:102571732',
  'Los Angeles': 'urn:li:geo:102448103',
  'Chicago': 'urn:li:geo:103112676',
  'London': 'urn:li:geo:90009496',
  'Paris': 'urn:li:geo:105117694',
  'Toronto': 'urn:li:geo:100436921',
  'Sydney': 'urn:li:geo:104769905',
};

// TikTok Location IDs
// https://ads.tiktok.com/marketing_api/docs?id=1739311681933313
export const TIKTOK_LOCATION_MAPPING: Record<string, number> = {
  // Countries
  'United States': 6252001,
  'United Kingdom': 2635167,
  'Canada': 6251999,
  'Australia': 2077456,
  'Germany': 2921044,
  'France': 3017382,

  // Major Cities
  'New York': 5128581,
  'Los Angeles': 5368361,
  'Chicago': 4887398,
  'London': 2643743,
  'Paris': 2988507,
  'Toronto': 6167865,
  'Sydney': 2147714,
};

// ISO Country Codes
export const COUNTRY_CODES: Record<string, string> = {
  'United States': 'US',
  'United Kingdom': 'GB',
  'Canada': 'CA',
  'Australia': 'AU',
  'Germany': 'DE',
  'France': 'FR',
  'Spain': 'ES',
  'Italy': 'IT',
  'Japan': 'JP',
  'China': 'CN',
  'India': 'IN',
  'Brazil': 'BR',
  'Mexico': 'MX',
};

// Helper functions
export function getFacebookLocationKey(location: UnifiedLocation): string | null {
  const mapping = FACEBOOK_LOCATION_MAPPING[location.name];
  return mapping?.key || location.code || null;
}

export function getGoogleLocationId(location: UnifiedLocation): number | null {
  return GOOGLE_LOCATION_MAPPING[location.name] || null;
}

export function getLinkedInLocationUrn(location: UnifiedLocation): string | null {
  return LINKEDIN_LOCATION_MAPPING[location.name] || null;
}

export function getTikTokLocationId(location: UnifiedLocation): number | null {
  return TIKTOK_LOCATION_MAPPING[location.name] || null;
}

export function getCountryCode(countryName: string): string | null {
  return COUNTRY_CODES[countryName] || null;
}

// Get all supported locations for a platform
export function getSupportedLocations(
  platform: 'facebook' | 'google' | 'linkedin' | 'tiktok'
): string[] {
  switch (platform) {
    case 'facebook':
      return Object.keys(FACEBOOK_LOCATION_MAPPING);
    case 'google':
      return Object.keys(GOOGLE_LOCATION_MAPPING);
    case 'linkedin':
      return Object.keys(LINKEDIN_LOCATION_MAPPING);
    case 'tiktok':
      return Object.keys(TIKTOK_LOCATION_MAPPING);
    default:
      return [];
  }
}
