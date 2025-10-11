import { OnboardingLayout } from "@/components/onboarding/onboarding-layout";
import { BusinessProfileForm } from "@/components/onboarding/business-profile-form";

export default function BusinessProfilePage() {
  return (
    <OnboardingLayout currentStepId={1}>
      <BusinessProfileForm />
    </OnboardingLayout>
  );
}
