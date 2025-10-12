import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { SettingsForm } from "@/components/settings/settings-form";

export default async function SettingsPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  // Get full user data from Clerk
  const user = await currentUser();

  if (!user) {
    return (
      <div className="space-y-4 lg:space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight lg:text-3xl">Settings</h1>
          <p className="text-sm text-muted-foreground lg:text-base">
            Loading your settings...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight lg:text-3xl">Settings</h1>
        <p className="text-sm text-muted-foreground lg:text-base">
          Manage your account and application preferences
        </p>
      </div>

      {/* Settings Content */}
      <SettingsForm user={user} />
    </div>
  );
}
