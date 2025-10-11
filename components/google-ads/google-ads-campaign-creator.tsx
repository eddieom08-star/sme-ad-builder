"use client";

import { useState } from "react";
import { AdVersionSelector } from "./ad-version-selector";
import { EducationModal } from "./education-modal";
import { HeadlinesEditor } from "./headlines-editor";
import { DescriptionsEditor } from "./descriptions-editor";
import { KeywordsSelector } from "./keywords-selector";
import { URLConfiguration } from "./url-configuration";
import { GeographicTargeting } from "./geographic-targeting";
import { BudgetSelection } from "./budget-selection";
import { AdPreviewPanel } from "./ad-preview-panel";
import { useGoogleAdsStore } from "@/lib/store/google-ads";

type Step =
  | "versions"
  | "education"
  | "headlines"
  | "descriptions"
  | "keywords"
  | "urls"
  | "targeting"
  | "budget";

export function GoogleAdsCampaignCreator() {
  const [currentStep, setCurrentStep] = useState<Step>("versions");
  const { hasSeenEducation, setHasSeenEducation } = useGoogleAdsStore();
  const [showEducation, setShowEducation] = useState(!hasSeenEducation);

  const handleVersionsComplete = () => {
    if (!hasSeenEducation) {
      setShowEducation(true);
    } else {
      setCurrentStep("headlines");
    }
  };

  const handleEducationComplete = () => {
    setShowEducation(false);
    setHasSeenEducation(true);
    setCurrentStep("headlines");
  };

  const showPreview =
    currentStep === "headlines" ||
    currentStep === "descriptions" ||
    currentStep === "keywords" ||
    currentStep === "urls";

  return (
    <div className="space-y-6">
      {/* Education Modal */}
      <EducationModal
        isOpen={showEducation}
        onClose={() => {
          setShowEducation(false);
          setHasSeenEducation(true);
        }}
        onComplete={handleEducationComplete}
      />

      {/* Main Content */}
      <div className={showPreview ? "grid lg:grid-cols-[1fr,400px] gap-6" : ""}>
        {/* Left: Main Content */}
        <div>
          {currentStep === "versions" && (
            <AdVersionSelector onContinue={handleVersionsComplete} />
          )}

          {currentStep === "headlines" && (
            <HeadlinesEditor
              onContinue={() => setCurrentStep("descriptions")}
              onBack={() => setCurrentStep("versions")}
            />
          )}

          {currentStep === "descriptions" && (
            <DescriptionsEditor
              onContinue={() => setCurrentStep("keywords")}
              onBack={() => setCurrentStep("headlines")}
            />
          )}

          {currentStep === "keywords" && (
            <KeywordsSelector
              onContinue={() => setCurrentStep("urls")}
              onBack={() => setCurrentStep("descriptions")}
            />
          )}

          {currentStep === "urls" && (
            <URLConfiguration
              onContinue={() => setCurrentStep("targeting")}
              onBack={() => setCurrentStep("keywords")}
            />
          )}

          {currentStep === "targeting" && (
            <GeographicTargeting
              onContinue={() => setCurrentStep("budget")}
              onBack={() => setCurrentStep("urls")}
            />
          )}

          {currentStep === "budget" && (
            <BudgetSelection
              onContinue={() => {
                // Navigate to next step or review page
                console.log("Campaign complete!");
              }}
              onBack={() => setCurrentStep("targeting")}
            />
          )}
        </div>

        {/* Right: Ad Preview Panel (sticky) */}
        {showPreview && (
          <div>
            <AdPreviewPanel />
          </div>
        )}
      </div>
    </div>
  );
}
