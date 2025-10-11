"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Users, MapPin, TrendingUp, Target, X, Plus } from "lucide-react";
import { useSocialMediaStore, type AudienceTargeting } from "@/lib/store/social-media";
import { US_STATES } from "@/lib/constants/us-states";

interface AudienceTargetingProps {
  onContinue: () => void;
  onBack: () => void;
}

const INTEREST_SUGGESTIONS = [
  "Home Improvement",
  "Home Services",
  "DIY",
  "Home Repair",
  "Local Services",
  "Professional Services",
  "Home Renovation",
  "Property Maintenance",
];

export function AudienceTargeting({ onContinue, onBack }: AudienceTargetingProps) {
  const { audienceTargeting, setAudienceTargeting } = useSocialMediaStore();
  const [newLocation, setNewLocation] = useState("");
  const [newInterest, setNewInterest] = useState("");

  const handleAddLocation = () => {
    if (newLocation.trim() && !audienceTargeting.locations.includes(newLocation.trim())) {
      setAudienceTargeting({
        locations: [...audienceTargeting.locations, newLocation.trim()],
      });
      setNewLocation("");
    }
  };

  const handleRemoveLocation = (location: string) => {
    setAudienceTargeting({
      locations: audienceTargeting.locations.filter((l) => l !== location),
    });
  };

  const handleAddInterest = (interest: string) => {
    if (!audienceTargeting.interests.includes(interest)) {
      setAudienceTargeting({
        interests: [...audienceTargeting.interests, interest],
      });
    }
  };

  const handleRemoveInterest = (interest: string) => {
    setAudienceTargeting({
      interests: audienceTargeting.interests.filter((i) => i !== interest),
    });
  };

  const handleCustomInterest = () => {
    if (newInterest.trim() && !audienceTargeting.interests.includes(newInterest.trim())) {
      handleAddInterest(newInterest.trim());
      setNewInterest("");
    }
  };

  const handleAgeRangeChange = (values: number[]) => {
    setAudienceTargeting({
      ageRange: {
        min: values[0],
        max: values[1],
      },
    });
  };

  const handleGenderChange = (gender: "all" | "male" | "female") => {
    setAudienceTargeting({ gender });
  };

  const isValid = audienceTargeting.locations.length > 0;

  const estimatedReach = () => {
    let base = audienceTargeting.locations.length * 50000;
    const ageSpan = audienceTargeting.ageRange.max - audienceTargeting.ageRange.min;
    const ageFactor = ageSpan / 47; // Max span is 47 years (18-65)
    base *= ageFactor;

    if (audienceTargeting.gender !== "all") {
      base *= 0.5;
    }

    if (audienceTargeting.interests.length > 0) {
      base *= 0.3; // More targeted = smaller reach
    }

    return Math.round(base).toLocaleString();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight lg:text-3xl">
          Define Your Audience
        </h2>
        <p className="text-muted-foreground mt-2">
          Choose who will see your ads. More specific targeting can improve your results.
        </p>
      </div>

      <div className="grid lg:grid-cols-[1fr,350px] gap-6">
        {/* Left: Targeting Options */}
        <div className="space-y-4">
          {/* Location Targeting */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Location Targeting
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="location">Add Location</Label>
                <div className="flex gap-2">
                  <Select value={newLocation} onValueChange={setNewLocation}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a state..." />
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px]">
                      {US_STATES.map((state) => (
                        <SelectItem key={state.code} value={state.name}>
                          {state.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button onClick={handleAddLocation} disabled={!newLocation}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Selected Locations */}
              {audienceTargeting.locations.length > 0 && (
                <div className="space-y-2">
                  <Label>Selected Locations</Label>
                  <div className="flex flex-wrap gap-2">
                    {audienceTargeting.locations.map((location) => (
                      <Badge key={location} variant="secondary" className="gap-1">
                        {location}
                        <button
                          onClick={() => handleRemoveLocation(location)}
                          className="ml-1 hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Age Range */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="h-4 w-4" />
                Age Range
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">
                    {audienceTargeting.ageRange.min} years old
                  </span>
                  <span className="font-medium">
                    {audienceTargeting.ageRange.max} years old
                  </span>
                </div>
                <Slider
                  min={18}
                  max={65}
                  step={1}
                  value={[audienceTargeting.ageRange.min, audienceTargeting.ageRange.max]}
                  onValueChange={handleAgeRangeChange}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  Target people between {audienceTargeting.ageRange.min} and{" "}
                  {audienceTargeting.ageRange.max} years old
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Gender */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="h-4 w-4" />
                Gender
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={audienceTargeting.gender}
                onValueChange={(v) => handleGenderChange(v as any)}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="all" id="gender-all" />
                  <Label htmlFor="gender-all">All Genders</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="male" id="gender-male" />
                  <Label htmlFor="gender-male">Male</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="female" id="gender-female" />
                  <Label htmlFor="gender-female">Female</Label>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Interests */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Target className="h-4 w-4" />
                Interests & Behaviors
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Suggested Interests */}
              <div className="space-y-2">
                <Label>Suggested Interests</Label>
                <div className="flex flex-wrap gap-2">
                  {INTEREST_SUGGESTIONS.filter(
                    (interest) => !audienceTargeting.interests.includes(interest)
                  ).map((interest) => (
                    <Button
                      key={interest}
                      variant="outline"
                      size="sm"
                      onClick={() => handleAddInterest(interest)}
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      {interest}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Custom Interest */}
              <div className="space-y-2">
                <Label htmlFor="custom-interest">Add Custom Interest</Label>
                <div className="flex gap-2">
                  <Input
                    id="custom-interest"
                    value={newInterest}
                    onChange={(e) => setNewInterest(e.target.value)}
                    placeholder="e.g., Emergency Services"
                    onKeyPress={(e) => e.key === "Enter" && handleCustomInterest()}
                  />
                  <Button onClick={handleCustomInterest} disabled={!newInterest.trim()}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Selected Interests */}
              {audienceTargeting.interests.length > 0 && (
                <div className="space-y-2">
                  <Label>Selected Interests</Label>
                  <div className="flex flex-wrap gap-2">
                    {audienceTargeting.interests.map((interest) => (
                      <Badge key={interest} variant="secondary" className="gap-1">
                        {interest}
                        <button
                          onClick={() => handleRemoveInterest(interest)}
                          className="ml-1 hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right: Audience Summary */}
        <div className="lg:sticky lg:top-6 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Audience Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Estimated Reach */}
              <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                <div className="text-sm text-muted-foreground mb-1">
                  Estimated Reach
                </div>
                <div className="text-2xl font-bold">{estimatedReach()}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  people per month
                </div>
              </div>

              {/* Targeting Details */}
              <div className="space-y-3 text-sm">
                <div>
                  <div className="font-semibold mb-1">Locations</div>
                  <div className="text-muted-foreground">
                    {audienceTargeting.locations.length > 0
                      ? audienceTargeting.locations.join(", ")
                      : "None selected"}
                  </div>
                </div>

                <div>
                  <div className="font-semibold mb-1">Age Range</div>
                  <div className="text-muted-foreground">
                    {audienceTargeting.ageRange.min} - {audienceTargeting.ageRange.max} years
                  </div>
                </div>

                <div>
                  <div className="font-semibold mb-1">Gender</div>
                  <div className="text-muted-foreground capitalize">
                    {audienceTargeting.gender}
                  </div>
                </div>

                {audienceTargeting.interests.length > 0 && (
                  <div>
                    <div className="font-semibold mb-1">Interests</div>
                    <div className="text-muted-foreground">
                      {audienceTargeting.interests.length} selected
                    </div>
                  </div>
                )}
              </div>

              {/* Tips */}
              <div className="pt-4 border-t">
                <div className="text-xs font-semibold mb-2">Pro Tips:</div>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• Broader targeting = larger reach</li>
                  <li>• Narrower targeting = better relevance</li>
                  <li>• Start broad, refine based on results</li>
                </ul>
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
          onClick={onContinue}
          disabled={!isValid}
          className="min-w-[200px]"
        >
          Continue to Budget
        </Button>
      </div>
    </div>
  );
}
