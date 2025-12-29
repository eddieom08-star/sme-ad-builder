import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getTransactionHistory, getWalletByBusinessId } from "@/lib/services/wallet.service";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

/**
 * GET /api/wallet/transactions - Get transaction history
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

    // Get wallet
    const wallet = await getWalletByBusinessId(user.businessId);

    if (!wallet) {
      return NextResponse.json(
        { error: "Wallet not found" },
        { status: 404 }
      );
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    const transactions = await getTransactionHistory(
      wallet.id,
      user.businessId,
      { limit, offset }
    );

    return NextResponse.json({ transactions });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return NextResponse.json(
      { error: "Failed to fetch transactions" },
      { status: 500 }
    );
  }
}
