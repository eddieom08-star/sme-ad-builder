'use client';

import { useWizardStore, type Platform, type AdCreative } from '@/lib/stores/wizard-store';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Facebook,
  Instagram,
  Linkedin,
  Globe,
  Play,
  ShoppingBag,
  Heart,
  MessageCircle,
  Share2,
  MoreHorizontal,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

const PLATFORM_CONFIG = {
  facebook: {
    name: 'Facebook',
    icon: Facebook,
    color: 'from-blue-600 to-blue-700',
    bgColor: 'bg-[#1877F2]',
  },
  instagram: {
    name: 'Instagram',
    icon: Instagram,
    color: 'from-pink-500 via-purple-500 to-orange-500',
    bgColor: 'bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600',
  },
  google: {
    name: 'Google Ads',
    icon: Globe,
    color: 'from-blue-500 via-red-500 to-yellow-500',
    bgColor: 'bg-[#4285F4]',
  },
  linkedin: {
    name: 'LinkedIn',
    icon: Linkedin,
    color: 'from-blue-600 to-blue-700',
    bgColor: 'bg-[#0A66C2]',
  },
} as const;

interface AdPreviewPanelProps {
  className?: string;
}

export function AdPreviewPanel({ className }: AdPreviewPanelProps) {
  const { platforms, ads, campaignName } = useWizardStore();
  const [selectedPlatform, setSelectedPlatform] = useState<Platform | null>(
    platforms[0] || null
  );

  // Get the first ad for the selected platform
  const currentAd = ads.find(ad => ad.platform === selectedPlatform);

  // Update selected platform when platforms change
  if (selectedPlatform && !platforms.includes(selectedPlatform) && platforms.length > 0) {
    setSelectedPlatform(platforms[0]);
  }

  if (platforms.length === 0) {
    return (
      <Card className={cn("h-full flex items-center justify-center", className)}>
        <CardContent className="text-center py-12">
          <Sparkles className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="font-semibold mb-2">No Platforms Selected</h3>
          <p className="text-sm text-muted-foreground">
            Select platforms in Step 1 to see ad previews
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Header */}
      <div className="border-b px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-sm">Ad Preview</h3>
            <p className="text-xs text-muted-foreground">
              Real-time preview across platforms
            </p>
          </div>
          <Badge variant="secondary" className="text-xs">
            {platforms.length} {platforms.length === 1 ? 'Platform' : 'Platforms'}
          </Badge>
        </div>
      </div>

      {/* Platform Tabs */}
      <Tabs
        value={selectedPlatform || platforms[0]}
        onValueChange={(value) => setSelectedPlatform(value as Platform)}
        className="flex-1 flex flex-col"
      >
        <TabsList className="w-full justify-start rounded-none border-b bg-transparent p-0 h-auto">
          {platforms.map((platform) => {
            const config = PLATFORM_CONFIG[platform];
            const Icon = config.icon;
            return (
              <TabsTrigger
                key={platform}
                value={platform}
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-muted/50 px-4 py-3"
              >
                <Icon className="h-4 w-4 mr-2" />
                <span className="text-xs font-medium">{config.name}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        <div className="flex-1 overflow-auto p-4">
          {platforms.map((platform) => (
            <TabsContent key={platform} value={platform} className="mt-0">
              {platform === 'facebook' && <FacebookPreview ad={currentAd} campaignName={campaignName} />}
              {platform === 'instagram' && <InstagramPreview ad={currentAd} campaignName={campaignName} />}
              {platform === 'google' && <GooglePreview ad={currentAd} campaignName={campaignName} />}
              {platform === 'linkedin' && <LinkedInPreview ad={currentAd} campaignName={campaignName} />}
            </TabsContent>
          ))}
        </div>
      </Tabs>
    </div>
  );
}

// Facebook Feed Ad Preview
function FacebookPreview({ ad, campaignName }: { ad?: AdCreative; campaignName: string }) {
  if (!ad) {
    return <EmptyPreview platform="Facebook" />;
  }

  return (
    <Card className="max-w-md mx-auto border shadow-lg">
      {/* Post Header */}
      <div className="p-3 flex items-center gap-3 border-b">
        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold">
          {campaignName.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1">
          <div className="font-semibold text-sm">{campaignName || 'Your Business'}</div>
          <div className="text-xs text-muted-foreground flex items-center gap-1">
            Sponsored · <Globe className="h-3 w-3" />
          </div>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </div>

      {/* Post Content */}
      <div className="p-3 space-y-3">
        <p className="text-sm whitespace-pre-wrap">
          {ad.primaryText || 'Your ad copy will appear here...'}
        </p>
      </div>

      {/* Media */}
      {ad.media[0] && (
        <div className="relative aspect-video bg-muted">
          {ad.media[0].type === 'image' ? (
            <img
              src={ad.media[0].url}
              alt={ad.headline}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-black">
              <Play className="h-16 w-16 text-white" />
            </div>
          )}
        </div>
      )}

      {/* Link Card */}
      <div className="border-t p-3 bg-muted/30">
        <div className="text-xs text-muted-foreground mb-1">
          {ad.destinationUrl ? new URL(ad.destinationUrl).hostname.toUpperCase() : 'YOURWEBSITE.COM'}
        </div>
        <div className="font-semibold text-sm mb-1">
          {ad.headline || 'Your headline goes here'}
        </div>
        {ad.description && (
          <div className="text-xs text-muted-foreground line-clamp-1">
            {ad.description}
          </div>
        )}
      </div>

      {/* CTA Button */}
      <div className="p-3 pt-0">
        <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white" size="sm">
          {ad.callToAction || 'Learn More'}
        </Button>
      </div>

      {/* Engagement */}
      <div className="border-t p-3 flex items-center justify-between text-muted-foreground">
        <Button variant="ghost" size="sm" className="flex-1">
          <Heart className="h-4 w-4 mr-1" />
          <span className="text-xs">Like</span>
        </Button>
        <Button variant="ghost" size="sm" className="flex-1">
          <MessageCircle className="h-4 w-4 mr-1" />
          <span className="text-xs">Comment</span>
        </Button>
        <Button variant="ghost" size="sm" className="flex-1">
          <Share2 className="h-4 w-4 mr-1" />
          <span className="text-xs">Share</span>
        </Button>
      </div>
    </Card>
  );
}

// Instagram Feed Ad Preview
function InstagramPreview({ ad, campaignName }: { ad?: AdCreative; campaignName: string }) {
  if (!ad) {
    return <EmptyPreview platform="Instagram" />;
  }

  return (
    <Card className="max-w-md mx-auto border shadow-lg">
      {/* Post Header */}
      <div className="p-3 flex items-center gap-3">
        <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 p-0.5">
          <div className="h-full w-full rounded-full bg-white flex items-center justify-center">
            <div className="h-6 w-6 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-white text-xs font-semibold">
              {campaignName.charAt(0).toUpperCase()}
            </div>
          </div>
        </div>
        <div className="flex-1">
          <div className="font-semibold text-sm">{campaignName || 'yourbusiness'}</div>
          <div className="text-xs text-muted-foreground">Sponsored</div>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </div>

      {/* Media */}
      {ad.media[0] && (
        <div className="relative aspect-square bg-muted">
          {ad.media[0].type === 'image' ? (
            <img
              src={ad.media[0].url}
              alt={ad.headline}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-black">
              <Play className="h-16 w-16 text-white" />
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="p-3 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Heart className="h-6 w-6" />
            <MessageCircle className="h-6 w-6" />
            <Share2 className="h-6 w-6" />
          </div>
          <ShoppingBag className="h-6 w-6" />
        </div>

        {/* Caption */}
        <div className="text-sm">
          <span className="font-semibold mr-2">{campaignName || 'yourbusiness'}</span>
          <span className="whitespace-pre-wrap">
            {ad.primaryText || 'Your ad copy will appear here...'}
          </span>
        </div>

        {/* CTA */}
        <Button
          variant="outline"
          className="w-full border-2 font-semibold"
          size="sm"
        >
          {ad.callToAction || 'Learn More'}
        </Button>
      </div>
    </Card>
  );
}

// Google Search Ad Preview
function GooglePreview({ ad, campaignName }: { ad?: AdCreative; campaignName: string }) {
  if (!ad) {
    return <EmptyPreview platform="Google" />;
  }

  const displayUrl = ad.destinationUrl
    ? new URL(ad.destinationUrl).hostname.replace('www.', '')
    : 'yourwebsite.com';

  return (
    <Card className="max-w-2xl mx-auto border shadow-lg">
      <CardContent className="p-6 space-y-2">
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-1">
            {/* Ad Label */}
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs font-normal px-1.5 py-0.5">
                Ad
              </Badge>
              <div className="flex items-center text-xs text-muted-foreground">
                <Globe className="h-3 w-3 mr-1" />
                {displayUrl}
              </div>
            </div>

            {/* Headline */}
            <h3 className="text-xl text-blue-600 hover:underline cursor-pointer font-normal">
              {ad.headline || 'Your headline goes here'}
            </h3>

            {/* URL Path */}
            <div className="text-sm text-green-700">
              {ad.destinationUrl || 'https://yourwebsite.com/landing-page'}
            </div>

            {/* Description */}
            <p className="text-sm text-gray-700">
              {ad.description || ad.primaryText || 'Your ad description will appear here. This is where you describe your product or service to potential customers.'}
            </p>

            {/* CTA Extensions */}
            <div className="flex gap-2 pt-2">
              <Button variant="link" size="sm" className="h-auto p-0 text-blue-600 text-xs">
                {ad.callToAction || 'Learn More'}
              </Button>
              <span className="text-muted-foreground text-xs">•</span>
              <Button variant="link" size="sm" className="h-auto p-0 text-blue-600 text-xs">
                Contact Us
              </Button>
              <span className="text-muted-foreground text-xs">•</span>
              <Button variant="link" size="sm" className="h-auto p-0 text-blue-600 text-xs">
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// LinkedIn Feed Ad Preview
function LinkedInPreview({ ad, campaignName }: { ad?: AdCreative; campaignName: string }) {
  if (!ad) {
    return <EmptyPreview platform="LinkedIn" />;
  }

  return (
    <Card className="max-w-md mx-auto border shadow-lg">
      {/* Post Header */}
      <div className="p-3 flex items-center gap-3 border-b">
        <div className="h-12 w-12 rounded bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center text-white font-semibold text-lg">
          {campaignName.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1">
          <div className="font-semibold text-sm">{campaignName || 'Your Company'}</div>
          <div className="text-xs text-muted-foreground">Company · Promoted</div>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </div>

      {/* Post Content */}
      <div className="p-3">
        <p className="text-sm whitespace-pre-wrap mb-3">
          {ad.primaryText || 'Your ad copy will appear here...'}
        </p>
      </div>

      {/* Media */}
      {ad.media[0] && (
        <div className="relative aspect-video bg-muted">
          {ad.media[0].type === 'image' ? (
            <img
              src={ad.media[0].url}
              alt={ad.headline}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-black">
              <Play className="h-16 w-16 text-white" />
            </div>
          )}
        </div>
      )}

      {/* Link Card */}
      <div className="border-t p-3 bg-muted/30">
        <div className="font-semibold text-sm mb-1 flex items-center gap-2">
          {ad.headline || 'Your headline goes here'}
          <ExternalLink className="h-3 w-3" />
        </div>
        <div className="text-xs text-muted-foreground">
          {ad.destinationUrl ? new URL(ad.destinationUrl).hostname : 'yourwebsite.com'}
        </div>
      </div>

      {/* CTA Button */}
      <div className="p-3">
        <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white" size="sm">
          {ad.callToAction || 'Learn More'}
        </Button>
      </div>

      {/* Engagement */}
      <div className="border-t px-3 py-2 flex items-center justify-between text-xs text-muted-foreground">
        <span>0 likes</span>
        <span>0 comments</span>
      </div>
    </Card>
  );
}

// Empty State
function EmptyPreview({ platform }: { platform: string }) {
  return (
    <Card className="max-w-md mx-auto border shadow-lg">
      <CardContent className="py-16 text-center">
        <Sparkles className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="font-semibold mb-2">No {platform} Ad Yet</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Create an ad in Step 4 to see a preview
        </p>
      </CardContent>
    </Card>
  );
}
