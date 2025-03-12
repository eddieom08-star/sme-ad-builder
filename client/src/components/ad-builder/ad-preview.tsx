import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ImageIcon, Facebook, Instagram, Bell, Users } from "lucide-react";

interface AdPreviewProps {
  title: string;
  description: string;
  imageUrl?: string;
  ctaText: string;
  format: "square" | "landscape" | "story";
  platform: "facebook" | "instagram" | "google";
}

export function AdPreview({
  title,
  description,
  imageUrl,
  ctaText,
  format,
  platform
}: AdPreviewProps) {
  const [selectedView, setSelectedView] = useState<string>("preview");

  // Format dimensions based on ad format
  const getFormatClasses = () => {
    switch (format) {
      case "square":
        return "aspect-square";
      case "landscape":
        return "aspect-video";
      case "story":
        return "aspect-[9/16] max-w-[320px]";
      default:
        return "aspect-square";
    }
  };

  // Platform-specific UI elements
  const renderPlatformHeader = () => {
    switch (platform) {
      case "facebook":
        return (
          <div className="flex items-center mb-2">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center mr-2">
              <Facebook className="h-4 w-4 text-white" />
            </div>
            <div>
              <div className="text-sm font-medium">Your Business Page</div>
              <div className="text-xs text-slate-500">Sponsored · <span className="ml-1">👥</span></div>
            </div>
          </div>
        );
      case "instagram":
        return (
          <div className="flex items-center mb-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-600 to-orange-500 flex items-center justify-center mr-2">
              <Instagram className="h-4 w-4 text-white" />
            </div>
            <div>
              <div className="text-sm font-medium">yourbusiness</div>
              <div className="text-xs text-slate-500">Sponsored</div>
            </div>
          </div>
        );
      case "google":
        return (
          <div className="flex flex-col mb-2">
            <div className="text-xs text-green-600 mb-1">Ad · www.yourbusiness.com</div>
            <div className="text-sm font-medium">{title}</div>
          </div>
        );
      default:
        return null;
    }
  };

  const renderPlatformFooter = () => {
    switch (platform) {
      case "facebook":
      case "instagram":
        return (
          <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
            <div className="flex space-x-4">
              <div>❤️ 42</div>
              <div>💬 7</div>
            </div>
            <div>↗️ Share</div>
          </div>
        );
      case "google":
        return null;
      default:
        return null;
    }
  };

  return (
    <div className="rounded-md border bg-white">
      <Tabs value={selectedView} onValueChange={setSelectedView}>
        <div className="p-3 border-b">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="preview">Preview</TabsTrigger>
            <TabsTrigger value="specs">Specifications</TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="preview" className="focus-visible:outline-none focus-visible:ring-0">
          <div className="p-4">
            <div className={`mx-auto border border-slate-200 rounded-md overflow-hidden ${getFormatClasses()}`}>
              <div className="h-full flex flex-col bg-white">
                {/* Ad Platform UI Header */}
                <div className="p-3">
                  {renderPlatformHeader()}
                </div>
                
                {/* Ad Image */}
                <div className="flex-1 bg-slate-100 relative min-h-[120px]">
                  {imageUrl ? (
                    <img 
                      src={imageUrl} 
                      alt={title} 
                      className="w-full h-full object-cover" 
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <ImageIcon className="h-12 w-12 text-slate-300" />
                    </div>
                  )}
                </div>
                
                {/* Ad Content */}
                <div className="p-3">
                  {platform !== "google" && (
                    <div className="mb-3">
                      <h4 className="font-medium">{title}</h4>
                      <p className="text-sm text-slate-600 line-clamp-2">{description}</p>
                    </div>
                  )}
                  
                  {platform === "google" ? (
                    <div>
                      <p className="text-sm text-slate-600 mb-2">{description}</p>
                      <div className="text-sm font-medium text-blue-600">{ctaText}</div>
                    </div>
                  ) : (
                    <Button size="sm" className="w-full text-xs">
                      {ctaText}
                    </Button>
                  )}
                  
                  {renderPlatformFooter()}
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="specs" className="p-4 focus-visible:outline-none focus-visible:ring-0">
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium mb-1">Format Requirements</h4>
              <div className="text-xs text-slate-600 space-y-1">
                <p><span className="font-medium">Resolution:</span> {format === 'square' ? '1080x1080px' : format === 'landscape' ? '1200x628px' : '1080x1920px'}</p>
                <p><span className="font-medium">File type:</span> JPG or PNG</p>
                <p><span className="font-medium">File size:</span> Max 30MB</p>
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium mb-1">Text Requirements</h4>
              <div className="text-xs text-slate-600 space-y-1">
                <p><span className="font-medium">Headline:</span> 40 characters (25 recommended)</p>
                <p><span className="font-medium">Description:</span> 125 characters (90 recommended)</p>
                <p><span className="font-medium">Text ratio:</span> No more than 20% of the image</p>
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium mb-1">Platform Guidelines</h4>
              <div className="text-xs text-slate-600 space-y-1">
                <p>• Avoid excessive text in images</p>
                <p>• Be clear about product/offer</p>
                <p>• No misleading content or claims</p>
                <p>• Respect intellectual property</p>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}