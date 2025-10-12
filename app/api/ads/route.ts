import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { ads } from '@/lib/db/schema';
import { createAdRequestSchema } from '@/lib/validations/campaign-schema';
import { eq } from 'drizzle-orm';

export async function POST(req: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      console.error('[API /ads POST] Unauthorized - no userId');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    console.log('[API /ads POST] Request body:', JSON.stringify(body, null, 2));

    // Validate request body
    const validationResult = createAdRequestSchema.safeParse(body);

    if (!validationResult.success) {
      console.error('[API /ads POST] Validation failed:', validationResult.error.errors);
      return NextResponse.json(
        { error: 'Invalid request', details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    // Check if DATABASE_URL is set
    if (!process.env.DATABASE_URL || process.env.DATABASE_URL.includes('dummy')) {
      console.warn('[API /ads POST] DATABASE_URL not configured, using mock response');

      // Return mock success response for development
      const mockAdId = Math.floor(Math.random() * 10000);
      return NextResponse.json({
        adId: mockAdId,
        status: data.status,
        createdAt: new Date().toISOString(),
        message: 'Ad created successfully (mock mode - database not configured)',
      });
    }

    console.log('[API /ads POST] Creating ad for campaignId:', data.campaignId);

    // Create ad
    const [ad] = await db
      .insert(ads)
      .values({
        campaignId: data.campaignId,
        name: data.name,
        format: data.format,
        platform: data.platform,
        status: data.status,
        headline: data.headline,
        body: data.body,
        callToAction: data.callToAction,
        imageUrl: data.imageUrl,
        videoUrl: data.videoUrl,
        targetUrl: data.targetUrl,
        impressions: 0,
        clicks: 0,
        conversions: 0,
        spend: '0',
      })
      .returning();

    console.log('[API /ads POST] Ad created successfully:', ad.id);

    return NextResponse.json({
      adId: ad.id,
      status: ad.status,
      createdAt: ad.createdAt,
    });
  } catch (error) {
    console.error('[API /ads POST] Error creating ad:', error);
    console.error('[API /ads POST] Error stack:', error instanceof Error ? error.stack : 'No stack');
    console.error('[API /ads POST] Error message:', error instanceof Error ? error.message : String(error));

    return NextResponse.json(
      {
        error: 'Failed to create ad',
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

    const { searchParams } = new URL(req.url);
    const campaignId = searchParams.get('campaignId');

    if (campaignId) {
      // Get ads for specific campaign
      const campaignAds = await db
        .select()
        .from(ads)
        .where(eq(ads.campaignId, parseInt(campaignId)));

      return NextResponse.json({ ads: campaignAds });
    }

    // Get all ads
    const allAds = await db.select().from(ads).orderBy(ads.createdAt);

    return NextResponse.json({ ads: allAds });
  } catch (error) {
    console.error('Error fetching ads:', error);
    return NextResponse.json(
      { error: 'Failed to fetch ads' },
      { status: 500 }
    );
  }
}
