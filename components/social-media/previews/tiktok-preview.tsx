"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Heart,
  MessageCircle,
  Share2,
  Music,
  Plus,
} from "lucide-react";
import type { PlatformContent } from "@/lib/store/social-media";

interface TikTokPreviewProps {
  content: PlatformContent;
  businessName: string;
  imageUrl?: string;
}

export function TikTokPreview({
  content,
  businessName,
  imageUrl,
}: TikTokPreviewProps) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="bg-black p-4 flex items-center justify-center min-h-[600px]">
          <div className="relative w-full max-w-[320px] aspect-[9/16] rounded-lg overflow-hidden shadow-2xl">
            {/* Video Background */}
            {imageUrl ? (
              <img
                src={imageUrl}
                alt="TikTok video"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-[#00F2EA] via-[#FF0050] to-[#000000] flex items-center justify-center text-white text-center p-6">
                <div>TikTok Video Ad Preview</div>
              </div>
            )}

            {/* Top Bar */}
            <div className="absolute top-0 left-0 right-0 p-3 flex justify-between items-center">
              <div className="text-white text-sm font-medium">Following</div>
              <div className="text-white text-sm font-medium px-4 border-b-2 border-white">
                For You
              </div>
              <div className="w-8" />
            </div>

            {/* Right Side Icons */}
            <div className="absolute right-2 bottom-24 flex flex-col items-center gap-4">
              {/* Profile */}
              <div className="relative">
                <div className="w-12 h-12 rounded-full border-2 border-white bg-gray-300 overflow-hidden">
                  <div className="w-full h-full bg-primary flex items-center justify-center text-white font-semibold">
                    {businessName.charAt(0)}
                  </div>
                </div>
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-[#FF0050] flex items-center justify-center">
                  <Plus className="w-3 h-3 text-white" strokeWidth={3} />
                </div>
              </div>

              {/* Like */}
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 flex items-center justify-center">
                  <Heart className="w-8 h-8 text-white drop-shadow-lg" strokeWidth={1.5} />
                </div>
                <span className="text-white text-xs font-semibold drop-shadow-lg">
                  34.2K
                </span>
              </div>

              {/* Comment */}
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 flex items-center justify-center">
                  <MessageCircle className="w-8 h-8 text-white drop-shadow-lg" strokeWidth={1.5} />
                </div>
                <span className="text-white text-xs font-semibold drop-shadow-lg">
                  1,847
                </span>
              </div>

              {/* Share */}
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 flex items-center justify-center">
                  <Share2 className="w-7 h-7 text-white drop-shadow-lg" strokeWidth={1.5} />
                </div>
                <span className="text-white text-xs font-semibold drop-shadow-lg">
                  531
                </span>
              </div>

              {/* Music Icon */}
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center border border-white/20 shadow-lg animate-spin-slow">
                <Music className="w-4 h-4 text-white" />
              </div>
            </div>

            {/* Bottom Content */}
            <div className="absolute bottom-0 left-0 right-0 p-3 pb-16 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
              <div className="space-y-2">
                {/* Username */}
                <div className="flex items-center gap-2">
                  <span className="text-white font-semibold text-sm drop-shadow-lg">
                    @{businessName.toLowerCase().replace(/\s+/g, "")}
                  </span>
                  <Badge
                    variant="secondary"
                    className="bg-white/20 text-white text-[10px] px-1.5 h-4 backdrop-blur-sm"
                  >
                    Sponsored
                  </Badge>
                </div>

                {/* Caption */}
                <p className="text-white text-sm drop-shadow-lg line-clamp-2">
                  {content.copy}
                </p>

                {/* Hashtags */}
                {content.hashtags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {content.hashtags.slice(0, 3).map((tag, i) => (
                      <span key={i} className="text-white text-sm font-medium drop-shadow-lg">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Music */}
                <div className="flex items-center gap-1 text-white text-xs drop-shadow-lg">
                  <Music className="w-3 h-3" />
                  <span>Original Audio - {businessName}</span>
                </div>

                {/* CTA Button */}
                {content.cta && (
                  <div className="pt-2">
                    <Button className="w-full bg-white hover:bg-gray-100 text-black font-bold">
                      {content.cta}
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Sponsored Label Top */}
            <div className="absolute top-12 left-3">
              <Badge
                variant="secondary"
                className="bg-black/40 text-white text-[10px] backdrop-blur-sm"
              >
                Sponsored
              </Badge>
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="p-3 bg-muted/50 border-t">
          <p className="text-xs text-muted-foreground text-center">
            TikTok Feed Video Ad Preview
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
