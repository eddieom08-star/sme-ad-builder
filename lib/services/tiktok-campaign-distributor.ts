/**
 * TikTok Campaign Distributor
 *
 * Service for distributing campaigns to TikTok.
 * Validates campaign data and coordinates with the TikTok Marketing API client.
 */

import { UnifiedCampaignData } from '@/lib/types/unified-targeting';
import { TikTokApiClient, TikTokCredentials } from '../platforms/tiktok/api-client';
import { transformToTikTokTargeting, validateTikTokTargeting } from '../platforms/tiktok/targeting-transformer';

export interface PlatformCampaignResult {
  success: boolean;
  platform: 'tiktok';
  campaignId?: string;
  adGroupId?: string;
  adId?: string;
  error?: {
    message: string;
    details?: any;
  };
}

/**
 * TikTok Campaign Distributor
 */
export class TikTokCampaignDistributor {
  /**
   * Distribute campaign to TikTok
   */
  async distribute(
    campaignData: UnifiedCampaignData,
    credentials: TikTokCredentials
  ): Promise<PlatformCampaignResult> {
    try {
      console.log('[TikTokCampaignDistributor] Starting distribution for:', campaignData.name);

      // Validate campaign data
      const validation = this.validateCampaignData(campaignData);
      if (!validation.valid) {
        console.error('[TikTokCampaignDistributor] Validation failed:', validation.errors);
        return {
          success: false,
          platform: 'tiktok',
          error: {
            message: 'Campaign validation failed',
            details: validation.errors,
          },
        };
      }

      // Create API client
      const apiClient = new TikTokApiClient(credentials);

      // Test connection first
      console.log('[TikTokCampaignDistributor] Testing TikTok connection...');
      const connectionOk = await apiClient.testConnection();
      if (!connectionOk) {
        return {
          success: false,
          platform: 'tiktok',
          error: {
            message: 'Failed to connect to TikTok Marketing API. Check your credentials.',
          },
        };
      }

      // Create campaign
      console.log('[TikTokCampaignDistributor] Creating campaign on TikTok...');
      const result = await apiClient.createCampaign(campaignData);

      console.log('[TikTokCampaignDistributor] Campaign created successfully:', {
        campaignId: result.campaign.data.campaign_id,
        adGroupId: result.adGroup.data.adgroup_id,
        adId: result.ad.data.ad_id,
      });

      return {
        success: true,
        platform: 'tiktok',
        campaignId: result.campaign.data.campaign_id,
        adGroupId: result.adGroup.data.adgroup_id,
        adId: result.ad.data.ad_id,
      };
    } catch (error) {
      console.error('[TikTokCampaignDistributor] Distribution failed:', error);

      return {
        success: false,
        platform: 'tiktok',
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

    // TikTok has minimum daily budget requirements (varies by country)
    if (campaignData.budget.type === 'daily' && campaignData.budget.amount < 20) {
      console.warn('[TikTokCampaignDistributor] Daily budget below $20 may not meet TikTok minimums');
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

      // TikTok requires campaigns to start in the future
      const now = new Date();
      if (startDate < now) {
        errors.push('Campaign start date must be in the future for TikTok');
      }
    }

    // Validate creative
    if (!campaignData.creative) {
      errors.push('Creative content is required');
    } else {
      // TikTok requires video or image
      const hasMedia = campaignData.creative.media && campaignData.creative.media.length > 0;
      if (!hasMedia) {
        errors.push('Either video or image is required for TikTok ads');
      }

      // TikTok ad text requirements
      if (!campaignData.creative.description && !campaignData.creative.headline) {
        errors.push('Ad text (description or headline) is required');
      } else {
        const adText = campaignData.creative.description || campaignData.creative.headline;
        if (adText.length > 100) {
          errors.push('Ad text must be 100 characters or less for TikTok');
        }
      }

      // Landing page URL required
      if (!campaignData.creative.destinationUrl) {
        errors.push('Landing page URL is required');
      } else {
        try {
          new URL(campaignData.creative.destinationUrl);
        } catch {
          errors.push('Invalid landing page URL format');
        }
      }

      // Video and image requirements validation
      const primaryMedia = campaignData.creative.media?.[0];
      if (primaryMedia?.type === 'video') {
        // TikTok video requirements:
        // - Duration: 5-60 seconds
        // - File size: 500KB - 500MB
        // - Format: MP4, MOV, MPEG, AVI, FLV, 3GP
        console.log('[TikTokCampaignDistributor] Ensure video meets TikTok requirements: 5-60s, 500KB-500MB, MP4/MOV/MPEG');
      } else if (primaryMedia?.type === 'image') {
        // TikTok image requirements:
        // - Format: JPG, PNG
        // - Size: Max 50MB
        // - Dimensions: 540x960 to 1080x1920 (9:16 ratio recommended)
        console.log('[TikTokCampaignDistributor] Ensure image meets TikTok requirements: JPG/PNG, max 50MB, 9:16 ratio');
      }
    }

    // Validate targeting
    if (!campaignData.targeting) {
      errors.push('Targeting parameters are required');
    } else {
      const tiktokTargeting = transformToTikTokTargeting(campaignData.targeting);
      const targetingValidation = validateTikTokTargeting(tiktokTargeting);

      if (!targetingValidation.valid) {
        errors.push(...targetingValidation.errors);
      }

      // TikTok-specific validation
      if (!campaignData.targeting.locations || campaignData.targeting.locations.length === 0) {
        errors.push('At least one location is required for TikTok');
      }

      // Age validation - TikTok minimum age is 13
      if (campaignData.targeting.ageMin !== undefined && campaignData.targeting.ageMin < 13) {
        errors.push('TikTok requires minimum age of 13 (COPPA compliance)');
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
   * Get estimated reach for TikTok campaign
   * (This would call TikTok's audience estimation API)
   */
  async getEstimatedReach(
    campaignData: UnifiedCampaignData,
    credentials: TikTokCredentials
  ): Promise<{
    minReach: number;
    maxReach: number;
    estimatedImpressions: number;
  }> {
    // TODO: Implement TikTok audience estimation API call
    // Endpoint: /tool/targeting_search/
    console.log('[TikTokCampaignDistributor] Reach estimation not yet implemented');

    return {
      minReach: 50000,
      maxReach: 200000,
      estimatedImpressions: 500000,
    };
  }

  /**
   * Preview how the campaign will look on TikTok
   */
  previewCampaign(campaignData: UnifiedCampaignData): {
    feedPreview: string;
    specifications: string;
  } {
    const creative = campaignData.creative;
    const primaryMedia = creative.media?.[0];
    const isVideo = primaryMedia?.type === 'video';
    const isImage = primaryMedia?.type === 'image';

    return {
      feedPreview: `
┌─────────────────────┐
│ [TikTok Logo]       │
│                     │
│  ${isVideo ? '[Video Player]' : '[Image Display]'}  │
│                     │
│  ❤️ 👍 💬 ↗️         │
│                     │
│  ${creative.description || creative.headline || 'Ad text'}
│                     │
│  [${creative.callToAction || 'Learn More'}] │
└─────────────────────┘
      `.trim(),
      specifications: `
Video: ${isVideo ? 'Yes' : 'No'}
Image: ${isImage ? 'Yes' : 'No'}
Ad Text: ${creative.description || creative.headline || 'N/A'} (${(creative.description || creative.headline || '').length}/100 chars)
CTA: ${creative.callToAction || 'Learn More'}
Landing URL: ${creative.destinationUrl || 'N/A'}

Recommended:
- Video: 9:16 aspect ratio, 5-60 seconds
- Image: 9:16 aspect ratio (1080x1920)
- File size: 500KB - 500MB
- Format: MP4, MOV (video) or JPG, PNG (image)
      `.trim(),
    };
  }

  /**
   * Get TikTok-specific campaign recommendations
   */
  getCampaignRecommendations(campaignData: UnifiedCampaignData): string[] {
    const recommendations: string[] = [];

    // Video recommendations
    const primaryMedia = campaignData.creative.media?.[0];
    if (!primaryMedia || primaryMedia.type !== 'video') {
      recommendations.push('💡 TikTok performs best with video content. Consider adding a video for better engagement.');
    }

    // Aspect ratio recommendation
    recommendations.push('📱 Use 9:16 vertical video/image format for optimal TikTok display');

    // Duration recommendation
    recommendations.push('⏱️ Keep videos between 9-15 seconds for best performance on TikTok');

    // Creative recommendations
    recommendations.push('🎵 Add trending music or sounds to increase engagement');
    recommendations.push('✨ Use native TikTok effects and transitions for authentic content');
    recommendations.push('📝 Include captions - 85% of TikTok users watch with sound off');

    // Targeting recommendations
    if (campaignData.targeting.ageMin && campaignData.targeting.ageMin > 35) {
      recommendations.push('👥 Note: TikTok\'s primary audience is 18-34. Consider this for your targeting.');
    }

    // Budget recommendations
    if (campaignData.budget.amount < 50) {
      recommendations.push('💰 Consider increasing budget to at least $50/day for better reach on TikTok');
    }

    return recommendations;
  }
}

/**
 * Singleton instance
 */
export const tiktokCampaignDistributor = new TikTokCampaignDistributor();
