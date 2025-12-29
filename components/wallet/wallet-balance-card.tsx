"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wallet, Plus, TrendingUp, TrendingDown } from "lucide-react";
import { formatCurrency } from "@/lib/utils/currency";

export interface WalletBalanceCardProps {
  balance: string;
  totalDeposited: string;
  totalSpent: string;
  currency: string;
  onAddFunds: () => void;
  loading?: boolean;
}

export function WalletBalanceCard({
  balance,
  totalDeposited,
  totalSpent,
  currency,
  onAddFunds,
  loading = false,
}: WalletBalanceCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-2xl font-bold flex items-center gap-2">
            <Wallet className="h-6 w-6 text-primary" />
            Wallet Balance
          </CardTitle>
          <CardDescription>Prepaid funds for ad campaigns</CardDescription>
        </div>
        <Button onClick={onAddFunds} disabled={loading}>
          <Plus className="h-4 w-4 mr-2" />
          Add Funds
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Current Balance */}
          <div className="flex flex-col space-y-1">
            <span className="text-sm text-muted-foreground">Available Balance</span>
            <span className="text-4xl font-bold text-primary">
              {formatCurrency(balance, currency)}
            </span>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Total Deposited</p>
                <p className="text-lg font-semibold">{formatCurrency(totalDeposited, currency)}</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                <TrendingDown className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Total Spent</p>
                <p className="text-lg font-semibold">{formatCurrency(totalSpent, currency)}</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
