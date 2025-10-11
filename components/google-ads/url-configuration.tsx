"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Link2, AlertTriangle, CheckCircle2, Eye } from "lucide-react";
import {
  useGoogleAdsStore,
  DISPLAY_PATH_MAX_LENGTH,
} from "@/lib/store/google-ads";
import { cn } from "@/lib/utils";

interface URLConfigurationProps {
  onContinue: () => void;
  onBack: () => void;
}

export function URLConfiguration({
  onContinue,
  onBack,
}: URLConfigurationProps) {
  const {
    targetUrl,
    displayPath1,
    displayPath2,
    setTargetUrl,
    setDisplayPath,
  } = useGoogleAdsStore();
  const [showError, setShowError] = useState(false);
  const [urlError, setUrlError] = useState("");

  const validateUrl = (url: string): boolean => {
    if (!url.trim()) {
      setUrlError("URL is required");
      return false;
    }

    try {
      const urlObj = new URL(url.startsWith("http") ? url : `https://${url}`);
      if (!urlObj.hostname.includes(".")) {
        setUrlError("Please enter a valid website URL");
        return false;
      }
      setUrlError("");
      return true;
    } catch {
      setUrlError("Please enter a valid website URL");
      return false;
    }
  };

  const handleUrlChange = (url: string) => {
    setTargetUrl(url);
    setShowError(false);
    if (url.trim()) {
      validateUrl(url);
    } else {
      setUrlError("");
    }
  };

  const handleContinue = () => {
    if (validateUrl(targetUrl)) {
      onContinue();
    } else {
      setShowError(true);
    }
  };

  const isValid = targetUrl.trim() !== "" && urlError === "";

  // Extract domain from URL for preview
  const getDomain = () => {
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight lg:text-3xl">
          Configure URLs
        </h2>
        <p className="text-muted-foreground mt-2">
          Set your landing page URL and customize how it appears in your ad.
        </p>
      </div>

      {/* Status */}
      <div className="flex items-center gap-3 flex-wrap">
        {isValid && (
          <div className="flex items-center gap-1 text-sm text-green-600">
            <CheckCircle2 className="h-4 w-4" />
            <span>URL configured</span>
          </div>
        )}
      </div>

      {/* Error */}
      {showError && !isValid && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{urlError || "Please enter a valid URL"}</AlertDescription>
        </Alert>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Left: URL Configuration */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Link2 className="h-4 w-4" />
                URL Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Target URL */}
              <div className="space-y-2">
                <Label htmlFor="target-url">
                  Final URL <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="target-url"
                  value={targetUrl}
                  onChange={(e) => handleUrlChange(e.target.value)}
                  placeholder="https://yourwebsite.com"
                  className={cn(urlError && "border-destructive")}
                />
                {urlError && (
                  <p className="text-xs text-destructive">{urlError}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  This is where users will land after clicking your ad
                </p>
              </div>

              <div className="border-t pt-4 space-y-4">
                <div>
                  <h4 className="text-sm font-semibold mb-1">Display Path</h4>
                  <p className="text-xs text-muted-foreground">
                    Optional: Customize how your URL appears in the ad (doesn't
                    affect the actual landing page)
                  </p>
                </div>

                {/* Display Path 1 */}
                <div className="space-y-2">
                  <Label htmlFor="display-path-1">Path 1 (Optional)</Label>
                  <div className="relative">
                    <Input
                      id="display-path-1"
                      value={displayPath1}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^a-zA-Z0-9-]/g, "");
                        setDisplayPath(value, displayPath2);
                      }}
                      placeholder="services"
                      maxLength={DISPLAY_PATH_MAX_LENGTH}
                      className="pr-16"
                    />
                    <div
                      className={cn(
                        "absolute right-3 top-1/2 -translate-y-1/2 text-xs",
                        displayPath1.length > DISPLAY_PATH_MAX_LENGTH
                          ? "text-destructive font-medium"
                          : "text-muted-foreground"
                      )}
                    >
                      {displayPath1.length}/{DISPLAY_PATH_MAX_LENGTH}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Letters, numbers, and hyphens only
                  </p>
                </div>

                {/* Display Path 2 */}
                <div className="space-y-2">
                  <Label htmlFor="display-path-2">Path 2 (Optional)</Label>
                  <div className="relative">
                    <Input
                      id="display-path-2"
                      value={displayPath2}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^a-zA-Z0-9-]/g, "");
                        setDisplayPath(displayPath1, value);
                      }}
                      placeholder="plumbing"
                      maxLength={DISPLAY_PATH_MAX_LENGTH}
                      className="pr-16"
                    />
                    <div
                      className={cn(
                        "absolute right-3 top-1/2 -translate-y-1/2 text-xs",
                        displayPath2.length > DISPLAY_PATH_MAX_LENGTH
                          ? "text-destructive font-medium"
                          : "text-muted-foreground"
                      )}
                    >
                      {displayPath2.length}/{DISPLAY_PATH_MAX_LENGTH}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Letters, numbers, and hyphens only
                  </p>
                </div>
              </div>

              {/* Tips */}
              <div className="p-3 bg-muted rounded-lg space-y-2">
                <div className="text-xs font-semibold">Tips:</div>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• Use your homepage or a relevant landing page</li>
                  <li>• Display paths help show relevant info</li>
                  <li>• Keep paths short and descriptive</li>
                  <li>• Example: yoursite.com/services/plumbing</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right: Preview */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Eye className="h-4 w-4" />
                URL Preview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-2">
                    How your URL will appear in the ad:
                  </p>
                  <div className="p-4 bg-muted rounded-lg">
                    <div className="font-medium text-sm text-green-600 break-all">
                      {getDisplayUrl()}
                    </div>
                  </div>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground mb-2">
                    Actual landing page:
                  </p>
                  <div className="p-4 bg-muted rounded-lg">
                    <div className="text-sm text-muted-foreground break-all">
                      {targetUrl || "https://yourwebsite.com"}
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <div className="text-xs">
                      <span className="font-medium">Important:</span> The display
                      path is for appearance only. Users will still land on your
                      Final URL.
                    </div>
                  </div>
                </div>

                {/* Example */}
                <div className="pt-4 border-t">
                  <p className="text-xs font-semibold mb-3">Example:</p>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">
                        Display in ad:
                      </p>
                      <div className="p-2 bg-green-50 border border-green-200 rounded text-xs text-green-700">
                        smithplumbing.com/emergency/repair
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">
                        Actual destination:
                      </p>
                      <div className="p-2 bg-gray-50 border border-gray-200 rounded text-xs text-gray-600 break-all">
                        https://smithplumbing.com/services?utm_source=google
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

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
