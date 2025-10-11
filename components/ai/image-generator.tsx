"use client";

import { useState } from "react";
import { useOnboardingStore } from "@/lib/store/onboarding";
import {
  PROMPT_LIBRARY,
  getPromptsByCategory,
  buildPrompt,
  containsProhibitedTerms,
  type PromptTemplate,
} from "@/lib/ai/prompt-library";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Sparkles, Wand2, AlertTriangle, Image as ImageIcon, Download, Loader2, Edit, Share2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { ImageEditor } from "./image-editor";
import { MultiExportModal } from "./multi-export-modal";

type AspectRatio = "1:1" | "16:9" | "9:16" | "4:5";

interface GeneratedImage {
  url: string;
  prompt: string;
  revisedPrompt?: string;
  aspectRatio: AspectRatio;
  quality: string;
  style: string;
}

export function ImageGenerator() {
  const { businessProfile } = useOnboardingStore();
  const [activeTab, setActiveTab] = useState<"templates" | "custom">("templates");

  // Template mode
  const [selectedTemplate, setSelectedTemplate] = useState<PromptTemplate | null>(null);
  const [placeholders, setPlaceholders] = useState<Record<string, string>>({});

  // Custom mode
  const [customPrompt, setCustomPrompt] = useState("");

  // Generation settings
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>("4:5");
  const [quality, setQuality] = useState<"standard" | "hd">("standard");
  const [style, setStyle] = useState<"vivid" | "natural">("vivid");

  // State
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [selectedImage, setSelectedImage] = useState<GeneratedImage | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [prohibitedWarning, setProhibitedWarning] = useState<string[] | null>(null);
  const [editingImage, setEditingImage] = useState<GeneratedImage | null>(null);
  const [showExportModal, setShowExportModal] = useState(false);

  const category = businessProfile.category || "Other";
  const availableTemplates = getPromptsByCategory(category);

  // Handle template selection
  const handleTemplateSelect = (templateId: string) => {
    const template = PROMPT_LIBRARY.find((t) => t.id === templateId);
    if (template) {
      setSelectedTemplate(template);
      setPlaceholders({});
      setError(null);
      setProhibitedWarning(null);
    }
  };

  // Validate and build final prompt
  const getFinalPrompt = (): string | null => {
    if (activeTab === "templates") {
      if (!selectedTemplate) return null;

      // Check if all placeholders are filled
      const missingPlaceholders = selectedTemplate.placeholders.filter(
        (p) => !placeholders[p] || placeholders[p].trim() === ""
      );

      if (missingPlaceholders.length > 0) {
        setError(`Please fill in: ${missingPlaceholders.join(", ")}`);
        return null;
      }

      return buildPrompt(selectedTemplate, placeholders, category);
    } else {
      if (!customPrompt.trim()) {
        setError("Please enter a prompt");
        return null;
      }
      return customPrompt;
    }
  };

  // Generate image
  const handleGenerate = async () => {
    setError(null);
    setProhibitedWarning(null);

    const finalPrompt = getFinalPrompt();
    if (!finalPrompt) return;

    // Check for prohibited terms
    const check = containsProhibitedTerms(finalPrompt);
    if (check.hasProhibited) {
      setProhibitedWarning(check.foundTerms);
      setError(`Prohibited terms found: ${check.foundTerms.join(", ")}`);
      return;
    }

    try {
      setIsGenerating(true);

      const response = await fetch("/api/images/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: finalPrompt,
          aspectRatio,
          quality,
          style,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || result.error || "Failed to generate image");
      }

      const newImage: GeneratedImage = {
        url: result.data.imageUrl,
        prompt: finalPrompt,
        revisedPrompt: result.data.revisedPrompt,
        aspectRatio,
        quality,
        style,
      };

      setGeneratedImages([newImage, ...generatedImages]);
      setSelectedImage(newImage);
    } catch (err: any) {
      setError(err.message || "Failed to generate image");
    } finally {
      setIsGenerating(false);
    }
  };

  // Handle edited image save
  const handleSaveEditedImage = (editedImageUrl: string) => {
    if (!editingImage) return;

    const updatedImage: GeneratedImage = {
      ...editingImage,
      url: editedImageUrl,
    };

    // Update in gallery
    const updatedImages = generatedImages.map((img) =>
      img.url === editingImage.url ? updatedImage : img
    );
    setGeneratedImages(updatedImages);

    // Update selected if it was selected
    if (selectedImage?.url === editingImage.url) {
      setSelectedImage(updatedImage);
    }

    setEditingImage(null);
  };

  // Handle download
  const handleDownload = (image: GeneratedImage) => {
    const link = document.createElement("a");
    link.href = image.url;
    link.download = `ad-image-${image.aspectRatio}-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight lg:text-3xl">AI Image Generator</h2>
        <p className="text-muted-foreground mt-2">
          Create professional marketing images for your {category} business
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Left: Prompt Builder */}
        <div className="space-y-4">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="templates">
                <Sparkles className="h-4 w-4 mr-2" />
                Templates
              </TabsTrigger>
              <TabsTrigger value="custom">
                <Wand2 className="h-4 w-4 mr-2" />
                Custom
              </TabsTrigger>
            </TabsList>

            {/* Template Mode */}
            <TabsContent value="templates" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Select Template</Label>
                <Select
                  value={selectedTemplate?.id}
                  onValueChange={handleTemplateSelect}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a template..." />
                  </SelectTrigger>
                  <SelectContent>
                    {availableTemplates.map((template) => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedTemplate && (
                <>
                  <Card className="bg-muted/50">
                    <CardContent className="pt-4">
                      <p className="text-sm text-muted-foreground">
                        {selectedTemplate.description}
                      </p>
                      <div className="mt-2">
                        <Badge variant="outline">{selectedTemplate.style}</Badge>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Placeholder Inputs */}
                  <div className="space-y-3">
                    <Label className="text-sm font-semibold">Customize Details</Label>
                    {selectedTemplate.placeholders.map((placeholder) => (
                      <div key={placeholder} className="space-y-1">
                        <Label htmlFor={placeholder} className="text-sm capitalize">
                          {placeholder.replace(/_/g, " ")}
                        </Label>
                        <Input
                          id={placeholder}
                          value={placeholders[placeholder] || ""}
                          onChange={(e) =>
                            setPlaceholders({
                              ...placeholders,
                              [placeholder]: e.target.value,
                            })
                          }
                          placeholder={`Enter ${placeholder.replace(/_/g, " ")}...`}
                        />
                      </div>
                    ))}
                  </div>

                  {/* Example Preview */}
                  <Card className="border-dashed">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Example Output</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-xs text-muted-foreground font-mono">
                        {selectedTemplate.example}
                      </p>
                    </CardContent>
                  </Card>
                </>
              )}
            </TabsContent>

            {/* Custom Mode */}
            <TabsContent value="custom" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="custom-prompt">Your Prompt</Label>
                <Textarea
                  id="custom-prompt"
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  placeholder="Describe the image you want to generate..."
                  rows={6}
                  className="resize-none"
                />
                <p className="text-xs text-muted-foreground">
                  {customPrompt.length} / 4000 characters
                </p>
              </div>

              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  Avoid: Competitor names, medical claims, guarantees, before/after comparisons
                </AlertDescription>
              </Alert>
            </TabsContent>
          </Tabs>

          {/* Generation Settings */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Generation Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-sm">Aspect Ratio</Label>
                  <Select value={aspectRatio} onValueChange={(v) => setAspectRatio(v as AspectRatio)}>
                    <SelectTrigger className="text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1:1">Square (1:1)</SelectItem>
                      <SelectItem value="4:5">Portrait (4:5)</SelectItem>
                      <SelectItem value="16:9">Landscape (16:9)</SelectItem>
                      <SelectItem value="9:16">Story (9:16)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-sm">Quality</Label>
                  <Select value={quality} onValueChange={(v) => setQuality(v as any)}>
                    <SelectTrigger className="text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">Standard</SelectItem>
                      <SelectItem value="hd">HD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm">Style</Label>
                <Select value={style} onValueChange={(v) => setStyle(v as any)}>
                  <SelectTrigger className="text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vivid">Vivid (More Creative)</SelectItem>
                    <SelectItem value="natural">Natural (More Realistic)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Error Display */}
          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Generate Button */}
          <Button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full"
            size="lg"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5 mr-2" />
                Generate Image
              </>
            )}
          </Button>
        </div>

        {/* Right: Generated Images */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Generated Images</h3>
            <Badge variant="outline">{generatedImages.length} Generated</Badge>
          </div>

          {selectedImage ? (
            <Card className="overflow-hidden">
              <div className="aspect-square relative bg-muted">
                <img
                  src={selectedImage.url}
                  alt="Generated"
                  className={cn(
                    "w-full h-full object-contain",
                    selectedImage.aspectRatio === "4:5" && "aspect-[4/5]",
                    selectedImage.aspectRatio === "16:9" && "aspect-video",
                    selectedImage.aspectRatio === "9:16" && "aspect-[9/16]"
                  )}
                />
              </div>
              <CardContent className="pt-4">
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Badge variant="secondary">{selectedImage.aspectRatio}</Badge>
                    <Badge variant="secondary">{selectedImage.quality}</Badge>
                    <Badge variant="secondary">{selectedImage.style}</Badge>
                  </div>
                  {selectedImage.revisedPrompt && (
                    <p className="text-xs text-muted-foreground">
                      <strong>Revised:</strong> {selectedImage.revisedPrompt}
                    </p>
                  )}
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant="outline"
                        className="w-full"
                        size="sm"
                        onClick={() => setEditingImage(selectedImage)}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full"
                        size="sm"
                        onClick={() => handleDownload(selectedImage)}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </div>
                    <Button
                      variant="default"
                      className="w-full"
                      size="sm"
                      onClick={() => setShowExportModal(true)}
                    >
                      <Share2 className="h-4 w-4 mr-2" />
                      Export for Platforms
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-dashed">
              <CardContent className="pt-6 pb-6">
                <div className="text-center space-y-2">
                  <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground/50" />
                  <p className="text-sm text-muted-foreground">
                    No images generated yet
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Select a template or create a custom prompt to get started
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Image History */}
          {generatedImages.length > 1 && (
            <div className="grid grid-cols-3 gap-2">
              {generatedImages.slice(1, 4).map((img, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(img)}
                  className="aspect-square rounded-lg overflow-hidden border-2 hover:border-primary transition-colors"
                >
                  <img
                    src={img.url}
                    alt={`Generated ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Image Editor Modal */}
      {editingImage && (
        <ImageEditor
          imageUrl={editingImage.url}
          onSave={handleSaveEditedImage}
          onCancel={() => setEditingImage(null)}
        />
      )}

      {/* Multi-Format Export Modal */}
      {selectedImage && (
        <MultiExportModal
          isOpen={showExportModal}
          onClose={() => setShowExportModal(false)}
          imageUrl={selectedImage.url}
          baseAspectRatio={selectedImage.aspectRatio}
        />
      )}
    </div>
  );
}
