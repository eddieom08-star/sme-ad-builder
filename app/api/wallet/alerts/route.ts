import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getUnacknowledgedAlerts, acknowledgeBillingAlert } from "@/lib/services/wallet.service";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

/**
 * GET /api/wallet/alerts - Get unacknowledged alerts
 */
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get user with businessId
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, parseInt(userId)))
      .limit(1);

    if (!user || !user.businessId) {
      return NextResponse.json(
        { error: "Business not found" },
        { status: 404 }
      );
    }

    const alerts = await getUnacknowledgedAlerts(user.businessId);

    return NextResponse.json({ alerts });
  } catch (error) {
    console.error("Error fetching alerts:", error);
    return NextResponse.json(
      { error: "Failed to fetch alerts" },
      { status: 500 }
    );
  }
}

const acknowledgeSchema = z.object({
  alertId: z.number(),
});

/**
 * POST /api/wallet/alerts/acknowledge - Acknowledge an alert
 */
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get user
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, parseInt(userId)))
      .limit(1);

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validation = acknowledgeSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid request", details: validation.error.issues },
        { status: 400 }
      );
    }

    const { alertId } = validation.data;

    const alert = await acknowledgeBillingAlert(alertId, user.id);

    return NextResponse.json({ alert });
  } catch (error: any) {
    console.error("Error acknowledging alert:", error);
    return NextResponse.json(
      { error: error.message || "Failed to acknowledge alert" },
      { status: 500 }
    );
  }
}
