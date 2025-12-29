"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Info, XCircle, X } from "lucide-react";
import type { BillingAlert } from "@/lib/db/schema";

interface BillingAlertsProps {
  alerts: BillingAlert[];
  onAcknowledge: (alertId: number) => Promise<void>;
}

export function BillingAlerts({ alerts, onAcknowledge }: BillingAlertsProps) {
  if (alerts.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      {alerts.map((alert) => (
        <BillingAlertItem key={alert.id} alert={alert} onAcknowledge={onAcknowledge} />
      ))}
    </div>
  );
}

function BillingAlertItem({
  alert,
  onAcknowledge,
}: {
  alert: BillingAlert;
  onAcknowledge: (alertId: number) => Promise<void>;
}) {
  const getIcon = () => {
    switch (alert.severity) {
      case "critical":
        return <XCircle className="h-5 w-5" />;
      case "warning":
        return <AlertTriangle className="h-5 w-5" />;
      case "info":
      default:
        return <Info className="h-5 w-5" />;
    }
  };

  const getVariant = () => {
    switch (alert.severity) {
      case "critical":
        return "destructive";
      case "warning":
        return "default";
      case "info":
      default:
        return "default";
    }
  };

  const getTitle = () => {
    switch (alert.type) {
      case "low_balance":
        return "Low Balance Warning";
      case "auto_reload_failed":
        return "Auto-Reload Failed";
      case "spend_limit_reached":
        return "Spend Limit Reached";
      case "campaign_paused":
        return "Campaign Paused";
      default:
        return "Billing Alert";
    }
  };

  return (
    <Alert variant={getVariant()} className="relative pr-12">
      <div className="flex items-start gap-3">
        {getIcon()}
        <div className="flex-1">
          <AlertTitle>{getTitle()}</AlertTitle>
          <AlertDescription>{alert.message}</AlertDescription>
        </div>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-2 top-2 h-8 w-8"
        onClick={() => onAcknowledge(alert.id)}
      >
        <X className="h-4 w-4" />
        <span className="sr-only">Dismiss</span>
      </Button>
    </Alert>
  );
}
