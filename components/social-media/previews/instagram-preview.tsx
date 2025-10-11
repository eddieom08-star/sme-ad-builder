"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Heart,
  MessageCircle,
  Send,
  Bookmark,
  MoreHorizontal,
} from "lucide-react";
import type { PlatformContent } from "@/lib/store/social-media";

interface InstagramPreviewProps {
  content: PlatformContent;
  businessName: string;
  imageUrl?: string;
}

export function InstagramPreview({
  content,
  businessName,
  imageUrl,
}: InstagramPreviewProps) {
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
            <div className="bg-white p-4">
              <div className="bg-white border rounded-sm max-w-md mx-auto">
                {/* Post Header */}
                <div className="p-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#FD5949] via-[#D6249F] to-[#285AEB] p-[2px]">
                      <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
                        <div className="w-full h-full rounded-full bg-primary flex items-center justify-center text-white font-semibold text-xs">
                          {businessName.charAt(0)}
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="font-semibold text-sm flex items-center gap-1">
                        {businessName.toLowerCase().replace(/\s+/g, "")}
                        <Badge
                          variant="secondary"
                          className="bg-[#0095F6] text-white text-[9px] px-1 h-4"
                        >
                          Sponsored
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <button className="text-gray-900">
                    <MoreHorizontal className="w-6 h-6" />
                  </button>
                </div>

                {/* Post Image */}
                {imageUrl ? (
                  <div className="relative bg-gray-200 aspect-square">
                    <img
                      src={imageUrl}
                      alt="Instagram post"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="aspect-square bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white">
                    <div className="text-center p-6">
                      <div className="text-sm">Instagram Feed Post</div>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="p-3">
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex gap-4">
                      <button>
                        <Heart className="w-6 h-6" />
                      </button>
                      <button>
                        <MessageCircle className="w-6 h-6" />
                      </button>
                      <button>
                        <Send className="w-6 h-6" />
                      </button>
                    </div>
                    <button>
                      <Bookmark className="w-6 h-6" />
                    </button>
                  </div>

                  {/* Likes */}
                  <div className="font-semibold text-sm mb-2">467 likes</div>

                  {/* Caption */}
                  <div className="text-sm">
                    <span className="font-semibold mr-2">
                      {businessName.toLowerCase().replace(/\s+/g, "")}
                    </span>
                    <span className="whitespace-pre-wrap">{content.copy}</span>
                  </div>

                  {/* Hashtags */}
                  {content.hashtags.length > 0 && (
                    <div className="mt-1 text-sm text-[#00376B]">
                      {content.hashtags.map((tag, i) => (
                        <span key={i} className="mr-1">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* CTA */}
                  {content.cta && (
                    <div className="mt-3">
                      <Button className="w-full bg-[#0095F6] hover:bg-[#0095F6]/90 text-white font-semibold">
                        {content.cta}
                      </Button>
                    </div>
                  )}

                  {/* Comments Preview */}
                  <div className="text-sm text-gray-500 mt-2">
                    View all 23 comments
                  </div>

                  {/* Timestamp */}
                  <div className="text-xs text-gray-400 mt-1 uppercase">
                    2 HOURS AGO
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Story Preview */}
          <TabsContent value="story" className="mt-0 p-0">
            <div className="bg-black p-4 flex items-center justify-center min-h-[500px]">
              <div className="relative w-full max-w-[280px] aspect-[9/16] rounded-xl overflow-hidden shadow-2xl">
                {/* Story Background */}
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt="Story preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[#FD5949] via-[#D6249F] to-[#285AEB] flex items-center justify-center text-white text-center p-6">
                    <div>Instagram Story preview</div>
                  </div>
                )}

                {/* Progress Bar */}
                <div className="absolute top-0 left-0 right-0 p-2">
                  <div className="h-0.5 bg-white/30 rounded-full overflow-hidden">
                    <div className="h-full w-1/3 bg-white rounded-full" />
                  </div>
                </div>

                {/* Story Header */}
                <div className="absolute top-3 left-0 right-0 px-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full border-2 border-white">
                      <div className="w-full h-full rounded-full bg-primary flex items-center justify-center text-white font-semibold text-xs">
                        {businessName.charAt(0)}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="text-white font-semibold text-sm drop-shadow-lg">
                        {businessName.toLowerCase().replace(/\s+/g, "")}
                      </div>
                      <div className="text-white/90 text-xs drop-shadow-lg">
                        Sponsored
                      </div>
                    </div>
                    <button className="text-white">
                      <MoreHorizontal className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Story Content */}
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
                  <p className="text-white text-sm mb-3 line-clamp-3 drop-shadow-lg">
                    {content.copy}
                  </p>
                  {content.cta && (
                    <Button className="w-full bg-white hover:bg-gray-100 text-black font-semibold">
                      {content.cta}
                    </Button>
                  )}
                </div>

                {/* Interaction Icons */}
                <div className="absolute bottom-20 right-3 flex flex-col gap-3">
                  <button className="text-white drop-shadow-lg">
                    <Heart className="w-7 h-7" />
                  </button>
                  <button className="text-white drop-shadow-lg">
                    <MessageCircle className="w-7 h-7" />
                  </button>
                  <button className="text-white drop-shadow-lg">
                    <Send className="w-7 h-7" />
                  </button>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
