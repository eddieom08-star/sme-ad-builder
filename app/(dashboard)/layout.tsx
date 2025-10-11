import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ResponsiveSidebar } from "@/components/dashboard/responsive-sidebar";
import { DashboardHeader } from "@/components/dashboard/header";
import { MobileBottomNav, MobileHeader } from "@/components/dashboard/mobile-nav";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/login");
  }

  return (
    <div className="flex min-h-screen">
      <ResponsiveSidebar />
      <div className="flex-1 flex flex-col">
        {/* Desktop Header - Hidden on mobile */}
        <div className="hidden lg:block">
          <DashboardHeader user={session.user} />
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
