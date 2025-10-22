/**
 * LinkedIn Targeting Transformer
 *
 * Transforms unified targeting structure to LinkedIn Marketing API format.
 * LinkedIn is focused on B2B/professional targeting with unique capabilities
 * like job titles, companies, industries, and seniority levels.
 */

import { UnifiedTargeting, UnifiedLocation } from '@/lib/types/unified-targeting';
import { getInterestId } from '../mappings/interest-mappings';
import { getLinkedInLocationUrn } from '../mappings/location-mappings';

export interface LinkedInTargeting {
  includedTargetingFacets: {
    locations?: string[]; // URNs: urn:li:geo:103644278
    ageRanges?: string[]; // URNs: urn:li:ageRange:(18,24)
    genders?: string[]; // URNs: urn:li:gender:MALE
    industries?: string[]; // URNs: urn:li:industry:4
    jobTitles?: string[]; // URNs: urn:li:title:100
    jobFunctions?: string[]; // URNs: urn:li:function:1
    companySizes?: string[]; // URNs: urn:li:organizationSize:B
    companies?: string[]; // URNs: urn:li:organization:1234
    seniorities?: string[]; // URNs: urn:li:seniority:1
    skills?: string[]; // URNs: urn:li:skill:1
    degrees?: string[]; // URNs: urn:li:degree:100
    fieldsOfStudy?: string[]; // URNs: urn:li:fieldOfStudy:100
    interests?: string[]; // URNs for member interests
  };
  excludedTargetingFacets?: {
    // Same structure as included, for negative targeting
  };
}

/**
 * Transform unified targeting to LinkedIn targeting format
 */
export function transformToLinkedInTargeting(
  unified: UnifiedTargeting
): LinkedInTargeting {
  const targeting: LinkedInTargeting = {
    includedTargetingFacets: {},
  };

  // Age targeting (LinkedIn uses age range URNs)
  if (unified.ageMin !== undefined && unified.ageMax !== undefined) {
    targeting.includedTargetingFacets.ageRanges = [
      getLinkedInAgeRangeUrn(unified.ageMin, unified.ageMax),
    ];
  }

  // Gender targeting
  if (unified.genders && unified.genders.length > 0 && !unified.genders.includes('all')) {
    targeting.includedTargetingFacets.genders = unified.genders.map(gender => {
      return `urn:li:gender:${gender.toUpperCase()}`;
    });
  }

  // Location targeting
  if (unified.locations && unified.locations.length > 0) {
    targeting.includedTargetingFacets.locations = unified.locations
      .map(loc => getLinkedInLocationUrn(loc))
      .filter((urn): urn is string => urn !== null);
  }

  // Interest targeting (limited on LinkedIn compared to other platforms)
  if (unified.interests && unified.interests.length > 0) {
    targeting.includedTargetingFacets.interests = unified.interests
      .map(interest => {
        const interestUrn = getInterestId(interest, 'linkedin');
        return typeof interestUrn === 'string' ? interestUrn : null;
      })
      .filter((urn): urn is string => urn !== null);
  }

  // LinkedIn-specific targeting
  if (unified.linkedin) {
    // Job titles
    if (unified.linkedin.jobTitles && unified.linkedin.jobTitles.length > 0) {
      targeting.includedTargetingFacets.jobTitles = unified.linkedin.jobTitles.map(
        title => `urn:li:title:${title}`
      );
    }

    // Job functions
    if (unified.linkedin.jobFunctions && unified.linkedin.jobFunctions.length > 0) {
      targeting.includedTargetingFacets.jobFunctions = unified.linkedin.jobFunctions.map(
        func => `urn:li:function:${func}`
      );
    }

    // Companies
    if (unified.linkedin.companies && unified.linkedin.companies.length > 0) {
      targeting.includedTargetingFacets.companies = unified.linkedin.companies.map(
        company => `urn:li:organization:${company}`
      );
    }

    // Company sizes
    if (unified.linkedin.companySize && unified.linkedin.companySize.length > 0) {
      targeting.includedTargetingFacets.companySizes = unified.linkedin.companySize.map(
        size => getLinkedInCompanySizeUrn(size)
      );
    }

    // Industries
    if (unified.linkedin.industries && unified.linkedin.industries.length > 0) {
      targeting.includedTargetingFacets.industries = unified.linkedin.industries.map(
        industry => `urn:li:industry:${industry}`
      );
    }

    // Seniority levels
    if (unified.linkedin.seniority && unified.linkedin.seniority.length > 0) {
      targeting.includedTargetingFacets.seniorities = unified.linkedin.seniority.map(
        level => getLinkedInSeniorityUrn(level)
      );
    }

    // Skills
    if (unified.linkedin.skills && unified.linkedin.skills.length > 0) {
      targeting.includedTargetingFacets.skills = unified.linkedin.skills.map(
        skill => `urn:li:skill:${skill}`
      );
    }

    // Degrees
    if (unified.linkedin.degrees && unified.linkedin.degrees.length > 0) {
      targeting.includedTargetingFacets.degrees = unified.linkedin.degrees.map(
        degree => `urn:li:degree:${degree}`
      );
    }

    // Fields of study
    if (unified.linkedin.fieldsOfStudy && unified.linkedin.fieldsOfStudy.length > 0) {
      targeting.includedTargetingFacets.fieldsOfStudy = unified.linkedin.fieldsOfStudy.map(
        field => `urn:li:fieldOfStudy:${field}`
      );
    }
  }

  return targeting;
}

/**
 * Convert age range to LinkedIn age range URN
 */
function getLinkedInAgeRangeUrn(ageMin: number, ageMax: number): string {
  // LinkedIn age ranges are predefined
  if (ageMin >= 18 && ageMax <= 24) return 'urn:li:ageRange:(18,24)';
  if (ageMin >= 25 && ageMax <= 34) return 'urn:li:ageRange:(25,34)';
  if (ageMin >= 35 && ageMax <= 54) return 'urn:li:ageRange:(35,54)';
  if (ageMin >= 55) return 'urn:li:ageRange:(55,2147483647)';

  // Default to broadest range that fits
  if (ageMin < 25) return 'urn:li:ageRange:(18,24)';
  if (ageMin < 35) return 'urn:li:ageRange:(25,34)';
  if (ageMin < 55) return 'urn:li:ageRange:(35,54)';
  return 'urn:li:ageRange:(55,2147483647)';
}

/**
 * Convert company size to LinkedIn URN
 */
function getLinkedInCompanySizeUrn(size: string): string {
  const sizeMap: Record<string, string> = {
    'self-employed': 'urn:li:organizationSize:A', // 1 employee
    '1-10': 'urn:li:organizationSize:B', // 1-10 employees
    '11-50': 'urn:li:organizationSize:C', // 11-50 employees
    '51-200': 'urn:li:organizationSize:D', // 51-200 employees
    '201-500': 'urn:li:organizationSize:E', // 201-500 employees
    '501-1000': 'urn:li:organizationSize:F', // 501-1000 employees
    '1001-5000': 'urn:li:organizationSize:G', // 1001-5000 employees
    '5001-10000': 'urn:li:organizationSize:H', // 5001-10000 employees
    '10001+': 'urn:li:organizationSize:I', // 10001+ employees
  };
  return sizeMap[size] || 'urn:li:organizationSize:C'; // Default to 11-50
}

/**
 * Convert seniority level to LinkedIn URN
 */
function getLinkedInSeniorityUrn(level: string): string {
  const seniorityMap: Record<string, string> = {
    'unpaid': 'urn:li:seniority:1',
    'training': 'urn:li:seniority:2',
    'entry': 'urn:li:seniority:3',
    'senior': 'urn:li:seniority:4',
    'manager': 'urn:li:seniority:5',
    'director': 'urn:li:seniority:6',
    'vp': 'urn:li:seniority:7',
    'cxo': 'urn:li:seniority:8',
    'partner': 'urn:li:seniority:9',
    'owner': 'urn:li:seniority:10',
  };
  return seniorityMap[level.toLowerCase()] || 'urn:li:seniority:3'; // Default to entry
}

/**
 * Validate LinkedIn targeting
 */
export function validateLinkedInTargeting(targeting: LinkedInTargeting): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Must have at least one location
  if (
    !targeting.includedTargetingFacets.locations ||
    targeting.includedTargetingFacets.locations.length === 0
  ) {
    errors.push('At least one location is required');
  }

  // LinkedIn requires at least one professional targeting facet
  const hasProfessionalTargeting =
    (targeting.includedTargetingFacets.jobTitles?.length ?? 0) > 0 ||
    (targeting.includedTargetingFacets.jobFunctions?.length ?? 0) > 0 ||
    (targeting.includedTargetingFacets.companies?.length ?? 0) > 0 ||
    (targeting.includedTargetingFacets.industries?.length ?? 0) > 0 ||
    (targeting.includedTargetingFacets.seniorities?.length ?? 0) > 0;

  if (!hasProfessionalTargeting) {
    errors.push(
      'LinkedIn requires at least one professional targeting facet (job title, function, company, industry, or seniority)'
    );
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Get LinkedIn targeting suggestions based on campaign objective
 */
export function getLinkedInTargetingSuggestions(objective: string): string[] {
  const suggestions: Record<string, string[]> = {
    leads: [
      'Consider targeting decision-makers (Director, VP, CXO seniority)',
      'Use job functions relevant to your product (e.g., Marketing, IT, Finance)',
      'Target companies of specific sizes that match your ideal customer',
    ],
    awareness: [
      'Broaden your targeting to include multiple seniority levels',
      'Consider industry-wide targeting rather than specific companies',
      'Include both managers and individual contributors',
    ],
    conversions: [
      'Target specific job titles that align with buying power',
      'Focus on decision-maker seniorities (Manager and above)',
      'Consider targeting specific companies in your TAM',
    ],
  };

  return suggestions[objective] || suggestions.leads;
}
