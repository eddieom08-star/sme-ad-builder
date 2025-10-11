import { auth } from "@clerk/nextjs/server";
import { currentUser } from "@clerk/nextjs/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Activity, DollarSign, Target, TrendingUp, Plus } from "lucide-react";
import Link from "next/link";

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

      {/* Stats Grid - Responsive */}
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4 lg:gap-4">
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium lg:text-sm">
              Active Campaigns
            </CardTitle>
            <Target className="h-3.5 w-3.5 text-muted-foreground lg:h-4 lg:w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold lg:text-2xl">0</div>
            <p className="text-[10px] text-muted-foreground lg:text-xs">
              No campaigns yet
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium lg:text-sm">Total Leads</CardTitle>
            <Activity className="h-3.5 w-3.5 text-muted-foreground lg:h-4 lg:w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold lg:text-2xl">0</div>
            <p className="text-[10px] text-muted-foreground lg:text-xs">
              Start generating leads
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium lg:text-sm">Total Spend</CardTitle>
            <DollarSign className="h-3.5 w-3.5 text-muted-foreground lg:h-4 lg:w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold lg:text-2xl">$0.00</div>
            <p className="text-[10px] text-muted-foreground lg:text-xs">This month</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium lg:text-sm">ROAS</CardTitle>
            <TrendingUp className="h-3.5 w-3.5 text-muted-foreground lg:h-4 lg:w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold lg:text-2xl">-</div>
            <p className="text-[10px] text-muted-foreground lg:text-xs">
              Return on ad spend
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Getting Started */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-base lg:text-lg">Get Started</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Start building your first marketing campaign to reach more customers.
          </p>
          <Link href="/campaigns/new" className="hidden lg:inline-flex">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Campaign
            </Button>
          </Link>
          <Link href="/campaigns/new" className="lg:hidden">
            <Button className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Create Campaign
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
