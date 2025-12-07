import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const body = await req.json();

        // Validate required fields
        if (!body.campaign_id || !body.adgroup_name || !body.placement_type) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Mock TikTok API call
        // In production, this would make a request to https://business-api.tiktok.com/open_api/v1.3/adgroup/create/
        console.log('Creating TikTok adgroup:', body);

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        return NextResponse.json({
            code: 0,
            message: "OK",
            data: {
                adgroup_id: `tiktok_adgroup_${Date.now()}`,
                campaign_id: body.campaign_id,
                adgroup_name: body.adgroup_name,
                create_time: new Date().toISOString()
            }
        });
    } catch (error) {
        console.error('TikTok adgroup creation error:', error);
        return NextResponse.json(
            { error: 'Failed to create adgroup' },
            { status: 500 }
        );
    }
}
