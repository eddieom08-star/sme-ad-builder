import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const body = await req.json();

        // Validate required fields
        if (!body.adgroup_id || !body.creatives) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Mock TikTok API call
        // In production, this would make a request to https://business-api.tiktok.com/open_api/v1.3/ad/create/
        console.log('Creating TikTok ad:', body);

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        return NextResponse.json({
            code: 0,
            message: "OK",
            data: {
                ad_id: `tiktok_ad_${Date.now()}`,
                adgroup_id: body.adgroup_id,
                creatives: body.creatives,
                create_time: new Date().toISOString()
            }
        });
    } catch (error) {
        console.error('TikTok ad creation error:', error);
        return NextResponse.json(
            { error: 'Failed to create ad' },
            { status: 500 }
        );
    }
}
