'use client';

import { useWizardStore, type AdFormat, type Platform } from '@/lib/stores/wizard-store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Image,
  Video,
  Sparkles,
  Plus,
  Trash2,
  Upload,
  Eye,
  CheckCircle2,
  Circle,
  Facebook,
  Instagram,
  Linkedin,
  Play
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

const AD_FORMATS = [
  { value: 'image' as AdFormat, label: 'Single Image', icon: Image, description: 'Best for products & services' },
  { value: 'video' as AdFormat, label: 'Video', icon: Video, description: 'Engage with motion' },
  { value: 'carousel' as AdFormat, label: 'Carousel', icon: Image, description: 'Multiple images in sequence' },
  { value: 'story' as AdFormat, label: 'Story', icon: Image, description: 'Vertical full-screen' },
];

const CTA_OPTIONS = {
  facebook: ['Learn More', 'Shop Now', 'Sign Up', 'Download', 'Contact Us', 'Book Now', 'Apply Now', 'Get Quote'],
  instagram: ['Learn More', 'Shop Now', 'Sign Up', 'Contact Us', 'Book Now', 'View More'],
  google: ['Learn More', 'Get Started', 'Sign Up', 'Buy Now', 'Contact Sales', 'Request Quote'],
  linkedin: ['Learn More', 'Sign Up', 'Download', 'Register', 'Subscribe', 'Join Now', 'Contact Us'],
  tiktok: ['Learn More', 'Shop Now', 'Sign Up', 'Download', 'Watch Now', 'Visit Website', 'Contact Us'],
};

const PLATFORM_LIMITS = {
  facebook: { headline: 40, primaryText: 125, description: 30 },
  instagram: { headline: 40, primaryText: 2200, description: 30 },
  google: { headline: 30, primaryText: 90, description: 90 },
  linkedin: { headline: 70, primaryText: 150, description: 70 },
  tiktok: { headline: 100, primaryText: 1000, description: 80 },
};

const PLATFORM_ICONS: Record<Platform, any> = {
  facebook: Facebook,
  instagram: Instagram,
  google: () => <span className="font-bold text-lg">G</span>,
  linkedin: Linkedin,
  tiktok: Play,
};

const PLATFORM_COLORS: Record<Platform, string> = {
  facebook: 'from-blue-500 to-blue-600',
  instagram: 'from-pink-500 via-purple-500 to-orange-500',
  google: 'from-blue-500 via-red-500 to-yellow-500',
  linkedin: 'from-blue-600 to-blue-700',
  tiktok: 'from-black via-[#25F4EE] to-[#FE2C55]',
};

export function CreativeStep() {
  const {
    ads,
    platforms,
    addAd,
    updateAd,
    removeAd,
    validationErrors,
  } = useWizardStore();

  // Group ads by platform
  const adsByPlatform = platforms.reduce((acc, platform) => {
    acc[platform] = ads.filter(ad => ad.platform === platform);
    return acc;
  }, {} as Record<Platform, typeof ads>);

  // Track which platform accordions are open
  const [openPlatforms, setOpenPlatforms] = useState<string[]>(platforms.length > 0 ? [platforms[0]] : []);

  const handleCreateAd = (platform: Platform) => {
    const newAd = {
      format: 'image' as AdFormat,
      platform,
      headline: '',
      primaryText: '',
      description: '',
      callToAction: CTA_OPTIONS[platform][0],
      media: [],
      destinationUrl: '',
    };
    addAd(newAd);
  };

  const handleUpdateAd = (adId: string, updates: any) => {
    updateAd(adId, updates);
  };

  const handleDeleteAd = (id: string) => {
    removeAd(id);
  };

  const handleAddMedia = (adId: string, currentMedia: any[]) => {
    const mockImageUrl = `https://images.unsplash.com/photo-${Math.floor(Math.random() * 1000000)}?w=1200&h=628`;
    updateAd(adId, {
      media: [
        ...currentMedia,
        { url: mockImageUrl, type: 'image' as const, width: 1200, height: 628 },
      ],
    });
  };

  const getAdCompletion = (ad: any) => {
    const required = [ad.headline, ad.primaryText, ad.callToAction, ad.destinationUrl, ad.media.length > 0];
    const completed = required.filter(Boolean).length;
    return { completed, total: required.length, percentage: (completed / required.length) * 100 };
  };

  const getPlatformCompletion = (platform: Platform) => {
    const platformAds = adsByPlatform[platform];
    if (platformAds.length === 0) return 0;
    const totalCompletion = platformAds.reduce((sum, ad) => sum + getAdCompletion(ad).percentage, 0);
    return totalCompletion / platformAds.length;
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header with Platform Overview */}
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Create Your Ad Creative</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Create compelling ads for each platform. Each platform has different requirements and best practices.
          </p>
        </div>

        {/* Platform Summary Cards */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {platforms.map((platform) => {
            const Icon = PLATFORM_ICONS[platform];
            const count = adsByPlatform[platform].length;
            const completion = getPlatformCompletion(platform);

            return (
              <Card key={platform} className="relative overflow-hidden">
                <div className={cn(
                  "absolute inset-0 opacity-10 bg-gradient-to-br",
                  PLATFORM_COLORS[platform]
                )} />
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        "h-8 w-8 rounded-md bg-gradient-to-br flex items-center justify-center text-white",
                        PLATFORM_COLORS[platform]
                      )}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div>
                        <CardTitle className="text-sm capitalize">{platform}</CardTitle>
                        <CardDescription className="text-xs">
                          {count} {count === 1 ? 'ad' : 'ads'}
                        </CardDescription>
                      </div>
                    </div>
                    {count > 0 && completion === 100 && (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    )}
                  </div>
                </CardHeader>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Platform Accordions */}
      <Accordion
        type="multiple"
        value={openPlatforms}
        onValueChange={setOpenPlatforms}
        className="space-y-4"
      >
        {platforms.map((platform) => {
          const Icon = PLATFORM_ICONS[platform];
          const platformAds = adsByPlatform[platform];
          const limits = PLATFORM_LIMITS[platform];
          const completion = getPlatformCompletion(platform);

          return (
            <AccordionItem
              key={platform}
              value={platform}
              className="border rounded-lg px-4 bg-card"
            >
              <AccordionTrigger className="hover:no-underline py-4">
                <div className="flex items-center justify-between w-full pr-4">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "h-10 w-10 rounded-lg bg-gradient-to-br flex items-center justify-center text-white",
                      PLATFORM_COLORS[platform]
                    )}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold capitalize">{platform} Ads</p>
                      <p className="text-sm text-muted-foreground">
                        {platformAds.length} {platformAds.length === 1 ? 'variation' : 'variations'}
                        {platformAds.length > 0 && ` • ${Math.round(completion)}% complete`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {platformAds.length === 0 ? (
                      <Badge variant="outline" className="text-xs">No ads yet</Badge>
                    ) : completion === 100 ? (
                      <Badge className="bg-green-500 text-xs">Complete</Badge>
                    ) : (
                      <Badge variant="secondary" className="text-xs">In Progress</Badge>
                    )}
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-4 pb-6">
                {/* Empty State */}
                {platformAds.length === 0 && (
                  <Card className="border-dashed">
                    <CardContent className="flex flex-col items-center justify-center py-8">
                      <div className={cn(
                        "h-12 w-12 rounded-full bg-gradient-to-br flex items-center justify-center text-white mb-3",
                        PLATFORM_COLORS[platform]
                      )}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <p className="font-medium mb-1">Create your first {platform} ad</p>
                      <p className="text-sm text-muted-foreground mb-4 text-center max-w-sm">
                        Get started by creating an ad variation for {platform}. You can create multiple variations to test.
                      </p>
                      <Button
                        type="button"
                        onClick={() => handleCreateAd(platform)}
                        className={cn(
                          "bg-gradient-to-r text-white",
                          PLATFORM_COLORS[platform]
                        )}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Create {platform.charAt(0).toUpperCase() + platform.slice(1)} Ad
                      </Button>
                    </CardContent>
                  </Card>
                )}

                {/* Ad Variations */}
                {platformAds.map((ad, index) => {
                  const adIndex = ads.indexOf(ad);
                  const adCompletion = getAdCompletion(ad);

                  return (
                    <Card key={ad.id} className="overflow-hidden">
                      <CardHeader className="bg-muted/50 pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center h-8 w-8 rounded-full bg-background border-2 border-primary/20">
                              <span className="text-sm font-semibold">{index + 1}</span>
                            </div>
                            <div>
                              <CardTitle className="text-base">
                                Ad Variation {index + 1}
                              </CardTitle>
                              <CardDescription className="text-xs mt-0.5">
                                {adCompletion.completed}/{adCompletion.total} fields completed
                              </CardDescription>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {adCompletion.percentage === 100 && (
                              <Badge className="bg-green-500 text-xs">
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                Ready
                              </Badge>
                            )}
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteAd(ad.id!)}
                              className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        {/* Progress Bar */}
                        <div className="mt-2">
                          <div className="h-1.5 w-full bg-background rounded-full overflow-hidden">
                            <div
                              className={cn(
                                "h-full bg-gradient-to-r transition-all",
                                PLATFORM_COLORS[platform]
                              )}
                              style={{ width: `${adCompletion.percentage}%` }}
                            />
                          </div>
                        </div>
                      </CardHeader>

                      <CardContent className="space-y-4 pt-6">
                        {/* Ad Format */}
                        <div className="space-y-2">
                          <Label htmlFor={`format-${ad.id}`} className="text-sm font-medium">
                            Ad Format *
                          </Label>
                          <Select
                            value={ad.format}
                            onValueChange={(value) => handleUpdateAd(ad.id!, { format: value })}
                          >
                            <SelectTrigger id={`format-${ad.id}`}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {AD_FORMATS.map((format) => {
                                const FormatIcon = format.icon;
                                return (
                                  <SelectItem key={format.value} value={format.value}>
                                    <div className="flex items-center gap-2">
                                      <FormatIcon className="h-4 w-4" />
                                      <div>
                                        <div className="font-medium">{format.label}</div>
                                        <div className="text-xs text-muted-foreground">{format.description}</div>
                                      </div>
                                    </div>
                                  </SelectItem>
                                );
                              })}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Media Upload */}
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Media *</Label>
                          {ad.media.length > 0 ? (
                            <div className="space-y-2">
                              <div className="grid gap-2 sm:grid-cols-2">
                                {ad.media.map((media, mediaIndex) => (
                                  <Card key={mediaIndex} className="overflow-hidden group relative">
                                    <div className="aspect-video bg-muted">
                                      <img
                                        src={media.url}
                                        alt={`Media ${mediaIndex + 1}`}
                                        className="w-full h-full object-cover"
                                      />
                                    </div>
                                    <Button
                                      type="button"
                                      variant="destructive"
                                      size="sm"
                                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                      onClick={() => {
                                        handleUpdateAd(ad.id!, {
                                          media: ad.media.filter((_, i) => i !== mediaIndex),
                                        });
                                      }}
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  </Card>
                                ))}
                              </div>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => handleAddMedia(ad.id!, ad.media)}
                                className="w-full"
                              >
                                <Plus className="h-4 w-4 mr-2" />
                                Add More Media
                              </Button>
                            </div>
                          ) : (
                            <Card className="border-dashed hover:border-primary transition-colors cursor-pointer">
                              <CardContent
                                className="flex flex-col items-center justify-center py-8"
                                onClick={() => handleAddMedia(ad.id!, ad.media)}
                              >
                                <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                                <p className="text-sm font-medium mb-1">Upload Media</p>
                                <p className="text-xs text-muted-foreground mb-3">
                                  Recommended: 1200x628px (1.91:1 ratio)
                                </p>
                                <Button type="button" variant="outline" size="sm">
                                  <Upload className="h-4 w-4 mr-2" />
                                  Choose File (Demo)
                                </Button>
                              </CardContent>
                            </Card>
                          )}
                          {validationErrors[`ad_${adIndex}_media`] && (
                            <p className="text-sm text-destructive">
                              {validationErrors[`ad_${adIndex}_media`][0]}
                            </p>
                          )}
                        </div>

                        {/* Headline */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label htmlFor={`headline-${ad.id}`} className="text-sm font-medium">
                              Headline *
                            </Label>
                            <span className="text-xs text-muted-foreground">
                              {ad.headline.length}/{limits.headline}
                            </span>
                          </div>
                          <Input
                            id={`headline-${ad.id}`}
                            placeholder="e.g., Summer Sale - 30% Off Everything"
                            value={ad.headline}
                            onChange={(e) => handleUpdateAd(ad.id!, { headline: e.target.value })}
                            maxLength={limits.headline}
                            className={cn(
                              validationErrors[`ad_${adIndex}_headline`] && 'border-destructive'
                            )}
                          />
                          {validationErrors[`ad_${adIndex}_headline`] && (
                            <p className="text-sm text-destructive">
                              {validationErrors[`ad_${adIndex}_headline`][0]}
                            </p>
                          )}
                        </div>

                        {/* Primary Text */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label htmlFor={`primaryText-${ad.id}`} className="text-sm font-medium">
                              Primary Text *
                            </Label>
                            <span className="text-xs text-muted-foreground">
                              {ad.primaryText.length}/{limits.primaryText}
                            </span>
                          </div>
                          <Textarea
                            id={`primaryText-${ad.id}`}
                            placeholder="Tell people about your product or service..."
                            value={ad.primaryText}
                            onChange={(e) => handleUpdateAd(ad.id!, { primaryText: e.target.value })}
                            maxLength={limits.primaryText}
                            rows={3}
                            className={cn(
                              'resize-none',
                              validationErrors[`ad_${adIndex}_primaryText`] && 'border-destructive'
                            )}
                          />
                          {validationErrors[`ad_${adIndex}_primaryText`] && (
                            <p className="text-sm text-destructive">
                              {validationErrors[`ad_${adIndex}_primaryText`][0]}
                            </p>
                          )}
                        </div>

                        {/* Call to Action */}
                        <div className="space-y-2">
                          <Label htmlFor={`cta-${ad.id}`} className="text-sm font-medium">
                            Call to Action *
                          </Label>
                          <Select
                            value={ad.callToAction}
                            onValueChange={(value) => handleUpdateAd(ad.id!, { callToAction: value })}
                          >
                            <SelectTrigger id={`cta-${ad.id}`}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {CTA_OPTIONS[platform].map((cta) => (
                                <SelectItem key={cta} value={cta}>
                                  {cta}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Destination URL */}
                        <div className="space-y-2">
                          <Label htmlFor={`url-${ad.id}`} className="text-sm font-medium">
                            Destination URL *
                          </Label>
                          <Input
                            id={`url-${ad.id}`}
                            type="url"
                            placeholder="https://yourwebsite.com/product"
                            value={ad.destinationUrl}
                            onChange={(e) => handleUpdateAd(ad.id!, { destinationUrl: e.target.value })}
                            className={cn(
                              validationErrors[`ad_${adIndex}_url`] && 'border-destructive'
                            )}
                          />
                          {validationErrors[`ad_${adIndex}_url`] && (
                            <p className="text-sm text-destructive">
                              {validationErrors[`ad_${adIndex}_url`][0]}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground">
                            Where people go when they click your ad
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}

                {/* Add Variation Button */}
                {platformAds.length > 0 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleCreateAd(platform)}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Another Variation
                  </Button>
                )}
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>

      {/* AI Suggestions */}
      <Card className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950 dark:to-blue-950 border-purple-200 dark:border-purple-800">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center shrink-0">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-sm">AI-Powered Copy Suggestions</p>
              <p className="text-xs text-muted-foreground">
                Get platform-optimized headlines and copy suggestions (coming soon)
              </p>
            </div>
            <Button type="button" variant="outline" size="sm" disabled>
              <Sparkles className="h-4 w-4 mr-2" />
              Generate
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Best Practices */}
      <Card className="bg-muted/50 border-dashed">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <Eye className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
            <div className="space-y-2 text-sm">
              <p className="font-medium">Platform-Specific Best Practices</p>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <p className="font-medium text-xs text-muted-foreground mb-1">General Tips:</p>
                  <ul className="text-muted-foreground space-y-1 text-xs">
                    <li>• Use high-quality images (min 1200x628px)</li>
                    <li>• Keep headlines short and attention-grabbing</li>
                    <li>• Test multiple ad variations (A/B testing)</li>
                  </ul>
                </div>
                <div>
                  <p className="font-medium text-xs text-muted-foreground mb-1">Platform Tips:</p>
                  <ul className="text-muted-foreground space-y-1 text-xs">
                    <li>• Facebook: Focus on community and connection</li>
                    <li>• Instagram: Use visual storytelling</li>
                    <li>• Google: Emphasize search intent</li>
                    <li>• LinkedIn: Professional, business-focused copy</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
