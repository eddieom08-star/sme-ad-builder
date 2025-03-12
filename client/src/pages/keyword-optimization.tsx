import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Lightbulb, 
  Search, 
  ArrowUp, 
  ArrowDown, 
  ArrowRight, 
  Plus, 
  Trash,
  Sparkles, 
  Filter,
  MoveUp
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { suggestKeywords } from "@/lib/openai";
import type { Keyword, Campaign } from "@shared/schema";
import type { KeywordSuggestion } from "@/lib/openai";

export default function KeywordOptimization() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedCampaign, setSelectedCampaign] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [businessDescription, setBusinessDescription] = useState("");
  const [industry, setIndustry] = useState<string>("");
  const [suggestions, setSuggestions] = useState<KeywordSuggestion[]>([]);

  // Get campaigns
  const { data: campaigns, isLoading: campaignsLoading } = useQuery({
    queryKey: ["/api/campaigns"]
  });

  // Get keywords for selected campaign
  const { data: keywords, isLoading: keywordsLoading } = useQuery({
    queryKey: ["/api/campaigns", selectedCampaign, "keywords"],
    enabled: !!selectedCampaign
  });

  const addKeywordMutation = useMutation({
    mutationFn: async (keyword: { campaignId: number; text: string; ctr: string; status: string }) => {
      const res = await apiRequest("POST", "/api/keywords", keyword);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/campaigns", selectedCampaign, "keywords"] });
      toast({
        title: "Keyword added",
        description: "The keyword has been added to your campaign."
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to add keyword: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  const handleGenerateKeywords = async () => {
    if (!businessDescription || !industry) {
      toast({
        title: "Missing information",
        description: "Please provide a business description and select an industry.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    try {
      const keywordSuggestions = await suggestKeywords(businessDescription, industry);
      setSuggestions(keywordSuggestions);
      toast({
        title: "Keywords generated",
        description: "AI has generated keyword suggestions based on your business."
      });
    } catch (error) {
      toast({
        title: "Generation failed",
        description: "Failed to generate keyword suggestions. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const addSuggestedKeyword = (suggestion: KeywordSuggestion) => {
    if (!selectedCampaign) {
      toast({
        title: "No campaign selected",
        description: "Please select a campaign to add this keyword to.",
        variant: "destructive"
      });
      return;
    }

    addKeywordMutation.mutate({
      campaignId: parseInt(selectedCampaign),
      text: suggestion.keyword,
      ctr: "0.0%",
      status: "new"
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "growing":
        return <ArrowUp className="mr-1 h-3 w-3" />;
      case "declining":
        return <ArrowDown className="mr-1 h-3 w-3" />;
      case "stable":
        return <ArrowRight className="mr-1 h-3 w-3" />;
      case "new":
        return <Plus className="mr-1 h-3 w-3" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "growing":
        return "bg-green-100 text-green-600";
      case "declining":
        return "bg-red-100 text-red-600";
      case "stable":
        return "bg-amber-100 text-amber-600";
      case "new":
        return "bg-blue-100 text-blue-600";
      default:
        return "bg-slate-100 text-slate-600";
    }
  };

  const getVolumeColor = (volume: string) => {
    switch (volume) {
      case "high":
        return "bg-green-100 text-green-600";
      case "medium":
        return "bg-blue-100 text-blue-600";
      case "low":
        return "bg-amber-100 text-amber-600";
      default:
        return "bg-slate-100 text-slate-600";
    }
  };

  const getCompetitionColor = (competition: string) => {
    switch (competition) {
      case "high":
        return "bg-red-100 text-red-600";
      case "medium":
        return "bg-amber-100 text-amber-600";
      case "low":
        return "bg-green-100 text-green-600";
      default:
        return "bg-slate-100 text-slate-600";
    }
  };

  const industryOptions = [
    { value: "retail", label: "Retail" },
    { value: "technology", label: "Technology" },
    { value: "health", label: "Health & Wellness" },
    { value: "food", label: "Food & Beverage" },
    { value: "fashion", label: "Fashion" },
    { value: "beauty", label: "Beauty" },
    { value: "home", label: "Home & Decor" },
    { value: "finance", label: "Finance" },
    { value: "travel", label: "Travel" },
    { value: "education", label: "Education" },
    { value: "arts", label: "Arts & Entertainment" }
  ];

  const filteredKeywords = keywords?.filter((keyword: Keyword) => 
    keyword.text.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col min-h-screen">
      <Header title="Keyword Optimization" />
      <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 bg-slate-100">
        <div className="mb-6">
          <Tabs defaultValue="current">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="current">Current Keywords</TabsTrigger>
              <TabsTrigger value="generate">Generate Keywords</TabsTrigger>
            </TabsList>
            
            <TabsContent value="current" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Keywords Performance</CardTitle>
                  <CardDescription>
                    Track and optimize your campaign keywords.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col sm:flex-row gap-4 mb-4">
                    <div className="flex-1">
                      <Label htmlFor="campaign-select">Campaign</Label>
                      <Select 
                        value={selectedCampaign} 
                        onValueChange={setSelectedCampaign}
                      >
                        <SelectTrigger id="campaign-select">
                          <SelectValue placeholder="Select a campaign" />
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
                    <div className="flex-1">
                      <Label htmlFor="keyword-search">Search Keywords</Label>
                      <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
                        <Input
                          id="keyword-search"
                          placeholder="Search keywords..."
                          className="pl-8"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  {!selectedCampaign ? (
                    <div className="text-center py-10 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                      <Filter className="h-10 w-10 text-slate-400 mx-auto mb-3" />
                      <h3 className="text-lg font-medium text-slate-900">No campaign selected</h3>
                      <p className="mt-1 text-sm text-slate-500">Select a campaign to view its keywords.</p>
                    </div>
                  ) : keywordsLoading ? (
                    <div className="space-y-3">
                      <Skeleton className="h-10 w-full" />
                      <Skeleton className="h-10 w-full" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                  ) : (
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Keyword</TableHead>
                            <TableHead className="text-center">Clicks</TableHead>
                            <TableHead className="text-center">CTR</TableHead>
                            <TableHead className="text-center">Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredKeywords?.length > 0 ? (
                            filteredKeywords.map((keyword: Keyword) => (
                              <TableRow key={keyword.id}>
                                <TableCell className="font-medium">{keyword.text}</TableCell>
                                <TableCell className="text-center">{keyword.clicks}</TableCell>
                                <TableCell className="text-center">{keyword.ctr}</TableCell>
                                <TableCell className="text-center">
                                  <Badge variant="outline" className={`inline-flex items-center ${getStatusColor(keyword.status)}`}>
                                    {getStatusIcon(keyword.status)}
                                    {keyword.status.charAt(0).toUpperCase() + keyword.status.slice(1)}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                  <Button variant="ghost" size="icon" className="text-red-500">
                                    <Trash className="h-4 w-4" />
                                    <span className="sr-only">Delete</span>
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell colSpan={5} className="text-center py-6 text-sm text-slate-500">
                                {searchTerm 
                                  ? "No keywords match your search. Try a different term." 
                                  : "No keywords found for this campaign. Generate some keywords to get started."}
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  <Alert className="bg-primary-50 border-primary-100">
                    <Lightbulb className="h-4 w-4 text-primary" />
                    <AlertTitle className="text-sm font-medium text-primary-700">Optimization Tip</AlertTitle>
                    <AlertDescription className="text-xs text-slate-700">
                      Keywords with higher CTR perform better. Consider removing keywords with consistently low engagement.
                    </AlertDescription>
                  </Alert>
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="generate" className="mt-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="md:col-span-1">
                  <CardHeader>
                    <CardTitle>AI Keyword Generator</CardTitle>
                    <CardDescription>
                      Let our AI suggest keywords based on your business.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="business-description">Business Description</Label>
                      <Textarea
                        id="business-description"
                        placeholder="Describe your business, products, and target customers..."
                        className="h-32"
                        value={businessDescription}
                        onChange={(e) => setBusinessDescription(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="industry-select">Industry</Label>
                      <Select value={industry} onValueChange={setIndustry}>
                        <SelectTrigger id="industry-select">
                          <SelectValue placeholder="Select an industry" />
                        </SelectTrigger>
                        <SelectContent>
                          {industryOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="campaign-select-generate">Target Campaign</Label>
                      <Select 
                        value={selectedCampaign} 
                        onValueChange={setSelectedCampaign}
                      >
                        <SelectTrigger id="campaign-select-generate">
                          <SelectValue placeholder="Select a campaign" />
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
                    <Button 
                      className="w-full" 
                      onClick={handleGenerateKeywords}
                      disabled={isGenerating || !businessDescription || !industry}
                    >
                      <Sparkles className="mr-2 h-4 w-4" />
                      {isGenerating ? "Generating..." : "Generate Keywords"}
                    </Button>
                  </CardContent>
                </Card>
                
                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle>Suggested Keywords</CardTitle>
                    <CardDescription>
                      Review and add AI-generated keywords to your campaign.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isGenerating ? (
                      <div className="space-y-3">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                      </div>
                    ) : suggestions.length > 0 ? (
                      <div className="rounded-md border">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Keyword</TableHead>
                              <TableHead className="text-center">Relevance</TableHead>
                              <TableHead className="text-center">Volume</TableHead>
                              <TableHead className="text-center">Competition</TableHead>
                              <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {suggestions.map((suggestion) => (
                              <TableRow key={suggestion.keyword}>
                                <TableCell className="font-medium">{suggestion.keyword}</TableCell>
                                <TableCell className="text-center">
                                  <Progress value={suggestion.score * 100} className="h-1.5 max-w-24 mx-auto" />
                                  <span className="text-xs text-slate-500 mt-1 block">
                                    {Math.round(suggestion.score * 100)}%
                                  </span>
                                </TableCell>
                                <TableCell className="text-center">
                                  <Badge variant="outline" className={getVolumeColor(suggestion.volume)}>
                                    {suggestion.volume.charAt(0).toUpperCase() + suggestion.volume.slice(1)}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-center">
                                  <Badge variant="outline" className={getCompetitionColor(suggestion.competition)}>
                                    {suggestion.competition.charAt(0).toUpperCase() + suggestion.competition.slice(1)}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                  <Button 
                                    size="sm" 
                                    className="text-xs"
                                    onClick={() => addSuggestedKeyword(suggestion)}
                                    disabled={!selectedCampaign || addKeywordMutation.isPending}
                                  >
                                    <Plus className="mr-1 h-3 w-3" />
                                    Add
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    ) : (
                      <div className="text-center py-16 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                        <MoveUp className="h-10 w-10 text-slate-400 mx-auto mb-3" />
                        <h3 className="text-lg font-medium text-slate-900">No suggestions yet</h3>
                        <p className="mt-1 text-sm text-slate-500 max-w-md mx-auto">
                          Fill out the form to the left with your business details to receive AI-powered keyword suggestions.
                        </p>
                      </div>
                    )}
                  </CardContent>
                  {suggestions.length > 0 && (
                    <CardFooter>
                      <Alert className="bg-primary-50 border-primary-100">
                        <Lightbulb className="h-4 w-4 text-primary" />
                        <AlertTitle className="text-sm font-medium text-primary-700">Tip</AlertTitle>
                        <AlertDescription className="text-xs text-slate-700">
                          Look for keywords with high relevance, medium-high volume, and low-medium competition for the best results.
                        </AlertDescription>
                      </Alert>
                    </CardFooter>
                  )}
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
