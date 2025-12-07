import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, ExternalLink, Play, Sparkles } from 'lucide-react';
import { AdCreative } from '@/lib/stores/wizard-store';
import { cn } from '@/lib/utils';

interface LinkedInPreviewProps {
    ad?: AdCreative;
    campaignName: string;
    className?: string;
}

export function LinkedInPreview({ ad, campaignName, className }: LinkedInPreviewProps) {
    if (!ad) {
        return (
            <Card className={cn("max-w-md mx-auto border shadow-lg", className)}>
                <div className="py-16 text-center">
                    <Sparkles className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="font-semibold mb-2">No LinkedIn Ad Yet</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                        Create an ad in Step 4 to see a preview
                    </p>
                </div>
            </Card>
        );
    }

    return (
        <Card className={cn("max-w-md mx-auto border shadow-lg", className)}>
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
