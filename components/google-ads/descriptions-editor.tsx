"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Plus, X, AlertTriangle, CheckCircle2, FileText } from "lucide-react";
import {
  useGoogleAdsStore,
  DESCRIPTION_MAX_LENGTH,
  MIN_DESCRIPTIONS,
  MAX_DESCRIPTIONS,
} from "@/lib/store/google-ads";
import { cn } from "@/lib/utils";

interface DescriptionsEditorProps {
  onContinue: () => void;
  onBack: () => void;
}

export function DescriptionsEditor({
  onContinue,
  onBack,
}: DescriptionsEditorProps) {
  const { descriptions, addDescription, updateDescription, removeDescription } =
    useGoogleAdsStore();
  const [newDescription, setNewDescription] = useState("");
  const [showError, setShowError] = useState(false);

  const handleAdd = () => {
    if (newDescription.trim() && descriptions.length < MAX_DESCRIPTIONS) {
      if (newDescription.length > DESCRIPTION_MAX_LENGTH) {
        setShowError(true);
        return;
      }
      addDescription(newDescription.trim());
      setNewDescription("");
      setShowError(false);
    }
  };

  const handleContinue = () => {
    if (descriptions.length >= MIN_DESCRIPTIONS) {
      onContinue();
    } else {
      setShowError(true);
    }
  };

  const isValid = descriptions.length >= MIN_DESCRIPTIONS;
  const canAddMore = descriptions.length < MAX_DESCRIPTIONS;
  const remainingToMin = Math.max(0, MIN_DESCRIPTIONS - descriptions.length);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight lg:text-3xl">
          Create Your Descriptions
        </h2>
        <p className="text-muted-foreground mt-2">
          Write {MIN_DESCRIPTIONS}-{MAX_DESCRIPTIONS} unique descriptions. Expand
          on your headlines with more details about your service.
        </p>
      </div>

      {/* Status */}
      <div className="flex items-center gap-3 flex-wrap">
        <Badge variant={isValid ? "default" : "secondary"} className="text-sm">
          {descriptions.length} of {MIN_DESCRIPTIONS}-{MAX_DESCRIPTIONS}{" "}
          descriptions
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
            Please add at least {remainingToMin} more description
            {remainingToMin !== 1 ? "s" : ""} to continue.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Left: Add New Description */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Add New Description
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-description">Description Text</Label>
                <div className="space-y-2">
                  <Textarea
                    id="new-description"
                    value={newDescription}
                    onChange={(e) => {
                      setNewDescription(e.target.value);
                      setShowError(false);
                    }}
                    placeholder="e.g., Expert plumbers available 24/7. Licensed & insured. Same-day service available."
                    maxLength={DESCRIPTION_MAX_LENGTH}
                    rows={3}
                    className={cn(
                      newDescription.length > DESCRIPTION_MAX_LENGTH &&
                        "border-destructive"
                    )}
                  />
                  <div
                    className={cn(
                      "text-xs text-right",
                      newDescription.length > DESCRIPTION_MAX_LENGTH
                        ? "text-destructive font-medium"
                        : "text-muted-foreground"
                    )}
                  >
                    {newDescription.length}/{DESCRIPTION_MAX_LENGTH} characters
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Maximum {DESCRIPTION_MAX_LENGTH} characters
                </p>
              </div>

              <Button
                onClick={handleAdd}
                disabled={
                  !newDescription.trim() ||
                  !canAddMore ||
                  newDescription.length > DESCRIPTION_MAX_LENGTH
                }
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Description
              </Button>

              {/* Tips */}
              <div className="p-3 bg-muted rounded-lg space-y-2">
                <div className="text-xs font-semibold">Tips:</div>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• Explain what makes you different</li>
                  <li>• Include call-to-action phrases</li>
                  <li>• Mention credentials or guarantees</li>
                  <li>• Keep it clear and concise</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right: Existing Descriptions */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Your Descriptions ({descriptions.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {descriptions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p className="text-sm">No descriptions yet</p>
                  <p className="text-xs mt-1">
                    Add your first description to get started
                  </p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                  {descriptions.map((description, index) => (
                    <div
                      key={description.id}
                      className="group relative p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                    >
                      <div className="flex items-start gap-2">
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-semibold flex items-center justify-center mt-0.5">
                          {index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <Textarea
                            value={description.text}
                            onChange={(e) =>
                              updateDescription(description.id, e.target.value)
                            }
                            maxLength={DESCRIPTION_MAX_LENGTH}
                            rows={3}
                            className="bg-background resize-none"
                          />
                          <div
                            className={cn(
                              "text-xs mt-1",
                              description.text.length > DESCRIPTION_MAX_LENGTH
                                ? "text-destructive font-medium"
                                : "text-muted-foreground"
                            )}
                          >
                            {description.text.length}/{DESCRIPTION_MAX_LENGTH}{" "}
                            characters
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => removeDescription(description.id)}
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
          Continue to Keywords
        </Button>
      </div>
    </div>
  );
}
