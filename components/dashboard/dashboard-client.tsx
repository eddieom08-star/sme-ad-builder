'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Activity, DollarSign, Target, TrendingUp, Plus, Eye, MousePointerClick } from 'lucide-react';

interface Campaign {
  id: string;
  name: string;
  status: string;
  budget: string;
  budgetType: string;
  platforms: string[];
  startDate: string;
  endDate: string;
  createdAt: string;
}

interface Ad {
  id: string;
  campaignId: string;
  name: string;
  platform: string;
  status: string;
  impressions: number;
  clicks: number;
  spend: string;
}

export function DashboardClient() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [ads, setAds] = useState<Ad[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const storedCampaigns = localStorage.getItem('campaigns');
      const storedAds = localStorage.getItem('ads');

      if (storedCampaigns) {
        setCampaigns(JSON.parse(storedCampaigns));
      }
      if (storedAds) {
        setAds(JSON.parse(storedAds));
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  if (isLoading) {
    return <div className="text-center py-8 text-muted-foreground">Loading...</div>;
  }

  const activeCampaigns = campaigns.filter(c => c.status === 'active').length;
  const totalBudget = campaigns.reduce((sum, c) => sum + parseFloat(c.budget || '0'), 0);
  const totalSpend = ads.reduce((sum, a) => sum + parseFloat(a.spend || '0'), 0);
  const totalImpressions = ads.reduce((sum, a) => sum + (a.impressions || 0), 0);
  const totalClicks = ads.reduce((sum, a) => sum + (a.clicks || 0), 0);

  return (
    <>
      {/* Stats Grid */}
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4 lg:gap-4">
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium lg:text-sm">
              Active Campaigns
            </CardTitle>
            <Target className="h-3.5 w-3.5 text-muted-foreground lg:h-4 lg:w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold lg:text-2xl">{activeCampaigns}</div>
            <p className="text-[10px] text-muted-foreground lg:text-xs">
              {campaigns.length} total
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium lg:text-sm">Total Ads</CardTitle>
            <Activity className="h-3.5 w-3.5 text-muted-foreground lg:h-4 lg:w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold lg:text-2xl">{ads.length}</div>
            <p className="text-[10px] text-muted-foreground lg:text-xs">
              Ad creatives
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium lg:text-sm">Total Budget</CardTitle>
            <DollarSign className="h-3.5 w-3.5 text-muted-foreground lg:h-4 lg:w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold lg:text-2xl">${totalBudget.toFixed(2)}</div>
            <p className="text-[10px] text-muted-foreground lg:text-xs">Allocated</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium lg:text-sm">Impressions</CardTitle>
            <Eye className="h-3.5 w-3.5 text-muted-foreground lg:h-4 lg:w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold lg:text-2xl">{totalImpressions.toLocaleString()}</div>
            <p className="text-[10px] text-muted-foreground lg:text-xs">
              {totalClicks} clicks
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Campaigns */}
      {campaigns.length > 0 && (
        <Card className="shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base lg:text-lg">Recent Campaigns</CardTitle>
                <CardDescription className="text-xs lg:text-sm">
                  Your latest advertising campaigns
                </CardDescription>
              </div>
              <Link href="/campaigns">
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {campaigns.slice(0, 3).map((campaign) => (
                <Link key={campaign.id} href={`/campaigns/${campaign.id}`}>
                  <div className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent transition-colors cursor-pointer">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{campaign.name}</p>
                      <div className="flex gap-2 mt-1">
                        {campaign.platforms?.map((platform) => (
                          <Badge key={platform} variant="secondary" className="text-xs">
                            {platform}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-sm font-semibold">${campaign.budget}</p>
                        <p className="text-xs text-muted-foreground">
                          {campaign.budgetType === 'daily' ? '/day' : 'total'}
                        </p>
                      </div>
                      <Badge
                        className={
                          campaign.status === 'active'
                            ? 'bg-green-100 text-green-800 hover:bg-green-100'
                            : 'bg-gray-100 text-gray-800 hover:bg-gray-100'
                        }
                      >
                        {campaign.status}
                      </Badge>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Ads */}
      {ads.length > 0 && (
        <Card className="shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base lg:text-lg">Recent Ad Creatives</CardTitle>
                <CardDescription className="text-xs lg:text-sm">
                  Your latest ad creatives
                </CardDescription>
              </div>
              <Link href="/ads">
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {ads.slice(0, 3).map((ad) => (
                <div key={ad.id} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{ad.name}</p>
                    <div className="flex gap-2 mt-1">
                      <Badge variant="secondary" className="text-xs">{ad.platform}</Badge>
                      <Badge variant="outline" className="text-xs">{ad.status}</Badge>
                    </div>
                  </div>
                  <div className="text-right text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      <span>{ad.impressions.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MousePointerClick className="h-3 w-3" />
                      <span>{ad.clicks.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Getting Started - Only show if no campaigns */}
      {campaigns.length === 0 && (
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
      )}
    </>
  );
}
