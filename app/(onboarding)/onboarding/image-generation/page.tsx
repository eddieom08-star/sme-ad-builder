import { OnboardingLayout } from "@/components/onboarding/onboarding-layout";
import { ImageGenerator } from "@/components/ai/image-generator";

export default function ImageGenerationPage() {
  return (
    <OnboardingLayout
      currentStep={2}
      title="Generate Ad Images"
      description="Create professional marketing images using AI"
    >
      <ImageGenerator />
    </OnboardingLayout>
  );
}
