'use client';

import { useWizardStore, type Platform, type CampaignObjective } from '@/lib/stores/wizard-store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Target,
  Eye,
  MousePointer,
  UserPlus,
  ShoppingCart,
  Facebook,
  Instagram,
  Chrome,
  Linkedin
} from 'lucide-react';
import { cn } from '@/lib/utils';

const OBJECTIVES = [
  {
    value: 'awareness' as CampaignObjective,
    label: 'Brand Awareness',
    description: 'Reach people most likely to remember your brand',
    icon: Eye,
  },
  {
    value: 'traffic' as CampaignObjective,
    label: 'Traffic',
    description: 'Drive more visitors to your website or app',
    icon: MousePointer,
  },
  {
    value: 'leads' as CampaignObjective,
    label: 'Lead Generation',
    description: 'Collect leads and build your customer list',
    icon: UserPlus,
  },
  {
    value: 'conversions' as CampaignObjective,
    label: 'Conversions',
    description: 'Drive valuable actions on your website or app',
    icon: ShoppingCart,
  },
];

const PLATFORMS = [
  {
    value: 'facebook' as Platform,
    label: 'Facebook',
    description: 'Reach 2.9B+ users worldwide',
    icon: Facebook,
    color: 'text-blue-600',
  },
  {
    value: 'instagram' as Platform,
    label: 'Instagram',
    description: 'Engage visual-focused audiences',
    icon: Instagram,
    color: 'text-pink-600',
  },
  {
    value: 'google' as Platform,
    label: 'Google Ads',
    description: 'Capture intent-driven searches',
    icon: Chrome,
    color: 'text-red-600',
  },
  {
    value: 'linkedin' as Platform,
    label: 'LinkedIn',
    description: 'Target professional audiences',
    icon: Linkedin,
    color: 'text-blue-700',
  },
];

export function CampaignSetupStep() {
  const {
    campaignName,
    campaignDescription,
    objective,
    platforms,
    updateCampaignSetup,
    validationErrors,
  } = useWizardStore();

  const handlePlatformToggle = (platform: Platform) => {
    const newPlatforms = platforms.includes(platform)
      ? platforms.filter(p => p !== platform)
      : [...platforms, platform];
    updateCampaignSetup({ platforms: newPlatforms });
  };

  return (
    <div className="space-y-6 p-6">
      {/* Campaign Name */}
      <div className="space-y-2">
        <Label htmlFor="campaignName" className="text-base font-semibold">
          Campaign Name *
        </Label>
        <Input
          id="campaignName"
          placeholder="e.g., Summer Sale 2025"
          value={campaignName}
          onChange={(e) => updateCampaignSetup({ campaignName: e.target.value })}
          className={cn(
            'text-base',
            validationErrors.campaignName && 'border-destructive'
          )}
        />
        {validationErrors.campaignName && (
          <p className="text-sm text-destructive">
            {validationErrors.campaignName[0]}
          </p>
        )}
        <p className="text-xs text-muted-foreground">
          Choose a clear, descriptive name for your campaign
        </p>
      </div>

      {/* Campaign Description (Optional) */}
      <div className="space-y-2">
        <Label htmlFor="campaignDescription" className="text-base font-semibold">
          Description <span className="text-muted-foreground font-normal">(Optional)</span>
        </Label>
        <Textarea
          id="campaignDescription"
          placeholder="What is this campaign about?"
          value={campaignDescription}
          onChange={(e) => updateCampaignSetup({ campaignDescription: e.target.value })}
          rows={3}
          className="resize-none"
        />
        <p className="text-xs text-muted-foreground">
          Internal notes about this campaign (not shown to customers)
        </p>
      </div>

      {/* Campaign Objective */}
      <div className="space-y-3">
        <div>
          <Label className="text-base font-semibold">Campaign Objective *</Label>
          <p className="text-xs text-muted-foreground mt-1">
            What do you want to achieve with this campaign?
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {OBJECTIVES.map((obj) => {
            const Icon = obj.icon;
            const isSelected = objective === obj.value;

            return (
              <Card
                key={obj.value}
                className={cn(
                  'cursor-pointer transition-all hover:border-primary hover:shadow-md',
                  isSelected && 'border-primary bg-primary/5 shadow-md'
                )}
                onClick={() => updateCampaignSetup({ objective: obj.value })}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start gap-3">
                    <div
                      className={cn(
                        'rounded-lg p-2',
                        isSelected ? 'bg-primary/10' : 'bg-muted'
                      )}
                    >
                      <Icon
                        className={cn(
                          'h-5 w-5',
                          isSelected ? 'text-primary' : 'text-muted-foreground'
                        )}
                      />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-sm font-semibold">
                        {obj.label}
                      </CardTitle>
                      <CardDescription className="text-xs mt-1">
                        {obj.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            );
          })}
        </div>

        {validationErrors.objective && (
          <p className="text-sm text-destructive">
            {validationErrors.objective[0]}
          </p>
        )}
      </div>

      {/* Platform Selection */}
      <div className="space-y-3">
        <div>
          <Label className="text-base font-semibold">Advertising Platforms *</Label>
          <p className="text-xs text-muted-foreground mt-1">
            Select where you want your ads to appear (select all that apply)
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {PLATFORMS.map((platform) => {
            const Icon = platform.icon;
            const isSelected = platforms.includes(platform.value);

            return (
              <Card
                key={platform.value}
                className={cn(
                  'cursor-pointer transition-all hover:border-primary hover:shadow-md',
                  isSelected && 'border-primary bg-primary/5 shadow-md'
                )}
                onClick={() => handlePlatformToggle(platform.value)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => handlePlatformToggle(platform.value)}
                      className="mt-1"
                      onClick={(e) => e.stopPropagation()}
                    />
                    <div
                      className={cn(
                        'rounded-lg p-2',
                        isSelected ? 'bg-primary/10' : 'bg-muted'
                      )}
                    >
                      <Icon
                        className={cn(
                          'h-5 w-5',
                          isSelected ? platform.color : 'text-muted-foreground'
                        )}
                      />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-sm font-semibold">
                        {platform.label}
                      </CardTitle>
                      <CardDescription className="text-xs mt-1">
                        {platform.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            );
          })}
        </div>

        {validationErrors.platforms && (
          <p className="text-sm text-destructive">
            {validationErrors.platforms[0]}
          </p>
        )}
      </div>

      {/* Info Banner */}
      <Card className="bg-muted/50 border-dashed">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <Target className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
            <div className="space-y-1 text-sm">
              <p className="font-medium">Campaign Setup Tips</p>
              <ul className="text-muted-foreground space-y-1 text-xs">
                <li>• Choose a descriptive campaign name to easily identify it later</li>
                <li>• Your objective determines how the platform optimizes ad delivery</li>
                <li>• Running ads on multiple platforms increases your reach</li>
                <li>• You can always pause or edit campaigns after launch</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
