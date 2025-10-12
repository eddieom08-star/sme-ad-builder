'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Target, Calendar, DollarSign, Eye, MousePointerClick } from 'lucide-react';

interface Campaign {
  id: string;
  name: string;
  description: string;
  status: string;
  budget: string;
  budgetType: string;
  platforms: string[];
  startDate: string;
  endDate: string;
  createdAt: string;
  targeting?: any;
}

export function CampaignsListClient() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load campaigns from localStorage
    try {
      const stored = localStorage.getItem('campaigns');
      if (stored) {
        const parsed = JSON.parse(stored);
        setCampaigns(parsed);
      }
    } catch (error) {
      console.error('Error loading campaigns:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-muted-foreground">Loading campaigns...</div>
      </div>
    );
  }

  const activeCampaigns = campaigns.filter(c => c.status === 'active').length;
  const draftCampaigns = campaigns.filter(c => c.status === 'draft').length;
  const totalBudget = campaigns.reduce((sum, c) => sum + parseFloat(c.budget || '0'), 0);

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Quick Stats */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4 lg:gap-6">
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Campaigns</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{campaigns.length}</div>
            <p className="text-xs text-muted-foreground">
              Across all platforms
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Campaigns</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeCampaigns}</div>
            <p className="text-xs text-muted-foreground">
              Currently running
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Drafts</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{draftCampaigns}</div>
            <p className="text-xs text-muted-foreground">
              Pending launch
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalBudget.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Allocated budget
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Campaign List or Empty State */}
      {campaigns.length === 0 ? (
        <Card className="shadow-sm">
          <CardContent className="flex flex-col items-center justify-center py-12 lg:py-16">
            <div className="rounded-full bg-primary/10 p-4 lg:p-6 mb-4">
              <Target className="h-8 w-8 lg:h-12 lg:w-12 text-primary" />
            </div>
            <h3 className="text-lg lg:text-xl font-semibold mb-2">No campaigns yet</h3>
            <p className="text-sm text-muted-foreground text-center max-w-sm mb-6">
              Create your first campaign to start reaching more customers and growing your business.
            </p>
            <Link href="/campaigns/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Campaign
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 lg:gap-6">
          {campaigns.map((campaign) => (
            <Link key={campaign.id} href={`/campaigns/${campaign.id}`}>
              <Card className="shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-base lg:text-lg">{campaign.name}</CardTitle>
                      <CardDescription className="text-xs lg:text-sm mt-1">
                        {campaign.description || 'No description'}
                      </CardDescription>
                      <div className="flex gap-2 mt-2">
                        {campaign.platforms?.map((platform) => (
                          <Badge key={platform} variant="secondary" className="text-xs">
                            {platform}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="ml-4">
                      <Badge
                        className={
                          campaign.status === 'active'
                            ? 'bg-green-100 text-green-800 hover:bg-green-100'
                            : campaign.status === 'draft'
                            ? 'bg-blue-100 text-blue-800 hover:bg-blue-100'
                            : campaign.status === 'paused'
                            ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100'
                            : 'bg-gray-100 text-gray-800 hover:bg-gray-100'
                        }
                      >
                        {campaign.status === 'draft' ? 'Draft' : campaign.status}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Budget</p>
                      <p className="text-sm lg:text-base font-semibold">
                        ${campaign.budget} <span className="text-xs font-normal text-muted-foreground">
                          {campaign.budgetType === 'daily' ? '/day' : 'total'}
                        </span>
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Start Date</p>
                      <p className="text-sm lg:text-base font-semibold">
                        {new Date(campaign.startDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">End Date</p>
                      <p className="text-sm lg:text-base font-semibold">
                        {new Date(campaign.endDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Created</p>
                      <p className="text-sm lg:text-base font-semibold">
                        {new Date(campaign.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
                {campaign.status === 'draft' && (
                  <div className="border-t bg-blue-50 dark:bg-blue-950 px-6 py-3">
                    <p className="text-xs text-blue-800 dark:text-blue-200">
                      <strong>Draft:</strong> This campaign hasn't been launched yet. Complete all steps in the campaign wizard and click "Launch Campaign" to activate it.
                    </p>
                  </div>
                )}
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
