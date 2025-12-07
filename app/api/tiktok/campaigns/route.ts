import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const body = await req.json();

        // Validate required fields
        if (!body.campaign_name || !body.objective_type || !body.budget_mode || !body.budget) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Mock TikTok API call
        // In production, this would make a request to https://business-api.tiktok.com/open_api/v1.3/campaign/create/
        console.log('Creating TikTok campaign:', body);

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        return NextResponse.json({
            code: 0,
            message: "OK",
            data: {
                campaign_id: `tiktok_camp_${Date.now()}`,
                campaign_name: body.campaign_name,
                objective_type: body.objective_type,
                budget_mode: body.budget_mode,
                budget: body.budget,
                create_time: new Date().toISOString()
            }
        });
    } catch (error) {
        console.error('TikTok campaign creation error:', error);
        return NextResponse.json(
            { error: 'Failed to create campaign' },
            { status: 500 }
        );
    }
}
