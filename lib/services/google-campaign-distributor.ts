/**
 * Google Ads Campaign Distributor
 *
 * Service for distributing campaigns to Google Ads.
 * Validates campaign data and coordinates with the Google Ads API client.
 */

import { UnifiedCampaignData } from '@/lib/types/unified-targeting';
import { GoogleAdsApiClient, GoogleAdsCredentials } from '../platforms/google/api-client';
import { transformToGoogleAdsTargeting, validateGoogleAdsTargeting } from '../platforms/google/targeting-transformer';

export interface PlatformCampaignResult {
  success: boolean;
  platform: 'google';
  campaignId?: string;
  adGroupId?: string;
  adIds?: string[];
  error?: {
    message: string;
    details?: any;
  };
}

/**
 * Google Ads Campaign Distributor
 */
export class GoogleCampaignDistributor {
  /**
   * Distribute campaign to Google Ads
   */
  async distribute(
    campaignData: UnifiedCampaignData,
    credentials: GoogleAdsCredentials
  ): Promise<PlatformCampaignResult> {
    try {
      console.log('[GoogleCampaignDistributor] Starting distribution for:', campaignData.name);

      // Validate campaign data
      const validation = this.validateCampaignData(campaignData);
      if (!validation.valid) {
        console.error('[GoogleCampaignDistributor] Validation failed:', validation.errors);
        return {
          success: false,
          platform: 'google',
          error: {
            message: 'Campaign validation failed',
            details: validation.errors,
          },
        };
      }

      // Create API client
      const apiClient = new GoogleAdsApiClient(credentials);

      // Test connection first
      console.log('[GoogleCampaignDistributor] Testing Google Ads connection...');
      const connectionOk = await apiClient.testConnection();
      if (!connectionOk) {
        return {
          success: false,
          platform: 'google',
          error: {
            message: 'Failed to connect to Google Ads API. Check your credentials.',
          },
        };
      }

      // Create campaign
      console.log('[GoogleCampaignDistributor] Creating campaign on Google Ads...');
      const result = await apiClient.createCampaign(campaignData);

      console.log('[GoogleCampaignDistributor] Campaign created successfully:', {
        campaignId: result.campaign.id,
        adGroupId: result.adGroup.id,
        adCount: result.ads.length,
      });

      return {
        success: true,
        platform: 'google',
        campaignId: result.campaign.id,
        adGroupId: result.adGroup.id,
        adIds: result.ads.map(ad => ad.id),
      };
    } catch (error) {
      console.error('[GoogleCampaignDistributor] Distribution failed:', error);

      return {
        success: false,
        platform: 'google',
        error: {
          message: error instanceof Error ? error.message : 'Unknown error occurred',
          details: error,
        },
      };
    }
  }

  /**
   * Validate campaign data before distribution
   */
  validateCampaignData(campaignData: UnifiedCampaignData): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    // Validate campaign name
    if (!campaignData.name || campaignData.name.trim().length === 0) {
      errors.push('Campaign name is required');
    }

    // Validate budget
    if (!campaignData.budget || campaignData.budget.amount <= 0) {
      errors.push('Valid budget is required');
    }

    // Validate schedule
    if (!campaignData.schedule?.startDate || !campaignData.schedule?.endDate) {
      errors.push('Campaign schedule (start and end dates) is required');
    } else {
      const startDate = new Date(campaignData.schedule.startDate);
      const endDate = new Date(campaignData.schedule.endDate);

      if (startDate >= endDate) {
        errors.push('End date must be after start date');
      }

      // Google Ads requires campaigns to start at least 1 day in the future (for some campaign types)
      const now = new Date();
      const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      if (startDate < tomorrow) {
        // This is a warning, not a hard error
        console.warn('[GoogleCampaignDistributor] Campaign start date is very soon. Consider starting at least 1 day in the future.');
      }
    }

    // Validate creative
    if (!campaignData.creative) {
      errors.push('Creative content is required');
    } else {
      if (!campaignData.creative.headline || campaignData.creative.headline.length === 0) {
        errors.push('Ad headline is required');
      } else if (campaignData.creative.headline.length > 30) {
        errors.push('Ad headline must be 30 characters or less for Google Ads');
      }

      if (!campaignData.creative.description || campaignData.creative.description.length === 0) {
        errors.push('Ad description is required');
      } else if (campaignData.creative.description.length > 90) {
        errors.push('Ad description must be 90 characters or less for Google Ads');
      }

      if (!campaignData.creative.destinationUrl) {
        errors.push('Destination URL is required');
      } else {
        // Validate URL format
        try {
          new URL(campaignData.creative.destinationUrl);
        } catch {
          errors.push('Invalid destination URL format');
        }
      }
    }

    // Validate targeting
    if (!campaignData.targeting) {
      errors.push('Targeting parameters are required');
    } else {
      const googleTargeting = transformToGoogleAdsTargeting(campaignData.targeting);
      const targetingValidation = validateGoogleAdsTargeting(googleTargeting);

      if (!targetingValidation.valid) {
        errors.push(...targetingValidation.errors);
      }

      // Additional Google-specific validation
      if (!campaignData.targeting.locations || campaignData.targeting.locations.length === 0) {
        errors.push('At least one location is required for Google Ads');
      }

      // Validate age range
      if (campaignData.targeting.ageMin === undefined || campaignData.targeting.ageMax === undefined) {
        errors.push('Age range is required');
      } else if (campaignData.targeting.ageMin < 18) {
        // Google Ads has restrictions on targeting users under 18
        console.warn('[GoogleCampaignDistributor] Targeting users under 18 may have restrictions on Google Ads');
      }
    }

    // Validate objective
    const validObjectives = ['awareness', 'traffic', 'conversions', 'leads'];
    if (!validObjectives.includes(campaignData.objective)) {
      errors.push(`Invalid campaign objective. Must be one of: ${validObjectives.join(', ')}`);
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Get estimated reach for Google Ads campaign
   * (This would call Google Ads reach forecasting API)
   */
  async getEstimatedReach(
    campaignData: UnifiedCampaignData,
    credentials: GoogleAdsCredentials
  ): Promise<{
    minReach: number;
    maxReach: number;
    estimatedImpressions: number;
  }> {
    // TODO: Implement Google Ads Reach Forecast API call
    // For now, return placeholder data
    console.log('[GoogleCampaignDistributor] Reach estimation not yet implemented');

    return {
      minReach: 10000,
      maxReach: 50000,
      estimatedImpressions: 100000,
    };
  }

  /**
   * Preview how the campaign will look on Google Ads
   */
  previewCampaign(campaignData: UnifiedCampaignData): {
    searchAdPreview: string;
    displayAdPreview: string;
  } {
    const creative = campaignData.creative;
    const displayUrl = creative.destinationUrl ? new URL(creative.destinationUrl).hostname : 'example.com';
    const primaryImage = creative.media?.[0];

    return {
      searchAdPreview: `
Ad - ${displayUrl}
${creative.headline}
${creative.description}
${creative.destinationUrl}
      `.trim(),
      displayAdPreview: `
[Image: ${primaryImage?.url || 'No image'}]
${creative.headline}
${creative.description}
[Button: ${creative.callToAction || 'Learn More'}]
      `.trim(),
    };
  }
}

/**
 * Singleton instance
 */
export const googleCampaignDistributor = new GoogleCampaignDistributor();
