"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2 } from "lucide-react";
import { useSocialMediaStore } from "@/lib/store/social-media";
import { PlatformSelection } from "./platform-selection";
import { ContentAdapter } from "./content-adapter";
import { AudienceTargeting } from "./audience-targeting";
import { BudgetAllocation } from "./budget-allocation";
import { LeadForm } from "./lead-form";
import { cn } from "@/lib/utils";

type SocialMediaStep = "platforms" | "content" | "targeting" | "budget" | "leadform";

interface SocialMediaCampaignCreatorProps {
  onComplete?: () => void;
}

export function SocialMediaCampaignCreator({ onComplete }: SocialMediaCampaignCreatorProps) {
  const [currentStep, setCurrentStep] = useState<SocialMediaStep>("platforms");
  const {
    selectedPlatforms,
    platformContent,
    audienceTargeting,
    budgetAllocations,
    leadForm,
  } = useSocialMediaStore();

  const steps: Array<{
    id: SocialMediaStep;
    label: string;
    description: string;
  }> = [
    {
      id: "platforms",
      label: "Platforms",
      description: "Select platforms",
    },
    {
      id: "content",
      label: "Content",
      description: "Create ad content",
    },
    {
      id: "targeting",
      label: "Audience",
      description: "Define targeting",
    },
    {
      id: "budget",
      label: "Budget",
      description: "Allocate spend",
    },
    {
      id: "leadform",
      label: "Lead Form",
      description: "Optional lead capture",
    },
  ];

  const getStepIndex = (step: SocialMediaStep) => steps.findIndex((s) => s.id === step);
  const currentStepIndex = getStepIndex(currentStep);

  const isStepComplete = (step: SocialMediaStep): boolean => {
    switch (step) {
      case "platforms":
        return selectedPlatforms.length > 0;
      case "content":
        return (
          platformContent.length > 0 &&
          platformContent.every((c) => c.copy.trim().length >= 20)
        );
      case "targeting":
        return audienceTargeting.locations.length > 0;
      case "budget":
        return (
          budgetAllocations.length > 0 &&
          budgetAllocations.reduce((sum, a) => sum + a.percentage, 0) === 100
        );
      case "leadform":
        return (
          !leadForm.enabled ||
          (leadForm.fields.length >= 2 &&
            leadForm.fields.some((f) => f.type === "email") &&
            leadForm.privacyPolicyUrl.trim().length > 0)
        );
      default:
        return false;
    }
  };

  const handleContinue = () => {
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < steps.length) {
      setCurrentStep(steps[nextIndex].id);
    } else {
      // All steps complete
      onComplete?.();
    }
  };

  const handleBack = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStep(steps[prevIndex].id);
    }
  };

  const handleStepClick = (step: SocialMediaStep) => {
    const stepIndex = getStepIndex(step);
    // Allow going back to any previous step
    if (stepIndex < currentStepIndex) {
      setCurrentStep(step);
    }
    // Allow going forward only if all previous steps are complete
    else if (stepIndex > currentStepIndex) {
      const allPreviousComplete = steps
        .slice(0, stepIndex)
        .every((s) => isStepComplete(s.id));
      if (allPreviousComplete) {
        setCurrentStep(step);
      }
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Progress Steps */}
        <Card className="mb-8 p-6">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const isActive = step.id === currentStep;
              const isComplete = isStepComplete(step.id);
              const isPast = index < currentStepIndex;
              const isAccessible = index <= currentStepIndex || isComplete;

              return (
                <div key={step.id} className="flex items-center flex-1">
                  {/* Step Indicator */}
                  <div
                    className={cn(
                      "flex flex-col items-center gap-2 cursor-pointer transition-all",
                      !isAccessible && "opacity-40 cursor-not-allowed"
                    )}
                    onClick={() => isAccessible && handleStepClick(step.id)}
                  >
                    <div
                      className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all",
                        isActive && "bg-primary text-primary-foreground ring-4 ring-primary/20",
                        isComplete && !isActive && "bg-green-600 text-white",
                        !isActive && !isComplete && "bg-muted text-muted-foreground"
                      )}
                    >
                      {isComplete && !isActive ? (
                        <CheckCircle2 className="h-5 w-5" />
                      ) : (
                        <span>{index + 1}</span>
                      )}
                    </div>
                    <div className="text-center">
                      <div
                        className={cn(
                          "text-sm font-medium",
                          isActive && "text-primary",
                          isComplete && !isActive && "text-green-600",
                          !isActive && !isComplete && "text-muted-foreground"
                        )}
                      >
                        {step.label}
                      </div>
                      <div className="text-xs text-muted-foreground hidden md:block">
                        {step.description}
                      </div>
                    </div>
                  </div>

                  {/* Connector Line */}
                  {index < steps.length - 1 && (
                    <div
                      className={cn(
                        "flex-1 h-[2px] mx-4 transition-all",
                        isPast || isComplete ? "bg-primary" : "bg-muted"
                      )}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </Card>

        {/* Current Step Content */}
        <div className="animate-in fade-in duration-300">
          {currentStep === "platforms" && (
            <PlatformSelection onContinue={handleContinue} />
          )}
          {currentStep === "content" && (
            <ContentAdapter onContinue={handleContinue} onBack={handleBack} />
          )}
          {currentStep === "targeting" && (
            <AudienceTargeting onContinue={handleContinue} onBack={handleBack} />
          )}
          {currentStep === "budget" && (
            <BudgetAllocation onContinue={handleContinue} onBack={handleBack} />
          )}
          {currentStep === "leadform" && (
            <LeadForm onContinue={handleContinue} onBack={handleBack} />
          )}
        </div>

        {/* Summary Card (shown after first step) */}
        {currentStepIndex > 0 && (
          <Card className="mt-8 p-6 bg-muted/30">
            <h3 className="font-semibold mb-4">Campaign Summary</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
              {/* Platforms */}
              <div>
                <div className="text-muted-foreground mb-1">Platforms</div>
                <div className="flex flex-wrap gap-1">
                  {selectedPlatforms.length > 0 ? (
                    selectedPlatforms.map((platform) => (
                      <Badge key={platform} variant="secondary" className="text-xs capitalize">
                        {platform}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-muted-foreground">None selected</span>
                  )}
                </div>
              </div>

              {/* Content Status */}
              <div>
                <div className="text-muted-foreground mb-1">Content</div>
                <div className="font-medium">
                  {platformContent.length > 0
                    ? `${platformContent.length} platform${platformContent.length !== 1 ? "s" : ""} ready`
                    : "Not configured"}
                </div>
              </div>

              {/* Targeting */}
              <div>
                <div className="text-muted-foreground mb-1">Targeting</div>
                <div className="font-medium">
                  {audienceTargeting.locations.length > 0
                    ? `${audienceTargeting.locations.length} location${audienceTargeting.locations.length !== 1 ? "s" : ""}`
                    : "Not configured"}
                </div>
              </div>

              {/* Budget */}
              <div>
                <div className="text-muted-foreground mb-1">Daily Budget</div>
                <div className="font-medium">
                  {budgetAllocations.length > 0
                    ? `$${budgetAllocations.reduce((sum, b) => sum + b.dailyBudget, 0).toFixed(2)}/day`
                    : "Not configured"}
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
