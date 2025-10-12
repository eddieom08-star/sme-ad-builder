'use client';

import { useWizardStore } from '@/lib/stores/wizard-store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CheckCircle2, AlertCircle, Calendar, DollarSign, Users, Target, Image as ImageIcon, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';

export function PreviewStep() {
  const {
    campaignName,
    campaignDescription,
    objective,
    platforms,
    targeting,
    budgetType,
    budgetAmount,
    currency,
    startDate,
    endDate,
    bidStrategy,
    ads,
    validationErrors,
  } = useWizardStore();

  const start = new Date(startDate);
  const end = new Date(endDate);
  const durationDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  const totalBudget = budgetType === 'daily' ? budgetAmount * durationDays : budgetAmount;
  const currencySymbol = currency === 'USD' ? '$' : currency === 'GBP' ? '£' : currency === 'EUR' ? '€' : 'C$';

  const hasErrors = Object.keys(validationErrors).length > 0;
  const estimatedAudienceSize = targeting.locations.length * 500000;

  return (
    <div className="space-y-6 p-6">
      {/* Status Banner */}
      {hasErrors ? (
        <Card className="border-destructive bg-destructive/5">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-destructive">Campaign has validation errors</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Please go back and fix the errors before launching
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-green-500 bg-green-50 dark:bg-green-950">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-green-900 dark:text-green-100">Ready to launch!</p>
                <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                  Your campaign is configured correctly and ready to go live
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Campaign Overview */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Campaign Overview</h3>
        <Card>
          <CardHeader>
            <CardTitle>{campaignName}</CardTitle>
            {campaignDescription && (
              <CardDescription>{campaignDescription}</CardDescription>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex items-start gap-3">
                <Target className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Objective</p>
                  <p className="text-sm text-muted-foreground capitalize">{objective}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Globe className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Platforms</p>
                  <div className="flex gap-1 mt-1">
                    {platforms.map((platform) => (
                      <Badge key={platform} variant="secondary" className="capitalize">
                        {platform}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Audience */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Target Audience</h3>
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <p className="text-sm font-medium mb-1">Age Range</p>
                <p className="text-sm text-muted-foreground">
                  {targeting.ageMin} - {targeting.ageMax} years
                </p>
              </div>

              <div>
                <p className="text-sm font-medium mb-1">Gender</p>
                <p className="text-sm text-muted-foreground capitalize">
                  {targeting.genders.join(', ')}
                </p>
              </div>

              <div>
                <p className="text-sm font-medium mb-1">Audience Size</p>
                <p className="text-sm text-muted-foreground">
                  ~{estimatedAudienceSize.toLocaleString()} people
                </p>
              </div>
            </div>

            <Separator />

            <div>
              <p className="text-sm font-medium mb-2">Locations</p>
              <div className="flex flex-wrap gap-1">
                {targeting.locations.map((location) => (
                  <Badge key={location.name} variant="outline">
                    {location.name}
                  </Badge>
                ))}
              </div>
            </div>

            {targeting.interests.length > 0 && (
              <>
                <Separator />
                <div>
                  <p className="text-sm font-medium mb-2">Interests</p>
                  <div className="flex flex-wrap gap-1">
                    {targeting.interests.map((interest) => (
                      <Badge key={interest} variant="secondary">
                        {interest}
                      </Badge>
                    ))}
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Budget & Schedule */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Budget & Schedule</h3>
        <Card>
          <CardContent className="pt-6">
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <DollarSign className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Budget</p>
                    <p className="text-lg font-bold text-primary">
                      {currencySymbol}{budgetAmount.toFixed(2)}/{budgetType}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Total: {currencySymbol}{totalBudget.toFixed(2)}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Users className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Bid Strategy</p>
                    <p className="text-sm text-muted-foreground capitalize">
                      {bidStrategy.replace('_', ' ')}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="text-sm font-medium mb-2">Schedule</p>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <p>Start: {new Date(startDate).toLocaleDateString()}</p>
                    <p>End: {new Date(endDate).toLocaleDateString()}</p>
                    <p className="font-medium text-foreground">
                      Duration: {durationDays} day{durationDays !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Ads */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Ad Creatives ({ads.length})</h3>
        <div className="grid gap-4">
          {ads.map((ad, index) => (
            <Card key={ad.id || index}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base">Ad #{index + 1}</CardTitle>
                    <CardDescription className="capitalize">
                      {ad.platform} • {ad.format}
                    </CardDescription>
                  </div>
                  <Badge variant="secondary">{ad.callToAction}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Media Preview */}
                {ad.media.length > 0 && (
                  <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                    <img
                      src={ad.media[0].url}
                      alt="Ad preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {/* Copy */}
                <div className="space-y-2">
                  <div>
                    <p className="text-sm font-semibold">{ad.headline}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{ad.primaryText}</p>
                  </div>
                  {ad.description && (
                    <div>
                      <p className="text-xs text-muted-foreground">{ad.description}</p>
                    </div>
                  )}
                  <div className="pt-2">
                    <a
                      href={ad.destinationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary hover:underline"
                    >
                      {ad.destinationUrl}
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {ads.length === 0 && (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-8">
                <ImageIcon className="h-12 w-12 text-muted-foreground mb-3" />
                <p className="text-sm text-muted-foreground">
                  No ads created yet. Go back to Step 4 to create ads.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Estimated Performance */}
      <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
        <CardHeader>
          <CardTitle className="text-base">Estimated Performance</CardTitle>
          <CardDescription>
            Based on your budget and targeting
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">
                {(budgetAmount * 200).toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Estimated Impressions</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">
                {(budgetAmount * 4).toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Estimated Clicks</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">
                2.0%
              </p>
              <p className="text-xs text-muted-foreground mt-1">Estimated CTR</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground text-center mt-4 italic">
            * Estimates are based on historical averages and may vary
          </p>
        </CardContent>
      </Card>

      {/* Launch Instructions */}
      <Card className="bg-muted/50 border-dashed">
        <CardContent className="pt-6">
          <div className="space-y-3 text-sm">
            <p className="font-medium">Before you launch:</p>
            <ul className="space-y-2 text-muted-foreground list-disc list-inside">
              <li>Review all campaign details above</li>
              <li>Ensure your payment method is connected</li>
              <li>Double-check your destination URLs work correctly</li>
              <li>Your campaign will start immediately after launch</li>
              <li>You can pause or edit the campaign anytime</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
