"use client";

import { useRouter } from "next/navigation";
import { SocialMediaCampaignCreator } from "@/components/social-media/social-media-campaign-creator";

export default function SocialMediaCampaignPage() {
  const router = useRouter();

  const handleComplete = () => {
    // Navigate to next step or dashboard
    router.push("/dashboard");
  };

  return <SocialMediaCampaignCreator onComplete={handleComplete} />;
}
