/**
 * Facebook/Instagram Targeting Transformer
 *
 * Transforms unified targeting structure to Facebook Marketing API format.
 * Facebook and Instagram share the same API and targeting structure.
 */

import { UnifiedTargeting, UnifiedLocation } from '@/lib/types/unified-targeting';
import { getInterestId } from '../mappings/interest-mappings';
import { getFacebookLocationKey, getCountryCode } from '../mappings/location-mappings';

export interface FacebookTargeting {
  geo_locations?: {
    countries?: string[];
    cities?: Array<{
      key: string;
      radius?: number;
      distance_unit?: 'mile' | 'kilometer';
    }>;
    regions?: Array<{
      key: string;
    }>;
    zips?: Array<{
      key: string;
    }>;
  };
  age_min?: number;
  age_max?: number;
  genders?: number[]; // 0=all, 1=male, 2=female
  locales?: number[]; // Language codes
  interests?: Array<{
    id: string;
    name: string;
  }>;
  behaviors?: Array<{
    id: string;
    name: string;
  }>;
  life_events?: Array<{
    id: string;
    name: string;
  }>;
  education_statuses?: number[];
  relationship_statuses?: number[];
  work_employers?: Array<{
    id: string;
    name: string;
  }>;
  flexible_spec?: any[]; // Advanced targeting
}

/**
 * Transform unified targeting to Facebook targeting format
 */
export function transformToFacebookTargeting(
  unified: UnifiedTargeting
): FacebookTargeting {
  const targeting: FacebookTargeting = {};

  // Age targeting
  if (unified.ageMin !== undefined) {
    targeting.age_min = unified.ageMin;
  }
  if (unified.ageMax !== undefined) {
    targeting.age_max = unified.ageMax;
  }

  // Gender targeting
  if (unified.genders && unified.genders.length > 0) {
    if (unified.genders.includes('all')) {
      // Facebook doesn't need explicit gender targeting for "all"
      // Omit the field to target all genders
    } else {
      targeting.genders = unified.genders.map(gender => {
        switch (gender) {
          case 'male':
            return 1;
          case 'female':
            return 2;
          default:
            return 0; // all
        }
      });
    }
  }

  // Location targeting
  if (unified.locations && unified.locations.length > 0) {
    targeting.geo_locations = transformLocations(unified.locations);
  }

  // Interest targeting
  if (unified.interests && unified.interests.length > 0) {
    targeting.interests = unified.interests
      .map(interest => {
        const interestId = getInterestId(interest, 'facebook');
        if (interestId && typeof interestId === 'string') {
          return {
            id: interestId,
            name: interest,
          };
        }
        return null;
      })
      .filter((item): item is { id: string; name: string } => item !== null);
  }

  // Language targeting
  if (unified.languages && unified.languages.length > 0) {
    targeting.locales = unified.languages.map(lang => getLocaleCode(lang));
  }

  // Facebook-specific targeting
  if (unified.facebook) {
    // Life events
    if (unified.facebook.lifeEvents && unified.facebook.lifeEvents.length > 0) {
      targeting.life_events = unified.facebook.lifeEvents.map(event => ({
        id: event,
        name: event,
      }));
    }

    // Relationship statuses
    if (unified.facebook.relationshipStatuses && unified.facebook.relationshipStatuses.length > 0) {
      targeting.relationship_statuses = unified.facebook.relationshipStatuses.map(status =>
        getRelationshipStatusId(status)
      );
    }

    // Work/Education targeting
    if (unified.facebook.work) {
      if (unified.facebook.work.employers) {
        targeting.work_employers = unified.facebook.work.employers.map(employer => ({
          id: employer,
          name: employer,
        }));
      }
    }

    if (unified.facebook.education) {
      if (unified.facebook.education.educationStatuses) {
        targeting.education_statuses = unified.facebook.education.educationStatuses.map(status =>
          getEducationStatusId(status)
        );
      }
    }
  }

  return targeting;
}

/**
 * Transform unified locations to Facebook geo_locations format
 */
function transformLocations(locations: UnifiedLocation[]) {
  const geoLocations: FacebookTargeting['geo_locations'] = {
    countries: [],
    cities: [],
    regions: [],
    zips: [],
  };

  for (const location of locations) {
    switch (location.type) {
      case 'country': {
        const countryCode = location.code || getCountryCode(location.name);
        if (countryCode) {
          geoLocations.countries!.push(countryCode);
        }
        break;
      }

      case 'city': {
        const cityKey = getFacebookLocationKey(location);
        if (cityKey) {
          geoLocations.cities!.push({
            key: cityKey,
            radius: location.radius || 10,
            distance_unit: 'mile',
          });
        }
        break;
      }

      case 'region': {
        const regionKey = getFacebookLocationKey(location);
        if (regionKey) {
          geoLocations.regions!.push({
            key: regionKey,
          });
        }
        break;
      }

      case 'zip': {
        geoLocations.zips!.push({
          key: location.code || location.name,
        });
        break;
      }
    }
  }

  // Remove empty arrays
  if (geoLocations.countries!.length === 0) delete geoLocations.countries;
  if (geoLocations.cities!.length === 0) delete geoLocations.cities;
  if (geoLocations.regions!.length === 0) delete geoLocations.regions;
  if (geoLocations.zips!.length === 0) delete geoLocations.zips;

  return geoLocations;
}

/**
 * Map language name to Facebook locale code
 */
function getLocaleCode(language: string): number {
  const localeCodes: Record<string, number> = {
    'English': 6,
    'Spanish': 3,
    'French': 2,
    'German': 8,
    'Italian': 10,
    'Portuguese': 11,
    'Chinese': 13,
    'Japanese': 14,
    'Korean': 15,
  };
  return localeCodes[language] || 6; // Default to English
}

/**
 * Map relationship status to Facebook ID
 */
function getRelationshipStatusId(status: string): number {
  const statusCodes: Record<string, number> = {
    'single': 1,
    'in_relationship': 2,
    'married': 3,
    'engaged': 4,
    'not_specified': 6,
  };
  return statusCodes[status] || 6;
}

/**
 * Map education status to Facebook ID
 */
function getEducationStatusId(status: string): number {
  const statusCodes: Record<string, number> = {
    'high_school': 1,
    'undergraduate': 2,
    'graduate': 3,
    'some_college': 4,
    'associate_degree': 5,
  };
  return statusCodes[status] || 1;
}

/**
 * Validate Facebook targeting
 */
export function validateFacebookTargeting(targeting: FacebookTargeting): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Age must be between 13 and 65
  if (targeting.age_min && (targeting.age_min < 13 || targeting.age_min > 65)) {
    errors.push('Minimum age must be between 13 and 65');
  }
  if (targeting.age_max && (targeting.age_max < 13 || targeting.age_max > 65)) {
    errors.push('Maximum age must be between 13 and 65');
  }
  if (targeting.age_min && targeting.age_max && targeting.age_min >= targeting.age_max) {
    errors.push('Minimum age must be less than maximum age');
  }

  // Must have at least one location
  if (!targeting.geo_locations || Object.keys(targeting.geo_locations).length === 0) {
    errors.push('At least one location is required');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
