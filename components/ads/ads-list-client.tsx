'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, FileText, Eye, MousePointer } from 'lucide-react';

interface Ad {
  id: string;
  campaignId: string;
  name: string;
  format: string;
  platform: string;
  headline: string;
  body: string;
  callToAction: string;
  imageUrl?: string;
  videoUrl?: string;
  targetUrl: string;
  status: string;
  createdAt: string;
  impressions: number;
  clicks: number;
  spend: string;
}

export function AdsListClient() {
  const [ads, setAds] = useState<Ad[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('ads');
      if (stored) {
        setAds(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading ads:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-muted-foreground">Loading ads...</div>
      </div>
    );
  }

  const activeAds = ads.filter(a => a.status === 'active').length;
  const totalImpressions = ads.reduce((sum, a) => sum + (a.impressions || 0), 0);
  const totalClicks = ads.reduce((sum, a) => sum + (a.clicks || 0), 0);
  const avgCTR = totalImpressions > 0 ? (totalClicks / totalImpressions * 100).toFixed(2) : '0';

  return (
    <>
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
            <div className="text-2xl font-bold">{activeAds}</div>
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
            <div className="text-2xl font-bold">{totalImpressions.toLocaleString()}</div>
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
            <div className="text-2xl font-bold">{avgCTR}%</div>
            <p className="text-xs text-muted-foreground">
              Average CTR
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Ads Grid or Empty State */}
      {ads.length === 0 ? (
        <Card className="shadow-sm">
          <CardContent className="flex flex-col items-center justify-center py-12 lg:py-16">
            <div className="rounded-full bg-primary/10 p-4 lg:p-6 mb-4">
              <FileText className="h-8 w-8 lg:h-12 lg:w-12 text-primary" />
            </div>
            <h3 className="text-lg lg:text-xl font-semibold mb-2">No ads yet</h3>
            <p className="text-sm text-muted-foreground text-center max-w-sm mb-6">
              Ads are created when you launch a campaign. Create your first campaign to see ads here.
            </p>
            <Link href="/campaigns/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Campaign
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {ads.map((ad) => (
            <Card key={ad.id} className="shadow-sm hover:shadow-md transition-shadow overflow-hidden">
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
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-sm lg:text-base truncate">{ad.headline}</CardTitle>
                    <CardDescription className="text-xs mt-1 line-clamp-2">
                      {ad.body}
                    </CardDescription>
                  </div>
                  <Badge
                    className={
                      ad.status === 'active'
                        ? 'bg-green-100 text-green-800 hover:bg-green-100'
                        : 'bg-gray-100 text-gray-800 hover:bg-gray-100'
                    }
                  >
                    {ad.status}
                  </Badge>
                </div>
                <div className="flex gap-1 mt-2">
                  <Badge variant="secondary" className="text-xs">
                    {ad.platform}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {ad.format}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="p-4 pt-0">
                <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                  <div>
                    <p className="text-muted-foreground">Impressions</p>
                    <p className="font-semibold">{ad.impressions?.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Clicks</p>
                    <p className="font-semibold">{ad.clicks?.toLocaleString()}</p>
                  </div>
                </div>
                <div className="text-xs">
                  <p className="text-muted-foreground mb-1">Call to Action:</p>
                  <Badge variant="secondary" className="text-xs">
                    {ad.callToAction}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
