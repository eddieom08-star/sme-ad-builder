"use client";

import { useState, useEffect } from "react";
import { WalletBalanceCard } from "@/components/wallet/wallet-balance-card";
import { AddFundsDialog } from "@/components/wallet/add-funds-dialog";
import { TransactionHistory } from "@/components/wallet/transaction-history";
import { BillingAlerts } from "@/components/wallet/billing-alerts";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";
import type { Wallet, Transaction, BillingAlert } from "@/lib/db/schema";

// Mock data for development when API is not available
const mockWallet: Wallet = {
  id: 1,
  businessId: 1,
  balance: "1250.00",
  totalDeposited: "2500.00",
  totalSpent: "1250.00",
  currency: "GBP",
  lowBalanceThreshold: "100.00",
  autoReloadEnabled: false,
  autoReloadAmount: null,
  autoReloadThreshold: null,
  status: "active",
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockTransactions: Transaction[] = [
  {
    id: 1,
    walletId: 1,
    businessId: 1,
    type: "deposit",
    amount: "500.00",
    balanceBefore: "750.00",
    balanceAfter: "1250.00",
    paymentMethod: "stripe",
    stripePaymentIntentId: "pi_123",
    stripeChargeId: "ch_123",
    referenceType: null,
    referenceId: null,
    description: "Deposit via Stripe",
    metadata: null,
    status: "completed",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    completedAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
  },
  {
    id: 2,
    walletId: 1,
    businessId: 1,
    type: "spend",
    amount: "125.50",
    balanceBefore: "875.50",
    balanceAfter: "750.00",
    paymentMethod: null,
    stripePaymentIntentId: null,
    stripeChargeId: null,
    referenceType: "campaign",
    referenceId: 1,
    description: "TikTok ad spend - Summer Sale Campaign",
    metadata: { campaignName: "Summer Sale", platform: "tiktok" },
    status: "completed",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    completedAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
  },
  {
    id: 3,
    walletId: 1,
    businessId: 1,
    type: "deposit",
    amount: "1000.00",
    balanceBefore: "0.00",
    balanceAfter: "1000.00",
    paymentMethod: "stripe",
    stripePaymentIntentId: "pi_456",
    stripeChargeId: "ch_456",
    referenceType: null,
    referenceId: null,
    description: "Initial deposit via Stripe",
    metadata: null,
    status: "completed",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7), // 7 days ago
    completedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
  },
];

export default function WalletPage() {
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [alerts, setAlerts] = useState<BillingAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddFunds, setShowAddFunds] = useState(false);
  const [useMockData, setUseMockData] = useState(false);
  const { toast } = useToast();

  const fetchWalletData = async () => {
    try {
      setLoading(true);

      // Fetch wallet
      const walletResponse = await fetch("/api/wallet");
      if (!walletResponse.ok) {
        // Use mock data if API fails
        setUseMockData(true);
        setWallet(mockWallet);
        setTransactions(mockTransactions);
        setAlerts([]);
        return;
      }
      const walletData = await walletResponse.json();
      setWallet(walletData.wallet);

      // Fetch transactions
      const transactionsResponse = await fetch("/api/wallet/transactions?limit=50");
      if (transactionsResponse.ok) {
        const transactionsData = await transactionsResponse.json();
        setTransactions(transactionsData.transactions);
      }

      // Fetch alerts
      const alertsResponse = await fetch("/api/wallet/alerts");
      if (alertsResponse.ok) {
        const alertsData = await alertsResponse.json();
        setAlerts(alertsData.alerts);
      }
    } catch (error: any) {
      // Use mock data on error
      setUseMockData(true);
      setWallet(mockWallet);
      setTransactions(mockTransactions);
      setAlerts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAcknowledgeAlert = async (alertId: number) => {
    try {
      const response = await fetch("/api/wallet/alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ alertId }),
      });

      if (!response.ok) throw new Error("Failed to acknowledge alert");

      setAlerts(alerts.filter((a) => a.id !== alertId));
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to acknowledge alert",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchWalletData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!wallet) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Wallet not found</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Wallet</h1>
        <p className="text-muted-foreground">
          Manage your prepaid balance and transaction history
        </p>
        {useMockData && (
          <p className="text-xs text-amber-600 mt-1">
            Demo mode - showing sample data
          </p>
        )}
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <BillingAlerts alerts={alerts} onAcknowledge={handleAcknowledgeAlert} />
      )}

      {/* Balance Card */}
      <WalletBalanceCard
        balance={wallet.balance}
        totalDeposited={wallet.totalDeposited}
        totalSpent={wallet.totalSpent}
        currency={wallet.currency}
        onAddFunds={() => setShowAddFunds(true)}
      />

      {/* Transaction History */}
      <TransactionHistory transactions={transactions} currency={wallet.currency} />

      {/* Add Funds Dialog */}
      <AddFundsDialog
        open={showAddFunds}
        onOpenChange={setShowAddFunds}
        currency={wallet.currency}
        onSuccess={fetchWalletData}
      />
    </div>
  );
}
