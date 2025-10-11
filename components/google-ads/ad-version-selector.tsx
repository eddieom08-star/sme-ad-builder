"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, AlertTriangle, Sparkles } from "lucide-react";
import { useGoogleAdsStore, type AdVersion } from "@/lib/store/google-ads";
import { cn } from "@/lib/utils";

interface AdVersionSelectorProps {
  onContinue: () => void;
}

export function AdVersionSelector({ onContinue }: AdVersionSelectorProps) {
  const { adVersions, selectedVersionCount, setAdVersions, toggleAdVersion } =
    useGoogleAdsStore();
  const [showWarning, setShowWarning] = useState(false);

  // Initialize with sample ad versions (in real app, these would come from AI generation)
  useEffect(() => {
    if (adVersions.length === 0) {
      const sampleVersions: AdVersion[] = [
        {
          id: "v1",
          headline: "Professional Plumbing Services",
          description:
            "Expert plumbers available 24/7. Licensed & insured. Same-day service.",
          selected: false,
        },
        {
          id: "v2",
          headline: "Emergency Plumbing Repairs",
          description:
            "Fast emergency repairs. 30+ years experience. Call now for free estimate.",
          selected: false,
        },
        {
          id: "v3",
          headline: "Licensed Plumbers Near You",
          description:
            "Trusted local plumbers. Affordable rates. Quality workmanship guaranteed.",
          selected: false,
        },
        {
          id: "v4",
          headline: "Same-Day Plumbing Service",
          description:
            "Quick response times. Experienced technicians. Competitive pricing.",
          selected: false,
        },
        {
          id: "v5",
          headline: "Expert Plumbing Solutions",
          description:
            "Residential & commercial. Free quotes. Satisfaction guaranteed.",
          selected: false,
        },
      ];
      setAdVersions(sampleVersions);
    }
  }, []);

  const handleContinue = () => {
    if (selectedVersionCount >= 3 && selectedVersionCount <= 5) {
      onContinue();
    } else {
      setShowWarning(true);
    }
  };

  const isValid = selectedVersionCount >= 3 && selectedVersionCount <= 5;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight lg:text-3xl">
          Choose Your Ad Versions
        </h2>
        <p className="text-muted-foreground mt-2">
          Select 3-5 ad variations to test. Google will automatically show the
          best-performing versions.
        </p>
      </div>

      {/* Status Badge */}
      <div className="flex items-center gap-3">
        <Badge variant={isValid ? "default" : "secondary"} className="text-sm">
          {selectedVersionCount} of 3-5 selected
        </Badge>
        {isValid && (
          <div className="flex items-center gap-1 text-sm text-green-600">
            <CheckCircle2 className="h-4 w-4" />
            <span>Ready to continue</span>
          </div>
        )}
      </div>

      {/* Warning */}
      {showWarning && !isValid && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {selectedVersionCount < 3
              ? `Please select at least ${3 - selectedVersionCount} more ad version${3 - selectedVersionCount !== 1 ? "s" : ""}`
              : `Please deselect ${selectedVersionCount - 5} ad version${selectedVersionCount - 5 !== 1 ? "s" : ""}. Maximum is 5.`}
          </AlertDescription>
        </Alert>
      )}

      {/* Ad Versions Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {adVersions.map((version) => (
          <Card
            key={version.id}
            className={cn(
              "cursor-pointer transition-all hover:shadow-md",
              version.selected && "ring-2 ring-primary shadow-md"
            )}
            onClick={() => {
              if (!version.selected && selectedVersionCount >= 5) {
                setShowWarning(true);
                return;
              }
              toggleAdVersion(version.id);
              setShowWarning(false);
            }}
          >
            <CardContent className="p-4">
              <div className="space-y-3">
                {/* Header with checkbox */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={version.selected}
                      onCheckedChange={() => {
                        if (!version.selected && selectedVersionCount >= 5) {
                          setShowWarning(true);
                          return;
                        }
                        toggleAdVersion(version.id);
                        setShowWarning(false);
                      }}
                      onClick={(e) => e.stopPropagation()}
                    />
                    {version.selected && (
                      <Badge variant="default" className="text-xs">
                        Selected
                      </Badge>
                    )}
                  </div>
                  <Sparkles className="h-4 w-4 text-muted-foreground" />
                </div>

                {/* Ad Preview */}
                <div className="space-y-2">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                      Ad
                    </p>
                    <h3 className="font-semibold text-primary line-clamp-2">
                      {version.headline}
                    </h3>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {version.description}
                  </p>
                </div>

                {/* Character counts */}
                <div className="flex gap-4 text-xs text-muted-foreground pt-2 border-t">
                  <div>
                    <span className="font-medium">
                      {version.headline.length}
                    </span>
                    /30 headline
                  </div>
                  <div>
                    <span className="font-medium">
                      {version.description.length}
                    </span>
                    /90 description
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Continue Button */}
      <div className="flex justify-end pt-4">
        <Button
          size="lg"
          onClick={handleContinue}
          disabled={!isValid}
          className="min-w-[200px]"
        >
          Continue to Setup
        </Button>
      </div>
    </div>
  );
}
