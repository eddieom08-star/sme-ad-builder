import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createDepositIntent, getWalletByBusinessId } from "@/lib/services/wallet.service";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { MINIMUM_DEPOSIT_AMOUNT, MAXIMUM_DEPOSIT_AMOUNT } from "@/lib/stripe";

const depositSchema = z.object({
  amount: z.number()
    .min(MINIMUM_DEPOSIT_AMOUNT, `Minimum deposit is £${MINIMUM_DEPOSIT_AMOUNT / 100}`)
    .max(MAXIMUM_DEPOSIT_AMOUNT, `Maximum deposit is £${MAXIMUM_DEPOSIT_AMOUNT / 100}`),
  paymentMethodId: z.string().min(1, "Payment method is required"),
});

/**
 * POST /api/wallet/deposit - Create a deposit payment intent
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

    // Parse and validate request body
    const body = await request.json();
    const validation = depositSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid request", details: validation.error.issues },
        { status: 400 }
      );
    }

    const { amount, paymentMethodId } = validation.data;

    // Create payment intent
    const paymentIntent = await createDepositIntent({
      walletId: wallet.id,
      businessId: user.businessId,
      amount,
      paymentMethodId,
      description: `Deposit £${(amount / 100).toFixed(2)} to wallet`,
    });

    return NextResponse.json({
      paymentIntent: {
        id: paymentIntent.id,
        clientSecret: paymentIntent.client_secret,
        status: paymentIntent.status,
        amount: paymentIntent.amount,
      },
    });
  } catch (error: any) {
    console.error("Error creating deposit:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create deposit" },
      { status: 500 }
    );
  }
}
