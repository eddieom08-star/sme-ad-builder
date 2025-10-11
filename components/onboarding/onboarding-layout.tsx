"use client";

import { useOnboardingStore, ONBOARDING_STEPS } from "@/lib/store/onboarding";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface OnboardingLayoutProps {
  children: React.ReactNode;
  currentStepId: number;
}

export function OnboardingLayout({ children, currentStepId }: OnboardingLayoutProps) {
  const { completedSteps } = useOnboardingStore();
  const progress = (completedSteps.length / ONBOARDING_STEPS.length) * 100;

  return (
    <div className="min-h-screen bg-muted/10">
      {/* Progress Bar - Mobile */}
      <div className="sticky top-0 z-40 bg-background border-b lg:hidden">
        <div className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">
              Step {currentStepId} of {ONBOARDING_STEPS.length}
            </span>
            <span className="text-xs text-muted-foreground">
              {Math.round(progress)}% Complete
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </div>

      <div className="container max-w-7xl mx-auto px-4 py-6 lg:py-12">
        <div className="grid lg:grid-cols-[280px,1fr] gap-8">
          {/* Sidebar - Desktop Only */}
          <aside className="hidden lg:block">
            <div className="sticky top-6">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-6">
                Onboarding Steps
              </h2>
              <nav className="space-y-1">
                {ONBOARDING_STEPS.map((step) => {
                  const isCompleted = completedSteps.includes(step.id);
                  const isCurrent = currentStepId === step.id;

                  return (
                    <div
                      key={step.id}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-lg transition-colors",
                        isCurrent && "bg-primary/10 text-primary",
                        !isCurrent && !isCompleted && "text-muted-foreground",
                        isCompleted && !isCurrent && "text-foreground/80"
                      )}
                    >
                      <div
                        className={cn(
                          "flex items-center justify-center w-6 h-6 rounded-full text-xs font-semibold shrink-0",
                          isCurrent && "bg-primary text-primary-foreground",
                          isCompleted && !isCurrent && "bg-green-500 text-white",
                          !isCurrent && !isCompleted && "bg-muted text-muted-foreground"
                        )}
                      >
                        {isCompleted ? <Check className="h-4 w-4" /> : step.id}
                      </div>
                      <span className="text-sm font-medium">{step.title}</span>
                    </div>
                  );
                })}
              </nav>

              {/* Progress Summary */}
              <div className="mt-8 p-4 bg-muted rounded-lg">
                <div className="text-sm font-medium mb-2">Overall Progress</div>
                <Progress value={progress} className="h-2 mb-2" />
                <div className="text-xs text-muted-foreground">
                  {completedSteps.length} of {ONBOARDING_STEPS.length} steps completed
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="min-h-[calc(100vh-200px)]">{children}</main>
        </div>
      </div>
    </div>
  );
}
