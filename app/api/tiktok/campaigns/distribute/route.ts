/**
 * TikTok Campaign Distribution API Route
 *
 * Endpoint for distributing campaigns to TikTok using the TikTok Marketing API.
 * This route handles the conversion from our app's unified format to TikTok's API.
 */

import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { tiktokCampaignDistributor } from '@/lib/services/tiktok-campaign-distributor';
import { UnifiedCampaignData } from '@/lib/types/unified-targeting';

export async function POST(req: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      console.error('[API /tiktok/campaigns/distribute] Unauthorized - no userId');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    console.log('[API /tiktok/campaigns/distribute] Request from user:', userId);

    // Extract campaign data and credentials from request
    const {
      campaignData,
      credentials,
    }: {
      campaignData: UnifiedCampaignData;
      credentials: {
        accessToken: string;
        advertiserId: string;
        appId?: string;
        appSecret?: string;
      };
    } = body;

    // Validate request body
    if (!campaignData) {
      return NextResponse.json(
        { error: 'Campaign data is required' },
        { status: 400 }
      );
    }

    if (!credentials || !credentials.accessToken || !credentials.advertiserId) {
      return NextResponse.json(
        { error: 'TikTok credentials (accessToken and advertiserId) are required' },
        { status: 400 }
      );
    }

    // Validate campaign data
    const validation = tiktokCampaignDistributor.validateCampaignData(campaignData);
    if (!validation.valid) {
      console.error('[API /tiktok/campaigns/distribute] Validation failed:', validation.errors);
      return NextResponse.json(
        {
          error: 'Invalid campaign data',
          details: validation.errors,
        },
        { status: 400 }
      );
    }

    console.log('[API /tiktok/campaigns/distribute] Distributing campaign:', campaignData.name);

    // Distribute campaign to TikTok
    const result = await tiktokCampaignDistributor.distribute(campaignData, credentials);

    if (result.success) {
      console.log('[API /tiktok/campaigns/distribute] Campaign distributed successfully:', {
        campaignId: result.campaignId,
        adGroupId: result.adGroupId,
        adId: result.adId,
      });

      return NextResponse.json({
        success: true,
        platform: 'tiktok',
        campaignId: result.campaignId,
        adGroupId: result.adGroupId,
        adId: result.adId,
        message: 'Campaign created successfully on TikTok',
      });
    } else {
      console.error('[API /tiktok/campaigns/distribute] Campaign distribution failed:', result.error);

      return NextResponse.json(
        {
          success: false,
          platform: 'tiktok',
          error: result.error?.message || 'Failed to create campaign',
          details: result.error?.details,
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('[API /tiktok/campaigns/distribute] Unexpected error:', error);

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
 * GET endpoint to check TikTok connection status
 */
export async function GET(req: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // TODO: Check if user has connected their TikTok account
    // For now, return a placeholder response
    return NextResponse.json({
      connected: false,
      message: 'TikTok account not connected. Please connect your account first.',
    });
  } catch (error) {
    console.error('[API /tiktok/campaigns/distribute GET] Error:', error);

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
