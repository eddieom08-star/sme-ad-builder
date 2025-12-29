"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatCurrency } from "@/lib/utils/currency";
import { format } from "date-fns";
import { ArrowDownCircle, ArrowUpCircle, DollarSign, RefreshCw } from "lucide-react";
import type { Transaction } from "@/lib/db/schema";

interface TransactionHistoryProps {
  transactions: Transaction[];
  currency: string;
}

export function TransactionHistory({ transactions, currency }: TransactionHistoryProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Transaction History</CardTitle>
        <CardDescription>Recent wallet activity</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          {transactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <DollarSign className="h-12 w-12 text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground">No transactions yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.map((transaction) => (
                <TransactionItem
                  key={transaction.id}
                  transaction={transaction}
                  currency={currency}
                />
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

function TransactionItem({ transaction, currency }: { transaction: Transaction; currency: string }) {
  const isPositive = transaction.type === "deposit" || transaction.type === "refund";
  const isNegative = transaction.type === "spend" || transaction.type === "withdrawal";

  const getIcon = () => {
    switch (transaction.type) {
      case "deposit":
        return <ArrowDownCircle className="h-5 w-5 text-green-600" />;
      case "spend":
      case "withdrawal":
        return <ArrowUpCircle className="h-5 w-5 text-orange-600" />;
      case "refund":
        return <RefreshCw className="h-5 w-5 text-blue-600" />;
      default:
        return <DollarSign className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusBadge = () => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      completed: "default",
      pending: "secondary",
      failed: "destructive",
      cancelled: "outline",
    };

    return (
      <Badge variant={variants[transaction.status] || "outline"} className="text-xs">
        {transaction.status}
      </Badge>
    );
  };

  return (
    <div className="flex items-start justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
      <div className="flex items-start gap-3 flex-1">
        <div className="mt-0.5">{getIcon()}</div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{transaction.description}</p>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-xs text-muted-foreground">
              {format(new Date(transaction.createdAt), "PPp")}
            </p>
            {getStatusBadge()}
          </div>
          {transaction.metadata && transaction.metadata.campaignName && (
            <p className="text-xs text-muted-foreground mt-1">
              Campaign: {transaction.metadata.campaignName}
            </p>
          )}
        </div>
      </div>
      <div className="text-right ml-4">
        <p className={`text-sm font-semibold ${
          isPositive ? "text-green-600" : isNegative ? "text-orange-600" : "text-gray-600"
        }`}>
          {isPositive && "+"}{isNegative && "-"}
          {formatCurrency(transaction.amount, currency)}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Balance: {formatCurrency(transaction.balanceAfter, currency)}
        </p>
      </div>
    </div>
  );
}
