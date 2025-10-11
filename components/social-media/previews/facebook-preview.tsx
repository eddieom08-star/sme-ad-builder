"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ThumbsUp,
  MessageCircle,
  Share2,
  MoreHorizontal,
  Heart,
  Globe,
} from "lucide-react";
import type { PlatformContent } from "@/lib/store/social-media";

interface FacebookPreviewProps {
  content: PlatformContent;
  businessName: string;
  imageUrl?: string;
}

export function FacebookPreview({
  content,
  businessName,
  imageUrl,
}: FacebookPreviewProps) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <Tabs defaultValue="feed" className="w-full">
          <TabsList className="w-full grid grid-cols-2 rounded-none border-b">
            <TabsTrigger value="feed">Feed Post</TabsTrigger>
            <TabsTrigger value="story">Story</TabsTrigger>
          </TabsList>

          {/* Feed Post Preview */}
          <TabsContent value="feed" className="mt-0 p-0">
            <div className="bg-[#F0F2F5] p-4">
              <div className="bg-white rounded-lg shadow-sm max-w-md mx-auto">
                {/* Post Header */}
                <div className="p-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-semibold">
                      {businessName.charAt(0)}
                    </div>
                    <div>
                      <div className="font-semibold text-sm">{businessName}</div>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <span>Sponsored</span>
                        <span>·</span>
                        <Globe className="w-3 h-3" />
                      </div>
                    </div>
                  </div>
                  <button className="text-gray-500">
                    <MoreHorizontal className="w-5 h-5" />
                  </button>
                </div>

                {/* Post Content */}
                <div className="px-3 pb-2">
                  <p className="text-sm whitespace-pre-wrap">{content.copy}</p>
                  {content.hashtags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {content.hashtags.map((tag, i) => (
                        <span key={i} className="text-sm text-[#1877F2]">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Image */}
                {imageUrl && (
                  <div className="relative bg-gray-200 aspect-square">
                    <img
                      src={imageUrl}
                      alt="Ad preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {/* CTA Button */}
                {content.cta && (
                  <div className="px-3 py-2 border-t">
                    <Button className="w-full bg-[#E7F3FF] hover:bg-[#D8EDFF] text-[#1877F2] font-semibold">
                      {content.cta}
                    </Button>
                  </div>
                )}

                {/* Engagement Bar */}
                <div className="px-3 py-2 border-t border-b flex justify-between text-gray-500">
                  <div className="flex items-center gap-1">
                    <div className="flex -space-x-1">
                      <div className="w-5 h-5 rounded-full bg-[#1877F2] flex items-center justify-center">
                        <ThumbsUp className="w-3 h-3 text-white fill-white" />
                      </div>
                      <div className="w-5 h-5 rounded-full bg-[#F33E5B] flex items-center justify-center">
                        <Heart className="w-3 h-3 text-white fill-white" />
                      </div>
                    </div>
                    <span className="text-xs">243</span>
                  </div>
                  <div className="flex gap-2 text-xs">
                    <span>18 comments</span>
                    <span>5 shares</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="p-2 flex justify-around">
                  <button className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 rounded-md text-gray-600">
                    <ThumbsUp className="w-5 h-5" />
                    <span className="text-sm font-semibold">Like</span>
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 rounded-md text-gray-600">
                    <MessageCircle className="w-5 h-5" />
                    <span className="text-sm font-semibold">Comment</span>
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 rounded-md text-gray-600">
                    <Share2 className="w-5 h-5" />
                    <span className="text-sm font-semibold">Share</span>
                  </button>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Story Preview */}
          <TabsContent value="story" className="mt-0 p-0">
            <div className="bg-black p-4 flex items-center justify-center min-h-[500px]">
              <div className="relative w-full max-w-[280px] aspect-[9/16] bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl overflow-hidden shadow-2xl">
                {/* Story Image */}
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt="Story preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white text-center p-6">
                    <div>Story preview will appear here</div>
                  </div>
                )}

                {/* Story Header */}
                <div className="absolute top-0 left-0 right-0 p-3 bg-gradient-to-b from-black/60 to-transparent">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-primary font-semibold text-xs">
                      {businessName.charAt(0)}
                    </div>
                    <div>
                      <div className="text-white font-semibold text-xs">
                        {businessName}
                      </div>
                      <div className="text-white/80 text-[10px]">Sponsored</div>
                    </div>
                  </div>
                </div>

                {/* Story Content */}
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                  <p className="text-white text-sm mb-3 line-clamp-3">
                    {content.copy}
                  </p>
                  {content.cta && (
                    <Button className="w-full bg-white hover:bg-gray-100 text-black font-semibold">
                      {content.cta}
                    </Button>
                  )}
                </div>

                {/* Sponsored Badge */}
                <div className="absolute top-12 right-3">
                  <Badge
                    variant="secondary"
                    className="bg-white/20 text-white text-[10px] backdrop-blur-sm"
                  >
                    Sponsored
                  </Badge>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
