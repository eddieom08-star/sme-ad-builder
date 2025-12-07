/**
 * TikTok Marketing API Client
 *
 * Handles communication with TikTok Marketing API for campaign creation and management.
 * TikTok uses a 3-level structure: Campaign → Ad Group → Ad
 *
 * API Documentation: https://business-api.tiktok.com/portal/docs
 */

import { UnifiedCampaignData } from '@/lib/types/unified-targeting';
import { transformToTikTokTargeting, TikTokTargeting } from './targeting-transformer';
import { getTikTokObjective } from '../mappings/objective-mappings';

export interface TikTokCredentials {
  accessToken: string;
  advertiserId: string; // TikTok advertiser account ID
  appId?: string; // TikTok app ID (for OAuth)
  appSecret?: string; // TikTok app secret (for OAuth)
}

export interface TikTokCampaignResponse {
  code: number;
  message: string;
  request_id: string;
  data: {
    campaign_id: string;
  };
}

export interface TikTokAdGroupResponse {
  code: number;
  message: string;
  request_id: string;
  data: {
    adgroup_id: string;
  };
}

export interface TikTokAdResponse {
  code: number;
  message: string;
  request_id: string;
  data: {
    ad_id: string;
  };
}

export interface TikTokVideoUploadResponse {
  code: number;
  message: string;
  request_id: string;
  data: {
    video_id: string;
  };
}

export interface TikTokImageUploadResponse {
  code: number;
  message: string;
  request_id: string;
  data: {
    image_id: string;
  };
}

/**
 * TikTok Marketing API Client
 * Uses TikTok Marketing API v1.3
 */
export class TikTokApiClient {
  private baseUrl = 'https://business-api.tiktok.com/open_api/v1.3';
  private credentials: TikTokCredentials;

  constructor(credentials: TikTokCredentials) {
    this.credentials = credentials;
  }

  /**
   * Create a complete TikTok ad campaign
   */
  async createCampaign(campaignData: UnifiedCampaignData): Promise<{
    campaign: TikTokCampaignResponse;
    adGroup: TikTokAdGroupResponse;
    ad: TikTokAdResponse;
  }> {
    console.log('[TikTokApiClient] Creating campaign:', campaignData.name);

    // Step 1: Upload media assets (video or image)
    let videoId: string | undefined;
    let imageIds: string[] | undefined;

    const primaryMedia = campaignData.creative.media?.[0];

    if (primaryMedia?.type === 'video') {
      const videoUpload = await this.uploadVideo(primaryMedia.url);
      videoId = videoUpload.data.video_id;
      console.log('[TikTokApiClient] Video uploaded:', videoId);
    } else if (primaryMedia?.type === 'image') {
      const imageUpload = await this.uploadImage(primaryMedia.url);
      imageIds = [imageUpload.data.image_id];
      console.log('[TikTokApiClient] Image uploaded:', imageIds[0]);
    }

    // Step 2: Create Campaign
    const campaign = await this.createTikTokCampaign(campaignData);
    console.log('[TikTokApiClient] Campaign created:', campaign.data.campaign_id);

    // Step 3: Create Ad Group with targeting
    const adGroup = await this.createAdGroup(campaign, campaignData);
    console.log('[TikTokApiClient] Ad Group created:', adGroup.data.adgroup_id);

    // Step 4: Create Ad with creative
    const ad = await this.createAd(adGroup, campaignData, videoId, imageIds);
    console.log('[TikTokApiClient] Ad created:', ad.data.ad_id);

    return { campaign, adGroup, ad };
  }

  /**
   * Step 1a: Upload video to TikTok
   */
  private async uploadVideo(videoUrl: string): Promise<TikTokVideoUploadResponse> {
    // For production, you would:
    // 1. Download video from URL
    // 2. Upload to TikTok using multipart/form-data
    // 3. Return video_id

    console.log('[TikTokApiClient] Uploading video from:', videoUrl);

    // Note: TikTok requires actual video file upload via multipart/form-data
    // This is a simplified example - real implementation would handle binary upload
    const response = await this.makeRequest('/file/video/ad/upload/', {
      advertiser_id: this.credentials.advertiserId,
      upload_type: 'UPLOAD_BY_URL',
      video_url: videoUrl,
    });

    return response;
  }

  /**
   * Step 1b: Upload image to TikTok
   */
  private async uploadImage(imageUrl: string): Promise<TikTokImageUploadResponse> {
    console.log('[TikTokApiClient] Uploading image from:', imageUrl);

    // Note: TikTok requires actual image file upload via multipart/form-data
    const response = await this.makeRequest('/file/image/ad/upload/', {
      advertiser_id: this.credentials.advertiserId,
      upload_type: 'UPLOAD_BY_URL',
      image_url: imageUrl,
    });

    return response;
  }

  /**
   * Step 2: Create the campaign
   */
  private async createTikTokCampaign(
    campaignData: UnifiedCampaignData
  ): Promise<TikTokCampaignResponse> {
    const objective = getTikTokObjective(campaignData.objective);

    // Convert budget amount to cents (TikTok uses minor currency units)
    const budgetInCents = Math.round(campaignData.budget.amount * 100);

    const requestBody = {
      advertiser_id: this.credentials.advertiserId,
      campaign_name: campaignData.name,
      objective_type: objective,
      budget_mode: campaignData.budget.type === 'daily'
        ? 'BUDGET_MODE_DAY'
        : 'BUDGET_MODE_TOTAL',
      budget: budgetInCents,
      // TikTok requires campaign to be created in paused state for review
      operation_status: 'DISABLE',
    };

    const response = await this.makeRequest('/campaign/create/', requestBody);

    if (response.code !== 0) {
      throw new Error(`TikTok Campaign creation failed: ${response.message}`);
    }

    return response;
  }

  /**
   * Step 3: Create ad group with targeting
   */
  private async createAdGroup(
    campaign: TikTokCampaignResponse,
    campaignData: UnifiedCampaignData
  ): Promise<TikTokAdGroupResponse> {
    const targeting = transformToTikTokTargeting(campaignData.targeting);

    // Convert budget and bid to cents
    const budgetInCents = Math.round(campaignData.budget.amount * 100);
    const bidInCents = campaignData.bidding?.bidCap
      ? Math.round(campaignData.bidding.bidCap * 100)
      : undefined;

    // Convert dates to Unix timestamps
    const scheduleStartTime = new Date(campaignData.schedule.startDate).getTime() / 1000;
    const scheduleEndTime = new Date(campaignData.schedule.endDate).getTime() / 1000;

    const requestBody = {
      advertiser_id: this.credentials.advertiserId,
      campaign_id: campaign.data.campaign_id,
      adgroup_name: `${campaignData.name} - Ad Group`,

      // Placement
      placement_type: 'PLACEMENT_TYPE_AUTOMATIC',
      placements: ['PLACEMENT_TIKTOK'], // Can also include PLACEMENT_PANGLE

      // Targeting
      location_ids: targeting.location_ids,
      age_groups: targeting.age_groups,
      gender: targeting.gender,
      languages: targeting.languages,
      interest_category_ids: targeting.interest_category_ids,

      // TikTok-specific targeting
      operating_systems: targeting.operating_systems,
      network_types: targeting.network_types,
      device_model_ids: targeting.device_model_ids,

      // Budget & Schedule
      budget_mode: campaignData.budget.type === 'daily'
        ? 'BUDGET_MODE_DAY'
        : 'BUDGET_MODE_TOTAL',
      budget: budgetInCents,
      schedule_type: 'SCHEDULE_START_END',
      schedule_start_time: scheduleStartTime.toString(),
      schedule_end_time: scheduleEndTime.toString(),

      // Bidding
      billing_event: this.getBillingEvent(campaignData.objective),
      bid_type: bidInCents ? 'BID_TYPE_CUSTOM' : 'BID_TYPE_NO_BID',
      bid: bidInCents,

      // Optimization
      optimization_goal: this.getOptimizationGoal(campaignData.objective),

      // Status
      operation_status: 'DISABLE', // Start paused
    };

    const response = await this.makeRequest('/adgroup/create/', requestBody);

    if (response.code !== 0) {
      throw new Error(`TikTok Ad Group creation failed: ${response.message}`);
    }

    return response;
  }

  /**
   * Step 4: Create ad with creative
   */
  private async createAd(
    adGroup: TikTokAdGroupResponse,
    campaignData: UnifiedCampaignData,
    videoId?: string,
    imageIds?: string[]
  ): Promise<TikTokAdResponse> {
    const creative = campaignData.creative;

    const requestBody = {
      advertiser_id: this.credentials.advertiserId,
      adgroup_id: adGroup.data.adgroup_id,
      ad_name: `${campaignData.name} - Ad`,
      ad_format: videoId ? 'SINGLE_VIDEO' : 'SINGLE_IMAGE',
      ad_text: creative.description || creative.headline,

      // Creative assets
      video_id: videoId,
      image_ids: imageIds,

      // Call to action
      call_to_action: this.mapCallToAction(creative.callToAction),
      landing_page_url: creative.destinationUrl,

      // Display name
      display_name: 'Your Brand',

      // Identity (optional - for TikTok page promotion)
      identity_type: 'CUSTOMIZED_USER',
      identity_id: this.credentials.advertiserId,

      // Status
      operation_status: 'DISABLE', // Start paused
    };

    const response = await this.makeRequest('/ad/create/', requestBody);

    if (response.code !== 0) {
      throw new Error(`TikTok Ad creation failed: ${response.message}`);
    }

    return response;
  }

  /**
   * Get billing event based on campaign objective
   */
  private getBillingEvent(objective: string): string {
    const billingMap: Record<string, string> = {
      'awareness': 'CPM', // Cost per thousand impressions
      'traffic': 'CPC', // Cost per click
      'conversions': 'OCPC', // Optimized cost per click
      'leads': 'OCPC',
    };
    return billingMap[objective] || 'CPC';
  }

  /**
   * Get optimization goal based on campaign objective
   */
  private getOptimizationGoal(objective: string): string {
    const goalMap: Record<string, string> = {
      'awareness': 'REACH',
      'traffic': 'CLICK',
      'conversions': 'CONVERT',
      'leads': 'LEAD_GENERATION',
    };
    return goalMap[objective] || 'CLICK';
  }

  /**
   * Map unified call to action to TikTok CTA
   */
  private mapCallToAction(cta?: string): string {
    if (!cta) return 'LEARN_MORE';

    const ctaMap: Record<string, string> = {
      'LEARN_MORE': 'LEARN_MORE',
      'SHOP_NOW': 'SHOP_NOW',
      'SIGN_UP': 'SIGN_UP',
      'DOWNLOAD': 'DOWNLOAD',
      'BOOK_NOW': 'BOOK_NOW',
      'CONTACT_US': 'CONTACT_US',
      'APPLY_NOW': 'APPLY_NOW',
      'WATCH_MORE': 'WATCH_MORE',
    };

    return ctaMap[cta.toUpperCase()] || 'LEARN_MORE';
  }

  /**
   * Make request to TikTok Marketing API
   */
  private async makeRequest(endpoint: string, body: any): Promise<any> {
    const url = `${this.baseUrl}${endpoint}`;

    console.log('[TikTokApiClient] Request to:', endpoint);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Access-Token': this.credentials.accessToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('[TikTokApiClient] HTTP Error:', error);
      throw new Error(`TikTok API request failed: ${response.statusText}`);
    }

    const result = await response.json();

    // TikTok returns code: 0 for success, non-zero for errors
    if (result.code !== 0) {
      console.error('[TikTokApiClient] API Error:', result);
      throw new Error(result.message || 'TikTok API request failed');
    }

    return result;
  }

  /**
   * Test connection to TikTok Marketing API
   */
  async testConnection(): Promise<boolean> {
    try {
      // Test by fetching advertiser info
      const response = await fetch(
        `${this.baseUrl}/advertiser/info/?advertiser_ids=[${this.credentials.advertiserId}]`,
        {
          method: 'GET',
          headers: {
            'Access-Token': this.credentials.accessToken,
          },
        }
      );

      const result = await response.json();
      return result.code === 0;
    } catch (error) {
      console.error('[TikTokApiClient] Connection test failed:', error);
      return false;
    }
  }

  /**
   * Get available locations for targeting
   */
  async getLocations(): Promise<any> {
    const response = await fetch(`${this.baseUrl}/tool/region/`, {
      method: 'GET',
      headers: {
        'Access-Token': this.credentials.accessToken,
      },
    });

    return response.json();
  }

  /**
   * Get available interest categories
   */
  async getInterestCategories(): Promise<any> {
    const response = await fetch(
      `${this.baseUrl}/tool/interest_category/?advertiser_id=${this.credentials.advertiserId}&language=en`,
      {
        method: 'GET',
        headers: {
          'Access-Token': this.credentials.accessToken,
        },
      }
    );

    return response.json();
  }
}

/**
 * Helper function to create TikTok API client
 */
export function createTikTokClient(credentials: TikTokCredentials): TikTokApiClient {
  return new TikTokApiClient(credentials);
}
