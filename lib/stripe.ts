import Stripe from "stripe";

// Allow build/dev without Stripe key, but throw at runtime if used
const stripeSecretKey = process.env.STRIPE_SECRET_KEY || "sk_test_placeholder";

export const stripe = new Stripe(stripeSecretKey, {
  apiVersion: "2025-12-15.clover",
  typescript: true,
});

export const STRIPE_CURRENCY = "gbp";
export const MINIMUM_DEPOSIT_AMOUNT = 10_00; // £10.00 in pence
export const MAXIMUM_DEPOSIT_AMOUNT = 50000_00; // £50,000.00 in pence

export function requireStripeConfig() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY is not set in environment variables");
  }
}
