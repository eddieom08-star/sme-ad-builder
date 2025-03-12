import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertCampaignSchema, insertKeywordSchema, insertAudienceSchema, insertMetricSchema, insertActivitySchema } from "@shared/schema";
import OpenAI from "openai";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  
  // Initialize OpenAI client
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || "sk-demo-key",
  });

  // Get current user (for demo purposes, we'll return the first user)
  app.get("/api/me", async (_req, res) => {
    try {
      const users = Array.from((await storage.getUser(1)) ? [await storage.getUser(1)] : []);
      const user = users[0];
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Don't return password
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Failed to get user" });
    }
  });

  // Campaign routes
  app.get("/api/campaigns", async (_req, res) => {
    try {
      // For demo, we'll use user ID 1
      const campaigns = await storage.getCampaigns(1);
      res.json(campaigns);
    } catch (error) {
      res.status(500).json({ message: "Failed to get campaigns" });
    }
  });

  app.get("/api/campaigns/:id", async (req, res) => {
    try {
      const campaignId = parseInt(req.params.id);
      const campaign = await storage.getCampaign(campaignId);
      
      if (!campaign) {
        return res.status(404).json({ message: "Campaign not found" });
      }
      
      res.json(campaign);
    } catch (error) {
      res.status(500).json({ message: "Failed to get campaign" });
    }
  });

  app.post("/api/campaigns", async (req, res) => {
    try {
      const campaignData = insertCampaignSchema.parse(req.body);
      const campaign = await storage.createCampaign(campaignData);
      res.status(201).json(campaign);
    } catch (error) {
      res.status(400).json({ message: "Invalid campaign data" });
    }
  });

  app.patch("/api/campaigns/:id", async (req, res) => {
    try {
      const campaignId = parseInt(req.params.id);
      const campaign = await storage.updateCampaign(campaignId, req.body);
      
      if (!campaign) {
        return res.status(404).json({ message: "Campaign not found" });
      }
      
      res.json(campaign);
    } catch (error) {
      res.status(500).json({ message: "Failed to update campaign" });
    }
  });

  app.delete("/api/campaigns/:id", async (req, res) => {
    try {
      const campaignId = parseInt(req.params.id);
      const deleted = await storage.deleteCampaign(campaignId);
      
      if (!deleted) {
        return res.status(404).json({ message: "Campaign not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete campaign" });
    }
  });

  // Keyword routes
  app.get("/api/campaigns/:campaignId/keywords", async (req, res) => {
    try {
      const campaignId = parseInt(req.params.campaignId);
      const keywords = await storage.getKeywords(campaignId);
      res.json(keywords);
    } catch (error) {
      res.status(500).json({ message: "Failed to get keywords" });
    }
  });

  app.post("/api/keywords", async (req, res) => {
    try {
      const keywordData = insertKeywordSchema.parse(req.body);
      const keyword = await storage.createKeyword(keywordData);
      res.status(201).json(keyword);
    } catch (error) {
      res.status(400).json({ message: "Invalid keyword data" });
    }
  });

  // Audience routes
  app.get("/api/audience", async (_req, res) => {
    try {
      // For demo, we'll use user ID 1
      const audience = await storage.getAudience(1);
      
      if (!audience) {
        return res.status(404).json({ message: "Audience not found" });
      }
      
      res.json(audience);
    } catch (error) {
      res.status(500).json({ message: "Failed to get audience" });
    }
  });

  // Metrics routes
  app.get("/api/metrics", async (req, res) => {
    try {
      // For demo, we'll use user ID 1
      const campaignId = req.query.campaignId 
        ? parseInt(req.query.campaignId as string) 
        : undefined;
        
      const metrics = await storage.getMetrics(1, campaignId);
      res.json(metrics);
    } catch (error) {
      res.status(500).json({ message: "Failed to get metrics" });
    }
  });

  // Activities routes
  app.get("/api/activities", async (_req, res) => {
    try {
      // For demo, we'll use user ID 1
      const activities = await storage.getActivities(1);
      res.json(activities);
    } catch (error) {
      res.status(500).json({ message: "Failed to get activities" });
    }
  });

  // AI routes
  app.post("/api/ai/suggest-keywords", async (req, res) => {
    try {
      const { businessDescription, industry } = req.body;
      
      if (!businessDescription || !industry) {
        return res.status(400).json({ message: "Business description and industry are required" });
      }
      
      // In a real implementation, we would call OpenAI API
      // For now, we'll return mock data
      const prompt = `
        You are an expert in digital marketing. Based on the following business description and industry, 
        suggest keyword ideas for digital advertising. 
        
        Business description: ${businessDescription}
        Industry: ${industry}
        
        Output the suggestions as a JSON array with the following format:
        [
          {
            "keyword": "suggested keyword",
            "score": number between 0 and 1 indicating relevance,
            "volume": "high", "medium", or "low" search volume,
            "competition": "high", "medium", or "low" competition level
          }
        ]
        
        Provide only JSON without any other text.
      `;
      
      // Use OpenAI if API key is present
      if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== "sk-demo-key") {
        const response = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: [{ role: "user", content: prompt }],
          response_format: { type: "json_object" },
        });
        
        const suggestions = JSON.parse(response.choices[0].message.content);
        return res.json(suggestions);
      }
      
      // Fallback demo data if no API key
      const suggestions = [
        {
          keyword: "handmade jewelry",
          score: 0.95,
          volume: "high",
          competition: "medium"
        },
        {
          keyword: "custom necklaces",
          score: 0.89,
          volume: "medium",
          competition: "medium"
        },
        {
          keyword: "artisan earrings",
          score: 0.82,
          volume: "medium",
          competition: "low"
        },
        {
          keyword: "beach jewelry",
          score: 0.78,
          volume: "medium",
          competition: "low"
        },
        {
          keyword: "sustainable jewelry",
          score: 0.75,
          volume: "low",
          competition: "low"
        }
      ];
      
      res.json(suggestions);
    } catch (error) {
      res.status(500).json({ message: "Failed to get keyword suggestions" });
    }
  });

  app.post("/api/ai/suggest-campaigns", async (req, res) => {
    try {
      const { businessDescription, goals } = req.body;
      
      if (!businessDescription || !goals) {
        return res.status(400).json({ message: "Business description and goals are required" });
      }
      
      // In a real implementation, we would call OpenAI API
      // For now, we'll return mock data
      const prompt = `
        You are an expert in digital marketing and advertisement campaign creation. Based on the following business description and goals, 
        suggest campaign ideas.
        
        Business description: ${businessDescription}
        Goals: ${goals.join(", ")}
        
        Output the suggestions as a JSON array with the following format:
        [
          {
            "name": "Campaign name",
            "description": "Brief description of the campaign",
            "targetAudience": "Description of the target audience",
            "platforms": ["Platform1", "Platform2"],
            "suggestedBudget": number in dollars,
            "estimatedROI": "Estimated ROI percentage"
          }
        ]
        
        Provide only JSON without any other text.
      `;
      
      // Use OpenAI if API key is present
      if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== "sk-demo-key") {
        const response = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: [{ role: "user", content: prompt }],
          response_format: { type: "json_object" },
        });
        
        const suggestions = JSON.parse(response.choices[0].message.content);
        return res.json(suggestions);
      }
      
      // Fallback demo data if no API key
      const suggestions = [
        {
          name: "Summer Collection Showcase",
          description: "Highlight your new summer collection with vibrant imagery and targeted ads",
          targetAudience: "Women 25-44 interested in fashion and beach lifestyle",
          platforms: ["Instagram", "Facebook"],
          suggestedBudget: 500,
          estimatedROI: "320%"
        },
        {
          name: "Local Search Dominance",
          description: "Optimize for local searches to drive foot traffic to your physical store",
          targetAudience: "Local customers within 15 miles searching for jewelry",
          platforms: ["Google Ads", "Bing"],
          suggestedBudget: 300,
          estimatedROI: "250%"
        },
        {
          name: "Sustainable Stories",
          description: "Showcase your sustainability practices and eco-friendly materials",
          targetAudience: "Environmentally conscious consumers ages 22-38",
          platforms: ["Instagram", "TikTok"],
          suggestedBudget: 400,
          estimatedROI: "180%"
        }
      ];
      
      res.json(suggestions);
    } catch (error) {
      res.status(500).json({ message: "Failed to get campaign suggestions" });
    }
  });

  app.post("/api/ai/analyze-campaign", async (req, res) => {
    try {
      const { campaignId } = req.body;
      
      if (!campaignId) {
        return res.status(400).json({ message: "Campaign ID is required" });
      }
      
      const campaign = await storage.getCampaign(campaignId);
      
      if (!campaign) {
        return res.status(404).json({ message: "Campaign not found" });
      }
      
      // In a real implementation, we would fetch campaign metrics and analyze with OpenAI
      // For now, we'll return mock data
      const suggestions = [
        {
          type: "budget",
          suggestion: "Increase budget allocation for weekends by 15% as they show higher conversion rates",
          impact: "Could improve overall ROI by ~8%",
          priority: "high"
        },
        {
          type: "targeting",
          suggestion: "Expand targeting to include 'beach lifestyle enthusiasts' interest group",
          impact: "Potential reach increase of 25,000 users",
          priority: "medium"
        },
        {
          type: "creative",
          suggestion: "Test new ad creatives highlighting product sustainability",
          impact: "Similar campaigns saw 12% higher CTR",
          priority: "medium"
        },
        {
          type: "keywords",
          suggestion: "Remove underperforming keyword 'artisan earrings' and reallocate budget",
          impact: "Saved budget could be more effective elsewhere",
          priority: "low"
        }
      ];
      
      res.json(suggestions);
    } catch (error) {
      res.status(500).json({ message: "Failed to analyze campaign" });
    }
  });

  app.post("/api/ai/generate-ad-copy", async (req, res) => {
    try {
      const { campaignId, target, tone } = req.body;
      
      if (!campaignId || !target || !tone) {
        return res.status(400).json({ 
          message: "Campaign ID, target audience, and tone are required" 
        });
      }
      
      const campaign = await storage.getCampaign(campaignId);
      
      if (!campaign) {
        return res.status(404).json({ message: "Campaign not found" });
      }
      
      // In a real implementation, we would call OpenAI API
      // For now, we'll return mock data
      const prompt = `
        Generate 3 different ad copy options for a digital ad campaign with the following details:
        
        Campaign name: ${campaign.name}
        Target audience: ${target}
        Tone: ${tone}
        
        Each ad copy should include a headline, body text, and call to action. 
        Output as a JSON array of strings.
        
        Provide only JSON without any other text.
      `;
      
      // Use OpenAI if API key is present
      if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== "sk-demo-key") {
        const response = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: [{ role: "user", content: prompt }],
          response_format: { type: "json_object" },
        });
        
        const adCopies = JSON.parse(response.choices[0].message.content);
        return res.json(adCopies);
      }
      
      // Fallback demo data if no API key
      const adCopies = [
        "Headline: Handcrafted Beauty, Just For You\nBody: Discover our unique jewelry pieces made with love and sustainable materials. Each creation tells a story of coastal beauty.\nCTA: Shop Now and Stand Out",
        
        "Headline: Beach Vibes, Everyday Elegance\nBody: Bring the coastal spirit wherever you go with our handmade accessories. Ethically sourced materials that sparkle like the ocean.\nCTA: Explore the Collection",
        
        "Headline: Wear Your Story\nBody: Our artisan-crafted jewelry isn't just an accessory—it's a statement. Sustainable, beautiful, and uniquely you.\nCTA: Find Your Piece Today"
      ];
      
      res.json(adCopies);
    } catch (error) {
      res.status(500).json({ message: "Failed to generate ad copy" });
    }
  });

  return httpServer;
}
