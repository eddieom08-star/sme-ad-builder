/**
 * Facebook Campaign Distributor
 *
 * Orchestrates the creation of Facebook/Instagram campaigns using unified campaign data.
 * Handles the conversion from our app's format to Facebook's API requirements.
 */

import { UnifiedCampaignData, PlatformCampaignResult } from '@/lib/types/unified-targeting';
import { FacebookApiClient } from '../platforms/facebook/api-client';

export interface FacebookCredentials {
  accessToken: string;
  adAccountId: string;
  pageId?: string; // Optional Facebook Page ID
}

export class FacebookCampaignDistributor {
  /**
   * Distribute campaign to Facebook/Instagram
   */
  async distribute(
    campaignData: UnifiedCampaignData,
    credentials: FacebookCredentials
  ): Promise<PlatformCampaignResult> {
    try {
      // Validate credentials
      if (!credentials.accessToken || !credentials.adAccountId) {
        throw new Error('Facebook access token and ad account ID are required');
      }

      // Create Facebook API client
      const client = new FacebookApiClient(
        credentials.accessToken,
        credentials.adAccountId
      );

      // Create the complete campaign
      console.log('[FacebookDistributor] Creating campaign:', campaignData.name);
      const result = await client.createCampaign(campaignData);

      console.log('[FacebookDistributor] Campaign created successfully:', {
        campaignId: result.campaign.id,
        adSetId: result.adSet.id,
        adId: result.ad.id,
      });

      // Return success result
      return {
        platform: 'facebook',
        success: true,
        campaignId: result.campaign.id,
        adSetId: result.adSet.id,
        adId: result.ad.id,
      };
    } catch (error) {
      console.error('[FacebookDistributor] Error creating campaign:', error);

      // Return failure result
      return {
        platform: 'facebook',
        success: false,
        error: {
          code: error instanceof Error ? error.name : 'UNKNOWN_ERROR',
          message: error instanceof Error ? error.message : 'Unknown error occurred',
          details: error,
        },
      };
    }
  }

  /**
   * Activate a paused Facebook campaign
   */
  async activateCampaign(
    campaignId: string,
    credentials: FacebookCredentials
  ): Promise<void> {
    const client = new FacebookApiClient(
      credentials.accessToken,
      credentials.adAccountId
    );

    await client.updateCampaignStatus(campaignId, 'ACTIVE');
    console.log('[FacebookDistributor] Campaign activated:', campaignId);
  }

  /**
   * Pause an active Facebook campaign
   */
  async pauseCampaign(
    campaignId: string,
    credentials: FacebookCredentials
  ): Promise<void> {
    const client = new FacebookApiClient(
      credentials.accessToken,
      credentials.adAccountId
    );

    await client.updateCampaignStatus(campaignId, 'PAUSED');
    console.log('[FacebookDistributor] Campaign paused:', campaignId);
  }

  /**
   * Get campaign performance insights
   */
  async getCampaignInsights(
    campaignId: string,
    credentials: FacebookCredentials
  ): Promise<any> {
    const client = new FacebookApiClient(
      credentials.accessToken,
      credentials.adAccountId
    );

    const insights = await client.getCampaignInsights(campaignId);
    console.log('[FacebookDistributor] Campaign insights:', insights);

    return insights;
  }

  /**
   * Validate campaign data before distribution
   */
  validateCampaignData(campaignData: UnifiedCampaignData): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    // Validate basic fields
    if (!campaignData.name || campaignData.name.trim().length === 0) {
      errors.push('Campaign name is required');
    }

    if (!campaignData.objective) {
      errors.push('Campaign objective is required');
    }

    // Validate budget
    if (!campaignData.budget || campaignData.budget.amount <= 0) {
      errors.push('Valid budget amount is required');
    }

    const minBudget = campaignData.budget?.type === 'daily' ? 1 : 10;
    if (campaignData.budget && campaignData.budget.amount < minBudget) {
      errors.push(`Minimum ${campaignData.budget.type} budget is $${minBudget}`);
    }

    // Validate dates
    if (!campaignData.schedule?.startDate || !campaignData.schedule?.endDate) {
      errors.push('Start and end dates are required');
    }

    const startDate = new Date(campaignData.schedule?.startDate || '');
    const endDate = new Date(campaignData.schedule?.endDate || '');

    if (startDate >= endDate) {
      errors.push('End date must be after start date');
    }

    // Validate targeting
    if (!campaignData.targeting) {
      errors.push('Targeting is required');
    }

    if (!campaignData.targeting?.locations || campaignData.targeting.locations.length === 0) {
      errors.push('At least one location is required');
    }

    if (campaignData.targeting?.ageMin !== undefined && campaignData.targeting.ageMin < 13) {
      errors.push('Minimum age must be at least 13');
    }

    if (campaignData.targeting?.ageMax !== undefined && campaignData.targeting.ageMax > 65) {
      errors.push('Maximum age cannot exceed 65');
    }

    // Validate creative
    if (!campaignData.creative) {
      errors.push('Ad creative is required');
    }

    if (!campaignData.creative?.headline || campaignData.creative.headline.trim().length === 0) {
      errors.push('Ad headline is required');
    }

    if (!campaignData.creative?.primaryText || campaignData.creative.primaryText.trim().length === 0) {
      errors.push('Ad primary text is required');
    }

    if (!campaignData.creative?.destinationUrl) {
      errors.push('Destination URL is required');
    }

    if (!campaignData.creative?.media || campaignData.creative.media.length === 0) {
      errors.push('At least one media item is required');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}

/**
 * Singleton instance for easy access
 */
export const facebookCampaignDistributor = new FacebookCampaignDistributor();
