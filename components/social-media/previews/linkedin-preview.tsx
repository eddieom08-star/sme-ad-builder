"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ThumbsUp,
  MessageCircle,
  Repeat2,
  Send,
  MoreHorizontal,
  Globe2,
} from "lucide-react";
import type { PlatformContent } from "@/lib/store/social-media";

interface LinkedInPreviewProps {
  content: PlatformContent;
  businessName: string;
  imageUrl?: string;
}

export function LinkedInPreview({
  content,
  businessName,
  imageUrl,
}: LinkedInPreviewProps) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="bg-[#F3F2EF] p-4">
          <div className="bg-white rounded-lg shadow-sm max-w-md mx-auto">
            {/* Post Header */}
            <div className="p-3 flex items-start justify-between">
              <div className="flex gap-2">
                <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white font-semibold">
                  {businessName.charAt(0)}
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-sm">{businessName}</div>
                  <div className="text-xs text-gray-600">
                    Professional Services
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                    <Badge
                      variant="outline"
                      className="text-[10px] px-1 h-4 border-gray-400"
                    >
                      Promoted
                    </Badge>
                    <span>·</span>
                    <Globe2 className="w-3 h-3" />
                  </div>
                </div>
              </div>
              <button className="text-gray-600">
                <MoreHorizontal className="w-5 h-5" />
              </button>
            </div>

            {/* Post Content */}
            <div className="px-3 pb-2">
              <p className="text-sm whitespace-pre-wrap leading-relaxed">
                {content.copy}
              </p>
              {content.hashtags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {content.hashtags.map((tag, i) => (
                    <span key={i} className="text-sm text-[#0A66C2] font-medium">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Image */}
            {imageUrl && (
              <div className="relative bg-gray-200">
                <img
                  src={imageUrl}
                  alt="LinkedIn post"
                  className="w-full h-auto object-cover max-h-96"
                />
              </div>
            )}

            {/* CTA Button */}
            {content.cta && (
              <div className="px-3 py-2 border-t border-gray-200">
                <Button className="w-full bg-white hover:bg-gray-50 text-[#0A66C2] border border-[#0A66C2] font-semibold">
                  {content.cta}
                </Button>
              </div>
            )}

            {/* Engagement Stats */}
            <div className="px-3 py-2 border-t border-gray-200 flex justify-between items-center text-xs text-gray-600">
              <div className="flex items-center gap-1">
                <div className="flex -space-x-0.5">
                  <div className="w-4 h-4 rounded-full bg-[#0A66C2] border border-white flex items-center justify-center">
                    <ThumbsUp className="w-2.5 h-2.5 text-white fill-white" />
                  </div>
                  <div className="w-4 h-4 rounded-full bg-[#6AAD3D] border border-white flex items-center justify-center">
                    <span className="text-[8px] text-white font-bold">👏</span>
                  </div>
                  <div className="w-4 h-4 rounded-full bg-[#DF704D] border border-white flex items-center justify-center">
                    <span className="text-[8px] text-white font-bold">💡</span>
                  </div>
                </div>
                <span>184</span>
              </div>
              <div className="flex gap-3">
                <span>32 comments</span>
                <span>8 reposts</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="p-1 border-t border-gray-200 flex justify-around">
              <button className="flex items-center gap-1.5 px-3 py-2 hover:bg-gray-100 rounded text-gray-600 flex-1 justify-center">
                <ThumbsUp className="w-5 h-5" />
                <span className="text-sm font-semibold">Like</span>
              </button>
              <button className="flex items-center gap-1.5 px-3 py-2 hover:bg-gray-100 rounded text-gray-600 flex-1 justify-center">
                <MessageCircle className="w-5 h-5" />
                <span className="text-sm font-semibold">Comment</span>
              </button>
              <button className="flex items-center gap-1.5 px-3 py-2 hover:bg-gray-100 rounded text-gray-600 flex-1 justify-center">
                <Repeat2 className="w-5 h-5" />
                <span className="text-sm font-semibold">Repost</span>
              </button>
              <button className="flex items-center gap-1.5 px-3 py-2 hover:bg-gray-100 rounded text-gray-600 flex-1 justify-center">
                <Send className="w-5 h-5" />
                <span className="text-sm font-semibold">Send</span>
              </button>
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="p-3 bg-muted/50 border-t">
          <p className="text-xs text-muted-foreground text-center">
            LinkedIn Feed Post Preview
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
