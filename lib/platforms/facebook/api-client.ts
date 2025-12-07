/**
 * Facebook Marketing API Client
 *
 * Handles all interactions with the Facebook Marketing API for creating
 * and managing campaigns, ad sets, and ads.
 *
 * Documentation: https://developers.facebook.com/docs/marketing-api
 */

import { UnifiedCampaignData } from '@/lib/types/unified-targeting';
import { transformToFacebookTargeting, validateFacebookTargeting } from './targeting-transformer';
import { getFacebookObjective, getFacebookOptimizationGoal } from '../mappings/objective-mappings';

// Facebook Graph API version
const FB_API_VERSION = 'v18.0';
const FB_GRAPH_URL = `https://graph.facebook.com/${FB_API_VERSION}`;

export interface FacebookCampaignResponse {
  id: string;
  name: string;
  objective: string;
  status: string;
}

export interface FacebookAdSetResponse {
  id: string;
  name: string;
  campaign_id: string;
  status: string;
}

export interface FacebookAdResponse {
  id: string;
  name: string;
  adset_id: string;
  status: string;
}

export interface FacebookCreativeResponse {
  id: string;
  name: string;
}

export class FacebookApiClient {
  private accessToken: string;
  private adAccountId: string;

  constructor(accessToken: string, adAccountId: string) {
    this.accessToken = accessToken;
    // Ensure ad account ID has 'act_' prefix
    this.adAccountId = adAccountId.startsWith('act_') ? adAccountId : `act_${adAccountId}`;
  }

  /**
   * Create a complete Facebook campaign (Campaign + Ad Set + Ad Creative + Ad)
   */
  async createCampaign(campaignData: UnifiedCampaignData): Promise<{
    campaign: FacebookCampaignResponse;
    adSet: FacebookAdSetResponse;
    creative: FacebookCreativeResponse;
    ad: FacebookAdResponse;
  }> {
    // Step 1: Create Campaign
    const campaign = await this.createCampaignOnly(campaignData);

    // Step 2: Create Ad Set with targeting
    const adSet = await this.createAdSet(campaign.id, campaignData);

    // Step 3: Create Ad Creative
    const creative = await this.createAdCreative(campaignData);

    // Step 4: Create Ad linking creative to ad set
    const ad = await this.createAd(adSet.id, creative.id, campaignData);

    return { campaign, adSet, creative, ad };
  }

  /**
   * Create Facebook Campaign
   */
  private async createCampaignOnly(
    campaignData: UnifiedCampaignData
  ): Promise<FacebookCampaignResponse> {
    const objective = getFacebookObjective(campaignData.objective);

    const body = {
      name: campaignData.name,
      objective,
      status: 'PAUSED', // Start paused for safety
      special_ad_categories: [], // Required field
      access_token: this.accessToken,
    };

    const response = await fetch(`${FB_GRAPH_URL}/${this.adAccountId}/campaigns`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Facebook API Error: ${error.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    return {
      id: data.id,
      name: campaignData.name,
      objective,
      status: 'PAUSED',
    };
  }

  /**
   * Create Ad Set with targeting
   */
  private async createAdSet(
    campaignId: string,
    campaignData: UnifiedCampaignData
  ): Promise<FacebookAdSetResponse> {
    // Transform unified targeting to Facebook format
    const targeting = transformToFacebookTargeting(campaignData.targeting);

    // Validate targeting
    const validation = validateFacebookTargeting(targeting);
    if (!validation.valid) {
      throw new Error(`Invalid targeting: ${validation.errors.join(', ')}`);
    }

    // Get optimization goal based on objective
    const objective = getFacebookObjective(campaignData.objective);
    const optimizationGoal = getFacebookOptimizationGoal(objective);

    // Convert budget to cents (Facebook uses cents)
    const budgetInCents = Math.round(campaignData.budget.amount * 100);

    const body: Record<string, any> = {
      name: `${campaignData.name} - Ad Set`,
      campaign_id: campaignId,
      targeting,
      optimization_goal: optimizationGoal,
      billing_event: 'IMPRESSIONS',
      bid_strategy: campaignData.bidding?.strategy.toUpperCase() || 'LOWEST_COST_WITHOUT_CAP',
      status: 'PAUSED',
      start_time: new Date(campaignData.schedule.startDate).toISOString(),
      end_time: new Date(campaignData.schedule.endDate).toISOString(),
      access_token: this.accessToken,
    };

    // Add budget (daily or lifetime)
    if (campaignData.budget.type === 'daily') {
      body['daily_budget'] = budgetInCents;
    } else {
      body['lifetime_budget'] = budgetInCents;
    }

    // Add bid cap if specified
    if (campaignData.bidding?.bidCap) {
      body['bid_amount'] = Math.round(campaignData.bidding.bidCap * 100);
    }

    const response = await fetch(`${FB_GRAPH_URL}/${this.adAccountId}/adsets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Facebook API Error: ${error.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    return {
      id: data.id,
      name: body.name,
      campaign_id: campaignId,
      status: 'PAUSED',
    };
  }

  /**
   * Create Ad Creative
   */
  private async createAdCreative(
    campaignData: UnifiedCampaignData
  ): Promise<FacebookCreativeResponse> {
    const creative = campaignData.creative;

    // Get primary media (first image or video)
    const primaryMedia = creative.media[0];
    if (!primaryMedia) {
      throw new Error('At least one media item is required');
    }

    // Build creative object
    const objectStorySpec: any = {
      page_id: await this.getPageId(), // You'll need to get the Facebook Page ID
      link_data: {
        link: creative.destinationUrl,
        message: creative.primaryText,
        name: creative.headline,
        description: creative.description || '',
        call_to_action: {
          type: this.mapCallToAction(creative.callToAction),
          value: {
            link: creative.destinationUrl,
          },
        },
      },
    };

    // Add media based on type
    if (primaryMedia.type === 'image') {
      objectStorySpec.link_data.picture = primaryMedia.url;
    } else if (primaryMedia.type === 'video') {
      objectStorySpec.video_data = {
        video_id: primaryMedia.url, // This should be Facebook video ID
        message: creative.primaryText,
        title: creative.headline,
        call_to_action: {
          type: this.mapCallToAction(creative.callToAction),
          value: {
            link: creative.destinationUrl,
          },
        },
      };
      delete objectStorySpec.link_data;
    }

    const body = {
      name: `${campaignData.name} - Creative`,
      object_story_spec: objectStorySpec,
      access_token: this.accessToken,
    };

    const response = await fetch(`${FB_GRAPH_URL}/${this.adAccountId}/adcreatives`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Facebook API Error: ${error.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    return {
      id: data.id,
      name: body.name,
    };
  }

  /**
   * Create Ad
   */
  private async createAd(
    adSetId: string,
    creativeId: string,
    campaignData: UnifiedCampaignData
  ): Promise<FacebookAdResponse> {
    const body = {
      name: `${campaignData.name} - Ad`,
      adset_id: adSetId,
      creative: { creative_id: creativeId },
      status: 'PAUSED',
      access_token: this.accessToken,
    };

    const response = await fetch(`${FB_GRAPH_URL}/${this.adAccountId}/ads`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Facebook API Error: ${error.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    return {
      id: data.id,
      name: body.name,
      adset_id: adSetId,
      status: 'PAUSED',
    };
  }

  /**
   * Get Facebook Page ID for the ad account
   * In production, you'd fetch this from your database or Facebook API
   */
  private async getPageId(): Promise<string> {
    // TODO: Implement page ID retrieval
    // For now, return a placeholder
    // In production, you should:
    // 1. Store the page ID when user connects their Facebook account
    // 2. Or fetch it from Facebook API: /me/accounts
    return process.env.FACEBOOK_PAGE_ID || 'YOUR_PAGE_ID';
  }

  /**
   * Map unified CTA to Facebook CTA type
   */
  private mapCallToAction(cta: string): string {
    const ctaMap: Record<string, string> = {
      'Learn More': 'LEARN_MORE',
      'Shop Now': 'SHOP_NOW',
      'Sign Up': 'SIGN_UP',
      'Download': 'DOWNLOAD',
      'Contact Us': 'CONTACT_US',
      'Book Now': 'BOOK_TRAVEL',
      'Apply Now': 'APPLY_NOW',
      'Get Quote': 'GET_QUOTE',
    };
    return ctaMap[cta] || 'LEARN_MORE';
  }

  /**
   * Update campaign status (activate, pause, delete)
   */
  async updateCampaignStatus(campaignId: string, status: 'ACTIVE' | 'PAUSED' | 'DELETED'): Promise<void> {
    const response = await fetch(`${FB_GRAPH_URL}/${campaignId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status,
        access_token: this.accessToken,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Facebook API Error: ${error.error?.message || 'Unknown error'}`);
    }
  }

  /**
   * Get campaign insights/metrics
   */
  async getCampaignInsights(campaignId: string): Promise<any> {
    const fields = 'impressions,clicks,spend,reach,cpm,cpc,ctr';
    const response = await fetch(
      `${FB_GRAPH_URL}/${campaignId}/insights?fields=${fields}&access_token=${this.accessToken}`
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Facebook API Error: ${error.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    return data.data[0] || {};
  }
}
