import { 
  users, type User, type InsertUser,
  campaigns, type Campaign, type InsertCampaign,
  keywords, type Keyword, type InsertKeyword,
  audiences, type Audience, type InsertAudience,
  metrics, type Metric, type InsertMetric,
  activities, type Activity, type InsertActivity
} from "@shared/schema";

// Storage interface for all entities
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Campaign operations
  getCampaigns(userId: number): Promise<Campaign[]>;
  getCampaign(id: number): Promise<Campaign | undefined>;
  createCampaign(campaign: InsertCampaign): Promise<Campaign>;
  updateCampaign(id: number, campaign: Partial<Campaign>): Promise<Campaign | undefined>;
  deleteCampaign(id: number): Promise<boolean>;

  // Keyword operations
  getKeywords(campaignId: number): Promise<Keyword[]>;
  createKeyword(keyword: InsertKeyword): Promise<Keyword>;
  updateKeyword(id: number, keyword: Partial<Keyword>): Promise<Keyword | undefined>;
  deleteKeyword(id: number): Promise<boolean>;
  
  // Audience operations
  getAudience(userId: number): Promise<Audience | undefined>;
  createAudience(audience: InsertAudience): Promise<Audience>;
  updateAudience(id: number, audience: Partial<Audience>): Promise<Audience | undefined>;
  
  // Metrics operations
  getMetrics(userId: number, campaignId?: number): Promise<Metric[]>;
  createMetric(metric: InsertMetric): Promise<Metric>;
  
  // Activity operations
  getActivities(userId: number): Promise<Activity[]>;
  createActivity(activity: InsertActivity): Promise<Activity>;
}

// In-memory implementation of the storage interface
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private campaigns: Map<number, Campaign>;
  private keywords: Map<number, Keyword>;
  private audiences: Map<number, Audience>;
  private metrics: Map<number, Metric>;
  private activities: Map<number, Activity>;
  
  private userIdCounter: number;
  private campaignIdCounter: number;
  private keywordIdCounter: number;
  private audienceIdCounter: number;
  private metricIdCounter: number;
  private activityIdCounter: number;

  constructor() {
    this.users = new Map();
    this.campaigns = new Map();
    this.keywords = new Map();
    this.audiences = new Map();
    this.metrics = new Map();
    this.activities = new Map();
    
    this.userIdCounter = 1;
    this.campaignIdCounter = 1;
    this.keywordIdCounter = 1;
    this.audienceIdCounter = 1;
    this.metricIdCounter = 1;
    this.activityIdCounter = 1;
    
    // Initialize with sample data
    this.initializeSampleData();
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const now = new Date();
    const user = { ...insertUser, id, createdAt: now };
    this.users.set(id, user);
    return user;
  }

  // Campaign operations
  async getCampaigns(userId: number): Promise<Campaign[]> {
    return Array.from(this.campaigns.values()).filter(
      (campaign) => campaign.userId === userId
    );
  }

  async getCampaign(id: number): Promise<Campaign | undefined> {
    return this.campaigns.get(id);
  }

  async createCampaign(insertCampaign: InsertCampaign): Promise<Campaign> {
    const id = this.campaignIdCounter++;
    const now = new Date();
    const campaign = { ...insertCampaign, id, spent: 0, createdAt: now };
    this.campaigns.set(id, campaign);
    
    // Create activity for new campaign
    await this.createActivity({
      userId: campaign.userId,
      description: `New campaign "${campaign.name}" has been created`,
      type: "campaign_created",
    });
    
    return campaign;
  }

  async updateCampaign(id: number, campaignUpdate: Partial<Campaign>): Promise<Campaign | undefined> {
    const campaign = this.campaigns.get(id);
    if (!campaign) return undefined;
    
    const updatedCampaign = { ...campaign, ...campaignUpdate };
    this.campaigns.set(id, updatedCampaign);
    
    // Create activity for campaign update
    await this.createActivity({
      userId: campaign.userId,
      description: `Campaign "${campaign.name}" has been updated`,
      type: "campaign_updated",
    });
    
    return updatedCampaign;
  }

  async deleteCampaign(id: number): Promise<boolean> {
    const campaign = this.campaigns.get(id);
    if (!campaign) return false;
    
    const deleted = this.campaigns.delete(id);
    
    if (deleted) {
      // Create activity for campaign deletion
      await this.createActivity({
        userId: campaign.userId,
        description: `Campaign "${campaign.name}" has been deleted`,
        type: "campaign_deleted",
      });
    }
    
    return deleted;
  }

  // Keyword operations
  async getKeywords(campaignId: number): Promise<Keyword[]> {
    return Array.from(this.keywords.values()).filter(
      (keyword) => keyword.campaignId === campaignId
    );
  }

  async createKeyword(insertKeyword: InsertKeyword): Promise<Keyword> {
    const id = this.keywordIdCounter++;
    const now = new Date();
    const keyword = { 
      ...insertKeyword, 
      id, 
      clicks: 0, 
      impressions: 0, 
      createdAt: now 
    };
    this.keywords.set(id, keyword);
    
    // Get campaign
    const campaign = this.campaigns.get(keyword.campaignId);
    if (campaign) {
      // Create activity for new keyword
      await this.createActivity({
        userId: campaign.userId,
        description: `New keyword "${keyword.text}" has been added to campaign "${campaign.name}"`,
        type: "keyword_added",
      });
    }
    
    return keyword;
  }

  async updateKeyword(id: number, keywordUpdate: Partial<Keyword>): Promise<Keyword | undefined> {
    const keyword = this.keywords.get(id);
    if (!keyword) return undefined;
    
    const updatedKeyword = { ...keyword, ...keywordUpdate };
    this.keywords.set(id, updatedKeyword);
    return updatedKeyword;
  }

  async deleteKeyword(id: number): Promise<boolean> {
    return this.keywords.delete(id);
  }

  // Audience operations
  async getAudience(userId: number): Promise<Audience | undefined> {
    return Array.from(this.audiences.values()).find(
      (audience) => audience.userId === userId
    );
  }

  async createAudience(insertAudience: InsertAudience): Promise<Audience> {
    const id = this.audienceIdCounter++;
    const now = new Date();
    const audience = { ...insertAudience, id, createdAt: now };
    this.audiences.set(id, audience);
    return audience;
  }

  async updateAudience(id: number, audienceUpdate: Partial<Audience>): Promise<Audience | undefined> {
    const audience = this.audiences.get(id);
    if (!audience) return undefined;
    
    const updatedAudience = { ...audience, ...audienceUpdate };
    this.audiences.set(id, updatedAudience);
    return updatedAudience;
  }

  // Metrics operations
  async getMetrics(userId: number, campaignId?: number): Promise<Metric[]> {
    let metrics = Array.from(this.metrics.values()).filter(
      (metric) => metric.userId === userId
    );
    
    if (campaignId) {
      metrics = metrics.filter((metric) => metric.campaignId === campaignId);
    }
    
    return metrics;
  }

  async createMetric(insertMetric: InsertMetric): Promise<Metric> {
    const id = this.metricIdCounter++;
    const now = new Date();
    const metric = { ...insertMetric, id, createdAt: now };
    this.metrics.set(id, metric);
    return metric;
  }

  // Activity operations
  async getActivities(userId: number): Promise<Activity[]> {
    return Array.from(this.activities.values())
      .filter((activity) => activity.userId === userId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  async createActivity(insertActivity: InsertActivity): Promise<Activity> {
    const id = this.activityIdCounter++;
    const now = new Date();
    const activity = { ...insertActivity, id, timestamp: now };
    this.activities.set(id, activity);
    return activity;
  }

  // Initialize with sample data for demo
  private initializeSampleData() {
    // Create a sample user
    const user: User = {
      id: this.userIdCounter++,
      username: "sarahjohnson",
      password: "password123", // In a real app, this would be hashed
      businessName: "Coastal Creations",
      email: "sarah@coastalcreations.com",
      createdAt: new Date(),
    };
    this.users.set(user.id, user);

    // Create sample campaigns
    const campaigns: Campaign[] = [
      {
        id: this.campaignIdCounter++,
        userId: user.id,
        name: "Summer Sale Promotion",
        platforms: ["Google Ads", "Facebook"],
        budget: 50000, // in cents
        spent: 35000, // in cents
        status: "active",
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days in the future
        createdAt: new Date(),
      },
      {
        id: this.campaignIdCounter++,
        userId: user.id,
        name: "Product Awareness",
        platforms: ["Instagram", "TikTok"],
        budget: 30000, // in cents
        spent: 22500, // in cents
        status: "active",
        startDate: new Date(),
        endDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days in the future
        createdAt: new Date(),
      },
      {
        id: this.campaignIdCounter++,
        userId: user.id,
        name: "Search Optimization",
        platforms: ["Google Ads"],
        budget: 20000, // in cents
        spent: 18000, // in cents
        status: "review",
        startDate: new Date(),
        endDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days in the future
        createdAt: new Date(),
      },
    ];

    campaigns.forEach((campaign) => {
      this.campaigns.set(campaign.id, campaign);
    });

    // Create sample keywords
    const keywords: Keyword[] = [
      {
        id: this.keywordIdCounter++,
        campaignId: campaigns[0].id,
        text: "handmade jewelry",
        clicks: 642,
        impressions: 13375,
        ctr: "4.8%",
        status: "growing",
        createdAt: new Date(),
      },
      {
        id: this.keywordIdCounter++,
        campaignId: campaigns[0].id,
        text: "custom necklaces",
        clicks: 318,
        impressions: 9937,
        ctr: "3.2%",
        status: "stable",
        createdAt: new Date(),
      },
      {
        id: this.keywordIdCounter++,
        campaignId: campaigns[0].id,
        text: "artisan earrings",
        clicks: 287,
        impressions: 9896,
        ctr: "2.9%",
        status: "declining",
        createdAt: new Date(),
      },
      {
        id: this.keywordIdCounter++,
        campaignId: campaigns[0].id,
        text: "beach jewelry",
        clicks: 209,
        impressions: 9952,
        ctr: "2.1%",
        status: "new",
        createdAt: new Date(),
      },
    ];

    keywords.forEach((keyword) => {
      this.keywords.set(keyword.id, keyword);
    });

    // Create sample audience
    const audience: Audience = {
      id: this.audienceIdCounter++,
      userId: user.id,
      ageDistribution: {
        "18-24": 12,
        "25-34": 42,
        "35-44": 28,
        "45-54": 18,
      },
      genderDistribution: {
        female: 72,
        male: 28,
      },
      interests: [
        { name: "Fashion", percentage: 68 },
        { name: "DIY Crafts", percentage: 54 },
        { name: "Travel", percentage: 47 },
        { name: "Home Decor", percentage: 42 },
        { name: "Sustainable Living", percentage: 38 },
      ],
      createdAt: new Date(),
    };
    this.audiences.set(audience.id, audience);

    // Create sample metrics
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      campaigns.forEach((campaign) => {
        const metric: Metric = {
          id: this.metricIdCounter++,
          userId: user.id,
          campaignId: campaign.id,
          impressions: Math.floor(Math.random() * 5000) + 1000,
          clicks: Math.floor(Math.random() * 300) + 50,
          conversions: Math.floor(Math.random() * 20) + 5,
          conversionRate: (Math.random() * 5 + 1).toFixed(1) + "%",
          roi: (Math.random() * 400 + 100).toFixed(0) + "%",
          date: date,
          createdAt: new Date(),
        };
        this.metrics.set(metric.id, metric);
      });
    }

    // Create sample activities
    const activities: Activity[] = [
      {
        id: this.activityIdCounter++,
        userId: user.id,
        description: `New campaign "Summer Sale" has been launched`,
        type: "campaign_launched",
        timestamp: new Date(),
      },
      {
        id: this.activityIdCounter++,
        userId: user.id,
        description: `Performance report for "Spring Collection" is ready`,
        type: "report_ready",
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
      },
      {
        id: this.activityIdCounter++,
        userId: user.id,
        description: `AI suggested 3 new keywords for your "Product Awareness" campaign`,
        type: "ai_suggestion",
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000 - 3600000), // Yesterday, 1 hour earlier
      },
      {
        id: this.activityIdCounter++,
        userId: user.id,
        description: `Budget increased for "Google Search Ads" campaign`,
        type: "budget_changed",
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      },
    ];

    activities.forEach((activity) => {
      this.activities.set(activity.id, activity);
    });
  }
}

export const storage = new MemStorage();
