import { db } from "@/lib/db";
import { wallets, transactions, billingAlerts, campaigns } from "@/lib/db/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import { stripe, STRIPE_CURRENCY } from "@/lib/stripe";
import type Stripe from "stripe";

// ============================================================================
// WALLET OPERATIONS
// ============================================================================

export interface CreateWalletParams {
  businessId: number;
  currency?: string;
  lowBalanceThreshold?: string;
}

export interface DepositParams {
  walletId: number;
  businessId: number;
  amount: number; // in smallest currency unit (pence, cents)
  paymentMethodId: string;
  description?: string;
}

export interface SpendParams {
  walletId: number;
  businessId: number;
  amount: string;
  referenceType: "campaign" | "ad";
  referenceId: number;
  description: string;
  metadata?: Record<string, any>;
}

/**
 * Create a new wallet for a business
 */
export async function createWallet(params: CreateWalletParams) {
  const [wallet] = await db.insert(wallets).values({
    businessId: params.businessId,
    currency: params.currency || "GBP",
    lowBalanceThreshold: params.lowBalanceThreshold || "100.00",
    balance: "0.00",
    totalDeposited: "0.00",
    totalSpent: "0.00",
    status: "active",
  }).returning();

  return wallet;
}

/**
 * Get wallet by business ID
 */
export async function getWalletByBusinessId(businessId: number) {
  const [wallet] = await db
    .select()
    .from(wallets)
    .where(eq(wallets.businessId, businessId))
    .limit(1);

  return wallet;
}

/**
 * Get or create wallet for a business
 */
export async function getOrCreateWallet(businessId: number) {
  let wallet = await getWalletByBusinessId(businessId);

  if (!wallet) {
    wallet = await createWallet({ businessId });
  }

  return wallet;
}

/**
 * Create a payment intent for depositing funds
 */
export async function createDepositIntent(params: DepositParams): Promise<Stripe.PaymentIntent> {
  // Validate wallet
  const [wallet] = await db
    .select()
    .from(wallets)
    .where(and(
      eq(wallets.id, params.walletId),
      eq(wallets.businessId, params.businessId),
      eq(wallets.status, "active")
    ))
    .limit(1);

  if (!wallet) {
    throw new Error("Wallet not found or inactive");
  }

  // Create payment intent
  const paymentIntent = await stripe.paymentIntents.create({
    amount: params.amount,
    currency: STRIPE_CURRENCY,
    payment_method: params.paymentMethodId,
    confirm: true,
    automatic_payment_methods: {
      enabled: true,
      allow_redirects: "never",
    },
    metadata: {
      walletId: params.walletId.toString(),
      businessId: params.businessId.toString(),
      type: "deposit",
    },
    description: params.description || `Wallet deposit for business ${params.businessId}`,
  });

  return paymentIntent;
}

/**
 * Process a successful deposit (called after payment confirmation)
 */
export async function processDeposit(
  walletId: number,
  businessId: number,
  amount: string,
  paymentIntent: Stripe.PaymentIntent
) {
  return await db.transaction(async (tx) => {
    // Get current wallet
    const [wallet] = await tx
      .select()
      .from(wallets)
      .where(and(
        eq(wallets.id, walletId),
        eq(wallets.businessId, businessId)
      ))
      .limit(1);

    if (!wallet) {
      throw new Error("Wallet not found");
    }

    const balanceBefore = wallet.balance;
    const newBalance = (parseFloat(balanceBefore) + parseFloat(amount)).toFixed(2);
    const newTotalDeposited = (parseFloat(wallet.totalDeposited) + parseFloat(amount)).toFixed(2);

    // Update wallet
    const [updatedWallet] = await tx
      .update(wallets)
      .set({
        balance: newBalance,
        totalDeposited: newTotalDeposited,
        updatedAt: new Date(),
      })
      .where(eq(wallets.id, walletId))
      .returning();

    // Create transaction record
    const [transaction] = await tx
      .insert(transactions)
      .values({
        walletId,
        businessId,
        type: "deposit" as const,
        amount,
        balanceBefore,
        balanceAfter: newBalance,
        paymentMethod: "stripe",
        stripePaymentIntentId: paymentIntent.id,
        stripeChargeId: paymentIntent.latest_charge as string,
        description: `Deposit via Stripe`,
        status: "completed" as const,
        completedAt: new Date(),
        metadata: {
          receiptUrl: undefined,
        },
      })
      .returning();

    return { wallet: updatedWallet, transaction };
  });
}

/**
 * Record ad spend and deduct from wallet balance
 */
export async function recordSpend(params: SpendParams) {
  return await db.transaction(async (tx) => {
    // Get current wallet with lock
    const [wallet] = await tx
      .select()
      .from(wallets)
      .where(and(
        eq(wallets.id, params.walletId),
        eq(wallets.businessId, params.businessId),
        eq(wallets.status, "active")
      ))
      .limit(1);

    if (!wallet) {
      throw new Error("Wallet not found or inactive");
    }

    const currentBalance = parseFloat(wallet.balance);
    const spendAmount = parseFloat(params.amount);

    // Check if sufficient balance
    if (currentBalance < spendAmount) {
      // Create critical alert
      await createBillingAlert({
        businessId: params.businessId,
        walletId: params.walletId,
        type: "spend_limit_reached",
        severity: "critical",
        message: `Insufficient balance. Required: £${spendAmount.toFixed(2)}, Available: £${currentBalance.toFixed(2)}`,
        currentBalance: wallet.balance,
      });

      throw new Error("Insufficient wallet balance");
    }

    const balanceBefore = wallet.balance;
    const newBalance = (currentBalance - spendAmount).toFixed(2);
    const newTotalSpent = (parseFloat(wallet.totalSpent) + spendAmount).toFixed(2);

    // Update wallet
    const [updatedWallet] = await tx
      .update(wallets)
      .set({
        balance: newBalance,
        totalSpent: newTotalSpent,
        updatedAt: new Date(),
      })
      .where(eq(wallets.id, params.walletId))
      .returning();

    // Create transaction record
    const [transaction] = await tx
      .insert(transactions)
      .values({
        walletId: params.walletId,
        businessId: params.businessId,
        type: "spend" as const,
        amount: params.amount,
        balanceBefore,
        balanceAfter: newBalance,
        referenceType: params.referenceType,
        referenceId: params.referenceId,
        description: params.description,
        status: "completed" as const,
        completedAt: new Date(),
        metadata: params.metadata as any,
      })
      .returning();

    // Check if balance is below threshold
    const threshold = parseFloat(wallet.lowBalanceThreshold || "100");
    if (parseFloat(newBalance) < threshold) {
      await createBillingAlert({
        businessId: params.businessId,
        walletId: params.walletId,
        type: "low_balance",
        severity: "warning",
        message: `Wallet balance (£${newBalance}) is below threshold (£${threshold.toFixed(2)})`,
        currentBalance: newBalance,
        threshold: threshold.toFixed(2),
      });
    }

    return { wallet: updatedWallet, transaction };
  });
}

/**
 * Get transaction history for a wallet
 */
export async function getTransactionHistory(
  walletId: number,
  businessId: number,
  options: { limit?: number; offset?: number } = {}
) {
  const { limit = 50, offset = 0 } = options;

  const transactionList = await db
    .select()
    .from(transactions)
    .where(and(
      eq(transactions.walletId, walletId),
      eq(transactions.businessId, businessId)
    ))
    .orderBy(desc(transactions.createdAt))
    .limit(limit)
    .offset(offset);

  return transactionList;
}

/**
 * Get spending by campaign
 */
export async function getSpendingByCampaign(businessId: number, campaignId: number) {
  const result = await db
    .select({
      totalSpend: sql<string>`COALESCE(SUM(${transactions.amount}), 0)`,
      transactionCount: sql<number>`COUNT(*)`,
    })
    .from(transactions)
    .where(and(
      eq(transactions.businessId, businessId),
      eq(transactions.type, "spend"),
      eq(transactions.referenceType, "campaign"),
      eq(transactions.referenceId, campaignId),
      eq(transactions.status, "completed")
    ));

  return result[0] || { totalSpend: "0", transactionCount: 0 };
}

/**
 * Create a billing alert
 */
export async function createBillingAlert(params: {
  businessId: number;
  walletId: number;
  type: "low_balance" | "auto_reload_failed" | "spend_limit_reached" | "campaign_paused";
  severity: "info" | "warning" | "critical";
  message: string;
  currentBalance?: string;
  threshold?: string;
}) {
  const [alert] = await db
    .insert(billingAlerts)
    .values({
      ...params,
      acknowledged: false,
    })
    .returning();

  return alert;
}

/**
 * Get unacknowledged alerts for a business
 */
export async function getUnacknowledgedAlerts(businessId: number) {
  const alerts = await db
    .select()
    .from(billingAlerts)
    .where(and(
      eq(billingAlerts.businessId, businessId),
      eq(billingAlerts.acknowledged, false)
    ))
    .orderBy(desc(billingAlerts.createdAt));

  return alerts;
}

/**
 * Acknowledge a billing alert
 */
export async function acknowledgeBillingAlert(alertId: number, userId: number) {
  const [alert] = await db
    .update(billingAlerts)
    .set({
      acknowledged: true,
      acknowledgedAt: new Date(),
      acknowledgedBy: userId,
    })
    .where(eq(billingAlerts.id, alertId))
    .returning();

  return alert;
}

/**
 * Check if campaign should be paused due to low balance
 */
export async function shouldPauseCampaign(campaignId: number): Promise<boolean> {
  const [campaign] = await db
    .select({
      businessId: campaigns.businessId,
      budget: campaigns.budget,
      spent: campaigns.spent,
    })
    .from(campaigns)
    .where(eq(campaigns.id, campaignId))
    .limit(1);

  if (!campaign) {
    return false;
  }

  const wallet = await getWalletByBusinessId(campaign.businessId);

  if (!wallet || wallet.status !== "active") {
    return true;
  }

  // Pause if balance is less than 10% of remaining campaign budget
  const remainingBudget = parseFloat(campaign.budget) - parseFloat(campaign.spent);
  const minimumRequired = remainingBudget * 0.1;

  return parseFloat(wallet.balance) < minimumRequired;
}
