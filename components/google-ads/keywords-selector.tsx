"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, X, AlertTriangle, CheckCircle2, Key, Info } from "lucide-react";
import {
  useGoogleAdsStore,
  MIN_KEYWORDS,
  RECOMMENDED_KEYWORDS,
  type Keyword,
} from "@/lib/store/google-ads";
import { cn } from "@/lib/utils";

interface KeywordsSelectorProps {
  onContinue: () => void;
  onBack: () => void;
}

export function KeywordsSelector({
  onContinue,
  onBack,
}: KeywordsSelectorProps) {
  const { keywords, addKeyword, removeKeyword, updateKeyword } =
    useGoogleAdsStore();
  const [newKeyword, setNewKeyword] = useState("");
  const [newKeywordType, setNewKeywordType] =
    useState<Keyword["type"]>("phrase");
  const [showError, setShowError] = useState(false);

  const handleAdd = () => {
    if (newKeyword.trim()) {
      addKeyword(newKeyword.trim(), newKeywordType);
      setNewKeyword("");
      setNewKeywordType("phrase");
      setShowError(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleAdd();
    }
  };

  const handleContinue = () => {
    if (keywords.length >= MIN_KEYWORDS) {
      onContinue();
    } else {
      setShowError(true);
    }
  };

  const isValid = keywords.length >= MIN_KEYWORDS;
  const isOptimal = keywords.length >= RECOMMENDED_KEYWORDS;
  const remainingToMin = Math.max(0, MIN_KEYWORDS - keywords.length);
  const remainingToOptimal = Math.max(0, RECOMMENDED_KEYWORDS - keywords.length);

  const getMatchTypeDisplay = (type: Keyword["type"]) => {
    switch (type) {
      case "broad":
        return { label: "Broad Match", color: "bg-blue-500" };
      case "phrase":
        return { label: "Phrase Match", color: "bg-green-500" };
      case "exact":
        return { label: "Exact Match", color: "bg-purple-500" };
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight lg:text-3xl">
          Select Your Keywords
        </h2>
        <p className="text-muted-foreground mt-2">
          Choose keywords that your customers might search for. Minimum{" "}
          {MIN_KEYWORDS}, recommended {RECOMMENDED_KEYWORDS}+ for best results.
        </p>
      </div>

      {/* Status */}
      <div className="flex items-center gap-3 flex-wrap">
        <Badge variant={isValid ? "default" : "secondary"} className="text-sm">
          {keywords.length} keyword{keywords.length !== 1 ? "s" : ""}
        </Badge>
        {isValid && !isOptimal && (
          <div className="flex items-center gap-1 text-sm text-green-600">
            <CheckCircle2 className="h-4 w-4" />
            <span>Minimum met</span>
          </div>
        )}
        {isOptimal && (
          <div className="flex items-center gap-1 text-sm text-green-600">
            <CheckCircle2 className="h-4 w-4" />
            <span>Optimal count reached!</span>
          </div>
        )}
      </div>

      {/* Warnings */}
      {showError && !isValid && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Please add at least {remainingToMin} more keyword
            {remainingToMin !== 1 ? "s" : ""} to continue.
          </AlertDescription>
        </Alert>
      )}

      {isValid && !isOptimal && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Add {remainingToOptimal} more keyword
            {remainingToOptimal !== 1 ? "s" : ""} to reach recommended count for
            optimal performance.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Left: Add New Keyword */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Key className="h-4 w-4" />
                Add New Keyword
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-keyword">Keyword</Label>
                <Input
                  id="new-keyword"
                  value={newKeyword}
                  onChange={(e) => {
                    setNewKeyword(e.target.value);
                    setShowError(false);
                  }}
                  onKeyPress={handleKeyPress}
                  placeholder="e.g., emergency plumber"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="match-type">Match Type</Label>
                <Select
                  value={newKeywordType}
                  onValueChange={(value) =>
                    setNewKeywordType(value as Keyword["type"])
                  }
                >
                  <SelectTrigger id="match-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="broad">
                      Broad Match - Widest reach
                    </SelectItem>
                    <SelectItem value="phrase">
                      Phrase Match - Balanced (Recommended)
                    </SelectItem>
                    <SelectItem value="exact">
                      Exact Match - Most specific
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={handleAdd}
                disabled={!newKeyword.trim()}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Keyword
              </Button>

              {/* Match Type Explanation */}
              <div className="p-3 bg-muted rounded-lg space-y-2">
                <div className="text-xs font-semibold">Match Types:</div>
                <div className="space-y-2">
                  <div className="text-xs">
                    <span className="font-medium">Broad:</span> Shows for
                    related searches
                  </div>
                  <div className="text-xs">
                    <span className="font-medium">Phrase:</span> Shows for
                    searches including your phrase
                  </div>
                  <div className="text-xs">
                    <span className="font-medium">Exact:</span> Shows only for
                    exact keyword
                  </div>
                </div>
              </div>

              {/* Keyword Suggestions */}
              <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
                <div className="text-xs font-semibold mb-2">
                  Suggested Keywords:
                </div>
                <div className="flex flex-wrap gap-2">
                  {[
                    "plumber near me",
                    "emergency plumber",
                    "24 hour plumber",
                    "licensed plumber",
                  ].map((suggestion) => (
                    <Button
                      key={suggestion}
                      variant="outline"
                      size="sm"
                      className="text-xs h-7"
                      onClick={() => {
                        setNewKeyword(suggestion);
                        setNewKeywordType("phrase");
                      }}
                    >
                      {suggestion}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right: Existing Keywords */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Your Keywords ({keywords.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {keywords.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p className="text-sm">No keywords yet</p>
                  <p className="text-xs mt-1">
                    Add your first keyword to get started
                  </p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
                  {keywords.map((keyword, index) => {
                    const matchType = getMatchTypeDisplay(keyword.type);
                    return (
                      <div
                        key={keyword.id}
                        className="group relative p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                      >
                        <div className="flex items-start gap-2">
                          <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-semibold flex items-center justify-center mt-0.5">
                            {index + 1}
                          </div>
                          <div className="flex-1 min-w-0 space-y-2">
                            <Input
                              value={keyword.text}
                              onChange={(e) =>
                                updateKeyword(
                                  keyword.id,
                                  e.target.value,
                                  keyword.type
                                )
                              }
                              className="bg-background"
                            />
                            <Select
                              value={keyword.type}
                              onValueChange={(value) =>
                                updateKeyword(
                                  keyword.id,
                                  keyword.text,
                                  value as Keyword["type"]
                                )
                              }
                            >
                              <SelectTrigger className="h-8 text-xs bg-background">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="broad">Broad</SelectItem>
                                <SelectItem value="phrase">Phrase</SelectItem>
                                <SelectItem value="exact">Exact</SelectItem>
                              </SelectContent>
                            </Select>
                            <div className="flex items-center gap-2">
                              <div
                                className={cn(
                                  "h-2 w-2 rounded-full",
                                  matchType.color
                                )}
                              />
                              <span className="text-xs text-muted-foreground">
                                {matchType.label}
                              </span>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => removeKeyword(keyword.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
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
          Continue to URLs
        </Button>
      </div>
    </div>
  );
}
