import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { campaigns, businesses } from '@/lib/db/schema';
import { createCampaignRequestSchema } from '@/lib/validations/campaign-schema';
import { eq } from 'drizzle-orm';

export async function POST(req: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      console.error('[API /campaigns POST] Unauthorized - no userId');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    console.log('[API /campaigns POST] Request body:', JSON.stringify(body, null, 2));

    // Validate request body
    const validationResult = createCampaignRequestSchema.safeParse(body);

    if (!validationResult.success) {
      console.error('[API /campaigns POST] Validation failed:', validationResult.error.errors);
      return NextResponse.json(
        { error: 'Invalid request', details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    // Check if DATABASE_URL is set
    if (!process.env.DATABASE_URL || process.env.DATABASE_URL.includes('dummy')) {
      console.warn('[API /campaigns POST] DATABASE_URL not configured, using mock response');

      // Return mock success response for development
      const mockCampaignId = Math.floor(Math.random() * 10000);
      return NextResponse.json({
        campaignId: mockCampaignId,
        status: data.status,
        createdAt: new Date().toISOString(),
        message: 'Campaign created successfully (mock mode - database not configured)',
      });
    }

    // Get user's business (assuming first business for now)
    // In production, you'd determine which business based on context
    const userBusinesses = await db
      .select()
      .from(businesses)
      .limit(1);

    let businessId: number;

    if (userBusinesses.length === 0) {
      console.log('[API /campaigns POST] No business found, creating default business');
      // Create a default business if none exists
      const [newBusiness] = await db
        .insert(businesses)
        .values({
          name: 'My Business',
          industry: 'General',
          ownerId: 1, // This should map to Clerk user eventually
        })
        .returning();

      businessId = newBusiness.id;
    } else {
      businessId = userBusinesses[0].id;
    }

    console.log('[API /campaigns POST] Creating campaign for businessId:', businessId);

    // Create campaign
    const [campaign] = await db
      .insert(campaigns)
      .values({
        businessId,
        userId: 1, // This should map to Clerk user eventually
        name: data.name,
        description: data.description || '',
        platforms: data.platforms,
        budget: data.budget,
        spent: '0',
        status: data.status,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        targeting: data.targeting,
      })
      .returning();

    console.log('[API /campaigns POST] Campaign created successfully:', campaign.id);

    return NextResponse.json({
      campaignId: campaign.id,
      status: campaign.status,
      createdAt: campaign.createdAt,
    });
  } catch (error) {
    console.error('[API /campaigns POST] Error creating campaign:', error);
    console.error('[API /campaigns POST] Error stack:', error instanceof Error ? error.stack : 'No stack');
    console.error('[API /campaigns POST] Error message:', error instanceof Error ? error.message : String(error));

    return NextResponse.json(
      {
        error: 'Failed to create campaign',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all campaigns
    const allCampaigns = await db
      .select()
      .from(campaigns)
      .orderBy(campaigns.createdAt);

    return NextResponse.json({ campaigns: allCampaigns });
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    return NextResponse.json(
      { error: 'Failed to fetch campaigns' },
      { status: 500 }
    );
  }
}
