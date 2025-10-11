"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Plus, X, AlertTriangle, CheckCircle2, Sparkles } from "lucide-react";
import {
  useGoogleAdsStore,
  HEADLINE_MAX_LENGTH,
  MIN_HEADLINES,
  MAX_HEADLINES,
} from "@/lib/store/google-ads";
import { cn } from "@/lib/utils";

interface HeadlinesEditorProps {
  onContinue: () => void;
  onBack: () => void;
}

export function HeadlinesEditor({ onContinue, onBack }: HeadlinesEditorProps) {
  const { headlines, addHeadline, updateHeadline, removeHeadline } =
    useGoogleAdsStore();
  const [newHeadline, setNewHeadline] = useState("");
  const [showError, setShowError] = useState(false);

  const handleAdd = () => {
    if (newHeadline.trim() && headlines.length < MAX_HEADLINES) {
      if (newHeadline.length > HEADLINE_MAX_LENGTH) {
        setShowError(true);
        return;
      }
      addHeadline(newHeadline.trim());
      setNewHeadline("");
      setShowError(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleAdd();
    }
  };

  const handleContinue = () => {
    if (headlines.length >= MIN_HEADLINES) {
      onContinue();
    } else {
      setShowError(true);
    }
  };

  const isValid = headlines.length >= MIN_HEADLINES;
  const canAddMore = headlines.length < MAX_HEADLINES;
  const remainingToMin = Math.max(0, MIN_HEADLINES - headlines.length);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight lg:text-3xl">
          Create Your Headlines
        </h2>
        <p className="text-muted-foreground mt-2">
          Write {MIN_HEADLINES}-{MAX_HEADLINES} unique headlines. Each headline
          should highlight a different benefit or feature.
        </p>
      </div>

      {/* Status */}
      <div className="flex items-center gap-3 flex-wrap">
        <Badge
          variant={isValid ? "default" : "secondary"}
          className="text-sm"
        >
          {headlines.length} of {MIN_HEADLINES}-{MAX_HEADLINES} headlines
        </Badge>
        {isValid && (
          <div className="flex items-center gap-1 text-sm text-green-600">
            <CheckCircle2 className="h-4 w-4" />
            <span>Minimum met</span>
          </div>
        )}
        {!canAddMore && (
          <Badge variant="outline" className="text-sm">
            Maximum reached
          </Badge>
        )}
      </div>

      {/* Warning */}
      {showError && !isValid && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Please add at least {remainingToMin} more headline
            {remainingToMin !== 1 ? "s" : ""} to continue.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Left: Add New Headline */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                Add New Headline
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-headline">Headline Text</Label>
                <div className="relative">
                  <Input
                    id="new-headline"
                    value={newHeadline}
                    onChange={(e) => {
                      setNewHeadline(e.target.value);
                      setShowError(false);
                    }}
                    onKeyPress={handleKeyPress}
                    placeholder="e.g., 24/7 Emergency Service"
                    maxLength={HEADLINE_MAX_LENGTH}
                    className={cn(
                      newHeadline.length > HEADLINE_MAX_LENGTH && "border-destructive"
                    )}
                  />
                  <div
                    className={cn(
                      "absolute right-3 top-1/2 -translate-y-1/2 text-xs",
                      newHeadline.length > HEADLINE_MAX_LENGTH
                        ? "text-destructive font-medium"
                        : "text-muted-foreground"
                    )}
                  >
                    {newHeadline.length}/{HEADLINE_MAX_LENGTH}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Maximum {HEADLINE_MAX_LENGTH} characters
                </p>
              </div>

              <Button
                onClick={handleAdd}
                disabled={
                  !newHeadline.trim() ||
                  !canAddMore ||
                  newHeadline.length > HEADLINE_MAX_LENGTH
                }
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Headline
              </Button>

              {/* Tips */}
              <div className="p-3 bg-muted rounded-lg space-y-2">
                <div className="text-xs font-semibold">Tips:</div>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• Highlight unique benefits</li>
                  <li>• Include keywords naturally</li>
                  <li>• Be specific and clear</li>
                  <li>• Avoid repetition</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right: Existing Headlines */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Your Headlines ({headlines.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {headlines.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p className="text-sm">No headlines yet</p>
                  <p className="text-xs mt-1">
                    Add your first headline to get started
                  </p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
                  {headlines.map((headline, index) => (
                    <div
                      key={headline.id}
                      className="group relative p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                    >
                      <div className="flex items-start gap-2">
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-semibold flex items-center justify-center mt-0.5">
                          {index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <Input
                            value={headline.text}
                            onChange={(e) =>
                              updateHeadline(headline.id, e.target.value)
                            }
                            maxLength={HEADLINE_MAX_LENGTH}
                            className="bg-background"
                          />
                          <div
                            className={cn(
                              "text-xs mt-1",
                              headline.text.length > HEADLINE_MAX_LENGTH
                                ? "text-destructive font-medium"
                                : "text-muted-foreground"
                            )}
                          >
                            {headline.text.length}/{HEADLINE_MAX_LENGTH}{" "}
                            characters
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => removeHeadline(headline.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
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
          Continue to Descriptions
        </Button>
      </div>
    </div>
  );
}
