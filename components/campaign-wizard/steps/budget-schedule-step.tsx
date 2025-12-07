'use client';

import { useWizardStore, type BudgetType, type BidStrategy } from '@/lib/stores/wizard-store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar, DollarSign, TrendingUp, Clock, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

const CURRENCIES = [
  { value: 'USD', label: 'USD ($)', symbol: '$' },
  { value: 'GBP', label: 'GBP (£)', symbol: '£' },
  { value: 'EUR', label: 'EUR (€)', symbol: '€' },
  { value: 'CAD', label: 'CAD ($)', symbol: 'C$' },
];

const BID_STRATEGIES = [
  {
    value: 'lowest_cost' as BidStrategy,
    label: 'Lowest Cost',
    description: 'Get the most results for your budget',
    recommended: true,
  },
  {
    value: 'cost_cap' as BidStrategy,
    label: 'Cost Cap',
    description: 'Keep average cost per result at or below your cap',
    recommended: false,
  },
  {
    value: 'bid_cap' as BidStrategy,
    label: 'Bid Cap',
    description: 'Set a maximum bid for each auction',
    recommended: false,
  },
];

export function BudgetScheduleStep() {
  const {
    budgetType,
    budgetAmount,
    currency,
    startDate,
    endDate,
    bidStrategy,
    bidCap,
    updateBudget,
    validationErrors,
    platforms,
  } = useWizardStore();

  const currencySymbol = CURRENCIES.find(c => c.value === currency)?.symbol || '$';
  let minBudget = budgetType === 'daily' ? 5 : 35;
  if (platforms.includes('linkedin')) {
    minBudget = budgetType === 'daily' ? 10 : 100;
  }

  // Calculate campaign duration and total budget
  const start = new Date(startDate);
  const end = new Date(endDate);
  const durationDays = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
  const totalBudget = budgetType === 'daily' ? budgetAmount * durationDays : budgetAmount;

  // Estimated metrics (mock calculations)
  const estimatedImpressions = Math.round(budgetAmount * 200 * (Math.random() * 0.4 + 0.8));
  const estimatedClicks = Math.round(estimatedImpressions * 0.02);

  return (
    <div className="space-y-6 p-6">
      {/* Budget Type */}
      <div className="space-y-3">
        <div>
          <Label className="text-base font-semibold">Budget Type *</Label>
          <p className="text-xs text-muted-foreground mt-1">
            Choose how you want to allocate your budget
          </p>
        </div>

        <RadioGroup
          value={budgetType}
          onValueChange={(value) => updateBudget({ budgetType: value as BudgetType })}
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <Card
              className={cn(
                'cursor-pointer transition-all hover:border-primary hover:shadow-md',
                budgetType === 'daily' && 'border-primary bg-primary/5 shadow-md'
              )}
              onClick={() => updateBudget({ budgetType: 'daily' })}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start gap-3">
                  <RadioGroupItem value="daily" id="daily" className="mt-1" />
                  <div className="flex-1">
                    <Label htmlFor="daily" className="cursor-pointer">
                      <CardTitle className="text-sm font-semibold">Daily Budget</CardTitle>
                      <CardDescription className="text-xs mt-1">
                        Spend up to {currencySymbol}{budgetAmount}/day for {durationDays} days
                      </CardDescription>
                    </Label>
                  </div>
                </div>
              </CardHeader>
            </Card>

            <Card
              className={cn(
                'cursor-pointer transition-all hover:border-primary hover:shadow-md',
                budgetType === 'lifetime' && 'border-primary bg-primary/5 shadow-md'
              )}
              onClick={() => updateBudget({ budgetType: 'lifetime' })}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start gap-3">
                  <RadioGroupItem value="lifetime" id="lifetime" className="mt-1" />
                  <div className="flex-1">
                    <Label htmlFor="lifetime" className="cursor-pointer">
                      <CardTitle className="text-sm font-semibold">Lifetime Budget</CardTitle>
                      <CardDescription className="text-xs mt-1">
                        Spend {currencySymbol}{budgetAmount} total over campaign duration
                      </CardDescription>
                    </Label>
                  </div>
                </div>
              </CardHeader>
            </Card>
          </div>
        </RadioGroup>
      </div>

      {/* Budget Amount & Currency */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="budgetAmount" className="text-base font-semibold">
            Budget Amount *
          </Label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="budgetAmount"
              type="number"
              min={minBudget}
              step="0.01"
              placeholder={`Min ${currencySymbol}${minBudget}`}
              value={budgetAmount}
              onChange={(e) => updateBudget({ budgetAmount: parseFloat(e.target.value) || 0 })}
              className={cn(
                'pl-9 text-base',
                validationErrors.budgetAmount && 'border-destructive'
              )}
            />
          </div>
          {validationErrors.budgetAmount && (
            <p className="text-sm text-destructive">
              {validationErrors.budgetAmount[0]}
            </p>
          )}
          <p className="text-xs text-muted-foreground">
            Minimum {budgetType} budget: {currencySymbol}{minBudget}
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="currency" className="text-base font-semibold">
            Currency *
          </Label>
          <Select value={currency} onValueChange={(value: any) => updateBudget({ currency: value })}>
            <SelectTrigger id="currency" className="text-base">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CURRENCIES.map((curr) => (
                <SelectItem key={curr.value} value={curr.value}>
                  {curr.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Your billing currency
          </p>
        </div>
      </div>

      {/* Schedule */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="startDate" className="text-base font-semibold">
            Start Date *
          </Label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="startDate"
              type="date"
              value={startDate}
              onChange={(e) => updateBudget({ startDate: e.target.value })}
              className={cn(
                'pl-9 text-base',
                validationErrors.startDate && 'border-destructive'
              )}
            />
          </div>
          {validationErrors.startDate && (
            <p className="text-sm text-destructive">
              {validationErrors.startDate[0]}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="endDate" className="text-base font-semibold">
            End Date *
          </Label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="endDate"
              type="date"
              value={endDate}
              onChange={(e) => updateBudget({ endDate: e.target.value })}
              className={cn(
                'pl-9 text-base',
                validationErrors.endDate && 'border-destructive'
              )}
            />
          </div>
          {validationErrors.endDate && (
            <p className="text-sm text-destructive">
              {validationErrors.endDate[0]}
            </p>
          )}
          <p className="text-xs text-muted-foreground">
            Campaign duration: {durationDays} day{durationDays !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Bid Strategy */}
      <div className="space-y-3">
        <div>
          <Label className="text-base font-semibold">Bid Strategy *</Label>
          <p className="text-xs text-muted-foreground mt-1">
            How should we optimize your ad delivery?
          </p>
        </div>

        <RadioGroup
          value={bidStrategy}
          onValueChange={(value) => updateBudget({ bidStrategy: value as BidStrategy })}
        >
          <div className="space-y-2">
            {BID_STRATEGIES.map((strategy) => {
              const isSelected = bidStrategy === strategy.value;

              return (
                <Card
                  key={strategy.value}
                  className={cn(
                    'cursor-pointer transition-all hover:border-primary hover:shadow-sm',
                    isSelected && 'border-primary bg-primary/5 shadow-sm'
                  )}
                  onClick={() => updateBudget({ bidStrategy: strategy.value })}
                >
                  <CardHeader className="pb-3 pt-4">
                    <div className="flex items-start gap-3">
                      <RadioGroupItem
                        value={strategy.value}
                        id={strategy.value}
                        className="mt-0.5"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Label htmlFor={strategy.value} className="cursor-pointer font-semibold text-sm">
                            {strategy.label}
                          </Label>
                          {strategy.recommended && (
                            <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
                              Recommended
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {strategy.description}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
        </RadioGroup>
      </div>

      {/* Bid Cap (if needed) */}
      {bidStrategy !== 'lowest_cost' && (
        <div className="space-y-2">
          <Label htmlFor="bidCap" className="text-base font-semibold">
            Bid Cap Amount *
          </Label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="bidCap"
              type="number"
              min="0.01"
              step="0.01"
              placeholder="Enter bid cap"
              value={bidCap || ''}
              onChange={(e) => updateBudget({ bidCap: parseFloat(e.target.value) || undefined })}
              className={cn(
                'pl-9 text-base',
                validationErrors.bidCap && 'border-destructive'
              )}
            />
          </div>
          {validationErrors.bidCap && (
            <p className="text-sm text-destructive">
              {validationErrors.bidCap[0]}
            </p>
          )}
          <p className="text-xs text-muted-foreground">
            Maximum {bidStrategy === 'cost_cap' ? 'cost per result' : 'bid'} in {currency}
          </p>
        </div>
      )}

      {/* Budget Summary */}
      <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Budget Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground">Total Budget</p>
              <p className="text-lg font-bold text-primary">
                {currencySymbol}{totalBudget.toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Duration</p>
              <p className="text-lg font-bold">{durationDays} days</p>
            </div>
          </div>

          <div className="border-t border-primary/20 pt-3 space-y-2">
            <p className="text-xs font-semibold text-muted-foreground">Estimated Performance:</p>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Info className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Impressions</p>
                  <p className="font-semibold">{estimatedImpressions.toLocaleString()}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Clock className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Clicks</p>
                  <p className="font-semibold">{estimatedClicks.toLocaleString()}</p>
                </div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground italic">
              * Estimates based on average performance. Actual results may vary.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Tips */}
      <Card className="bg-muted/50 border-dashed">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <DollarSign className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
            <div className="space-y-1 text-sm">
              <p className="font-medium">Budget & Schedule Tips</p>
              <ul className="text-muted-foreground space-y-1 text-xs">
                <li>• Daily budgets give you more control over spending</li>
                <li>• Lifetime budgets let the platform optimize delivery</li>
                <li>• Longer campaigns (7+ days) perform better</li>
                <li>• Start with "Lowest Cost" for best results</li>
                <li>• You can adjust budget anytime after launch</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
