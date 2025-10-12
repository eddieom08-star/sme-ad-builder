import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { AdsListClient } from "@/components/ads/ads-list-client";

export default async function AdsPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight lg:text-3xl">Ads</h1>
          <p className="text-sm text-muted-foreground lg:text-base">
            Manage your advertising creatives
          </p>
        </div>
        <Link href="/ads/new">
          <Button size="sm" className="lg:h-10">
            <Plus className="h-4 w-4 mr-1 lg:mr-2" />
            <span className="hidden sm:inline">New Ad</span>
            <span className="sm:hidden">New</span>
          </Button>
        </Link>
      </div>

      {/* Client-side ads content */}
      <AdsListClient />
    </div>
  );
}
