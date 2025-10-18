'use client';

import { useWizardStore, type AdFormat, type Platform } from '@/lib/stores/wizard-store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Image, Video, Sparkles, Plus, Trash2, Upload, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

const AD_FORMATS = [
  { value: 'image' as AdFormat, label: 'Single Image', icon: Image, description: 'One image ad' },
  { value: 'video' as AdFormat, label: 'Video', icon: Video, description: 'Video ad' },
  { value: 'carousel' as AdFormat, label: 'Carousel', icon: Image, description: 'Multiple images' },
  { value: 'story' as AdFormat, label: 'Story', icon: Image, description: 'Vertical format' },
];

const CTA_OPTIONS = [
  'Learn More', 'Shop Now', 'Sign Up', 'Download', 'Get Quote',
  'Contact Us', 'Book Now', 'Apply Now', 'Subscribe', 'See Menu',
];

const PLATFORM_LIMITS = {
  facebook: { headline: 40, primaryText: 125, description: 30 },
  instagram: { headline: 40, primaryText: 2200, description: 30 },
  google: { headline: 30, primaryText: 90, description: 90 },
  linkedin: { headline: 70, primaryText: 150, description: 70 },
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

  const [currentAdId, setCurrentAdId] = useState<string | null>(
    ads.length > 0 ? ads[0].id! : null
  );

  const currentAd = ads.find(ad => ad.id === currentAdId);
  const currentPlatform = currentAd?.platform || platforms[0] || 'facebook';
  const limits = PLATFORM_LIMITS[currentPlatform];

  const handleCreateAd = () => {
    const newAd = {
      format: 'image' as AdFormat,
      platform: platforms[0] || 'facebook',
      headline: '',
      primaryText: '',
      description: '',
      callToAction: 'Learn More',
      media: [],
      destinationUrl: '',
    };
    addAd(newAd);

    // Set the newly created ad as current
    // Note: addAd in wizard-store adds a UUID, so we need to get the updated ads array
    setTimeout(() => {
      const updatedAds = useWizardStore.getState().ads;
      const lastAd = updatedAds[updatedAds.length - 1];
      if (lastAd?.id) {
        setCurrentAdId(lastAd.id);
      }
    }, 50);
  };

  const handleDeleteAd = (id: string) => {
    removeAd(id);
    if (currentAdId === id && ads.length > 1) {
      const remainingAd = ads.find(ad => ad.id !== id);
      setCurrentAdId(remainingAd?.id || null);
    }
  };

  const handleUpdateAd = (updates: any) => {
    if (currentAdId) {
      updateAd(currentAdId, updates);
    }
  };

  // Simple mock image URL generator
  const handleAddMedia = () => {
    const mockImageUrl = `https://images.unsplash.com/photo-${Math.floor(Math.random() * 1000000)}?w=1200&h=628`;
    if (currentAd) {
      handleUpdateAd({
        media: [
          ...currentAd.media,
          { url: mockImageUrl, type: 'image' as const, width: 1200, height: 628 },
        ],
      });
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Ad List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-base font-semibold">Your Ads ({ads.length})</Label>
          <Button type="button" size="sm" onClick={handleCreateAd}>
            <Plus className="h-4 w-4 mr-2" />
            Create Ad
          </Button>
        </div>

        {ads.length === 0 && (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-8">
              <Image className="h-12 w-12 text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground mb-4">
                No ads created yet. Click "Create Ad" to get started.
              </p>
              <Button type="button" onClick={handleCreateAd}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Ad
              </Button>
            </CardContent>
          </Card>
        )}

        {ads.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            {ads.map((ad, index) => (
              <Card
                key={ad.id}
                className={cn(
                  'cursor-pointer transition-all hover:shadow-md flex-shrink-0',
                  currentAdId === ad.id && 'border-primary shadow-md'
                )}
                onClick={() => setCurrentAdId(ad.id!)}
              >
                <CardHeader className="pb-2 pt-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-sm truncate">
                        Ad #{index + 1} - {ad.platform}
                      </CardTitle>
                      <CardDescription className="text-xs mt-1">
                        {ad.format} format
                      </CardDescription>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteAd(ad.id!);
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Ad Editor */}
      {currentAd && (
        <div className="space-y-6 border-t pt-6">
          {/* Platform & Format */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="platform" className="text-base font-semibold">
                Platform *
              </Label>
              <Select
                value={currentAd.platform}
                onValueChange={(value) => handleUpdateAd({ platform: value })}
              >
                <SelectTrigger id="platform">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {platforms.map((platform) => (
                    <SelectItem key={platform} value={platform}>
                      {platform.charAt(0).toUpperCase() + platform.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="format" className="text-base font-semibold">
                Ad Format *
              </Label>
              <Select
                value={currentAd.format}
                onValueChange={(value) => handleUpdateAd({ format: value })}
              >
                <SelectTrigger id="format">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {AD_FORMATS.map((format) => (
                    <SelectItem key={format.value} value={format.value}>
                      {format.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Media Upload */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Media *</Label>

            {currentAd.media.length > 0 ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {currentAd.media.map((media, index) => (
                  <Card key={index} className="overflow-hidden">
                    <div className="aspect-video bg-muted relative">
                      <img
                        src={media.url}
                        alt={`Media ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={() => {
                          handleUpdateAd({
                            media: currentAd.media.filter((_, i) => i !== index),
                          });
                        }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-8">
                  <Upload className="h-8 w-8 text-muted-foreground mb-3" />
                  <p className="text-sm text-muted-foreground mb-4">
                    Click to upload image or video
                  </p>
                  <Button type="button" variant="outline" onClick={handleAddMedia}>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Media (Demo)
                  </Button>
                  <p className="text-xs text-muted-foreground mt-2">
                    Demo: Adds a sample image from Unsplash
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Headline */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="headline" className="text-base font-semibold">
                Headline *
              </Label>
              <span className="text-xs text-muted-foreground">
                {currentAd.headline.length}/{limits.headline}
              </span>
            </div>
            <Input
              id="headline"
              placeholder="e.g., Summer Sale - 30% Off Everything"
              value={currentAd.headline}
              onChange={(e) => handleUpdateAd({ headline: e.target.value })}
              maxLength={limits.headline}
              className={cn(
                validationErrors[`ad_${ads.indexOf(currentAd)}_headline`] && 'border-destructive'
              )}
            />
            {validationErrors[`ad_${ads.indexOf(currentAd)}_headline`] && (
              <p className="text-sm text-destructive">
                {validationErrors[`ad_${ads.indexOf(currentAd)}_headline`][0]}
              </p>
            )}
          </div>

          {/* Primary Text */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="primaryText" className="text-base font-semibold">
                Primary Text *
              </Label>
              <span className="text-xs text-muted-foreground">
                {currentAd.primaryText.length}/{limits.primaryText}
              </span>
            </div>
            <Textarea
              id="primaryText"
              placeholder="Tell people about your product or service..."
              value={currentAd.primaryText}
              onChange={(e) => handleUpdateAd({ primaryText: e.target.value })}
              maxLength={limits.primaryText}
              rows={4}
              className={cn(
                'resize-none',
                validationErrors[`ad_${ads.indexOf(currentAd)}_primaryText`] && 'border-destructive'
              )}
            />
            {validationErrors[`ad_${ads.indexOf(currentAd)}_primaryText`] && (
              <p className="text-sm text-destructive">
                {validationErrors[`ad_${ads.indexOf(currentAd)}_primaryText`][0]}
              </p>
            )}
          </div>

          {/* Description (Optional) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="description" className="text-base font-semibold">
                Description <span className="text-muted-foreground font-normal text-sm">(Optional)</span>
              </Label>
              {currentAd.description && (
                <span className="text-xs text-muted-foreground">
                  {currentAd.description.length}/{limits.description}
                </span>
              )}
            </div>
            <Input
              id="description"
              placeholder="Additional description"
              value={currentAd.description || ''}
              onChange={(e) => handleUpdateAd({ description: e.target.value })}
              maxLength={limits.description}
            />
          </div>

          {/* Call to Action */}
          <div className="space-y-2">
            <Label htmlFor="cta" className="text-base font-semibold">
              Call to Action *
            </Label>
            <Select
              value={currentAd.callToAction}
              onValueChange={(value) => handleUpdateAd({ callToAction: value })}
            >
              <SelectTrigger id="cta">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CTA_OPTIONS.map((cta) => (
                  <SelectItem key={cta} value={cta}>
                    {cta}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Destination URL */}
          <div className="space-y-2">
            <Label htmlFor="destinationUrl" className="text-base font-semibold">
              Destination URL *
            </Label>
            <Input
              id="destinationUrl"
              type="url"
              placeholder="https://yourwebsite.com/product"
              value={currentAd.destinationUrl}
              onChange={(e) => handleUpdateAd({ destinationUrl: e.target.value })}
              className={cn(
                validationErrors[`ad_${ads.indexOf(currentAd)}_url`] && 'border-destructive'
              )}
            />
            {validationErrors[`ad_${ads.indexOf(currentAd)}_url`] && (
              <p className="text-sm text-destructive">
                {validationErrors[`ad_${ads.indexOf(currentAd)}_url`][0]}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              Where people will go when they click your ad
            </p>
          </div>

          {/* AI Suggestions (Coming Soon) */}
          <Card className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950 dark:to-blue-950 border-purple-200 dark:border-purple-800">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-sm">AI Copy Suggestions</p>
                  <p className="text-xs text-muted-foreground">
                    Get AI-powered headline and copy suggestions (coming soon)
                  </p>
                </div>
                <Button type="button" variant="outline" size="sm" disabled>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tips */}
      <Card className="bg-muted/50 border-dashed">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <Eye className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
            <div className="space-y-1 text-sm">
              <p className="font-medium">Ad Creative Tips</p>
              <ul className="text-muted-foreground space-y-1 text-xs">
                <li>• Use high-quality images (min 1200x628px for feed ads)</li>
                <li>• Keep headlines short and attention-grabbing</li>
                <li>• Highlight benefits, not just features</li>
                <li>• Include a clear call-to-action</li>
                <li>• Test multiple ad variations (A/B testing)</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
