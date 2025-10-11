import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { ResponsiveSidebar } from "@/components/dashboard/responsive-sidebar";
import { DashboardHeader } from "@/components/dashboard/header";
import { MobileBottomNav, MobileHeader } from "@/components/dashboard/mobile-nav";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  // Get actual user data from Clerk for the header
  const clerkUser = await currentUser();
  const user = {
    name: clerkUser?.firstName && clerkUser?.lastName
      ? `${clerkUser.firstName} ${clerkUser.lastName}`
      : clerkUser?.username || null,
    email: clerkUser?.primaryEmailAddress?.emailAddress || null,
    image: clerkUser?.imageUrl || null,
  };

  return (
    <div className="flex min-h-screen">
      <ResponsiveSidebar />
      <div className="flex-1 flex flex-col">
        {/* Desktop Header - Hidden on mobile */}
        <div className="hidden lg:block">
          <DashboardHeader user={user} />
        </div>

        {/* Mobile Header - Hidden on desktop */}
        <MobileHeader />

        {/* Main Content - with bottom padding on mobile for nav */}
        <main className="flex-1 overflow-y-auto p-4 pb-20 bg-muted/10 lg:p-6 lg:pb-6">
          {children}
        </main>

        {/* Mobile Bottom Navigation - Hidden on desktop */}
        <MobileBottomNav />
      </div>
    </div>
  );
}
