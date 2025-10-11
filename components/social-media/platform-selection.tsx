"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { CheckCircle2, AlertTriangle } from "lucide-react";
import { useSocialMediaStore, PLATFORM_CONFIGS, type SocialPlatform } from "@/lib/store/social-media";
import { cn } from "@/lib/utils";

interface PlatformSelectionProps {
  onContinue: () => void;
}

export function PlatformSelection({ onContinue }: PlatformSelectionProps) {
  const { selectedPlatforms, togglePlatform } = useSocialMediaStore();

  const platforms: SocialPlatform[] = ["facebook", "instagram", "linkedin", "tiktok"];

  const handleContinue = () => {
    if (selectedPlatforms.length > 0) {
      onContinue();
    }
  };

  const isValid = selectedPlatforms.length > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight lg:text-3xl">
          Select Social Media Platforms
        </h2>
        <p className="text-muted-foreground mt-2">
          Choose which platforms you want to advertise on. You can select multiple platforms.
        </p>
      </div>

      {/* Status */}
      <div className="flex items-center gap-3 flex-wrap">
        <Badge variant={isValid ? "default" : "secondary"} className="text-sm">
          {selectedPlatforms.length} platform{selectedPlatforms.length !== 1 ? "s" : ""} selected
        </Badge>
        {isValid && (
          <div className="flex items-center gap-1 text-sm text-green-600">
            <CheckCircle2 className="h-4 w-4" />
            <span>Ready to continue</span>
          </div>
        )}
      </div>

      {/* Warning */}
      {!isValid && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Please select at least one platform to continue
          </AlertDescription>
        </Alert>
      )}

      {/* Platform Cards */}
      <div className="grid md:grid-cols-2 gap-4">
        {platforms.map((platform) => {
          const config = PLATFORM_CONFIGS[platform];
          const isSelected = selectedPlatforms.includes(platform);

          return (
            <Card
              key={platform}
              className={cn(
                "cursor-pointer transition-all hover:shadow-lg",
                isSelected && "ring-2 ring-primary shadow-lg"
              )}
              onClick={() => togglePlatform(platform)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                      style={{ backgroundColor: `${config.color}15` }}
                    >
                      {config.icon}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{config.name}</CardTitle>
                      <p className="text-xs text-muted-foreground mt-1">
                        Max {config.maxCopy} characters
                      </p>
                    </div>
                  </div>
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => togglePlatform(platform)}
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              </CardHeader>

              <CardContent>
                <div className="space-y-3">
                  {/* Features */}
                  <div className="flex flex-wrap gap-2">
                    {config.supportedFormats.map((format) => (
                      <Badge key={format} variant="outline" className="text-xs capitalize">
                        {format}
                      </Badge>
                    ))}
                    {config.supportsCTA && (
                      <Badge variant="outline" className="text-xs">
                        CTA Button
                      </Badge>
                    )}
                    {config.supportsLeadForm && (
                      <Badge variant="outline" className="text-xs">
                        Lead Forms
                      </Badge>
                    )}
                  </div>

                  {/* Best For */}
                  <div className="pt-2 border-t">
                    <p className="text-xs font-semibold mb-1">Best for:</p>
                    <p className="text-xs text-muted-foreground">
                      {platform === "facebook" && "Local businesses, event promotion, community engagement"}
                      {platform === "instagram" && "Visual content, younger audience, brand awareness"}
                      {platform === "linkedin" && "B2B services, professional networking, thought leadership"}
                      {platform === "tiktok" && "Viral content, Gen Z audience, creative campaigns"}
                    </p>
                  </div>

                  {/* Audience Reach */}
                  <div className="pt-2 border-t">
                    <p className="text-xs font-semibold mb-1">Monthly Active Users:</p>
                    <p className="text-xs text-muted-foreground">
                      {platform === "facebook" && "~2.9 billion globally"}
                      {platform === "instagram" && "~2 billion globally"}
                      {platform === "linkedin" && "~900 million globally"}
                      {platform === "tiktok" && "~1 billion globally"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recommendations */}
      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle className="text-base">Platform Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-semibold mb-2">Local Service Businesses:</p>
              <ul className="text-muted-foreground space-y-1">
                <li>• Facebook (primary) - Local targeting</li>
                <li>• Instagram (secondary) - Visual showcase</li>
              </ul>
            </div>
            <div>
              <p className="font-semibold mb-2">Professional Services:</p>
              <ul className="text-muted-foreground space-y-1">
                <li>• LinkedIn (primary) - B2B audience</li>
                <li>• Facebook (secondary) - Broader reach</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Continue Button */}
      <div className="flex justify-end pt-4">
        <Button
          size="lg"
          onClick={handleContinue}
          disabled={!isValid}
          className="min-w-[200px]"
        >
          Continue to Content
        </Button>
      </div>
    </div>
  );
}
