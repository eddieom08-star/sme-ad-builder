import { apiRequest } from "./queryClient";

// The newest OpenAI model is "gpt-4o" which was released May 13, 2024. 
// Do not change this unless explicitly requested by the user

// Keywords suggestion interface
export interface KeywordSuggestion {
  keyword: string;
  score: number;
  volume: string;
  competition: string;
}

// AI-generated campaign suggestion
export interface CampaignSuggestion {
  name: string;
  description: string;
  targetAudience: string;
  platforms: string[];
  suggestedBudget: number;
  estimatedROI: string;
}

// Campaign optimization suggestion
export interface OptimizationSuggestion {
  type: string;
  suggestion: string;
  impact: string;
  priority: "high" | "medium" | "low";
}

// Request AI to suggest keywords based on business description
export async function suggestKeywords(businessDescription: string, industry: string): Promise<KeywordSuggestion[]> {
  try {
    const res = await apiRequest(
      "POST",
      "/api/ai/suggest-keywords",
      { businessDescription, industry }
    );
    return await res.json();
  } catch (error) {
    console.error("Failed to get keyword suggestions:", error);
    throw error;
  }
}

// Request AI to suggest campaign ideas
export async function suggestCampaigns(businessDescription: string, goals: string[]): Promise<CampaignSuggestion[]> {
  try {
    const res = await apiRequest(
      "POST", 
      "/api/ai/suggest-campaigns", 
      { businessDescription, goals }
    );
    return await res.json();
  } catch (error) {
    console.error("Failed to get campaign suggestions:", error);
    throw error;
  }
}

// Request AI to analyze campaign performance and suggest optimizations
export async function analyzeCampaign(campaignId: number): Promise<OptimizationSuggestion[]> {
  try {
    const res = await apiRequest(
      "POST",
      "/api/ai/analyze-campaign",
      { campaignId }
    );
    return await res.json();
  } catch (error) {
    console.error("Failed to analyze campaign:", error);
    throw error;
  }
}

// Request AI to generate ad copy based on campaign details
export async function generateAdCopy(campaignId: number, target: string, tone: string): Promise<string[]> {
  try {
    const res = await apiRequest(
      "POST",
      "/api/ai/generate-ad-copy",
      { campaignId, target, tone }
    );
    return await res.json();
  } catch (error) {
    console.error("Failed to generate ad copy:", error);
    throw error;
  }
}
