import { OnboardingLayout } from "@/components/onboarding/onboarding-layout";
import { GoogleAdsCampaignCreator } from "@/components/google-ads/google-ads-campaign-creator";

export default function GoogleAdsCampaignPage() {
  return (
    <OnboardingLayout
      currentStep={3}
      title="Create Google Ads Campaign"
      description="Set up your first Google Ads campaign"
    >
      <GoogleAdsCampaignCreator />
    </OnboardingLayout>
  );
}
