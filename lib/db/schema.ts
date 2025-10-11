import { pgTable, text, serial, integer, boolean, timestamp, jsonb, decimal, index } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

// ============================================================================
// USERS TABLE
// ============================================================================

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(), // hashed with bcrypt
  businessId: integer("business_id"),
  role: text("role", { enum: ["owner", "admin", "member"] }).notNull().default("owner"),
  emailVerified: timestamp("email_verified"),
  image: text("image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  emailIdx: index("email_idx").on(table.email),
  usernameIdx: index("username_idx").on(table.username),
}));

export const usersRelations = relations(users, ({ one, many }) => ({
  business: one(businesses, {
    fields: [users.businessId],
    references: [businesses.id],
  }),
  ownedBusinesses: many(businesses),
  campaigns: many(campaigns),
  leads: many(leads),
}));

// ============================================================================
// BUSINESSES TABLE
// ============================================================================

export const businesses = pgTable("businesses", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  industry: text("industry").notNull(),
  description: text("description"),
  website: text("website"),
  logo: text("logo"),
  ownerId: integer("owner_id").notNull(),
  settings: jsonb("settings").$type<{
    timezone?: string;
    currency?: string;
    notifications?: {
      email?: boolean;
      push?: boolean;
    };
  }>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  ownerIdx: index("business_owner_idx").on(table.ownerId),
}));

export const businessesRelations = relations(businesses, ({ one, many }) => ({
  owner: one(users, {
    fields: [businesses.ownerId],
    references: [users.id],
  }),
  members: many(users),
  campaigns: many(campaigns),
  leads: many(leads),
}));

// ============================================================================
// CAMPAIGNS TABLE
// ============================================================================

export const campaigns = pgTable("campaigns", {
  id: serial("id").primaryKey(),
  businessId: integer("business_id").notNull(),
  userId: integer("user_id").notNull(), // creator
  name: text("name").notNull(),
  description: text("description"),
  platforms: text("platforms").array().notNull().default([]),
  budget: decimal("budget", { precision: 10, scale: 2 }).notNull().default("0"),
  spent: decimal("spent", { precision: 10, scale: 2 }).notNull().default("0"),
  status: text("status", {
    enum: ["draft", "active", "paused", "completed", "archived"]
  }).notNull().default("draft"),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  targeting: jsonb("targeting").$type<{
    ageMin?: number;
    ageMax?: number;
    genders?: string[];
    locations?: string[];
    interests?: string[];
    behaviors?: string[];
  }>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  businessIdx: index("campaign_business_idx").on(table.businessId),
  userIdx: index("campaign_user_idx").on(table.userId),
  statusIdx: index("campaign_status_idx").on(table.status),
}));

export const campaignsRelations = relations(campaigns, ({ one, many }) => ({
  business: one(businesses, {
    fields: [campaigns.businessId],
    references: [businesses.id],
  }),
  creator: one(users, {
    fields: [campaigns.userId],
    references: [users.id],
  }),
  ads: many(ads),
  leads: many(leads),
  metrics: many(campaignMetrics),
}));

// ============================================================================
// ADS TABLE
// ============================================================================

export const ads = pgTable("ads", {
  id: serial("id").primaryKey(),
  campaignId: integer("campaign_id").notNull(),
  name: text("name").notNull(),
  format: text("format", {
    enum: ["image", "video", "carousel", "story"]
  }).notNull(),
  platform: text("platform").notNull(),
  status: text("status", {
    enum: ["draft", "active", "paused", "rejected"]
  }).notNull().default("draft"),

  // Creative content
  headline: text("headline"),
  body: text("body"),
  callToAction: text("call_to_action"),
  imageUrl: text("image_url"),
  videoUrl: text("video_url"),
  targetUrl: text("target_url"),

  // Metrics
  impressions: integer("impressions").default(0).notNull(),
  clicks: integer("clicks").default(0).notNull(),
  conversions: integer("conversions").default(0).notNull(),
  spend: decimal("spend", { precision: 10, scale: 2 }).default("0").notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  campaignIdx: index("ad_campaign_idx").on(table.campaignId),
  statusIdx: index("ad_status_idx").on(table.status),
  platformIdx: index("ad_platform_idx").on(table.platform),
}));

export const adsRelations = relations(ads, ({ one, many }) => ({
  campaign: one(campaigns, {
    fields: [ads.campaignId],
    references: [campaigns.id],
  }),
  leads: many(leads),
}));

// ============================================================================
// LEADS TABLE
// ============================================================================

export const leads = pgTable("leads", {
  id: serial("id").primaryKey(),
  businessId: integer("business_id").notNull(),
  campaignId: integer("campaign_id"),
  adId: integer("ad_id"),

  // Contact information
  name: text("name"),
  email: text("email").notNull(),
  phone: text("phone"),
  company: text("company"),

  // Lead details
  source: text("source").notNull(), // e.g., "facebook", "google", "manual"
  status: text("status", {
    enum: ["new", "contacted", "qualified", "converted", "lost"]
  }).notNull().default("new"),
  score: integer("score"), // Lead scoring 0-100

  // Additional data
  notes: text("notes"),
  metadata: jsonb("metadata").$type<Record<string, any>>(),

  // Assignment
  assignedTo: integer("assigned_to"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  businessIdx: index("lead_business_idx").on(table.businessId),
  campaignIdx: index("lead_campaign_idx").on(table.campaignId),
  statusIdx: index("lead_status_idx").on(table.status),
  emailIdx: index("lead_email_idx").on(table.email),
}));

export const leadsRelations = relations(leads, ({ one }) => ({
  business: one(businesses, {
    fields: [leads.businessId],
    references: [businesses.id],
  }),
  campaign: one(campaigns, {
    fields: [leads.campaignId],
    references: [campaigns.id],
  }),
  ad: one(ads, {
    fields: [leads.adId],
    references: [ads.id],
  }),
  assignee: one(users, {
    fields: [leads.assignedTo],
    references: [users.id],
  }),
}));

// ============================================================================
// CAMPAIGN METRICS TABLE (for historical tracking)
// ============================================================================

export const campaignMetrics = pgTable("campaign_metrics", {
  id: serial("id").primaryKey(),
  campaignId: integer("campaign_id").notNull(),

  date: timestamp("date").notNull(),
  impressions: integer("impressions").default(0).notNull(),
  clicks: integer("clicks").default(0).notNull(),
  conversions: integer("conversions").default(0).notNull(),
  spend: decimal("spend", { precision: 10, scale: 2 }).default("0").notNull(),

  // Calculated fields
  ctr: decimal("ctr", { precision: 5, scale: 2 }).default("0"), // Click-through rate
  cpc: decimal("cpc", { precision: 10, scale: 2 }).default("0"), // Cost per click
  cpa: decimal("cpa", { precision: 10, scale: 2 }).default("0"), // Cost per acquisition
  roas: decimal("roas", { precision: 10, scale: 2 }).default("0"), // Return on ad spend

  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  campaignDateIdx: index("metrics_campaign_date_idx").on(table.campaignId, table.date),
}));

export const campaignMetricsRelations = relations(campaignMetrics, ({ one }) => ({
  campaign: one(campaigns, {
    fields: [campaignMetrics.campaignId],
    references: [campaigns.id],
  }),
}));

// ============================================================================
// ACTIVITIES/AUDIT LOG TABLE
// ============================================================================

export const activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  businessId: integer("business_id"),

  action: text("action").notNull(), // e.g., "campaign.created", "ad.updated"
  entityType: text("entity_type"), // e.g., "campaign", "ad", "lead"
  entityId: integer("entity_id"),
  description: text("description").notNull(),
  metadata: jsonb("metadata").$type<Record<string, any>>(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  userIdx: index("activity_user_idx").on(table.userId),
  businessIdx: index("activity_business_idx").on(table.businessId),
  entityIdx: index("activity_entity_idx").on(table.entityType, table.entityId),
}));

export const activitiesRelations = relations(activities, ({ one }) => ({
  user: one(users, {
    fields: [activities.userId],
    references: [users.id],
  }),
  business: one(businesses, {
    fields: [activities.businessId],
    references: [businesses.id],
  }),
}));

// ============================================================================
// ZODS SCHEMAS FOR VALIDATION
// ============================================================================

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  emailVerified: true,
});

export const insertBusinessSchema = createInsertSchema(businesses).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCampaignSchema = createInsertSchema(campaigns).omit({
  id: true,
  spent: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAdSchema = createInsertSchema(ads).omit({
  id: true,
  impressions: true,
  clicks: true,
  conversions: true,
  spend: true,
  createdAt: true,
  updatedAt: true,
});

export const insertLeadSchema = createInsertSchema(leads).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCampaignMetricSchema = createInsertSchema(campaignMetrics).omit({
  id: true,
  createdAt: true,
});

export const insertActivitySchema = createInsertSchema(activities).omit({
  id: true,
  createdAt: true,
});

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Business = typeof businesses.$inferSelect;
export type InsertBusiness = z.infer<typeof insertBusinessSchema>;

export type Campaign = typeof campaigns.$inferSelect;
export type InsertCampaign = z.infer<typeof insertCampaignSchema>;

export type Ad = typeof ads.$inferSelect;
export type InsertAd = z.infer<typeof insertAdSchema>;

export type Lead = typeof leads.$inferSelect;
export type InsertLead = z.infer<typeof insertLeadSchema>;

export type CampaignMetric = typeof campaignMetrics.$inferSelect;
export type InsertCampaignMetric = z.infer<typeof insertCampaignMetricSchema>;

export type Activity = typeof activities.$inferSelect;
export type InsertActivity = z.infer<typeof insertActivitySchema>;
