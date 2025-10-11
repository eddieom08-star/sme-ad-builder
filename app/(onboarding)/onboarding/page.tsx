import { redirect } from "next/navigation";

export default function OnboardingIndexPage() {
  // Redirect to first step
  redirect("/onboarding/business-profile");
}
