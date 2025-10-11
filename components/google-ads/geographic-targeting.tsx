"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { MapPin, Globe, CheckCircle2, Info } from "lucide-react";
import { useGoogleAdsStore, type GeographicTarget } from "@/lib/store/google-ads";
import { cn } from "@/lib/utils";
import { US_STATES } from "@/lib/constants/us-states";

interface GeographicTargetingProps {
  onContinue: () => void;
  onBack: () => void;
}

export function GeographicTargeting({
  onContinue,
  onBack,
}: GeographicTargetingProps) {
  const { geographicTarget, setGeographicTarget } = useGoogleAdsStore();
  const [targetType, setTargetType] = useState<"nationwide" | "local">(
    geographicTarget.type
  );
  const [city, setCity] = useState(geographicTarget.city || "");
  const [state, setState] = useState(geographicTarget.state || "");
  const [radius, setRadius] = useState(geographicTarget.radius?.toString() || "25");

  const handleTargetTypeChange = (value: "nationwide" | "local") => {
    setTargetType(value);
    if (value === "nationwide") {
      setGeographicTarget({ type: "nationwide" });
    }
  };

  const handleContinue = () => {
    if (targetType === "nationwide") {
      setGeographicTarget({ type: "nationwide" });
      onContinue();
    } else {
      if (city.trim() && state) {
        setGeographicTarget({
          type: "local",
          city: city.trim(),
          state,
          radius: parseInt(radius),
        });
        onContinue();
      }
    }
  };

  const isValid =
    targetType === "nationwide" ||
    (targetType === "local" && city.trim() !== "" && state !== "");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight lg:text-3xl">
          Geographic Targeting
        </h2>
        <p className="text-muted-foreground mt-2">
          Choose where you want your ads to appear. Target nationwide or focus on
          your local area.
        </p>
      </div>

      {/* Status */}
      <div className="flex items-center gap-3 flex-wrap">
        {isValid && (
          <div className="flex items-center gap-1 text-sm text-green-600">
            <CheckCircle2 className="h-4 w-4" />
            <span>
              {targetType === "nationwide"
                ? "Nationwide targeting selected"
                : `Targeting ${city}, ${state}`}
            </span>
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Left: Targeting Options */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Select Target Area</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <RadioGroup
                value={targetType}
                onValueChange={(v) => handleTargetTypeChange(v as any)}
              >
                {/* Nationwide */}
                <div
                  className={cn(
                    "flex items-start space-x-3 p-4 rounded-lg border-2 cursor-pointer transition-all",
                    targetType === "nationwide"
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  )}
                  onClick={() => handleTargetTypeChange("nationwide")}
                >
                  <RadioGroupItem value="nationwide" id="nationwide" />
                  <div className="flex-1">
                    <Label
                      htmlFor="nationwide"
                      className="cursor-pointer flex items-center gap-2"
                    >
                      <Globe className="h-4 w-4" />
                      <span className="font-semibold">Nationwide</span>
                    </Label>
                    <p className="text-xs text-muted-foreground mt-1">
                      Show ads to anyone in the United States
                    </p>
                  </div>
                </div>

                {/* Local */}
                <div
                  className={cn(
                    "flex items-start space-x-3 p-4 rounded-lg border-2 cursor-pointer transition-all",
                    targetType === "local"
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  )}
                  onClick={() => handleTargetTypeChange("local")}
                >
                  <RadioGroupItem value="local" id="local" />
                  <div className="flex-1">
                    <Label
                      htmlFor="local"
                      className="cursor-pointer flex items-center gap-2"
                    >
                      <MapPin className="h-4 w-4" />
                      <span className="font-semibold">Local Area</span>
                    </Label>
                    <p className="text-xs text-muted-foreground mt-1">
                      Target a specific city and surrounding radius
                    </p>
                  </div>
                </div>
              </RadioGroup>

              {/* Local Options */}
              {targetType === "local" && (
                <div className="space-y-4 pt-2 animate-in fade-in slide-in-from-top-2">
                  <div className="space-y-2">
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Enter city name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="state">State *</Label>
                    <Select value={state} onValueChange={setState}>
                      <SelectTrigger id="state">
                        <SelectValue placeholder="Select state" />
                      </SelectTrigger>
                      <SelectContent className="max-h-[300px]">
                        {US_STATES.map((s) => (
                          <SelectItem key={s.code} value={s.code}>
                            {s.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="radius">Target Radius (miles)</Label>
                    <Select value={radius} onValueChange={setRadius}>
                      <SelectTrigger id="radius">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10">10 miles</SelectItem>
                        <SelectItem value="15">15 miles</SelectItem>
                        <SelectItem value="25">25 miles</SelectItem>
                        <SelectItem value="50">50 miles</SelectItem>
                        <SelectItem value="75">75 miles</SelectItem>
                        <SelectItem value="100">100 miles</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      Ads will show to people within this radius of your city
                    </p>
                  </div>
                </div>
              )}

              {/* Info */}
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  {targetType === "nationwide"
                    ? "Nationwide targeting works best for businesses that can serve customers anywhere in the US or offer online services."
                    : "Local targeting is ideal for service-based businesses that operate in a specific geographic area."}
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </div>

        {/* Right: Preview & Tips */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Coverage Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {targetType === "nationwide" ? (
                  <div className="space-y-3">
                    <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                      <div className="flex items-center gap-2 mb-2">
                        <Globe className="h-5 w-5 text-primary" />
                        <span className="font-semibold">United States</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Your ads will be shown to anyone searching in the United
                        States
                      </p>
                    </div>

                    <div className="p-3 bg-muted rounded-lg">
                      <div className="text-xs font-semibold mb-2">
                        Best for:
                      </div>
                      <ul className="text-xs text-muted-foreground space-y-1">
                        <li>• E-commerce businesses</li>
                        <li>• Online services</li>
                        <li>• National franchises</li>
                        <li>• Digital products</li>
                      </ul>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {city && state ? (
                      <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                        <div className="flex items-center gap-2 mb-2">
                          <MapPin className="h-5 w-5 text-primary" />
                          <span className="font-semibold">
                            {city}, {state}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          Within {radius} mile radius
                        </p>
                        <div className="text-xs text-muted-foreground">
                          Estimated reach: ~
                          {parseInt(radius) >= 50
                            ? "500K+"
                            : parseInt(radius) >= 25
                              ? "250K+"
                              : "100K+"}{" "}
                          people
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 bg-muted rounded-lg text-center">
                        <MapPin className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                          Enter your city and state to see coverage
                        </p>
                      </div>
                    )}

                    <div className="p-3 bg-muted rounded-lg">
                      <div className="text-xs font-semibold mb-2">
                        Best for:
                      </div>
                      <ul className="text-xs text-muted-foreground space-y-1">
                        <li>• Local service businesses</li>
                        <li>• Plumbers, electricians, HVAC</li>
                        <li>• Contractors and handymen</li>
                        <li>• Brick-and-mortar stores</li>
                      </ul>
                    </div>
                  </div>
                )}

                {/* Tips */}
                <div className="pt-4 border-t">
                  <div className="text-xs font-semibold mb-2">Pro Tips:</div>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li>
                      • Start with a smaller radius and expand based on results
                    </li>
                    <li>• Consider where your customers typically come from</li>
                    <li>
                      • You can adjust targeting after launch based on
                      performance
                    </li>
                  </ul>
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
          Continue to Budget
        </Button>
      </div>
    </div>
  );
}
