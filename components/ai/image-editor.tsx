"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Crop,
  Sun,
  Circle,
  RotateCw,
  Download,
  X,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageEditorProps {
  imageUrl: string;
  onSave: (editedImageUrl: string) => void;
  onCancel: () => void;
}

interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface ImageAdjustments {
  brightness: number;
  contrast: number;
  saturation: number;
}

export function ImageEditor({ imageUrl, onSave, onCancel }: ImageEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [activeTab, setActiveTab] = useState<"crop" | "adjust">("crop");

  // Crop state
  const [cropArea, setCropArea] = useState<CropArea>({
    x: 0,
    y: 0,
    width: 100,
    height: 100,
  });
  const [isDragging, setIsDragging] = useState(false);

  // Adjustments state
  const [adjustments, setAdjustments] = useState<ImageAdjustments>({
    brightness: 100,
    contrast: 100,
    saturation: 100,
  });

  // Load image
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      setImage(img);
      // Initialize crop area to full image
      setCropArea({
        x: 0,
        y: 0,
        width: img.width,
        height: img.height,
      });
    };
    img.src = imageUrl;
  }, [imageUrl]);

  // Draw image on canvas with adjustments
  useEffect(() => {
    if (!image || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    canvas.width = image.width;
    canvas.height = image.height;

    // Apply filters
    ctx.filter = `brightness(${adjustments.brightness}%) contrast(${adjustments.contrast}%) saturate(${adjustments.saturation}%)`;

    // Draw image
    ctx.drawImage(image, 0, 0);

    // Draw crop overlay if in crop mode
    if (activeTab === "crop") {
      // Darken outside crop area
      ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Clear crop area
      ctx.globalCompositeOperation = "destination-out";
      ctx.fillRect(cropArea.x, cropArea.y, cropArea.width, cropArea.height);

      // Draw crop border
      ctx.globalCompositeOperation = "source-over";
      ctx.strokeStyle = "#3b82f6";
      ctx.lineWidth = 2;
      ctx.strokeRect(cropArea.x, cropArea.y, cropArea.width, cropArea.height);
    }
  }, [image, adjustments, cropArea, activeTab]);

  // Handle crop aspect ratio presets
  const applyCropPreset = (aspectRatio: string) => {
    if (!image) return;

    const [widthRatio, heightRatio] = aspectRatio.split(":").map(Number);
    const imageAspect = image.width / image.height;
    const targetAspect = widthRatio / heightRatio;

    let newWidth, newHeight, newX, newY;

    if (targetAspect > imageAspect) {
      // Crop height
      newWidth = image.width;
      newHeight = image.width / targetAspect;
      newX = 0;
      newY = (image.height - newHeight) / 2;
    } else {
      // Crop width
      newHeight = image.height;
      newWidth = image.height * targetAspect;
      newY = 0;
      newX = (image.width - newWidth) / 2;
    }

    setCropArea({
      x: Math.round(newX),
      y: Math.round(newY),
      width: Math.round(newWidth),
      height: Math.round(newHeight),
    });
  };

  // Export edited image
  const handleSave = () => {
    if (!image || !canvasRef.current) return;

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set output canvas size to crop area
    canvas.width = cropArea.width;
    canvas.height = cropArea.height;

    // Apply filters
    ctx.filter = `brightness(${adjustments.brightness}%) contrast(${adjustments.contrast}%) saturate(${adjustments.saturation}%)`;

    // Draw cropped and adjusted image
    ctx.drawImage(
      image,
      cropArea.x,
      cropArea.y,
      cropArea.width,
      cropArea.height,
      0,
      0,
      cropArea.width,
      cropArea.height
    );

    // Convert to data URL
    const editedImageUrl = canvas.toDataURL("image/png", 1.0);
    onSave(editedImageUrl);
  };

  // Download edited image
  const handleDownload = () => {
    if (!image || !canvasRef.current) return;

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = cropArea.width;
    canvas.height = cropArea.height;

    ctx.filter = `brightness(${adjustments.brightness}%) contrast(${adjustments.contrast}%) saturate(${adjustments.saturation}%)`;

    ctx.drawImage(
      image,
      cropArea.x,
      cropArea.y,
      cropArea.width,
      cropArea.height,
      0,
      0,
      cropArea.width,
      cropArea.height
    );

    // Trigger download
    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `edited-image-${Date.now()}.png`;
      a.click();
      URL.revokeObjectURL(url);
    }, "image/png");
  };

  // Reset adjustments
  const handleReset = () => {
    setAdjustments({
      brightness: 100,
      contrast: 100,
      saturation: 100,
    });
    if (image) {
      setCropArea({
        x: 0,
        y: 0,
        width: image.width,
        height: image.height,
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 overflow-auto">
      <div className="container max-w-6xl mx-auto p-4 lg:p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Edit Image</h2>
          <Button variant="ghost" size="icon" onClick={onCancel}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="grid lg:grid-cols-[1fr,320px] gap-6">
          {/* Canvas Area */}
          <Card>
            <CardContent className="p-4">
              <div className="relative bg-muted rounded-lg overflow-hidden">
                <canvas
                  ref={canvasRef}
                  className="w-full h-auto max-h-[600px] object-contain"
                />
              </div>
            </CardContent>
          </Card>

          {/* Controls */}
          <div className="space-y-4">
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="crop">
                  <Crop className="h-4 w-4 mr-2" />
                  Crop
                </TabsTrigger>
                <TabsTrigger value="adjust">
                  <Sun className="h-4 w-4 mr-2" />
                  Adjust
                </TabsTrigger>
              </TabsList>

              {/* Crop Tab */}
              <TabsContent value="crop" className="space-y-4 mt-4">
                <div className="space-y-3">
                  <Label className="text-sm font-semibold">Aspect Ratio</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => applyCropPreset("1:1")}
                    >
                      1:1
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => applyCropPreset("4:5")}
                    >
                      4:5
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => applyCropPreset("16:9")}
                    >
                      16:9
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => applyCropPreset("9:16")}
                    >
                      9:16
                    </Button>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-sm">Crop Dimensions</Label>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <div>Width: {cropArea.width}px</div>
                    <div>Height: {cropArea.height}px</div>
                    <div>
                      Aspect: {(cropArea.width / cropArea.height).toFixed(2)}
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Adjust Tab */}
              <TabsContent value="adjust" className="space-y-4 mt-4">
                <div className="space-y-4">
                  {/* Brightness */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm">Brightness</Label>
                      <span className="text-sm text-muted-foreground">
                        {adjustments.brightness}%
                      </span>
                    </div>
                    <Slider
                      value={[adjustments.brightness]}
                      onValueChange={([value]) =>
                        setAdjustments({ ...adjustments, brightness: value })
                      }
                      min={0}
                      max={200}
                      step={1}
                      className="w-full"
                    />
                  </div>

                  {/* Contrast */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm">Contrast</Label>
                      <span className="text-sm text-muted-foreground">
                        {adjustments.contrast}%
                      </span>
                    </div>
                    <Slider
                      value={[adjustments.contrast]}
                      onValueChange={([value]) =>
                        setAdjustments({ ...adjustments, contrast: value })
                      }
                      min={0}
                      max={200}
                      step={1}
                      className="w-full"
                    />
                  </div>

                  {/* Saturation */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm">Saturation</Label>
                      <span className="text-sm text-muted-foreground">
                        {adjustments.saturation}%
                      </span>
                    </div>
                    <Slider
                      value={[adjustments.saturation]}
                      onValueChange={([value]) =>
                        setAdjustments({ ...adjustments, saturation: value })
                      }
                      min={0}
                      max={200}
                      step={1}
                      className="w-full"
                    />
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleReset}
                    className="w-full"
                  >
                    <RotateCw className="h-4 w-4 mr-2" />
                    Reset All
                  </Button>
                </div>
              </TabsContent>
            </Tabs>

            {/* Action Buttons */}
            <div className="space-y-2 pt-4 border-t">
              <Button onClick={handleSave} className="w-full" size="lg">
                <Check className="h-5 w-5 mr-2" />
                Save Changes
              </Button>
              <Button
                onClick={handleDownload}
                variant="outline"
                className="w-full"
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
              <Button
                onClick={onCancel}
                variant="ghost"
                className="w-full"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
