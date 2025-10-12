import { auth } from "@clerk/nextjs/server";
import { currentUser } from "@clerk/nextjs/server";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { DashboardClient } from "@/components/dashboard/dashboard-client";

export default async function DashboardPage() {
  const user = await currentUser();

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight lg:text-3xl">Dashboard</h1>
          <p className="text-sm text-muted-foreground lg:text-base">
            Welcome back, {user?.firstName || user?.username || 'there'}
          </p>
        </div>
        <Link href="/campaigns/new" className="lg:hidden">
          <Button size="sm">
            <Plus className="h-4 w-4 mr-1" />
            New
          </Button>
        </Link>
      </div>

      {/* Client-side dashboard content */}
      <DashboardClient />
    </div>
  );
}
