/**
 * Google Ads Campaign Distribution API Route
 *
 * Endpoint for distributing campaigns to Google Ads using the Google Ads API.
 * This route handles the conversion from our app's unified format to Google's API.
 */

import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { googleCampaignDistributor } from '@/lib/services/google-campaign-distributor';
import { UnifiedCampaignData } from '@/lib/types/unified-targeting';

export async function POST(req: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      console.error('[API /google/campaigns/distribute] Unauthorized - no userId');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    console.log('[API /google/campaigns/distribute] Request from user:', userId);

    // Extract campaign data and credentials from request
    const {
      campaignData,
      credentials,
    }: {
      campaignData: UnifiedCampaignData;
      credentials: {
        accessToken: string;
        customerId: string;
        developerToken: string;
        clientId?: string;
        clientSecret?: string;
        refreshToken?: string;
      };
    } = body;

    // Validate request body
    if (!campaignData) {
      return NextResponse.json(
        { error: 'Campaign data is required' },
        { status: 400 }
      );
    }

    if (!credentials || !credentials.accessToken || !credentials.customerId || !credentials.developerToken) {
      return NextResponse.json(
        { error: 'Google Ads credentials (accessToken, customerId, and developerToken) are required' },
        { status: 400 }
      );
    }

    // Validate campaign data
    const validation = googleCampaignDistributor.validateCampaignData(campaignData);
    if (!validation.valid) {
      console.error('[API /google/campaigns/distribute] Validation failed:', validation.errors);
      return NextResponse.json(
        {
          error: 'Invalid campaign data',
          details: validation.errors,
        },
        { status: 400 }
      );
    }

    console.log('[API /google/campaigns/distribute] Distributing campaign:', campaignData.name);

    // Distribute campaign to Google Ads
    const result = await googleCampaignDistributor.distribute(campaignData, credentials);

    if (result.success) {
      console.log('[API /google/campaigns/distribute] Campaign distributed successfully:', {
        campaignId: result.campaignId,
        adGroupId: result.adGroupId,
        adCount: result.adIds?.length,
      });

      return NextResponse.json({
        success: true,
        platform: 'google',
        campaignId: result.campaignId,
        adGroupId: result.adGroupId,
        adIds: result.adIds,
        message: 'Campaign created successfully on Google Ads',
      });
    } else {
      console.error('[API /google/campaigns/distribute] Campaign distribution failed:', result.error);

      return NextResponse.json(
        {
          success: false,
          platform: 'google',
          error: result.error?.message || 'Failed to create campaign',
          details: result.error?.details,
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('[API /google/campaigns/distribute] Unexpected error:', error);

    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint to check Google Ads connection status
 */
export async function GET(req: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // TODO: Check if user has connected their Google Ads account
    // For now, return a placeholder response
    return NextResponse.json({
      connected: false,
      message: 'Google Ads account not connected. Please connect your account first.',
    });
  } catch (error) {
    console.error('[API /google/campaigns/distribute GET] Error:', error);

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
