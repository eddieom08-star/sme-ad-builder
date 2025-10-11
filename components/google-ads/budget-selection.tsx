"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, DollarSign, TrendingUp, Users, Eye } from "lucide-react";
import { useGoogleAdsStore, type BudgetOption } from "@/lib/store/google-ads";
import { cn } from "@/lib/utils";

interface BudgetSelectionProps {
  onContinue: () => void;
  onBack: () => void;
}

const budgetOptions: BudgetOption[] = [
  {
    dailyBudget: 5,
    estimatedClicks: "2-4",
    estimatedImpressions: "100-200",
    estimatedCost: "$150/month",
  },
  {
    dailyBudget: 7,
    estimatedClicks: "3-6",
    estimatedImpressions: "150-300",
    estimatedCost: "$210/month",
  },
  {
    dailyBudget: 10,
    estimatedClicks: "5-10",
    estimatedImpressions: "250-500",
    estimatedCost: "$300/month",
  },
  {
    dailyBudget: 13,
    estimatedClicks: "7-13",
    estimatedImpressions: "350-700",
    estimatedCost: "$390/month",
  },
];

export function BudgetSelection({ onContinue, onBack }: BudgetSelectionProps) {
  const { selectedBudget, setSelectedBudget } = useGoogleAdsStore();

  const handleBudgetSelect = (budget: BudgetOption) => {
    setSelectedBudget(budget);
  };

  const handleContinue = () => {
    if (selectedBudget) {
      onContinue();
    }
  };

  const isValid = selectedBudget !== null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight lg:text-3xl">
          Choose Your Budget
        </h2>
        <p className="text-muted-foreground mt-2">
          Select a daily budget that works for you. You can adjust this anytime
          after launch.
        </p>
      </div>

      {/* Status */}
      <div className="flex items-center gap-3 flex-wrap">
        {isValid && (
          <div className="flex items-center gap-1 text-sm text-green-600">
            <CheckCircle2 className="h-4 w-4" />
            <span>
              ${selectedBudget.dailyBudget}/day selected ({selectedBudget.estimatedCost})
            </span>
          </div>
        )}
      </div>

      {/* Budget Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {budgetOptions.map((option) => {
          const isSelected =
            selectedBudget?.dailyBudget === option.dailyBudget;
          const isRecommended = option.dailyBudget === 10;

          return (
            <Card
              key={option.dailyBudget}
              className={cn(
                "cursor-pointer transition-all hover:shadow-lg relative",
                isSelected && "ring-2 ring-primary shadow-lg"
              )}
              onClick={() => handleBudgetSelect(option)}
            >
              {isRecommended && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground">
                    Recommended
                  </Badge>
                </div>
              )}

              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-2xl font-bold">
                    ${option.dailyBudget}
                    <span className="text-sm font-normal text-muted-foreground">
                      /day
                    </span>
                  </CardTitle>
                  {isSelected && (
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                  )}
                </div>
                <div className="text-sm font-medium text-muted-foreground">
                  {option.estimatedCost}
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {/* Clicks */}
                  <div className="flex items-start gap-2">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <TrendingUp className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold">
                        {option.estimatedClicks} clicks
                      </div>
                      <div className="text-xs text-muted-foreground">
                        per day
                      </div>
                    </div>
                  </div>

                  {/* Impressions */}
                  <div className="flex items-start gap-2">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Eye className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold">
                        {option.estimatedImpressions}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        impressions
                      </div>
                    </div>
                  </div>

                  {/* Reach */}
                  <div className="flex items-start gap-2">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Users className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold">
                        {option.dailyBudget >= 13
                          ? "Wide"
                          : option.dailyBudget >= 10
                            ? "Good"
                            : "Moderate"}{" "}
                        reach
                      </div>
                      <div className="text-xs text-muted-foreground">
                        audience size
                      </div>
                    </div>
                  </div>
                </div>

                {/* Cost per click estimate */}
                <div className="pt-3 border-t">
                  <div className="text-xs text-muted-foreground">
                    Avg. cost per click
                  </div>
                  <div className="text-sm font-semibold">
                    $
                    {(
                      option.dailyBudget /
                      parseFloat(option.estimatedClicks.split("-")[1])
                    ).toFixed(2)}{" "}
                    - $
                    {(
                      option.dailyBudget /
                      parseFloat(option.estimatedClicks.split("-")[0])
                    ).toFixed(2)}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Info Section */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card className="bg-muted/50">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Budget Control
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Set a daily maximum spend limit</li>
              <li>• Google stops showing ads once limit is reached</li>
              <li>• Change your budget anytime</li>
              <li>• Pause or resume campaigns as needed</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="bg-muted/50">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Performance Tips
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Start with recommended budget</li>
              <li>• Monitor performance for 2-4 weeks</li>
              <li>• Increase budget if getting good results</li>
              <li>• Lower budget if cost per lead is too high</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Note */}
      <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
        <div className="text-sm">
          <span className="font-semibold">Note:</span> These are estimates based
          on typical performance for your industry. Actual results may vary
          depending on your keywords, ad quality, and competition.
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button
          size="lg"
          onClick={handleContinue}
          disabled={!isValid}
          className="min-w-[200px]"
        >
          Review Campaign
        </Button>
      </div>
    </div>
  );
}
