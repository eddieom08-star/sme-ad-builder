/**
 * Facebook Campaign Distribution API Route
 *
 * Endpoint for distributing campaigns to Facebook/Instagram using the Marketing API.
 * This route handles the conversion from our app's unified format to Facebook's API.
 */

import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { facebookCampaignDistributor } from '@/lib/services/facebook-campaign-distributor';
import { UnifiedCampaignData } from '@/lib/types/unified-targeting';

export async function POST(req: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      console.error('[API /facebook/campaigns/distribute] Unauthorized - no userId');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    console.log('[API /facebook/campaigns/distribute] Request from user:', userId);

    // Extract campaign data and credentials from request
    const {
      campaignData,
      credentials,
    }: {
      campaignData: UnifiedCampaignData;
      credentials: {
        accessToken: string;
        adAccountId: string;
        pageId?: string;
      };
    } = body;

    // Validate request body
    if (!campaignData) {
      return NextResponse.json(
        { error: 'Campaign data is required' },
        { status: 400 }
      );
    }

    if (!credentials || !credentials.accessToken || !credentials.adAccountId) {
      return NextResponse.json(
        { error: 'Facebook credentials (accessToken and adAccountId) are required' },
        { status: 400 }
      );
    }

    // Validate campaign data
    const validation = facebookCampaignDistributor.validateCampaignData(campaignData);
    if (!validation.valid) {
      console.error('[API /facebook/campaigns/distribute] Validation failed:', validation.errors);
      return NextResponse.json(
        {
          error: 'Invalid campaign data',
          details: validation.errors,
        },
        { status: 400 }
      );
    }

    console.log('[API /facebook/campaigns/distribute] Distributing campaign:', campaignData.name);

    // Distribute campaign to Facebook
    const result = await facebookCampaignDistributor.distribute(campaignData, credentials);

    if (result.success) {
      console.log('[API /facebook/campaigns/distribute] Campaign distributed successfully:', {
        campaignId: result.campaignId,
        adSetId: result.adSetId,
        adId: result.ad Id,
      });

      return NextResponse.json({
        success: true,
        platform: 'facebook',
        campaignId: result.campaignId,
        adSetId: result.adSetId,
        adId: result.adId,
        message: 'Campaign created successfully on Facebook',
      });
    } else {
      console.error('[API /facebook/campaigns/distribute] Campaign distribution failed:', result.error);

      return NextResponse.json(
        {
          success: false,
          platform: 'facebook',
          error: result.error?.message || 'Failed to create campaign',
          details: result.error?.details,
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('[API /facebook/campaigns/distribute] Unexpected error:', error);

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
 * GET endpoint to check Facebook connection status
 */
export async function GET(req: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // TODO: Check if user has connected their Facebook account
    // For now, return a placeholder response
    return NextResponse.json({
      connected: false,
      message: 'Facebook account not connected. Please connect your account first.',
    });
  } catch (error) {
    console.error('[API /facebook/campaigns/distribute GET] Error:', error);

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
