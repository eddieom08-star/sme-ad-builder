"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, Loader2, Check } from "lucide-react";
import {
  EXPORT_FORMATS,
  exportMultipleFormats,
  downloadAllFormats,
  getAvailablePlatforms,
  type ExportFormat,
  type ExportResult,
} from "@/lib/utils/image-export";
import { cn } from "@/lib/utils";

interface MultiExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  baseAspectRatio: string;
}

export function MultiExportModal({
  isOpen,
  onClose,
  imageUrl,
  baseAspectRatio,
}: MultiExportModalProps) {
  const [selectedFormats, setSelectedFormats] = useState<Set<string>>(new Set());
  const [isExporting, setIsExporting] = useState(false);
  const [exportResults, setExportResults] = useState<ExportResult[]>([]);
  const [activeTab, setActiveTab] = useState<"select" | "preview">("select");

  const availableFormats = EXPORT_FORMATS[baseAspectRatio] || [];
  const platforms = getAvailablePlatforms();

  // Auto-select all formats on mount
  useEffect(() => {
    if (isOpen && availableFormats.length > 0) {
      setSelectedFormats(new Set(availableFormats.map((f) => f.name)));
    }
  }, [isOpen, baseAspectRatio]);

  const toggleFormat = (formatName: string) => {
    const newSelected = new Set(selectedFormats);
    if (newSelected.has(formatName)) {
      newSelected.delete(formatName);
    } else {
      newSelected.add(formatName);
    }
    setSelectedFormats(newSelected);
  };

  const togglePlatform = (platform: string) => {
    const platformFormats = availableFormats.filter((f) => f.platform === platform);
    const allSelected = platformFormats.every((f) => selectedFormats.has(f.name));

    const newSelected = new Set(selectedFormats);
    if (allSelected) {
      // Deselect all from this platform
      platformFormats.forEach((f) => newSelected.delete(f.name));
    } else {
      // Select all from this platform
      platformFormats.forEach((f) => newSelected.add(f.name));
    }
    setSelectedFormats(newSelected);
  };

  const selectAll = () => {
    setSelectedFormats(new Set(availableFormats.map((f) => f.name)));
  };

  const deselectAll = () => {
    setSelectedFormats(new Set());
  };

  const handleExport = async () => {
    const formatsToExport = availableFormats.filter((f) =>
      selectedFormats.has(f.name)
    );

    if (formatsToExport.length === 0) return;

    try {
      setIsExporting(true);
      const results = await exportMultipleFormats(
        imageUrl,
        baseAspectRatio,
        formatsToExport
      );
      setExportResults(results);
      setActiveTab("preview");
    } catch (error) {
      console.error("Export failed:", error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleDownloadAll = async () => {
    if (exportResults.length === 0) return;
    await downloadAllFormats(exportResults, "ad-image");
  };

  const handleClose = () => {
    setActiveTab("select");
    setExportResults([]);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Export for Multiple Platforms</DialogTitle>
          <DialogDescription>
            Select the platforms you want to export for. Each format will be optimized
            for the specific platform requirements.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="select">Select Formats</TabsTrigger>
            <TabsTrigger value="preview" disabled={exportResults.length === 0}>
              Preview ({exportResults.length})
            </TabsTrigger>
          </TabsList>

          {/* Format Selection Tab */}
          <TabsContent value="select" className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={selectAll}>
                  Select All
                </Button>
                <Button variant="outline" size="sm" onClick={deselectAll}>
                  Deselect All
                </Button>
              </div>
              <Badge variant="secondary">
                {selectedFormats.size} format{selectedFormats.size !== 1 ? "s" : ""}{" "}
                selected
              </Badge>
            </div>

            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-4">
                {platforms
                  .filter((platform) =>
                    availableFormats.some((f) => f.platform === platform)
                  )
                  .map((platform) => {
                    const platformFormats = availableFormats.filter(
                      (f) => f.platform === platform
                    );
                    const allChecked = platformFormats.every((f) =>
                      selectedFormats.has(f.name)
                    );
                    const someChecked = platformFormats.some((f) =>
                      selectedFormats.has(f.name)
                    );

                    return (
                      <div key={platform} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              checked={allChecked}
                              onCheckedChange={() => togglePlatform(platform)}
                              className={cn(
                                someChecked && !allChecked && "data-[state=checked]:bg-muted"
                              )}
                            />
                            <Label className="text-base font-semibold">
                              {platform}
                            </Label>
                          </div>
                          <Badge variant="outline">
                            {platformFormats.length} format
                            {platformFormats.length !== 1 ? "s" : ""}
                          </Badge>
                        </div>

                        <div className="grid gap-2 ml-6">
                          {platformFormats.map((format) => (
                            <div
                              key={format.name}
                              className="flex items-center justify-between p-2 rounded hover:bg-muted/50"
                            >
                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  checked={selectedFormats.has(format.name)}
                                  onCheckedChange={() => toggleFormat(format.name)}
                                />
                                <Label className="cursor-pointer">
                                  {format.name}
                                </Label>
                              </div>
                              <div className="flex gap-2">
                                <Badge variant="secondary" className="text-xs">
                                  {format.width}×{format.height}
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  {format.aspectRatio}
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </ScrollArea>
          </TabsContent>

          {/* Preview Tab */}
          <TabsContent value="preview" className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Preview your exported images
              </p>
              <Button onClick={handleDownloadAll} size="sm">
                <Download className="h-4 w-4 mr-2" />
                Download All
              </Button>
            </div>

            <ScrollArea className="h-[400px] pr-4">
              <div className="grid grid-cols-2 gap-4">
                {exportResults.map((result, index) => (
                  <div
                    key={index}
                    className="border rounded-lg overflow-hidden"
                  >
                    <div className="aspect-video bg-muted relative">
                      <img
                        src={result.dataUrl}
                        alt={result.format.name}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">
                          {result.format.name}
                        </p>
                        <Check className="h-4 w-4 text-green-500" />
                      </div>
                      <div className="flex gap-2">
                        <Badge variant="secondary" className="text-xs">
                          {result.format.width}×{result.format.height}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {result.format.platform}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          {activeTab === "select" ? (
            <>
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                onClick={handleExport}
                disabled={selectedFormats.size === 0 || isExporting}
              >
                {isExporting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Exporting...
                  </>
                ) : (
                  <>
                    Generate {selectedFormats.size} Format
                    {selectedFormats.size !== 1 ? "s" : ""}
                  </>
                )}
              </Button>
            </>
          ) : (
            <Button onClick={handleClose}>Done</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
