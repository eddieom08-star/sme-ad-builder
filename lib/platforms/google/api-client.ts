/**
 * Google Ads API Client
 *
 * Handles communication with Google Ads API for campaign creation and management.
 * Google Ads uses a different structure than Facebook:
 * Campaign → Ad Group → Keywords/Audiences → Ads
 *
 * API Documentation: https://developers.google.com/google-ads/api/docs/start
 */

import { UnifiedCampaignData } from '@/lib/types/unified-targeting';
import { transformToGoogleAdsTargeting, GoogleAdsTargeting } from './targeting-transformer';
import { getGoogleObjective } from '../mappings/objective-mappings';

export interface GoogleAdsCredentials {
  accessToken: string;
  customerId: string; // Google Ads customer ID (without hyphens)
  developerToken: string; // Your Google Ads API developer token
  clientId?: string; // OAuth client ID
  clientSecret?: string; // OAuth client secret
  refreshToken?: string; // OAuth refresh token
}

export interface GoogleAdsCampaignResponse {
  resourceName: string; // customers/123/campaigns/456
  id: string;
  name: string;
  status: string;
  advertisingChannelType: string;
}

export interface GoogleAdsAdGroupResponse {
  resourceName: string;
  id: string;
  name: string;
  status: string;
  campaign: string;
}

export interface GoogleAdsAdResponse {
  resourceName: string;
  id: string;
  status: string;
  adGroup: string;
  ad: {
    id: string;
    finalUrls: string[];
    responsiveSearchAd?: any;
    responsiveDisplayAd?: any;
  };
}

export interface GoogleAdsApiError {
  code: number;
  message: string;
  details?: any;
}

/**
 * Google Ads API Client
 * Uses Google Ads API v14 (latest stable version)
 */
export class GoogleAdsApiClient {
  private baseUrl = 'https://googleads.googleapis.com/v14';
  private credentials: GoogleAdsCredentials;

  constructor(credentials: GoogleAdsCredentials) {
    this.credentials = credentials;
  }

  /**
   * Create a complete Google Ads campaign
   */
  async createCampaign(campaignData: UnifiedCampaignData): Promise<{
    campaign: GoogleAdsCampaignResponse;
    adGroup: GoogleAdsAdGroupResponse;
    ads: GoogleAdsAdResponse[];
  }> {
    console.log('[GoogleAdsApiClient] Creating campaign:', campaignData.name);

    // Step 1: Create Campaign
    const campaign = await this.createGoogleCampaign(campaignData);
    console.log('[GoogleAdsApiClient] Campaign created:', campaign.id);

    // Step 2: Create Ad Group with targeting
    const adGroup = await this.createAdGroup(campaign, campaignData);
    console.log('[GoogleAdsApiClient] Ad Group created:', adGroup.id);

    // Step 3: Add targeting criteria to Ad Group
    await this.addTargetingCriteria(adGroup, campaignData);
    console.log('[GoogleAdsApiClient] Targeting criteria added');

    // Step 4: Create Ads (Google supports multiple ads per ad group)
    const ads = await this.createAds(adGroup, campaignData);
    console.log('[GoogleAdsApiClient] Ads created:', ads.length);

    return { campaign, adGroup, ads };
  }

  /**
   * Step 1: Create the campaign
   */
  private async createGoogleCampaign(
    campaignData: UnifiedCampaignData
  ): Promise<GoogleAdsCampaignResponse> {
    const objective = getGoogleObjective(campaignData.objective);

    // Determine advertising channel based on targeting
    const targeting = transformToGoogleAdsTargeting(campaignData.targeting);
    const channelType = this.getAdvertisingChannelType(targeting);

    const operation = {
      create: {
        name: campaignData.name,
        status: 'PAUSED', // Start paused for review
        advertisingChannelType: channelType,
        biddingStrategyType: this.getBiddingStrategy(campaignData),

        // Campaign budget
        campaignBudget: this.createCampaignBudget(campaignData),

        // Network settings
        networkSettings: {
          targetGoogleSearch: targeting.targetGoogleSearch ?? true,
          targetSearchNetwork: targeting.targetSearchNetwork ?? false,
          targetContentNetwork: targeting.targetContentNetwork ?? false,
          targetPartnerSearchNetwork: targeting.targetPartnerSearchNetwork ?? false,
        },

        // Campaign dates
        startDate: this.formatDate(campaignData.schedule.startDate),
        endDate: this.formatDate(campaignData.schedule.endDate),

        // Campaign-level settings
        geoTargetTypeSetting: {
          positiveGeoTargetType: 'PRESENCE_OR_INTEREST',
        },
      },
    };

    const response = await this.makeRequest('/customers/{customerId}/campaigns:mutate', {
      operations: [operation],
    });

    return response.results[0];
  }

  /**
   * Step 2: Create ad group
   */
  private async createAdGroup(
    campaign: GoogleAdsCampaignResponse,
    campaignData: UnifiedCampaignData
  ): Promise<GoogleAdsAdGroupResponse> {
    const operation = {
      create: {
        name: `${campaignData.name} - Ad Group`,
        campaign: campaign.resourceName,
        status: 'ENABLED',
        type: 'SEARCH_STANDARD', // Will vary based on campaign type

        // Ad group level bidding (if not using campaign-level auto-bidding)
        cpcBidMicros: campaignData.bidding?.bidCap
          ? campaignData.bidding.bidCap * 1_000_000 // Convert to micros
          : undefined,
      },
    };

    const response = await this.makeRequest('/customers/{customerId}/adGroups:mutate', {
      operations: [operation],
    });

    return response.results[0];
  }

  /**
   * Step 3: Add targeting criteria to ad group
   */
  private async addTargetingCriteria(
    adGroup: GoogleAdsAdGroupResponse,
    campaignData: UnifiedCampaignData
  ): Promise<void> {
    const targeting = transformToGoogleAdsTargeting(campaignData.targeting);
    const operations: any[] = [];

    // Location criteria
    if (targeting.locationIds && targeting.locationIds.length > 0) {
      targeting.locationIds.forEach(locationId => {
        operations.push({
          create: {
            adGroup: adGroup.resourceName,
            location: {
              geoTargetConstant: `geoTargetConstants/${locationId}`,
            },
          },
        });
      });
    }

    // Language criteria
    if (targeting.languageIds && targeting.languageIds.length > 0) {
      targeting.languageIds.forEach(languageId => {
        operations.push({
          create: {
            adGroup: adGroup.resourceName,
            language: {
              languageConstant: `languageConstants/${languageId}`,
            },
          },
        });
      });
    }

    // Age range criteria
    if (targeting.ageRanges && targeting.ageRanges.length > 0) {
      targeting.ageRanges.forEach(ageRange => {
        operations.push({
          create: {
            adGroup: adGroup.resourceName,
            ageRange: {
              type: ageRange,
            },
          },
        });
      });
    }

    // Gender criteria
    if (targeting.genders && targeting.genders.length > 0) {
      targeting.genders.forEach(gender => {
        operations.push({
          create: {
            adGroup: adGroup.resourceName,
            gender: {
              type: gender,
            },
          },
        });
      });
    }

    // Keyword criteria
    if (targeting.keywords && targeting.keywords.length > 0) {
      targeting.keywords.forEach(keyword => {
        operations.push({
          create: {
            adGroup: adGroup.resourceName,
            keyword: {
              text: keyword,
              matchType: 'BROAD', // Can be BROAD, PHRASE, or EXACT
            },
            status: 'ENABLED',
          },
        });
      });
    }

    // Audience criteria (affinity, in-market, custom)
    if (targeting.affinityAudiences && targeting.affinityAudiences.length > 0) {
      targeting.affinityAudiences.forEach(audienceId => {
        operations.push({
          create: {
            adGroup: adGroup.resourceName,
            userList: {
              userList: audienceId,
            },
          },
        });
      });
    }

    // Send all criteria in batch
    if (operations.length > 0) {
      await this.makeRequest('/customers/{customerId}/adGroupCriteria:mutate', {
        operations,
      });
    }
  }

  /**
   * Step 4: Create ads
   */
  private async createAds(
    adGroup: GoogleAdsAdGroupResponse,
    campaignData: UnifiedCampaignData
  ): Promise<GoogleAdsAdResponse[]> {
    const creative = campaignData.creative;
    const operations: any[] = [];

    // Create Responsive Search Ad (RSA)
    if (creative.headline && creative.description) {
      operations.push({
        create: {
          adGroup: adGroup.resourceName,
          status: 'ENABLED',
          ad: {
            finalUrls: creative.destinationUrl ? [creative.destinationUrl] : [],
            responsiveSearchAd: {
              headlines: [
                { text: creative.headline },
                { text: `${creative.headline} - Special Offer` },
                { text: `Limited Time: ${creative.headline}` },
              ],
              descriptions: [
                { text: creative.description },
                { text: `${creative.description.substring(0, 90)}` },
              ],
              path1: '',
              path2: '',
            },
          },
        },
      });
    }

    // Create Responsive Display Ad (if image is provided)
    const primaryImage = creative.media?.[0];
    if (primaryImage && primaryImage.type === 'image') {
      operations.push({
        create: {
          adGroup: adGroup.resourceName,
          status: 'ENABLED',
          ad: {
            finalUrls: creative.destinationUrl ? [creative.destinationUrl] : [],
            responsiveDisplayAd: {
              headlines: [
                { text: creative.headline || 'Your Ad Headline' },
              ],
              descriptions: [
                { text: creative.description || 'Your ad description' },
              ],
              longHeadline: { text: creative.headline || 'Your Long Headline' },
              marketingImages: [
                {
                  asset: await this.uploadImage(primaryImage.url),
                },
              ],
              squareMarketingImages: primaryImage.url ? [
                {
                  asset: await this.uploadImage(primaryImage.url),
                },
              ] : undefined,
              businessName: 'Your Business',
              callToAction: creative.callToAction || 'LEARN_MORE',
            },
          },
        },
      });
    }

    if (operations.length === 0) {
      throw new Error('No valid ad creative provided');
    }

    const response = await this.makeRequest('/customers/{customerId}/adGroupAds:mutate', {
      operations,
    });

    return response.results;
  }

  /**
   * Upload image asset to Google Ads
   */
  private async uploadImage(imageUrl: string): Promise<string> {
    // This would need to:
    // 1. Download the image from the URL
    // 2. Convert to bytes
    // 3. Create an Asset via Google Ads API
    // 4. Return the asset resource name

    // For now, return a placeholder
    // In production, implement proper image upload
    console.log('[GoogleAdsApiClient] Would upload image:', imageUrl);
    return 'customers/{customerId}/assets/placeholder';
  }

  /**
   * Create campaign budget resource
   */
  private createCampaignBudget(campaignData: UnifiedCampaignData): any {
    const budgetMicros = campaignData.budget.amount * 1_000_000; // Convert to micros

    return {
      name: `Budget for ${campaignData.name}`,
      amountMicros: budgetMicros,
      deliveryMethod: campaignData.budget.type === 'daily' ? 'STANDARD' : 'ACCELERATED',
      period: campaignData.budget.type === 'daily' ? 'DAILY' : 'CUSTOM_PERIOD',
    };
  }

  /**
   * Determine advertising channel type based on targeting
   */
  private getAdvertisingChannelType(targeting: GoogleAdsTargeting): string {
    // If keywords are specified, use Search
    if (targeting.keywords && targeting.keywords.length > 0) {
      return 'SEARCH';
    }

    // If placements or topics are specified, use Display
    if (targeting.placements || targeting.topics) {
      return 'DISPLAY';
    }

    // Default to Search
    return 'SEARCH';
  }

  /**
   * Get bidding strategy based on campaign objective
   */
  private getBiddingStrategy(campaignData: UnifiedCampaignData): string {
    if (campaignData.bidding?.strategy) {
      return campaignData.bidding.strategy;
    }

    // Default strategies based on objective
    const strategyMap: Record<string, string> = {
      'awareness': 'MAXIMIZE_CONVERSIONS',
      'traffic': 'MAXIMIZE_CLICKS',
      'conversions': 'TARGET_CPA',
      'leads': 'TARGET_CPA',
    };

    return strategyMap[campaignData.objective] || 'MAXIMIZE_CLICKS';
  }

  /**
   * Format date for Google Ads API (YYYY-MM-DD)
   */
  private formatDate(date: string): string {
    return new Date(date).toISOString().split('T')[0];
  }

  /**
   * Make request to Google Ads API
   */
  private async makeRequest(endpoint: string, body: any): Promise<any> {
    const url = `${this.baseUrl}${endpoint.replace('{customerId}', this.credentials.customerId)}`;

    console.log('[GoogleAdsApiClient] Request to:', endpoint);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.credentials.accessToken}`,
        'developer-token': this.credentials.developerToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('[GoogleAdsApiClient] API Error:', error);
      throw new Error(error.error?.message || 'Google Ads API request failed');
    }

    return response.json();
  }

  /**
   * Test connection to Google Ads API
   */
  async testConnection(): Promise<boolean> {
    try {
      const response = await this.makeRequest('/customers/{customerId}', {});
      return !!response;
    } catch (error) {
      console.error('[GoogleAdsApiClient] Connection test failed:', error);
      return false;
    }
  }
}

/**
 * Helper function to create Google Ads API client
 */
export function createGoogleAdsClient(credentials: GoogleAdsCredentials): GoogleAdsApiClient {
  return new GoogleAdsApiClient(credentials);
}
