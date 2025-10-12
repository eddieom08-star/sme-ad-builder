import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, FileText, Eye, MousePointer } from "lucide-react";

export default async function AdsPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  // TODO: Fetch ads from database
  const ads: any[] = [];

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

      {/* Empty State */}
      {ads.length === 0 ? (
        <Card className="shadow-sm">
          <CardContent className="flex flex-col items-center justify-center py-12 lg:py-16">
            <div className="rounded-full bg-primary/10 p-4 lg:p-6 mb-4">
              <FileText className="h-8 w-8 lg:h-12 lg:w-12 text-primary" />
            </div>
            <h3 className="text-lg lg:text-xl font-semibold mb-2">No ads yet</h3>
            <p className="text-sm text-muted-foreground text-center max-w-sm mb-6">
              Create your first ad creative to start promoting your products and services.
            </p>
            <Link href="/ads/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Ad
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        /* Ads Grid */
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {ads.map((ad: any) => (
            <Card key={ad.id} className="shadow-sm hover:shadow-md transition-shadow cursor-pointer overflow-hidden">
              {/* Ad Preview Image */}
              {ad.imageUrl && (
                <div className="aspect-video bg-muted relative">
                  <img
                    src={ad.imageUrl}
                    alt={ad.name}
                    className="object-cover w-full h-full"
                  />
                </div>
              )}

              <CardHeader className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-sm lg:text-base truncate">{ad.name}</CardTitle>
                    <CardDescription className="text-xs mt-1">
                      {ad.platform}
                    </CardDescription>
                  </div>
                  <span className="ml-2 inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800 shrink-0">
                    Active
                  </span>
                </div>
              </CardHeader>

              <CardContent className="p-4 pt-0">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <p className="text-muted-foreground">Impressions</p>
                    <p className="font-semibold">{ad.impressions?.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Clicks</p>
                    <p className="font-semibold">{ad.clicks?.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4 lg:gap-6">
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Ads</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{ads.length}</div>
            <p className="text-xs text-muted-foreground">
              All creatives
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              Currently running
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Impressions</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              Total views
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Click Rate</CardTitle>
            <MousePointer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0%</div>
            <p className="text-xs text-muted-foreground">
              Average CTR
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
