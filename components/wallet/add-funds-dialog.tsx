"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";
import { formatCurrency, poundsToPence } from "@/lib/utils/currency";
import { loadStripe } from "@stripe/stripe-js";
import { CardElement, Elements, useStripe, useElements } from "@stripe/react-stripe-js";

const MINIMUM_DEPOSIT_AMOUNT = 10_00; // £10.00 in pence
const MAXIMUM_DEPOSIT_AMOUNT = 50000_00; // £50,000.00 in pence

const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
const stripePromise = stripePublishableKey ? loadStripe(stripePublishableKey) : null;

const QUICK_AMOUNTS = [50, 100, 250, 500, 1000];

interface AddFundsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currency: string;
  onSuccess?: () => void;
}

export function AddFundsDialog({ open, onOpenChange, currency, onSuccess }: AddFundsDialogProps) {
  if (!stripePromise) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add Funds to Wallet</DialogTitle>
            <DialogDescription>
              Payment processing is not configured. Please set NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY in your environment variables.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Funds to Wallet</DialogTitle>
          <DialogDescription>
            Choose an amount or enter a custom value. Minimum {formatCurrency(MINIMUM_DEPOSIT_AMOUNT / 100, currency)}.
          </DialogDescription>
        </DialogHeader>
        <Elements stripe={stripePromise}>
          <AddFundsForm currency={currency} onSuccess={() => {
            onSuccess?.();
            onOpenChange(false);
          }} />
        </Elements>
      </DialogContent>
    </Dialog>
  );
}

function AddFundsForm({ currency, onSuccess }: { currency: string; onSuccess: () => void }) {
  const [amount, setAmount] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const stripe = useStripe();
  const elements = useElements();

  const handleQuickAmount = (value: number) => {
    setAmount(value.toString());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    const numericAmount = parseFloat(amount);

    if (isNaN(numericAmount) || numericAmount < MINIMUM_DEPOSIT_AMOUNT / 100) {
      toast({
        title: "Invalid amount",
        description: `Minimum deposit is ${formatCurrency(MINIMUM_DEPOSIT_AMOUNT / 100, currency)}`,
        variant: "destructive",
      });
      return;
    }

    if (numericAmount > MAXIMUM_DEPOSIT_AMOUNT / 100) {
      toast({
        title: "Amount too large",
        description: `Maximum deposit is ${formatCurrency(MAXIMUM_DEPOSIT_AMOUNT / 100, currency)}`,
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const cardElement = elements.getElement(CardElement);

      if (!cardElement) {
        throw new Error("Card element not found");
      }

      // Create payment method
      const { error: pmError, paymentMethod } = await stripe.createPaymentMethod({
        type: "card",
        card: cardElement,
      });

      if (pmError) {
        throw new Error(pmError.message);
      }

      // Create deposit intent
      const response = await fetch("/api/wallet/deposit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: poundsToPence(numericAmount),
          paymentMethodId: paymentMethod.id,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to process payment");
      }

      const { paymentIntent } = await response.json();

      // Confirm payment if needed
      if (paymentIntent.status === "requires_action") {
        const { error: confirmError } = await stripe.confirmCardPayment(paymentIntent.clientSecret);
        if (confirmError) {
          throw new Error(confirmError.message);
        }
      }

      toast({
        title: "Funds added successfully",
        description: `${formatCurrency(numericAmount, currency)} has been added to your wallet`,
      });

      onSuccess();
    } catch (error: any) {
      toast({
        title: "Payment failed",
        description: error.message || "An error occurred while processing your payment",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Quick amount buttons */}
      <div className="space-y-2">
        <Label>Quick Select</Label>
        <div className="grid grid-cols-5 gap-2">
          {QUICK_AMOUNTS.map((quickAmount) => (
            <Button
              key={quickAmount}
              type="button"
              variant={amount === quickAmount.toString() ? "default" : "outline"}
              size="sm"
              onClick={() => handleQuickAmount(quickAmount)}
            >
              £{quickAmount}
            </Button>
          ))}
        </div>
      </div>

      {/* Custom amount input */}
      <div className="space-y-2">
        <Label htmlFor="amount">Custom Amount (£)</Label>
        <Input
          id="amount"
          type="number"
          min={MINIMUM_DEPOSIT_AMOUNT / 100}
          max={MAXIMUM_DEPOSIT_AMOUNT / 100}
          step="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Enter amount"
        />
      </div>

      {/* Card details */}
      <div className="space-y-2">
        <Label>Card Details</Label>
        <div className="border rounded-md p-3">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: "16px",
                  color: "#424770",
                  "::placeholder": {
                    color: "#aab7c4",
                  },
                },
                invalid: {
                  color: "#9e2146",
                },
              },
            }}
          />
        </div>
      </div>

      {/* Submit button */}
      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={() => onSuccess()} disabled={loading}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading || !stripe || !amount}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            `Add ${amount ? formatCurrency(parseFloat(amount), currency) : "Funds"}`
          )}
        </Button>
      </div>
    </form>
  );
}
