import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Sparkles } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'Create Ad | SME Ad Builder',
  description: 'Create a new advertisement',
};

export default async function NewAdPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/ads">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Ads
          </Button>
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-bold tracking-tight lg:text-3xl">Create New Ad</h1>
        <p className="text-sm text-muted-foreground lg:text-base">
          Create individual ad variations for your campaigns
        </p>
      </div>

      {/* Coming Soon Card */}
      <Card className="shadow-sm">
        <CardContent className="flex flex-col items-center justify-center py-12 lg:py-16">
          <div className="rounded-full bg-primary/10 p-4 lg:p-6 mb-4">
            <Sparkles className="h-8 w-8 lg:h-12 lg:w-12 text-primary" />
          </div>
          <h3 className="text-lg lg:text-xl font-semibold mb-2">Ad Builder Coming Soon</h3>
          <p className="text-sm text-muted-foreground text-center max-w-md mb-6">
            We're working on a powerful ad creation tool. For now, you can create ads through the Campaign Wizard.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link href="/campaigns/new">
              <Button>
                Create Campaign with Ads
              </Button>
            </Link>
            <Link href="/ads">
              <Button variant="outline">
                View Existing Ads
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="bg-muted/50 border-dashed">
        <CardHeader>
          <CardTitle className="text-base">What you can do now</CardTitle>
          <CardDescription>
            While we build the standalone ad creator
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="text-sm space-y-2 text-muted-foreground">
            <li>• Create ads as part of a campaign using the Campaign Wizard</li>
            <li>• View and manage existing ads in your campaigns</li>
            <li>• Edit ad creative and copy in campaign settings</li>
            <li>• Test different ad variations with A/B testing</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
