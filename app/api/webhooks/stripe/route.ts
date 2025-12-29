import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { processDeposit } from "@/lib/services/wallet.service";
import Stripe from "stripe";

/**
 * POST /api/webhooks/stripe - Handle Stripe webhook events
 */
export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 }
    );
  }

  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    console.error("STRIPE_WEBHOOK_SECRET is not set");
    return NextResponse.json(
      { error: "Webhook secret not configured" },
      { status: 500 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (error: any) {
    console.error("Webhook signature verification failed:", error.message);
    return NextResponse.json(
      { error: `Webhook Error: ${error.message}` },
      { status: 400 }
    );
  }

  // Handle the event
  try {
    switch (event.type) {
      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentIntentSucceeded(paymentIntent);
        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentIntentFailed(paymentIntent);
        break;
      }

      case "charge.refunded": {
        const charge = event.data.object as Stripe.Charge;
        await handleChargeRefunded(charge);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error(`Error processing webhook ${event.type}:`, error);
    return NextResponse.json(
      { error: `Webhook handler failed: ${error.message}` },
      { status: 500 }
    );
  }
}

/**
 * Handle successful payment intent
 */
async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  const metadata = paymentIntent.metadata;

  if (metadata.type !== "deposit") {
    console.log("Payment intent is not a deposit, skipping");
    return;
  }

  const walletId = parseInt(metadata.walletId);
  const businessId = parseInt(metadata.businessId);
  const amount = (paymentIntent.amount / 100).toFixed(2); // Convert from pence to pounds

  console.log(`Processing deposit: £${amount} for wallet ${walletId}`);

  await processDeposit(walletId, businessId, amount, paymentIntent);

  console.log(`Deposit processed successfully for wallet ${walletId}`);
}

/**
 * Handle failed payment intent
 */
async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
  console.error("Payment intent failed:", {
    id: paymentIntent.id,
    amount: paymentIntent.amount,
    lastError: paymentIntent.last_payment_error,
  });

  // TODO: Create billing alert for failed payment
  // This would notify the user that their payment failed
}

/**
 * Handle charge refunded
 */
async function handleChargeRefunded(charge: Stripe.Charge) {
  console.log("Charge refunded:", {
    id: charge.id,
    amount: charge.amount,
    refunded: charge.amount_refunded,
  });

  // TODO: Process refund and add balance back to wallet
  // This would create a "refund" transaction and update wallet balance
}
