import { OnboardingLayout } from "@/components/onboarding/onboarding-layout";

export default function TargetAudiencePage() {
  return (
    <OnboardingLayout currentStepId={2}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight lg:text-3xl">Target Audience</h1>
          <p className="text-muted-foreground mt-2">
            Define who your ideal customers are.
          </p>
        </div>

        <div className="bg-muted/50 border-2 border-dashed rounded-lg p-12 text-center">
          <p className="text-muted-foreground">
            Target Audience form coming in Step 2
          </p>
        </div>
      </div>
    </OnboardingLayout>
  );
}
