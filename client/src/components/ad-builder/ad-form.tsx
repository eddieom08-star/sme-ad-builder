import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Sparkles, ImageIcon } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { AdPreview } from "./ad-preview";
import { generateAdCopy } from "@/lib/openai";
import type { Campaign } from "@shared/schema";

// Define form schema
const adFormSchema = z.object({
  campaignId: z.string().min(1, "Please select a campaign"),
  title: z.string().min(1, "Headline is required").max(50, "Headline can't exceed 50 characters"),
  description: z.string().min(1, "Description is required").max(125, "Description can't exceed 125 characters"),
  imageUrl: z.string().optional(),
  ctaText: z.string().min(1, "CTA text is required"),
  format: z.enum(["square", "landscape", "story"]),
  platform: z.enum(["facebook", "instagram", "google"]),
  status: z.enum(["draft", "active", "paused"]).default("draft"),
});

type AdFormValues = z.infer<typeof adFormSchema>;

interface AdFormProps {
  campaigns: Campaign[];
  initialValues?: Partial<AdFormValues>;
  onSubmit: (values: AdFormValues) => void;
  isLoading?: boolean;
}

export function AdForm({ 
  campaigns,
  initialValues = {
    title: "",
    description: "",
    imageUrl: "",
    ctaText: "Shop Now",
    format: "square",
    platform: "facebook",
    status: "draft"
  },
  onSubmit,
  isLoading = false
}: AdFormProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [toneOfVoice, setToneOfVoice] = useState<string>("friendly");
  const [previewVisible, setPreviewVisible] = useState(false);

  // Initialize form
  const form = useForm<AdFormValues>({
    resolver: zodResolver(adFormSchema),
    defaultValues: initialValues as any,
  });

  // Generate ad copy with AI
  const handleGenerateAdCopy = async () => {
    const campaignId = form.getValues("campaignId");
    
    if (!campaignId) {
      form.setError("campaignId", { 
        type: "manual", 
        message: "Please select a campaign first" 
      });
      return;
    }

    setIsGenerating(true);
    try {
      const adCopyVariations = await generateAdCopy(
        parseInt(campaignId), 
        "Women 25-45 interested in sustainable fashion", 
        toneOfVoice
      );
      
      if (adCopyVariations && adCopyVariations.length > 0) {
        // Parse the first ad copy suggestion
        const adCopy = adCopyVariations[0];
        const headlineMatch = adCopy.match(/Headline: (.*?)\\n/);
        const bodyMatch = adCopy.match(/Body: (.*?)\\n/);
        const ctaMatch = adCopy.match(/CTA: (.*)/);
        
        if (headlineMatch) form.setValue("title", headlineMatch[1]);
        if (bodyMatch) form.setValue("description", bodyMatch[1]);
        if (ctaMatch) form.setValue("ctaText", ctaMatch[1]);
        
        // Show preview automatically when we generate copy
        setPreviewVisible(true);
      }
    } catch (error) {
      console.error("Error generating ad copy:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="flex-1 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="campaignId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Campaign</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select campaign" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {campaigns?.map((campaign) => (
                            <SelectItem key={campaign.id} value={campaign.id.toString()}>
                              {campaign.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="platform"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Platform</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select platform" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="facebook">Facebook</SelectItem>
                          <SelectItem value="instagram">Instagram</SelectItem>
                          <SelectItem value="google">Google Ads</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="format"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ad Format</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select format" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="square">Square (1:1)</SelectItem>
                        <SelectItem value="landscape">Landscape (16:9)</SelectItem>
                        <SelectItem value="story">Story (9:16)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex justify-between items-center">
                      <FormLabel>Headline</FormLabel>
                      <div className="text-xs text-slate-500">{field.value.length}/50 characters</div>
                    </div>
                    <FormControl>
                      <Input 
                        {...field} 
                        maxLength={50}
                        placeholder="Enter a catchy headline"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex justify-between items-center">
                      <FormLabel>Description</FormLabel>
                      <div className="text-xs text-slate-500">{field.value.length}/125 characters</div>
                    </div>
                    <FormControl>
                      <Textarea
                        {...field}
                        maxLength={125}
                        placeholder="Enter your ad description"
                        rows={3}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="ctaText"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Call to Action</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select CTA" />
                        </SelectTrigger>
                      </FormControl>
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
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="imageUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Image URL</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Enter image URL"
                      />
                    </FormControl>
                    <FormDescription className="text-xs">
                      For best results, use high-quality images that match your ad format.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="pt-2">
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
                  type="button"
                  variant="outline" 
                  className="w-full" 
                  onClick={handleGenerateAdCopy}
                  disabled={isGenerating || !form.getValues("campaignId")}
                >
                  {isGenerating ? "Generating..." : "Generate Ad Copy with AI"}
                </Button>
              </div>
            </div>
            
            <div className="flex-1">
              <div className="sticky top-4">
                <div className="mb-4 flex justify-between items-center">
                  <h3 className="text-lg font-medium">Ad Preview</h3>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setPreviewVisible(!previewVisible)}
                  >
                    {previewVisible ? "Hide Preview" : "Show Preview"}
                  </Button>
                </div>
                
                {previewVisible ? (
                  <AdPreview
                    title={form.watch("title") || "Your headline here"}
                    description={form.watch("description") || "Your ad description will appear here. Make it compelling!"}
                    imageUrl={form.watch("imageUrl")}
                    ctaText={form.watch("ctaText") || "Shop Now"}
                    format={form.watch("format") as "square" | "landscape" | "story"}
                    platform={form.watch("platform") as "facebook" | "instagram" | "google"}
                  />
                ) : (
                  <div className="border rounded-md bg-slate-50 p-8 flex flex-col items-center justify-center text-center">
                    <ImageIcon className="h-12 w-12 text-slate-300 mb-3" />
                    <h4 className="text-lg font-medium text-slate-700 mb-1">Preview Unavailable</h4>
                    <p className="text-sm text-slate-500 mb-4">Fill in ad details to see a live preview of how your ad will look.</p>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setPreviewVisible(true)}
                    >
                      Show Preview
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline">
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Ad"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}