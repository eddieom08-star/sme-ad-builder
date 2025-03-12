import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Sparkles, Plus, ImageIcon, Layout, Edit, Trash, Copy, Eye, SquarePen } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { generateAdCopy } from "@/lib/openai";
import type { Campaign } from "@shared/schema";

// Types for ad creatives
interface AdCreative {
  id: number;
  campaignId: number;
  title: string;
  description: string;
  imageUrl?: string;
  ctaText: string;
  format: "square" | "landscape" | "story";
  platform: "facebook" | "instagram" | "google";
  status: "draft" | "active" | "paused";
}

// Mock data for ad creatives (would come from API in a real app)
const mockAdCreatives: AdCreative[] = [
  {
    id: 1,
    campaignId: 1,
    title: "Summer Collection Launch",
    description: "Discover our handcrafted coastal-inspired jewelry. Limited time offer - free shipping on all orders!",
    imageUrl: "https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    ctaText: "Shop Now",
    format: "square",
    platform: "instagram",
    status: "active"
  },
  {
    id: 2,
    campaignId: 1,
    title: "Sustainable Beauty",
    description: "Ethically sourced materials that sparkle like the ocean. Each piece tells a story of coastal beauty.",
    imageUrl: "https://images.unsplash.com/photo-1535632066274-1f274eece83b?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    ctaText: "Explore Collection",
    format: "landscape",
    platform: "facebook",
    status: "draft"
  },
  {
    id: 3,
    campaignId: 2,
    title: "Holiday Special",
    description: "The perfect gift for someone special. Use code HOLIDAY for 15% off your purchase.",
    imageUrl: "https://images.unsplash.com/photo-1603561589131-f14c7140b03b?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    ctaText: "Get Discount",
    format: "story",
    platform: "instagram",
    status: "paused"
  }
];

export default function AdBuilder() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedCampaign, setSelectedCampaign] = useState<string>("all");
  const [selectedFormat, setSelectedFormat] = useState<string>("square");
  const [selectedPlatform, setSelectedPlatform] = useState<string>("facebook");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [adCreatives, setAdCreatives] = useState<AdCreative[]>(mockAdCreatives);
  const [newAd, setNewAd] = useState<Partial<AdCreative>>({
    title: "",
    description: "",
    imageUrl: "",
    ctaText: "Shop Now",
    format: "square" as "square" | "landscape" | "story",
    platform: "facebook" as "facebook" | "instagram" | "google",
    status: "draft" as "draft" | "active" | "paused"
  });
  const [currentAdId, setCurrentAdId] = useState<number | null>(null);
  const [toneOfVoice, setToneOfVoice] = useState<string>("friendly");

  // Get campaigns
  const { data: campaigns = [], isLoading: campaignsLoading } = useQuery<Campaign[]>({
    queryKey: ["/api/campaigns"]
  });

  const filteredAdCreatives = adCreatives.filter(ad => 
    selectedCampaign && selectedCampaign !== "all" ? ad.campaignId === parseInt(selectedCampaign) : true
  );

  const handleSaveAd = () => {
    if (!selectedCampaign || selectedCampaign === "all") {
      toast({
        title: "No campaign selected",
        description: "Please select a specific campaign for this ad.",
        variant: "destructive"
      });
      return;
    }

    if (!newAd.title || !newAd.description || !newAd.ctaText) {
      toast({
        title: "Incomplete ad",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    // In a real app, this would be an API call
    if (currentAdId) {
      // Update existing ad
      const updatedCreatives = adCreatives.map(ad => 
        ad.id === currentAdId 
          ? { 
              ...ad, 
              ...newAd, 
              campaignId: parseInt(selectedCampaign),
              format: newAd.format as "square" | "landscape" | "story",
              platform: newAd.platform as "facebook" | "instagram" | "google"
            } 
          : ad
      );
      setAdCreatives(updatedCreatives);
      toast({
        title: "Ad updated",
        description: "Your ad has been updated successfully."
      });
    } else {
      // Create new ad
      const newAdCreative: AdCreative = {
        id: Date.now(), // mock ID generation
        campaignId: parseInt(selectedCampaign),
        title: newAd.title || "",
        description: newAd.description || "",
        imageUrl: newAd.imageUrl,
        ctaText: newAd.ctaText || "Shop Now",
        format: (newAd.format as "square" | "landscape" | "story") || "square",
        platform: (newAd.platform as "facebook" | "instagram" | "google") || "facebook",
        status: "draft"
      };
      
      setAdCreatives([...adCreatives, newAdCreative]);
      toast({
        title: "Ad created",
        description: "Your new ad has been created successfully."
      });
    }

    // Reset form and close dialog
    setNewAd({
      title: "",
      description: "",
      imageUrl: "",
      ctaText: "Shop Now",
      format: "square" as "square" | "landscape" | "story",
      platform: "facebook" as "facebook" | "instagram" | "google",
      status: "draft" as "draft" | "active" | "paused"
    });
    setCurrentAdId(null);
    setIsDialogOpen(false);
  };

  const handleEditAd = (ad: AdCreative) => {
    setCurrentAdId(ad.id);
    setNewAd({
      title: ad.title,
      description: ad.description,
      imageUrl: ad.imageUrl,
      ctaText: ad.ctaText,
      format: ad.format,
      platform: ad.platform,
      status: ad.status
    });
    setSelectedCampaign(ad.campaignId.toString());
    setIsDialogOpen(true);
  };

  const handleDeleteAd = (id: number) => {
    setAdCreatives(adCreatives.filter(ad => ad.id !== id));
    toast({
      title: "Ad deleted",
      description: "The ad has been deleted successfully."
    });
  };

  const handleDuplicateAd = (ad: AdCreative) => {
    const duplicatedAd: AdCreative = {
      ...ad,
      id: Date.now(), // mock ID generation
      title: `${ad.title} (Copy)`,
      status: "draft"
    };
    
    setAdCreatives([...adCreatives, duplicatedAd]);
    toast({
      title: "Ad duplicated",
      description: "The ad has been duplicated successfully."
    });
  };

  const handleStatusChange = (id: number, status: "draft" | "active" | "paused") => {
    const updatedCreatives = adCreatives.map(ad => 
      ad.id === id ? { ...ad, status } : ad
    );
    setAdCreatives(updatedCreatives);
    
    toast({
      title: "Status updated",
      description: `Ad status changed to ${status}.`
    });
  };

  const handleGenerateAdCopy = async () => {
    if (!selectedCampaign || selectedCampaign === "all") {
      toast({
        title: "No campaign selected",
        description: "Please select a specific campaign to generate ad copy.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    try {
      const campaignId = parseInt(selectedCampaign);
      const adCopyVariations = await generateAdCopy(
        campaignId, 
        "Women 25-45 interested in sustainable fashion", 
        toneOfVoice
      );
      
      if (adCopyVariations && adCopyVariations.length > 0) {
        // Parse the first ad copy suggestion
        const adCopy = adCopyVariations[0];
        const headlineMatch = adCopy.match(/Headline: (.*?)\\n/);
        const bodyMatch = adCopy.match(/Body: (.*?)\\n/);
        const ctaMatch = adCopy.match(/CTA: (.*)/);
        
        setNewAd({
          ...newAd,
          title: headlineMatch ? headlineMatch[1] : newAd.title,
          description: bodyMatch ? bodyMatch[1] : newAd.description,
          ctaText: ctaMatch ? ctaMatch[1] : newAd.ctaText
        });
        
        toast({
          title: "Ad copy generated",
          description: "AI-generated ad copy has been applied to the form."
        });
      }
    } catch (error) {
      toast({
        title: "Generation failed",
        description: "Failed to generate ad copy. Please try again.",
        variant: "destructive"
      });
      console.error("Error generating ad copy:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-600 border-green-200";
      case "paused":
        return "bg-amber-100 text-amber-600 border-amber-200";
      case "draft":
        return "bg-slate-100 text-slate-600 border-slate-200";
      default:
        return "bg-slate-100 text-slate-600 border-slate-200";
    }
  };

  const getFormatIcon = (format: string) => {
    switch (format) {
      case "square":
        return <div className="w-4 h-4 border border-slate-300"></div>;
      case "landscape":
        return <div className="w-6 h-3 border border-slate-300"></div>;
      case "story":
        return <div className="w-3 h-5 border border-slate-300"></div>;
      default:
        return <div className="w-4 h-4 border border-slate-300"></div>;
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header title="Ad Builder" />
      <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 bg-slate-100">
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex flex-col">
            <h1 className="text-2xl font-semibold text-slate-800">Ad Creatives</h1>
            <p className="text-sm text-slate-500">Create and manage ad creatives for your campaigns</p>
          </div>
          
          <div className="flex items-center gap-2">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  New Ad
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>{currentAdId ? "Edit Ad Creative" : "Create New Ad Creative"}</DialogTitle>
                  <DialogDescription>
                    Fill in the details below to {currentAdId ? "update your" : "create a new"} ad creative.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="campaign">Campaign</Label>
                      <Select 
                        value={selectedCampaign} 
                        onValueChange={setSelectedCampaign}
                      >
                        <SelectTrigger id="campaign">
                          <SelectValue placeholder="Select campaign" />
                        </SelectTrigger>
                        <SelectContent>
                          {campaignsLoading ? (
                            <SelectItem value="loading" disabled>Loading campaigns...</SelectItem>
                          ) : campaigns?.length > 0 ? (
                            campaigns.map((campaign: Campaign) => (
                              <SelectItem key={campaign.id} value={campaign.id.toString()}>
                                {campaign.name}
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value="none" disabled>No campaigns found</SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="platform">Platform</Label>
                      <Select 
                        value={newAd.platform as string} 
                        onValueChange={(value: string) => setNewAd({...newAd, platform: value as "facebook" | "instagram" | "google"})}
                      >
                        <SelectTrigger id="platform">
                          <SelectValue placeholder="Select platform" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="facebook">Facebook</SelectItem>
                          <SelectItem value="instagram">Instagram</SelectItem>
                          <SelectItem value="google">Google Ads</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="format">Ad Format</Label>
                    <Select 
                      value={newAd.format as string} 
                      onValueChange={(value: string) => setNewAd({...newAd, format: value as "square" | "landscape" | "story"})}
                    >
                      <SelectTrigger id="format">
                        <SelectValue placeholder="Select format" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="square">Square (1:1)</SelectItem>
                        <SelectItem value="landscape">Landscape (16:9)</SelectItem>
                        <SelectItem value="story">Story (9:16)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label htmlFor="ad-title">Headline</Label>
                      <div className="text-xs text-slate-500">50 characters max</div>
                    </div>
                    <Input
                      id="ad-title"
                      value={newAd.title || ""}
                      onChange={(e) => setNewAd({...newAd, title: e.target.value})}
                      maxLength={50}
                      placeholder="Enter a catchy headline"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label htmlFor="ad-description">Description</Label>
                      <div className="text-xs text-slate-500">125 characters max</div>
                    </div>
                    <Textarea
                      id="ad-description"
                      value={newAd.description || ""}
                      onChange={(e) => setNewAd({...newAd, description: e.target.value})}
                      maxLength={125}
                      placeholder="Enter your ad description"
                      rows={3}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="ad-cta">Call to Action</Label>
                    <Select 
                      value={newAd.ctaText} 
                      onValueChange={(value) => setNewAd({...newAd, ctaText: value})}
                    >
                      <SelectTrigger id="ad-cta">
                        <SelectValue placeholder="Select CTA" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Shop Now">Shop Now</SelectItem>
                        <SelectItem value="Learn More">Learn More</SelectItem>
                        <SelectItem value="Sign Up">Sign Up</SelectItem>
                        <SelectItem value="Get Offer">Get Offer</SelectItem>
                        <SelectItem value="Contact Us">Contact Us</SelectItem>
                        <SelectItem value="Book Now">Book Now</SelectItem>
                        <SelectItem value="Download">Download</SelectItem>
                        <SelectItem value="Explore Collection">Explore Collection</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="ad-image">Image URL</Label>
                    <Input
                      id="ad-image"
                      value={newAd.imageUrl || ""}
                      onChange={(e) => setNewAd({...newAd, imageUrl: e.target.value})}
                      placeholder="Enter image URL"
                    />
                    <p className="text-xs text-slate-500">For best results, use high-quality images that match your ad format.</p>
                  </div>
                  
                  <div className="mt-6 flex flex-col">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <Sparkles className="h-4 w-4 text-primary mr-2" />
                        <span className="font-medium">AI Ad Copy Generator</span>
                      </div>
                      <Select 
                        value={toneOfVoice} 
                        onValueChange={setToneOfVoice}
                      >
                        <SelectTrigger className="w-[150px]">
                          <SelectValue placeholder="Select tone" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="friendly">Friendly</SelectItem>
                          <SelectItem value="professional">Professional</SelectItem>
                          <SelectItem value="casual">Casual</SelectItem>
                          <SelectItem value="luxury">Luxury</SelectItem>
                          <SelectItem value="urgent">Urgent</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button 
                      variant="outline" 
                      className="w-full" 
                      onClick={handleGenerateAdCopy}
                      disabled={isGenerating || !selectedCampaign}
                    >
                      {isGenerating ? "Generating..." : "Generate Ad Copy with AI"}
                    </Button>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                  <Button onClick={handleSaveAd}>
                    {currentAdId ? "Update Ad" : "Create Ad"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle>Filter Ads</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="filter-campaign" className="mb-2 block">Campaign</Label>
              <Select 
                value={selectedCampaign} 
                onValueChange={setSelectedCampaign}
              >
                <SelectTrigger id="filter-campaign">
                  <SelectValue placeholder="All campaigns" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All campaigns</SelectItem>
                  {campaignsLoading ? (
                    <SelectItem value="loading" disabled>Loading campaigns...</SelectItem>
                  ) : campaigns?.length > 0 ? (
                    campaigns.map((campaign: Campaign) => (
                      <SelectItem key={campaign.id} value={campaign.id.toString()}>
                        {campaign.name}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="none" disabled>No campaigns found</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex-1">
              <Label htmlFor="filter-format" className="mb-2 block">Format</Label>
              <Select 
                value={selectedFormat} 
                onValueChange={setSelectedFormat}
              >
                <SelectTrigger id="filter-format">
                  <SelectValue placeholder="All formats" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="square">Square (1:1)</SelectItem>
                  <SelectItem value="landscape">Landscape (16:9)</SelectItem>
                  <SelectItem value="story">Story (9:16)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex-1">
              <Label htmlFor="filter-platform" className="mb-2 block">Platform</Label>
              <Select 
                value={selectedPlatform} 
                onValueChange={setSelectedPlatform}
              >
                <SelectTrigger id="filter-platform">
                  <SelectValue placeholder="All platforms" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="facebook">Facebook</SelectItem>
                  <SelectItem value="instagram">Instagram</SelectItem>
                  <SelectItem value="google">Google Ads</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAdCreatives.length > 0 ? (
            filteredAdCreatives.map((ad) => (
              <Card key={ad.id} className="overflow-hidden">
                <div className="relative h-48 bg-slate-100 overflow-hidden">
                  {ad.imageUrl ? (
                    <img 
                      src={ad.imageUrl} 
                      alt={ad.title} 
                      className="w-full h-full object-cover" 
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full bg-slate-200">
                      <ImageIcon className="h-12 w-12 text-slate-400" />
                    </div>
                  )}
                  <div className="absolute top-2 right-2 flex space-x-1">
                    <div className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusBadgeColor(ad.status)}`}>
                      {ad.status.charAt(0).toUpperCase() + ad.status.slice(1)}
                    </div>
                  </div>
                </div>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <div className="text-xs px-2 py-1 bg-primary-100 text-primary rounded-full">
                        {ad.platform.charAt(0).toUpperCase() + ad.platform.slice(1)}
                      </div>
                      <div className="flex items-center text-xs text-slate-500">
                        {getFormatIcon(ad.format)}
                        <span className="ml-1">{ad.format}</span>
                      </div>
                    </div>
                  </div>
                  <h3 className="font-medium text-lg mb-1 line-clamp-1">{ad.title}</h3>
                  <p className="text-sm text-slate-600 mb-3 line-clamp-3">{ad.description}</p>
                  <div className="flex justify-between items-center">
                    <Button size="sm" variant="secondary" className="text-xs px-3">
                      {ad.ctaText}
                    </Button>
                    <div className="flex space-x-1">
                      <Button size="icon" variant="ghost" onClick={() => handleEditAd(ad)}>
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => handleDuplicateAd(ad)}>
                        <Copy className="h-4 w-4" />
                        <span className="sr-only">Duplicate</span>
                      </Button>
                      <Button size="icon" variant="ghost" className="text-red-500" onClick={() => handleDeleteAd(ad.id)}>
                        <Trash className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="p-4 pt-0 flex justify-between border-t border-slate-100 mt-4">
                  <div className="text-xs text-slate-500">Campaign: {campaigns.find((c: Campaign) => c.id === ad.campaignId)?.name || 'Unknown'}</div>
                  <Select 
                    value={ad.status} 
                    onValueChange={(value: "draft" | "active" | "paused") => handleStatusChange(ad.id, value)}
                  >
                    <SelectTrigger className="h-8 min-w-[110px]">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="paused">Paused</SelectItem>
                    </SelectContent>
                  </Select>
                </CardFooter>
              </Card>
            ))
          ) : (
            <div className="col-span-full">
              <Card className="bg-slate-50 border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <SquarePen className="h-12 w-12 text-slate-300 mb-4" />
                  <h3 className="text-xl font-medium text-slate-800 mb-2">No ad creatives found</h3>
                  <p className="text-slate-500 text-center mb-6 max-w-md">
                    Get started by creating your first ad creative for your campaigns.
                  </p>
                  <Button onClick={() => setIsDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Ad Creative
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
        
        <Alert className="mt-8 bg-primary-50 border-primary-100">
          <Sparkles className="h-4 w-4 text-primary" />
          <AlertTitle className="text-sm font-medium text-primary-700">Pro Tip</AlertTitle>
          <AlertDescription className="text-xs text-slate-700">
            Use the AI Ad Copy Generator to create compelling ad text based on your campaign objectives and target audience. Different tones work best for different platforms and audiences.
          </AlertDescription>
        </Alert>
      </main>
    </div>
  );
}