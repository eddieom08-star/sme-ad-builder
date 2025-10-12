import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { CampaignsListClient } from "@/components/campaigns/campaigns-list-client";

export default async function CampaignsPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight lg:text-3xl">Campaigns</h1>
          <p className="text-sm text-muted-foreground lg:text-base">
            Manage your advertising campaigns
          </p>
        </div>
        <Link href="/campaigns/new">
          <Button size="sm" className="lg:h-10">
            <Plus className="h-4 w-4 mr-1 lg:mr-2" />
            <span className="hidden sm:inline">New Campaign</span>
            <span className="sm:hidden">New</span>
          </Button>
        </Link>
      </div>

      {/* Client-side campaigns list */}
      <CampaignsListClient />
    </div>
  );
}
