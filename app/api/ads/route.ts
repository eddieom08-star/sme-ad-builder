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
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();

    // Validate request body
    const validationResult = createAdRequestSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const data = validationResult.data;

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

    return NextResponse.json({
      adId: ad.id,
      status: ad.status,
      createdAt: ad.createdAt,
    });
  } catch (error) {
    console.error('Error creating ad:', error);
    return NextResponse.json(
      { error: 'Failed to create ad' },
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
