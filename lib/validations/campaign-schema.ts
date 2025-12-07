import { z } from 'zod';

// Platform and objective enums
export const platformSchema = z.enum(['facebook', 'instagram', 'google', 'linkedin', 'tiktok']);
export const objectiveSchema = z.enum(['awareness', 'traffic', 'leads', 'conversions']);
export const budgetTypeSchema = z.enum(['daily', 'lifetime']);
export const bidStrategySchema = z.enum(['lowest_cost', 'cost_cap', 'bid_cap']);
export const adFormatSchema = z.enum(['image', 'video', 'carousel', 'story']);
export const genderSchema = z.enum(['male', 'female', 'all']);
export const currencySchema = z.enum(['USD', 'GBP', 'EUR', 'CAD']);

// Location schema
export const locationSchema = z.object({
  type: z.enum(['country', 'city', 'region']),
  name: z.string().min(1, 'Location name is required'),
  radius: z.number().min(1).max(50).optional(), // miles
});

// Targeting schema
export const targetingSchema = z.object({
  ageMin: z.number().min(13, 'Minimum age must be at least 13').max(65),
  ageMax: z.number().min(13).max(65, 'Maximum age cannot exceed 65'),
  genders: z.array(genderSchema).min(1, 'Select at least one gender option'),
  locations: z.array(locationSchema).min(1, 'Add at least one location'),
  interests: z.array(z.string()).default([]),
  behaviors: z.array(z.string()).default([]),
  languages: z.array(z.string()).default(['English']),
  linkedinTargeting: z.object({
    jobTitles: z.array(z.string()).default([]),
    industries: z.array(z.string()).default([]),
    companySizes: z.array(z.string()).default([]),
  }).optional(),
}).refine(
  (data) => data.ageMin < data.ageMax,
  {
    message: 'Minimum age must be less than maximum age',
    path: ['ageMin'],
  }
);

// Media schema
export const mediaSchema = z.object({
  url: z.string().url('Invalid media URL'),
  type: z.enum(['image', 'video']),
  width: z.number().positive().optional(),
  height: z.number().positive().optional(),
  thumbnail: z.string().url().optional(), // for videos
});

// Ad creative schema
export const adCreativeSchema = z.object({
  id: z.string().optional(),
  format: adFormatSchema,
  platform: platformSchema,
  headline: z.string()
    .min(1, 'Headline is required')
    .max(100, 'Headline is too long'),
  primaryText: z.string()
    .min(1, 'Primary text is required')
    .max(2200, 'Primary text is too long'),
  description: z.string()
    .max(100, 'Description is too long')
    .optional(),
  callToAction: z.string().min(1, 'Call-to-action is required'),
  media: z.array(mediaSchema)
    .min(1, 'Upload at least one image or video'),
  destinationUrl: z.string()
    .url('Invalid destination URL')
    .min(1, 'Destination URL is required'),
});

// Step 1: Campaign Setup
export const campaignSetupSchema = z.object({
  campaignName: z.string()
    .min(3, 'Campaign name must be at least 3 characters')
    .max(100, 'Campaign name must be less than 100 characters'),
  campaignDescription: z.string()
    .max(500, 'Description must be less than 500 characters')
    .optional(),
  objective: objectiveSchema,
  platforms: z.array(platformSchema)
    .min(1, 'Select at least one platform'),
});

// Step 2: Targeting (uses targetingSchema above)

// Step 3: Budget & Schedule
export const budgetScheduleSchema = z.object({
  budgetType: budgetTypeSchema,
  budgetAmount: z.number()
    .min(1, 'Budget amount is required')
    .max(100000, 'Budget cannot exceed $100,000'),
  currency: currencySchema,
  startDate: z.string().refine(
    (date) => {
      const selected = new Date(date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return selected >= today;
    },
    { message: 'Start date cannot be in the past' }
  ),
  endDate: z.string(),
  bidStrategy: bidStrategySchema,
  bidCap: z.number().positive().optional(),
}).refine(
  (data) => {
    const minBudget = data.budgetType === 'daily' ? 5 : 35;
    return data.budgetAmount >= minBudget;
  },
  (data) => ({
    message: `Minimum ${data.budgetType} budget is $${data.budgetType === 'daily' ? 5 : 35}`,
    path: ['budgetAmount'],
  })
).refine(
  (data) => {
    const start = new Date(data.startDate);
    const end = new Date(data.endDate);
    return end > start;
  },
  {
    message: 'End date must be after start date',
    path: ['endDate'],
  }
).refine(
  (data) => {
    if (data.bidStrategy !== 'lowest_cost') {
      return data.bidCap !== undefined && data.bidCap > 0;
    }
    return true;
  },
  {
    message: 'Bid cap is required for this bid strategy',
    path: ['bidCap'],
  }
);

// Step 4: Creative (uses adCreativeSchema above)

// Complete campaign schema (all steps)
export const completeCampaignSchema = z.object({
  // Step 1
  campaignName: z.string().min(3).max(100),
  campaignDescription: z.string().max(500).optional(),
  objective: objectiveSchema,
  platforms: z.array(platformSchema).min(1),

  // Step 2
  targeting: targetingSchema,

  // Step 3
  budgetType: budgetTypeSchema,
  budgetAmount: z.number().min(1).max(100000),
  currency: currencySchema,
  startDate: z.string(),
  endDate: z.string(),
  bidStrategy: bidStrategySchema,
  bidCap: z.number().positive().optional(),

  // Step 4
  ads: z.array(adCreativeSchema).min(1, 'Create at least one ad'),

  // Meta
  isDraft: z.boolean().default(false),
});

// API request schema (for creating campaign)
export const createCampaignRequestSchema = z.object({
  name: z.string().min(3).max(100),
  description: z.string().max(500).optional(),
  objective: objectiveSchema.optional(),
  platforms: z.array(platformSchema),
  budget: z.string(), // decimal string
  budgetType: budgetTypeSchema.optional(),
  startDate: z.string(),
  endDate: z.string(),
  targeting: z.object({
    ageMin: z.number().optional(),
    ageMax: z.number().optional(),
    genders: z.array(z.string()).optional(),
    locations: z.array(z.string()).optional(),
    interests: z.array(z.string()).optional(),
    behaviors: z.array(z.string()).optional(),
    linkedinTargeting: z.object({
      jobTitles: z.array(z.string()).optional(),
      industries: z.array(z.string()).optional(),
      companySizes: z.array(z.string()).optional(),
    }).optional(),
  }),
  status: z.enum(['draft', 'active', 'paused']).default('draft'),
});

// API request schema (for creating ad)
export const createAdRequestSchema = z.object({
  campaignId: z.number().positive(),
  name: z.string().min(1).max(100),
  format: adFormatSchema,
  platform: z.string(),
  headline: z.string().min(1).max(100),
  body: z.string().min(1).max(2200),
  callToAction: z.string().min(1),
  imageUrl: z.string().url().optional(),
  videoUrl: z.string().url().optional(),
  targetUrl: z.string().url(),
  status: z.enum(['draft', 'active', 'paused']).default('draft'),
});

// Type exports
export type Platform = z.infer<typeof platformSchema>;
export type CampaignObjective = z.infer<typeof objectiveSchema>;
export type BudgetType = z.infer<typeof budgetTypeSchema>;
export type BidStrategy = z.infer<typeof bidStrategySchema>;
export type AdFormat = z.infer<typeof adFormatSchema>;
export type Gender = z.infer<typeof genderSchema>;
export type Currency = z.infer<typeof currencySchema>;
export type Location = z.infer<typeof locationSchema>;
export type Targeting = z.infer<typeof targetingSchema>;
export type Media = z.infer<typeof mediaSchema>;
export type AdCreative = z.infer<typeof adCreativeSchema>;
export type CampaignSetup = z.infer<typeof campaignSetupSchema>;
export type BudgetSchedule = z.infer<typeof budgetScheduleSchema>;
export type CompleteCampaign = z.infer<typeof completeCampaignSchema>;
export type CreateCampaignRequest = z.infer<typeof createCampaignRequestSchema>;
export type CreateAdRequest = z.infer<typeof createAdRequestSchema>;
