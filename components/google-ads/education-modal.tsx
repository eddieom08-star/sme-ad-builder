"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
  TrendingUp,
  Target,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface EducationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

const educationPages = [
  {
    step: 1,
    title: "How Responsive Search Ads Work",
    icon: Sparkles,
    content: {
      heading: "Google mixes and matches your content",
      description:
        "You'll provide multiple headlines and descriptions. Google automatically tests different combinations to find what works best for each search.",
      visual: (
        <div className="space-y-4 p-6 bg-muted/50 rounded-lg">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-primary" />
              <div className="text-sm font-medium">Your Input</div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <Card className="p-3 text-xs text-center bg-background">
                Headline 1
              </Card>
              <Card className="p-3 text-xs text-center bg-background">
                Headline 2
              </Card>
              <Card className="p-3 text-xs text-center bg-background">
                Headline 3
              </Card>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Card className="p-3 text-xs text-center bg-background">
                Description 1
              </Card>
              <Card className="p-3 text-xs text-center bg-background">
                Description 2
              </Card>
            </div>
          </div>

          <div className="flex items-center justify-center">
            <Zap className="h-6 w-6 text-primary" />
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-500" />
              <div className="text-sm font-medium">Google Creates</div>
            </div>
            <div className="space-y-2">
              <Card className="p-3 bg-background">
                <div className="text-xs space-y-1">
                  <div className="text-primary font-medium">
                    Headline 1 | Headline 3
                  </div>
                  <div className="text-muted-foreground">Description 2</div>
                </div>
              </Card>
              <Card className="p-3 bg-background">
                <div className="text-xs space-y-1">
                  <div className="text-primary font-medium">
                    Headline 2 | Headline 1
                  </div>
                  <div className="text-muted-foreground">Description 1</div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      ),
    },
  },
  {
    step: 2,
    title: "Why Multiple Headlines & Descriptions?",
    icon: TrendingUp,
    content: {
      heading: "More options = Better performance",
      description:
        "Providing 3-15 headlines and 2-4 descriptions gives Google more combinations to test. The system learns which combinations get the most clicks.",
      visual: (
        <div className="space-y-4">
          <div className="grid gap-3">
            {[
              {
                count: "3 headlines",
                combinations: "~10 combinations",
                performance: "Good",
                color: "yellow",
              },
              {
                count: "5 headlines",
                combinations: "~50 combinations",
                performance: "Better",
                color: "orange",
              },
              {
                count: "10+ headlines",
                combinations: "~500+ combinations",
                performance: "Best",
                color: "green",
              },
            ].map((item) => (
              <Card
                key={item.count}
                className="p-4 border-l-4"
                style={{
                  borderLeftColor:
                    item.color === "green"
                      ? "rgb(34, 197, 94)"
                      : item.color === "orange"
                        ? "rgb(251, 146, 60)"
                        : "rgb(234, 179, 8)",
                }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-sm">{item.count}</div>
                    <div className="text-xs text-muted-foreground">
                      {item.combinations}
                    </div>
                  </div>
                  <Badge
                    variant={
                      item.color === "green"
                        ? "default"
                        : item.color === "orange"
                          ? "secondary"
                          : "outline"
                    }
                  >
                    {item.performance}
                  </Badge>
                </div>
              </Card>
            ))}
          </div>

          <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
            <div className="flex items-start gap-3">
              <Target className="h-5 w-5 text-primary mt-0.5" />
              <div className="space-y-1">
                <div className="font-medium text-sm">Recommendation</div>
                <div className="text-xs text-muted-foreground">
                  Provide at least 5 unique headlines and 2-3 descriptions for
                  optimal performance
                </div>
              </div>
            </div>
          </div>
        </div>
      ),
    },
  },
  {
    step: 3,
    title: "What Makes a Good Headline?",
    icon: Target,
    content: {
      heading: "Tips for writing effective headlines",
      description:
        "Each headline should be unique and highlight different benefits or features of your service.",
      visual: (
        <div className="space-y-3">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-full bg-green-500 text-white flex items-center justify-center text-xs font-bold">
                ✓
              </div>
              <div className="text-sm font-medium">Good Examples</div>
            </div>
            <div className="space-y-2 ml-8">
              {[
                "24/7 Emergency Service",
                "Licensed & Insured Plumbers",
                "Same-Day Repairs Available",
                "30+ Years Experience",
              ].map((example, i) => (
                <Card key={i} className="p-3 bg-green-50 border-green-200">
                  <div className="text-sm">{example}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Clear, specific, and valuable
                  </div>
                </Card>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-full bg-red-500 text-white flex items-center justify-center text-xs font-bold">
                ✗
              </div>
              <div className="text-sm font-medium">Avoid</div>
            </div>
            <div className="space-y-2 ml-8">
              {["Click Here!", "Best Service Ever", "#1 Plumber!!!"].map(
                (example, i) => (
                  <Card key={i} className="p-3 bg-red-50 border-red-200">
                    <div className="text-sm line-through">{example}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Too vague, spammy, or unverifiable
                    </div>
                  </Card>
                )
              )}
            </div>
          </div>
        </div>
      ),
    },
  },
];

export function EducationModal({
  isOpen,
  onClose,
  onComplete,
}: EducationModalProps) {
  const [currentPage, setCurrentPage] = useState(0);

  const handleNext = () => {
    if (currentPage < educationPages.length - 1) {
      setCurrentPage(currentPage + 1);
    } else {
      onComplete();
    }
  };

  const handlePrevious = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  const page = educationPages[currentPage];
  const Icon = page.icon;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Icon className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <DialogTitle className="text-xl">{page.title}</DialogTitle>
              <DialogDescription className="text-sm">
                Step {page.step} of {educationPages.length}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">{page.content.heading}</h3>
            <p className="text-muted-foreground">{page.content.description}</p>
          </div>

          {page.content.visual}

          {/* Progress dots */}
          <div className="flex items-center justify-center gap-2 pt-4">
            {educationPages.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i)}
                className={cn(
                  "h-2 rounded-full transition-all",
                  i === currentPage
                    ? "w-8 bg-primary"
                    : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50"
                )}
              />
            ))}
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <div className="flex-1">
            <Button variant="ghost" onClick={handleSkip} className="w-full sm:w-auto">
              Skip Tutorial
            </Button>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentPage === 0}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            <Button onClick={handleNext}>
              {currentPage === educationPages.length - 1 ? (
                "Get Started"
              ) : (
                <>
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
