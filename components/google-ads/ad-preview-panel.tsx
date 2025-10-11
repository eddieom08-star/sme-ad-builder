"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, RefreshCw } from "lucide-react";
import { useGoogleAdsStore } from "@/lib/store/google-ads";
import { cn } from "@/lib/utils";

export function AdPreviewPanel() {
  const { headlines, descriptions, targetUrl, displayPath1, displayPath2 } =
    useGoogleAdsStore();
  const [currentHeadlineIndex, setCurrentHeadlineIndex] = useState(0);
  const [currentDescriptionIndex, setCurrentDescriptionIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  // Auto-cycle through combinations every 3 seconds
  useEffect(() => {
    if (headlines.length === 0 || descriptions.length === 0) return;

    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentHeadlineIndex((prev) => (prev + 1) % headlines.length);
        setCurrentDescriptionIndex((prev) => (prev + 1) % descriptions.length);
        setIsAnimating(false);
      }, 150);
    }, 3000);

    return () => clearInterval(interval);
  }, [headlines.length, descriptions.length]);

  const handleRefresh = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentHeadlineIndex(
        Math.floor(Math.random() * headlines.length)
      );
      setCurrentDescriptionIndex(
        Math.floor(Math.random() * descriptions.length)
      );
      setIsAnimating(false);
    }, 150);
  };

  // Extract domain from URL for display
  const getDomain = () => {
    if (!targetUrl) return "yourwebsite.com";
    try {
      const url = targetUrl.startsWith("http")
        ? targetUrl
        : `https://${targetUrl}`;
      return new URL(url).hostname.replace("www.", "");
    } catch {
      return "yourwebsite.com";
    }
  };

  const getDisplayUrl = () => {
    const domain = getDomain();
    const path1 = displayPath1 ? `/${displayPath1}` : "";
    const path2 = displayPath2 ? `/${displayPath2}` : "";
    return `${domain}${path1}${path2}`;
  };

  const currentHeadline = headlines[currentHeadlineIndex];
  const currentDescription = descriptions[currentDescriptionIndex];

  return (
    <div className="lg:sticky lg:top-6 space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Live Ad Preview
            </CardTitle>
            {headlines.length > 0 && descriptions.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRefresh}
                className="h-8"
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Refresh
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {headlines.length === 0 || descriptions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Eye className="h-12 w-12 mx-auto mb-3 opacity-20" />
              <p className="text-sm">No preview available</p>
              <p className="text-xs mt-1">
                Add headlines and descriptions to see your ad
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Google Ad Preview */}
              <div
                className={cn(
                  "p-4 bg-white border rounded-lg space-y-2 transition-opacity duration-150",
                  isAnimating && "opacity-50"
                )}
              >
                {/* Ad Badge */}
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className="text-[10px] px-1.5 py-0 h-4 border-green-600 text-green-600"
                  >
                    Ad
                  </Badge>
                  <span className="text-xs text-gray-500">·</span>
                  <span className="text-xs text-gray-500">{getDisplayUrl()}</span>
                </div>

                {/* Headline */}
                <div>
                  <h3 className="text-xl font-normal text-[#1a0dab] hover:underline cursor-pointer leading-tight">
                    {currentHeadline?.text || "Your Headline Here"}
                  </h3>
                </div>

                {/* URL */}
                <div className="flex items-center gap-1">
                  <div className="text-sm text-green-700">
                    {getDisplayUrl()}
                  </div>
                </div>

                {/* Description */}
                <div>
                  <p className="text-sm text-gray-600 leading-snug">
                    {currentDescription?.text || "Your description here"}
                  </p>
                </div>
              </div>

              {/* Combination Info */}
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div>
                  Showing {headlines.length > 0 ? currentHeadlineIndex + 1 : 0} of{" "}
                  {headlines.length} headlines
                </div>
                <div>
                  {descriptions.length > 0 ? currentDescriptionIndex + 1 : 0} of{" "}
                  {descriptions.length} descriptions
                </div>
              </div>

              {/* Stats */}
              <div className="pt-3 border-t space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Total combinations:</span>
                  <span className="font-semibold">
                    {headlines.length * descriptions.length}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Headlines:</span>
                  <Badge variant="secondary" className="text-xs">
                    {headlines.length}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Descriptions:</span>
                  <Badge variant="secondary" className="text-xs">
                    {descriptions.length}
                  </Badge>
                </div>
              </div>

              {/* Auto-cycle indicator */}
              {headlines.length > 1 && descriptions.length > 1 && (
                <div className="pt-3 border-t">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                    <span>Auto-cycling combinations</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tips Card */}
      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle className="text-sm">Preview Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="text-xs text-muted-foreground space-y-2">
            <li>• Google automatically tests different combinations</li>
            <li>• The preview cycles through possible variations</li>
            <li>• More headlines = more combinations to test</li>
            <li>• Best-performing ads show more often</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
