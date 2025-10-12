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
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();

    // Validate request body
    const validationResult = createCampaignRequestSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    // Get user's business (assuming first business for now)
    // In production, you'd determine which business based on context
    const userBusinesses = await db
      .select()
      .from(businesses)
      .limit(1);

    let businessId: number;

    if (userBusinesses.length === 0) {
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

    return NextResponse.json({
      campaignId: campaign.id,
      status: campaign.status,
      createdAt: campaign.createdAt,
    });
  } catch (error) {
    console.error('Error creating campaign:', error);
    return NextResponse.json(
      { error: 'Failed to create campaign' },
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
