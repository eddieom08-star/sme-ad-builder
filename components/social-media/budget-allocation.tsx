"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { DollarSign, TrendingUp, PieChart } from "lucide-react";
import { useSocialMediaStore, PLATFORM_CONFIGS } from "@/lib/store/social-media";
import { cn } from "@/lib/utils";

interface BudgetAllocationProps {
  onContinue: () => void;
  onBack: () => void;
}

export function BudgetAllocation({ onContinue, onBack }: BudgetAllocationProps) {
  const {
    selectedPlatforms,
    totalDailyBudget,
    budgetAllocations,
    setTotalBudget,
    updateBudgetAllocation,
  } = useSocialMediaStore();

  const handleTotalBudgetChange = (value: string) => {
    const budget = parseFloat(value) || 0;
    if (budget >= 5 && budget <= 500) {
      setTotalBudget(budget);
    }
  };

  const handleAllocationChange = (platform: string, value: number[]) => {
    const newPercentage = value[0];
    const remaining = 100 - newPercentage;
    const otherPlatforms = selectedPlatforms.filter((p) => p !== platform);

    // Distribute remaining budget equally among other platforms
    if (otherPlatforms.length > 0) {
      const equalShare = remaining / otherPlatforms.length;
      otherPlatforms.forEach((p) => {
        updateBudgetAllocation(p, equalShare);
      });
    }

    updateBudgetAllocation(platform as any, newPercentage);
  };

  const handleEvenSplit = () => {
    const equalPercentage = 100 / selectedPlatforms.length;
    selectedPlatforms.forEach((platform) => {
      updateBudgetAllocation(platform, equalPercentage);
    });
  };

  const monthlyBudget = totalDailyBudget * 30;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight lg:text-3xl">
          Set Your Budget
        </h2>
        <p className="text-muted-foreground mt-2">
          Allocate your budget across selected platforms. You can adjust this anytime.
        </p>
      </div>

      <div className="grid lg:grid-cols-[1fr,350px] gap-6">
        {/* Left: Budget Settings */}
        <div className="space-y-4">
          {/* Total Budget */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Total Daily Budget
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="total-budget">Daily Spend Limit ($)</Label>
                <div className="flex items-center gap-4">
                  <Slider
                    min={5}
                    max={500}
                    step={5}
                    value={[totalDailyBudget]}
                    onValueChange={(v) => setTotalBudget(v[0])}
                    className="flex-1"
                  />
                  <div className="relative w-24">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      $
                    </span>
                    <Input
                      id="total-budget"
                      type="number"
                      value={totalDailyBudget}
                      onChange={(e) => handleTotalBudgetChange(e.target.value)}
                      min={5}
                      max={500}
                      className="pl-7"
                    />
                  </div>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>${totalDailyBudget}/day</span>
                  <span>≈ ${monthlyBudget.toFixed(0)}/month</span>
                </div>
              </div>

              <div className="pt-4 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleEvenSplit}
                  className="w-full"
                >
                  <PieChart className="h-4 w-4 mr-2" />
                  Split Evenly Across Platforms
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Platform Allocations */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Platform Allocation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {budgetAllocations.map((allocation) => {
                const config = PLATFORM_CONFIGS[allocation.platform];
                return (
                  <div key={allocation.platform} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span>{config.icon}</span>
                        <Label className="font-medium">{config.name}</Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">
                          {allocation.percentage.toFixed(0)}%
                        </Badge>
                        <Badge variant="outline">
                          ${allocation.dailyBudget.toFixed(2)}/day
                        </Badge>
                      </div>
                    </div>
                    <Slider
                      min={10}
                      max={90}
                      step={5}
                      value={[allocation.percentage]}
                      onValueChange={(v) => handleAllocationChange(allocation.platform, v)}
                      className="w-full"
                      style={{
                        // @ts-ignore
                        "--slider-bg": config.color,
                      }}
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>≈ ${(allocation.dailyBudget * 30).toFixed(0)}/month</span>
                      <span>
                        Est. {Math.round(allocation.dailyBudget * 2)}-
                        {Math.round(allocation.dailyBudget * 5)} clicks/day
                      </span>
                    </div>
                  </div>
                );
              })}

              {/* Total Check */}
              <div className="pt-4 border-t">
                <div className="flex justify-between items-center text-sm font-semibold">
                  <span>Total Allocation:</span>
                  <span
                    className={cn(
                      budgetAllocations.reduce((sum, a) => sum + a.percentage, 0) === 100
                        ? "text-green-600"
                        : "text-destructive"
                    )}
                  >
                    {budgetAllocations.reduce((sum, a) => sum + a.percentage, 0).toFixed(0)}%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right: Budget Summary */}
        <div className="lg:sticky lg:top-6 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Budget Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Daily Total */}
              <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                <div className="text-sm text-muted-foreground mb-1">
                  Total Daily Budget
                </div>
                <div className="text-3xl font-bold">${totalDailyBudget}</div>
                <div className="text-xs text-muted-foreground mt-1">per day</div>
              </div>

              {/* Monthly Projection */}
              <div className="p-4 bg-muted rounded-lg">
                <div className="text-sm text-muted-foreground mb-1">
                  Monthly Projection
                </div>
                <div className="text-2xl font-bold">${monthlyBudget.toFixed(0)}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  over 30 days
                </div>
              </div>

              {/* Platform Breakdown */}
              <div className="space-y-2">
                <div className="text-sm font-semibold">Platform Breakdown</div>
                {budgetAllocations.map((allocation) => {
                  const config = PLATFORM_CONFIGS[allocation.platform];
                  return (
                    <div
                      key={allocation.platform}
                      className="flex items-center justify-between text-sm"
                    >
                      <div className="flex items-center gap-2">
                        <span>{config.icon}</span>
                        <span>{config.name}</span>
                      </div>
                      <div className="font-semibold">
                        ${allocation.dailyBudget.toFixed(2)}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Estimates */}
              <div className="pt-4 border-t space-y-2">
                <div className="text-sm font-semibold mb-2">Estimated Performance</div>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Daily Clicks:</span>
                    <span className="font-medium">
                      {Math.round(totalDailyBudget * 2)}-{Math.round(totalDailyBudget * 5)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Daily Impressions:</span>
                    <span className="font-medium">
                      {Math.round(totalDailyBudget * 50)}-{Math.round(totalDailyBudget * 200)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Avg. Cost Per Click:</span>
                    <span className="font-medium">
                      ${(totalDailyBudget / (totalDailyBudget * 3.5)).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Tips */}
              <div className="pt-4 border-t">
                <div className="text-xs font-semibold mb-2">Budget Tips:</div>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• Start with recommended $10-20/day</li>
                  <li>• Monitor performance for 1-2 weeks</li>
                  <li>• Increase budget on top performers</li>
                  <li>• Adjust allocation based on ROI</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button size="lg" onClick={onContinue} className="min-w-[200px]">
          Continue to Lead Form
        </Button>
      </div>
    </div>
  );
}
