import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
} from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'Campaign Details | SME Ad Builder',
  description: 'View campaign details and performance',
};

interface CampaignDetailPageProps {
  params: {
    id: string;
  };
}

export default async function CampaignDetailPage({ params }: CampaignDetailPageProps) {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  const campaignId = params.id;

  // TODO: Fetch campaign data from database
  // For now, show success/mock page

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/campaigns">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              All Campaigns
            </Button>
          </Link>
        </div>
      </div>

      {/* Success Banner */}
      <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="rounded-full bg-green-100 p-3">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-green-900 mb-1">
                Campaign Launched Successfully!
              </h2>
              <p className="text-sm text-green-800 mb-4">
                Your campaign is now live and ads are being delivered to your target audience.
                Campaign ID: #{campaignId}
              </p>
              <div className="flex gap-3">
                <Link href={`/campaigns/${campaignId}/edit`}>
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Campaign
                  </Button>
                </Link>
                <Button variant="outline" size="sm">
                  <Pause className="h-4 w-4 mr-2" />
                  Pause Campaign
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
            <Play className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                Active
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Campaign is live
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
              <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">Campaign Period</p>
                <p className="text-sm text-muted-foreground">
                  Data will be loaded from campaign settings
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Users className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">Target Audience</p>
                <p className="text-sm text-muted-foreground">
                  Based on targeting settings
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <DollarSign className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">Total Budget</p>
                <p className="text-sm text-muted-foreground">
                  Set in budget configuration
                </p>
              </div>
            </div>
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

      {/* Pro Tip */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <div className="text-2xl">💡</div>
            <div>
              <p className="font-semibold text-blue-900 mb-1">Pro Tip</p>
              <p className="text-sm text-blue-800">
                Let your campaign run for at least 3-5 days before making major changes. This gives the platform time to optimize delivery and find your best-performing audience.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
