import { db } from "@/lib/db";
import { campaigns } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import {
  recordSpend,
  shouldPauseCampaign,
  getWalletByBusinessId,
  createBillingAlert,
} from "./wallet.service";

/**
 * Record ad spend for a campaign and check if it should be paused
 */
export async function recordCampaignSpend(params: {
  campaignId: number;
  adId?: number;
  platform: string;
  amount: string;
  description: string;
  metadata?: Record<string, any>;
}) {
  // Get campaign details
  const [campaign] = await db
    .select()
    .from(campaigns)
    .where(eq(campaigns.id, params.campaignId))
    .limit(1);

  if (!campaign) {
    throw new Error("Campaign not found");
  }

  // Get wallet
  const wallet = await getWalletByBusinessId(campaign.businessId);

  if (!wallet) {
    throw new Error("Wallet not found");
  }

  try {
    // Record spend in wallet
    const { transaction } = await recordSpend({
      walletId: wallet.id,
      businessId: campaign.businessId,
      amount: params.amount,
      referenceType: "campaign",
      referenceId: params.campaignId,
      description: params.description,
      metadata: {
        ...params.metadata,
        campaignName: campaign.name,
        platform: params.platform,
        adId: params.adId,
      },
    });

    // Update campaign spent amount
    const newSpent = (parseFloat(campaign.spent) + parseFloat(params.amount)).toFixed(2);
    await db
      .update(campaigns)
      .set({
        spent: newSpent,
        updatedAt: new Date(),
      })
      .where(eq(campaigns.id, params.campaignId));

    // Check if campaign should be paused
    const shouldPause = await shouldPauseCampaign(params.campaignId);

    if (shouldPause && campaign.status === "active") {
      await pauseCampaignDueToLowBalance(params.campaignId, campaign.businessId, wallet.id);
    }

    return { transaction, campaignPaused: shouldPause };
  } catch (error: any) {
    // If insufficient balance, pause campaign
    if (error.message.includes("Insufficient wallet balance")) {
      await pauseCampaignDueToLowBalance(params.campaignId, campaign.businessId, wallet.id);
    }
    throw error;
  }
}

/**
 * Pause a campaign due to insufficient balance
 */
export async function pauseCampaignDueToLowBalance(
  campaignId: number,
  businessId: number,
  walletId: number
) {
  // Get campaign
  const [campaign] = await db
    .select()
    .from(campaigns)
    .where(eq(campaigns.id, campaignId))
    .limit(1);

  if (!campaign) {
    return;
  }

  // Pause campaign
  await db
    .update(campaigns)
    .set({
      status: "paused",
      updatedAt: new Date(),
    })
    .where(eq(campaigns.id, campaignId));

  // Create alert
  await createBillingAlert({
    businessId,
    walletId,
    type: "campaign_paused",
    severity: "critical",
    message: `Campaign "${campaign.name}" has been paused due to insufficient wallet balance. Please add funds to resume.`,
  });

  console.log(`Campaign ${campaignId} paused due to low balance`);
}

/**
 * Check all active campaigns and pause if necessary
 */
export async function checkAllCampaignsBalance() {
  const activeCampaigns = await db
    .select()
    .from(campaigns)
    .where(eq(campaigns.status, "active"));

  const results = [];

  for (const campaign of activeCampaigns) {
    const shouldPause = await shouldPauseCampaign(campaign.id);

    if (shouldPause) {
      const wallet = await getWalletByBusinessId(campaign.businessId);
      if (wallet) {
        await pauseCampaignDueToLowBalance(campaign.id, campaign.businessId, wallet.id);
        results.push({ campaignId: campaign.id, paused: true });
      }
    }
  }

  return results;
}

/**
 * Check if campaign can be resumed based on wallet balance
 */
export async function canResumeCampaign(campaignId: number): Promise<boolean> {
  const [campaign] = await db
    .select()
    .from(campaigns)
    .where(eq(campaigns.id, campaignId))
    .limit(1);

  if (!campaign) {
    return false;
  }

  const wallet = await getWalletByBusinessId(campaign.businessId);

  if (!wallet || wallet.status !== "active") {
    return false;
  }

  // Require at least 20% of remaining budget or £100 minimum
  const remainingBudget = parseFloat(campaign.budget) - parseFloat(campaign.spent);
  const minimumRequired = Math.max(remainingBudget * 0.2, 100);

  return parseFloat(wallet.balance) >= minimumRequired;
}

/**
 * Estimate daily spend for a campaign
 */
export async function estimateDailySpend(campaignId: number): Promise<number> {
  const [campaign] = await db
    .select()
    .from(campaigns)
    .where(eq(campaigns.id, campaignId))
    .limit(1);

  if (!campaign) {
    return 0;
  }

  const startDate = new Date(campaign.startDate);
  const now = new Date();
  const daysRunning = Math.max(1, Math.ceil((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));

  const totalSpent = parseFloat(campaign.spent);
  const dailySpend = totalSpent / daysRunning;

  return dailySpend;
}

/**
 * Calculate how many days the wallet balance will last
 */
export async function calculateDaysRemaining(businessId: number): Promise<number | null> {
  const wallet = await getWalletByBusinessId(businessId);

  if (!wallet) {
    return null;
  }

  const activeCampaigns = await db
    .select()
    .from(campaigns)
    .where(and(
      eq(campaigns.businessId, businessId),
      eq(campaigns.status, "active")
    ));

  if (activeCampaigns.length === 0) {
    return null; // Infinite if no active campaigns
  }

  // Calculate total daily spend across all campaigns
  let totalDailySpend = 0;
  for (const campaign of activeCampaigns) {
    const dailySpend = await estimateDailySpend(campaign.id);
    totalDailySpend += dailySpend;
  }

  if (totalDailySpend === 0) {
    return null; // Not enough data
  }

  const balance = parseFloat(wallet.balance);
  const daysRemaining = balance / totalDailySpend;

  return Math.floor(daysRemaining);
}
