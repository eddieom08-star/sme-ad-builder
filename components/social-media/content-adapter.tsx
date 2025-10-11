"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkles, CheckCircle2, AlertTriangle, RefreshCw } from "lucide-react";
import { useGoogleAdsStore } from "@/lib/store/google-ads";
import {
  useSocialMediaStore,
  PLATFORM_CONFIGS,
  PLATFORM_CTAS,
  EMOJI_SUGGESTIONS,
  type SocialPlatform,
  type PlatformContent,
} from "@/lib/store/social-media";
import { FacebookPreview, InstagramPreview, LinkedInPreview, TikTokPreview } from "./previews";
import { cn } from "@/lib/utils";

interface ContentAdapterProps {
  onContinue: () => void;
  onBack: () => void;
}

export function ContentAdapter({ onContinue, onBack }: ContentAdapterProps) {
  const { headlines, descriptions } = useGoogleAdsStore();
  const { selectedPlatforms, platformContent, setPlatformContent } = useSocialMediaStore();
  const [currentPlatform, setCurrentPlatform] = useState<SocialPlatform>(
    selectedPlatforms[0] || "facebook"
  );

  // Initialize content for each platform
  useEffect(() => {
    selectedPlatforms.forEach((platform) => {
      const existing = platformContent.find((c) => c.platform === platform);
      if (!existing && headlines.length > 0 && descriptions.length > 0) {
        // Auto-generate initial content
        const generatedCopy = generateSocialCopy(platform);
        const generatedHashtags = generateHashtags(platform);

        setPlatformContent({
          platform,
          copy: generatedCopy,
          cta: PLATFORM_CTAS[platform][0],
          useEmojis: platform !== "linkedin",
          hashtags: generatedHashtags,
        });
      }
    });
  }, [selectedPlatforms]);

  const generateSocialCopy = (platform: SocialPlatform): string => {
    const headline = headlines[0]?.text || "Professional Service";
    const description = descriptions[0]?.text || "Expert solutions for your needs";

    // Combine and optimize for social
    let copy = `${headline} - ${description}`;

    // Add emojis if appropriate
    if (platform !== "linkedin") {
      const emojis = EMOJI_SUGGESTIONS.general;
      copy = `${emojis[0]} ${copy}`;
    }

    // Trim to max length
    const maxLength = PLATFORM_CONFIGS[platform].maxCopy;
    if (copy.length > maxLength) {
      copy = copy.substring(0, maxLength - 3) + "...";
    }

    return copy;
  };

  const generateHashtags = (platform: SocialPlatform): string[] => {
    if (platform === "linkedin") return [];
    return ["LocalBusiness", "ProfessionalService", "Quality"];
  };

  const currentContent = platformContent.find((c) => c.platform === currentPlatform);
  const config = PLATFORM_CONFIGS[currentPlatform];

  const handleCopyChange = (value: string) => {
    if (currentContent) {
      setPlatformContent({
        ...currentContent,
        copy: value,
      });
    }
  };

  const handleCTAChange = (value: string) => {
    if (currentContent) {
      setPlatformContent({
        ...currentContent,
        cta: value,
      });
    }
  };

  const handleHashtagsChange = (value: string) => {
    if (currentContent) {
      const tags = value.split(",").map((t) => t.trim()).filter(Boolean);
      setPlatformContent({
        ...currentContent,
        hashtags: tags,
      });
    }
  };

  const handleContinue = () => {
    const allValid = selectedPlatforms.every((platform) => {
      const content = platformContent.find((c) => c.platform === platform);
      return content && content.copy.trim().length >= 20;
    });

    if (allValid) {
      onContinue();
    }
  };

  const isValid = selectedPlatforms.every((platform) => {
    const content = platformContent.find((c) => c.platform === platform);
    return content && content.copy.trim().length >= 20;
  });

  const addEmoji = (emoji: string) => {
    if (currentContent) {
      setPlatformContent({
        ...currentContent,
        copy: `${currentContent.copy} ${emoji}`,
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight lg:text-3xl">
          Create Social Media Content
        </h2>
        <p className="text-muted-foreground mt-2">
          Adapt your Google Ads content for social media. We've pre-filled content based on your ads.
        </p>
      </div>

      {/* Platform Tabs */}
      <Tabs value={currentPlatform} onValueChange={(v) => setCurrentPlatform(v as SocialPlatform)}>
        <TabsList className="grid grid-cols-2 md:grid-cols-4 w-full">
          {selectedPlatforms.map((platform) => (
            <TabsTrigger key={platform} value={platform} className="gap-2">
              <span>{PLATFORM_CONFIGS[platform].icon}</span>
              <span className="hidden md:inline">{PLATFORM_CONFIGS[platform].name}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {selectedPlatforms.map((platform) => {
          const content = platformContent.find((c) => c.platform === platform);
          if (!content) return null;

          return (
            <TabsContent key={platform} value={platform} className="space-y-6">
              <div className="grid lg:grid-cols-[1fr,400px] gap-6">
                {/* Left: Content Editor */}
                <div className="space-y-4">
                  {/* Ad Copy */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <Sparkles className="h-4 w-4" />
                        Ad Copy
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="copy">Post Copy</Label>
                          <div className={cn(
                            "text-xs",
                            content.copy.length > config.maxCopy
                              ? "text-destructive font-medium"
                              : "text-muted-foreground"
                          )}>
                            {content.copy.length}/{config.maxCopy}
                          </div>
                        </div>
                        <Textarea
                          id="copy"
                          value={content.copy}
                          onChange={(e) => handleCopyChange(e.target.value)}
                          placeholder={`Write your ${config.name} post...`}
                          rows={4}
                          maxLength={config.maxCopy}
                          className={cn(
                            content.copy.length > config.maxCopy && "border-destructive"
                          )}
                        />
                        <p className="text-xs text-muted-foreground">
                          Make it engaging and include a call-to-action
                        </p>
                      </div>

                      {/* Emoji Suggestions */}
                      {platform !== "linkedin" && (
                        <div className="space-y-2">
                          <Label>Quick Emojis</Label>
                          <div className="flex flex-wrap gap-2">
                            {EMOJI_SUGGESTIONS.general.map((emoji, i) => (
                              <Button
                                key={i}
                                variant="outline"
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={() => addEmoji(emoji)}
                              >
                                {emoji}
                              </Button>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* CTA Selection */}
                  {config.supportsCTA && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Call-to-Action</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <Label htmlFor="cta">Button Text</Label>
                          <Select value={content.cta} onValueChange={handleCTAChange}>
                            <SelectTrigger id="cta">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {PLATFORM_CTAS[platform].map((cta) => (
                                <SelectItem key={cta} value={cta}>
                                  {cta}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Hashtags */}
                  {platform !== "linkedin" && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Hashtags</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <Label htmlFor="hashtags">Hashtags (comma separated)</Label>
                          <Textarea
                            id="hashtags"
                            value={content.hashtags.join(", ")}
                            onChange={(e) => handleHashtagsChange(e.target.value)}
                            placeholder="LocalBusiness, ProfessionalService, Quality"
                            rows={2}
                          />
                          <p className="text-xs text-muted-foreground">
                            Use 3-5 relevant hashtags for better reach
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>

                {/* Right: Live Preview */}
                <div className="lg:sticky lg:top-6 space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge>{config.name} Preview</Badge>
                    <Badge variant="outline">Live</Badge>
                  </div>

                  {platform === "facebook" && (
                    <FacebookPreview
                      content={content}
                      businessName="Your Business"
                    />
                  )}
                  {platform === "instagram" && (
                    <InstagramPreview
                      content={content}
                      businessName="Your Business"
                    />
                  )}
                  {platform === "linkedin" && (
                    <LinkedInPreview
                      content={content}
                      businessName="Your Business"
                    />
                  )}
                  {platform === "tiktok" && (
                    <TikTokPreview
                      content={content}
                      businessName="Your Business"
                    />
                  )}
                </div>
              </div>
            </TabsContent>
          );
        })}
      </Tabs>

      {/* Validation Warning */}
      {!isValid && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            All platforms need at least 20 characters of content
          </AlertDescription>
        </Alert>
      )}

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button
          size="lg"
          onClick={handleContinue}
          disabled={!isValid}
          className="min-w-[200px]"
        >
          Continue to Targeting
        </Button>
      </div>
    </div>
  );
}
