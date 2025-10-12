'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import {
  CheckCircle2,
  Calendar,
  DollarSign,
  Users,
  Eye,
  MousePointerClick,
  ArrowLeft,
  Edit,
  Pause,
  Play,
  TrendingUp,
  Globe,
  Target,
  Trash2,
} from 'lucide-react';
import Link from 'next/link';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

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

interface CampaignDetailClientProps {
  campaignId: string;
}

export function CampaignDetailClient({ campaignId }: CampaignDetailClientProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPausing, setIsPausing] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    // Load campaign from localStorage
    try {
      const stored = localStorage.getItem('campaigns');
      if (stored) {
        const campaigns: Campaign[] = JSON.parse(stored);
        const found = campaigns.find(c => c.id === campaignId);
        setCampaign(found || null);
      }
    } catch (error) {
      console.error('Error loading campaign:', error);
    } finally {
      setIsLoading(false);
    }
  }, [campaignId]);

  const handlePauseCampaign = () => {
    if (!campaign) return;

    setIsPausing(true);
    try {
      // Update campaign status in localStorage
      const stored = localStorage.getItem('campaigns');
      if (stored) {
        const campaigns: Campaign[] = JSON.parse(stored);
        const updatedCampaigns = campaigns.map(c =>
          c.id === campaignId
            ? { ...c, status: c.status === 'paused' ? 'active' : 'paused' }
            : c
        );
        localStorage.setItem('campaigns', JSON.stringify(updatedCampaigns));

        // Update local state
        const updated = updatedCampaigns.find(c => c.id === campaignId);
        if (updated) {
          setCampaign(updated);
          toast({
            title: updated.status === 'paused' ? 'Campaign Paused' : 'Campaign Resumed',
            description: updated.status === 'paused'
              ? 'Your campaign has been paused and ads are no longer being delivered.'
              : 'Your campaign is now active and ads are being delivered again.',
          });
        }
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update campaign status. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsPausing(false);
    }
  };

  const handleEditCampaign = () => {
    toast({
      title: 'Edit Campaign',
      description: 'Redirecting to campaign editor...',
    });
    router.push(`/campaigns/new?edit=${campaignId}`);
  };

  const handleDeleteCampaign = () => {
    try {
      // Remove campaign from localStorage
      const stored = localStorage.getItem('campaigns');
      if (stored) {
        const campaigns = JSON.parse(stored);
        const updated = campaigns.filter((c: Campaign) => c.id !== campaignId);
        localStorage.setItem('campaigns', JSON.stringify(updated));
      }

      // Remove associated ads
      const storedAds = localStorage.getItem('ads');
      if (storedAds) {
        const allAds = JSON.parse(storedAds);
        const updatedAds = allAds.filter((ad: any) => ad.campaignId !== campaignId);
        localStorage.setItem('ads', JSON.stringify(updatedAds));
      }

      toast({
        title: 'Campaign deleted',
        description: `"${campaign?.name}" has been permanently deleted.`,
      });

      // Redirect to campaigns list
      router.push('/campaigns');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete campaign. Please try again.',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-muted-foreground">Loading campaign...</div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="space-y-4">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground mb-4">Campaign not found</p>
            <Link href="/campaigns">
              <Button>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Campaigns
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isActive = campaign.status === 'active';
  const isPaused = campaign.status === 'paused';
  const isDraft = campaign.status === 'draft';

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link href="/campaigns">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            All Campaigns
          </Button>
        </Link>
      </div>

      {/* Success/Status Banner */}
      <Card className={
        isActive ? "bg-gradient-to-r from-green-50 to-emerald-50 border-green-200" :
        isPaused ? "bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200" :
        "bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200"
      }>
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className={`rounded-full p-3 ${
              isActive ? 'bg-green-100' :
              isPaused ? 'bg-yellow-100' :
              'bg-blue-100'
            }`}>
              <CheckCircle2 className={`h-8 w-8 ${
                isActive ? 'text-green-600' :
                isPaused ? 'text-yellow-600' :
                'text-blue-600'
              }`} />
            </div>
            <div className="flex-1">
              <h2 className={`text-xl font-bold mb-1 ${
                isActive ? 'text-green-900' :
                isPaused ? 'text-yellow-900' :
                'text-blue-900'
              }`}>
                {campaign.name}
              </h2>
              <p className={`text-sm mb-4 ${
                isActive ? 'text-green-800' :
                isPaused ? 'text-yellow-800' :
                'text-blue-800'
              }`}>
                {isActive && 'Your campaign is live and ads are being delivered to your target audience.'}
                {isPaused && 'Campaign is paused. Ads are not being delivered.'}
                {isDraft && 'This campaign is in draft status. Complete and launch to activate.'}
                {' '}Campaign ID: #{campaign.id}
              </p>
              <div className="flex flex-wrap gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleEditCampaign}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Campaign
                </Button>
                {!isDraft && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePauseCampaign}
                    disabled={isPausing}
                  >
                    {isPaused ? (
                      <>
                        <Play className="h-4 w-4 mr-2" />
                        Resume Campaign
                      </>
                    ) : (
                      <>
                        <Pause className="h-4 w-4 mr-2" />
                        Pause Campaign
                      </>
                    )}
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                  onClick={() => setShowDeleteDialog(true)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Campaign
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Campaign Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
            {isActive ? <Play className="h-4 w-4 text-muted-foreground" /> :
             isPaused ? <Pause className="h-4 w-4 text-muted-foreground" /> :
             <Edit className="h-4 w-4 text-muted-foreground" />}
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Badge className={
                isActive ? 'bg-green-100 text-green-800 hover:bg-green-100' :
                isPaused ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100' :
                'bg-blue-100 text-blue-800 hover:bg-blue-100'
              }>
                {campaign.status}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {isActive && 'Campaign is live'}
              {isPaused && 'Ads not delivered'}
              {isDraft && 'Not launched'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Budget Spent</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$0.00</div>
            <p className="text-xs text-muted-foreground">
              Campaign just started
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Impressions</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              Gathering data...
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clicks</CardTitle>
            <MousePointerClick className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              0% CTR
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Campaign Details */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Campaign Information</CardTitle>
            <CardDescription>
              Basic details about your campaign
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <Globe className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">Platforms</p>
                <div className="flex gap-1 mt-1">
                  {campaign.platforms?.map((platform) => (
                    <Badge key={platform} variant="secondary" className="text-xs">
                      {platform}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">Campaign Period</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(campaign.startDate).toLocaleDateString()} - {new Date(campaign.endDate).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <DollarSign className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">Budget</p>
                <p className="text-sm text-muted-foreground">
                  ${campaign.budget} {campaign.budgetType === 'daily' ? '/ day' : 'total'}
                </p>
              </div>
            </div>
            {campaign.targeting && (
              <div className="flex items-start gap-3">
                <Target className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Target Audience</p>
                  <p className="text-sm text-muted-foreground">
                    Ages {campaign.targeting.ageMin}-{campaign.targeting.ageMax}
                    {campaign.targeting.locations && ` • ${campaign.targeting.locations.length} location(s)`}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Performance Overview</CardTitle>
            <CardDescription>
              Real-time campaign metrics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Impressions</span>
                <span className="text-sm text-muted-foreground">Starting soon</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Clicks</span>
                <span className="text-sm text-muted-foreground">Starting soon</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Conversions</span>
                <span className="text-sm text-muted-foreground">Starting soon</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">CTR</span>
                <span className="text-sm text-muted-foreground">--</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">CPC</span>
                <span className="text-sm text-muted-foreground">--</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Next Steps */}
      {!isPaused && !isDraft && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              What happens next?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="flex gap-3">
                <span className="font-bold text-primary">1.</span>
                <div>
                  <p className="font-medium">Ads are being reviewed</p>
                  <p className="text-muted-foreground">
                    Platform providers will review your ads (usually takes 15-30 minutes)
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <span className="font-bold text-primary">2.</span>
                <div>
                  <p className="font-medium">Delivery begins</p>
                  <p className="text-muted-foreground">
                    Once approved, ads will start showing to your target audience
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <span className="font-bold text-primary">3.</span>
                <div>
                  <p className="font-medium">Monitor performance</p>
                  <p className="text-muted-foreground">
                    Check back in a few hours to see real-time metrics and optimize as needed
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pro Tip */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <div className="text-2xl">💡</div>
            <div>
              <p className="font-semibold text-blue-900 mb-1">Pro Tip</p>
              <p className="text-sm text-blue-800">
                {isPaused ?
                  'You can resume your campaign anytime by clicking the "Resume Campaign" button above.' :
                  'Let your campaign run for at least 3-5 days before making major changes. This gives the platform time to optimize delivery and find your best-performing audience.'
                }
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Campaign?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>&quot;{campaign.name}&quot;</strong>?
              {isActive && (
                <span className="block mt-2 text-red-600 font-medium">
                  ⚠️ This campaign is currently active. Deleting it will stop all ad delivery immediately.
                </span>
              )}
              <span className="block mt-2">
                This action cannot be undone. All campaign data and associated ads will be permanently deleted.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteCampaign}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              Delete Campaign
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
