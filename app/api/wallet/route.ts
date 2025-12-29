import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getOrCreateWallet, getWalletByBusinessId } from "@/lib/services/wallet.service";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

/**
 * GET /api/wallet - Get wallet for current user's business
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

    const wallet = await getOrCreateWallet(user.businessId);

    return NextResponse.json({ wallet });
  } catch (error) {
    console.error("Error fetching wallet:", error);
    return NextResponse.json(
      { error: "Failed to fetch wallet" },
      { status: 500 }
    );
  }
}
