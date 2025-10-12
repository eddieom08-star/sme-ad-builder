# Backend Architecture - SME Ad Builder

**Platform:** Next.js 14 App Router (Serverless)
**Deployment:** Vercel Edge Network
**Database:** Neon PostgreSQL (Serverless)
**Date:** October 12, 2025

---

## 🏗️ Architecture Overview

### **Serverless Backend on Vercel**

Your backend runs on **Vercel's Edge Network** as serverless functions. There is **NO traditional backend server** - everything is serverless!

```
┌─────────────────────────────────────────────────────────┐
│                    VERCEL EDGE NETWORK                   │
│                     (Global CDN)                         │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │     NEXT.JS APP (Server Components + API)        │  │
│  ├──────────────────────────────────────────────────┤  │
│  │                                                   │  │
│  │  Frontend (React)                                │  │
│  │  ├─ app/(dashboard)/*.tsx     ← Server Components│ │
│  │  ├─ components/**/*.tsx       ← Client Components│ │
│  │  └─ lib/stores/*.ts           ← State Management│  │
│  │                                                   │  │
│  │  Backend API Routes (Serverless Functions)       │  │
│  │  ├─ app/api/campaigns/route.ts  ← POST, GET     │  │
│  │  ├─ app/api/ads/route.ts        ← POST, GET     │  │
│  │  └─ app/api/images/generate/route.ts ← POST     │  │
│  │                                                   │  │
│  └──────────────────────────────────────────────────┘  │
│                         ↓                                │
└─────────────────────────┼──────────────────────────────┘
                          ↓
              ┌───────────────────────┐
              │   EXTERNAL SERVICES    │
              ├───────────────────────┤
              │                        │
              │  Neon PostgreSQL       │
              │  (Database)            │
              │  ↓                     │
              │  Drizzle ORM           │
              │                        │
              │  Clerk                 │
              │  (Authentication)      │
              │                        │
              │  OpenAI API            │
              │  (AI - Future)         │
              │                        │
              └───────────────────────┘
```

---

## 📍 Where Backend Functions Run

### **Location:** Vercel Edge Functions
- **Global Distribution:** Functions run in data centers closest to your users
- **Regions:** US, Europe, Asia, etc. (automatically routed)
- **Cold Start:** ~100ms (first request)
- **Warm:** ~10ms (subsequent requests)

### **How It Works:**

1. **User makes request:**
   ```
   POST https://sme-ad-builder.vercel.app/api/campaigns
   ```

2. **Vercel routes to nearest edge location:**
   ```
   User in London → London Data Center
   User in NYC    → NYC Data Center
   ```

3. **Function executes:**
   ```typescript
   // app/api/campaigns/route.ts runs as serverless function
   export async function POST(req: Request) {
     // This code runs on Vercel's servers
     // NOT on your machine
   }
   ```

4. **Response returned:**
   ```json
   { "campaignId": 42, "status": "success" }
   ```

---

## 🔌 Current API Endpoints

### **1. Campaign API**
**File:** `app/api/campaigns/route.ts`
**Running on:** Vercel Serverless Functions

```typescript
POST /api/campaigns
  ↓ Creates new campaign
  ↓ Validates with Zod
  ↓ Saves to PostgreSQL (Neon)
  ↓ Returns campaignId

GET /api/campaigns
  ↓ Fetches all campaigns
  ↓ Queries PostgreSQL
  ↓ Returns array of campaigns
```

**Code Location:**
```
app/api/campaigns/route.ts
├─ POST handler (lines 8-67)
│  ├─ Auth check (Clerk)
│  ├─ Validation (Zod schema)
│  ├─ Database insert (Drizzle)
│  └─ Return campaignId
│
└─ GET handler (lines 69-85)
   ├─ Auth check (Clerk)
   ├─ Database query (Drizzle)
   └─ Return campaigns array
```

### **2. Ads API**
**File:** `app/api/ads/route.ts`
**Running on:** Vercel Serverless Functions

```typescript
POST /api/ads
  ↓ Creates new ad for campaign
  ↓ Validates ad data
  ↓ Saves to PostgreSQL
  ↓ Returns adId

GET /api/ads?campaignId=42
  ↓ Fetches ads for specific campaign
  ↓ Queries PostgreSQL with filter
  ↓ Returns array of ads
```

### **3. Image Generation API** (Existing, not used yet)
**File:** `app/api/images/generate/route.ts`
**Running on:** Vercel Serverless Functions

```typescript
POST /api/images/generate
  ↓ Future: AI image generation
  ↓ Ready for integration
```

---

## 🗄️ Database Architecture

### **Neon PostgreSQL** (Serverless Database)

**Connection:**
```typescript
// lib/db/index.ts
import { neon } from '@neondatabase/serverless';

export const db = neon(process.env.DATABASE_URL!);
```

**Running on:** Neon Cloud (AWS us-east-1)
**Access:** Via connection string (encrypted)
**ORM:** Drizzle (type-safe SQL builder)

**Tables:**
```sql
users               ← User accounts (Clerk integration)
businesses          ← Business profiles
campaigns           ← Ad campaigns
ads                 ← Ad creatives
leads               ← Lead captures
campaign_metrics    ← Performance data
activities          ← Audit log
```

**Schema Definition:**
```
lib/db/schema.ts (363 lines)
├─ Table definitions
├─ Relations
├─ Zod validation schemas
└─ TypeScript types
```

---

## 🔐 Authentication Flow

### **Clerk (Third-party Service)**

**Where it runs:** Clerk's servers (not on Vercel)
**Integration:** Via middleware and API helpers

```typescript
// Middleware runs on EVERY request
// middleware.ts
export default clerkMiddleware((auth, req) => {
  // Runs on Vercel Edge
  // Checks if user is authenticated
});

// API routes use Clerk helpers
// app/api/campaigns/route.ts
import { auth } from '@clerk/nextjs/server';

export async function POST(req: Request) {
  const { userId } = await auth(); // ← Calls Clerk API
  if (!userId) return 401;
  // ... rest of code
}
```

**Flow:**
```
1. User visits /campaigns
2. Middleware checks authentication (Clerk API call)
3. If not signed in → redirect to /sign-in
4. If signed in → allow access
```

---

## 💾 Data Flow - Complete Example

### **Creating a Campaign:**

```
┌──────────────┐
│   Browser    │
│  (Frontend)  │
└──────┬───────┘
       │ POST /api/campaigns
       │ { name: "Summer Sale", platforms: [...] }
       ↓
┌──────────────────────────────────┐
│   Vercel Edge Function           │
│   app/api/campaigns/route.ts     │
├──────────────────────────────────┤
│  1. Authenticate with Clerk      │ → Clerk API
│     const { userId } = await auth()
│                                   │
│  2. Validate request data         │
│     const valid = schema.parse(body)
│                                   │
│  3. Connect to database           │ → Neon PostgreSQL
│     await db.insert(campaigns)    │   (AWS us-east-1)
│                                   │
│  4. Return response               │
│     { campaignId: 42 }            │
└──────┬───────────────────────────┘
       │ Response: 200 OK
       ↓
┌──────────────┐
│   Browser    │
│  Toast: ✓    │
│  Redirect    │
└──────────────┘
```

**Time Breakdown:**
- Clerk auth check: ~50ms
- Database insert: ~30ms
- Total: ~100ms

---

## 🌍 Where Everything Physically Runs

### **Your Code:**
```
GitHub Repository (git push)
  ↓
Vercel Build System (builds Next.js app)
  ↓
Vercel Edge Network (deploys to ~100+ locations worldwide)
  ↓
Functions execute in data center closest to user
```

### **External Services:**

| Service | Location | Purpose |
|---------|----------|---------|
| **Vercel Edge** | Global (100+ locations) | Hosts your Next.js app + API routes |
| **Neon PostgreSQL** | AWS us-east-1 (Virginia) | Database |
| **Clerk** | Global CDN | Authentication |
| **OpenAI** | Azure (future integration) | AI copy generation |

---

## 🚀 Deployment Process

### **How Code Gets to Production:**

```bash
# 1. You push code
git push origin main

# 2. Vercel detects push (webhook from GitHub)

# 3. Vercel builds
  - npm install (install dependencies)
  - npm run build (build Next.js app)
  - Generate serverless functions

# 4. Vercel deploys
  - Deploy to edge network
  - Update DNS
  - Purge CDN cache

# 5. LIVE! (2-3 minutes total)
  https://sme-ad-builder.vercel.app/
```

### **Environment Variables:**
```
Stored on Vercel Dashboard:
├─ DATABASE_URL                  ← Neon connection string
├─ NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ← Clerk public key
├─ CLERK_SECRET_KEY              ← Clerk secret
└─ OPENAI_API_KEY (future)       ← AI integration
```

---

## 📊 Current Backend Functions

### **Summary:**

| Function | File | Type | Status |
|----------|------|------|--------|
| Create Campaign | `app/api/campaigns/route.ts` | POST | ✅ Working |
| Get Campaigns | `app/api/campaigns/route.ts` | GET | ✅ Working |
| Create Ad | `app/api/ads/route.ts` | POST | ✅ Working |
| Get Ads | `app/api/ads/route.ts` | GET | ✅ Working |
| Generate Image | `app/api/images/generate/route.ts` | POST | 🔜 Future |

### **Missing (Future):**
- `POST /api/ai/generate-copy` - AI copy suggestions
- `POST /api/upload` - Media upload (Vercel Blob)
- `GET /api/campaigns/:id` - Single campaign details
- `PATCH /api/campaigns/:id` - Update campaign
- `DELETE /api/campaigns/:id` - Delete campaign
- `GET /api/analytics` - Performance metrics

---

## 💡 Key Insights

### **1. No Traditional Server**
- ❌ No Express.js running 24/7
- ❌ No EC2 instance
- ❌ No Docker container
- ✅ Functions spin up on-demand
- ✅ Scale automatically (0 to millions)
- ✅ Pay only for execution time

### **2. Serverless = Cost Efficient**
```
Traditional Server:
- Running 24/7: $50-200/month
- Even when idle
- Need to scale manually

Vercel Serverless:
- Running only when called: $0-20/month
- Auto-scales infinitely
- No maintenance
```

### **3. Database is Also Serverless**
```
Traditional PostgreSQL:
- Always-on server: $50+/month
- Fixed capacity

Neon PostgreSQL:
- Scales to zero: $0-10/month
- Auto-scales with usage
- Serverless connections
```

---

## 🔍 How to Monitor Backend

### **Vercel Dashboard:**
https://vercel.com/dashboard

**You can see:**
- ✅ Function invocations (how many API calls)
- ✅ Response times (avg latency)
- ✅ Error rates (failed requests)
- ✅ Deployment history
- ✅ Build logs

### **Neon Dashboard:**
https://neon.tech/dashboard

**You can see:**
- ✅ Database queries
- ✅ Connection count
- ✅ Storage usage
- ✅ Query performance

### **Clerk Dashboard:**
https://dashboard.clerk.com

**You can see:**
- ✅ User sign-ups
- ✅ Active sessions
- ✅ Authentication logs

---

## 🎯 Quick Reference

### **Adding a New API Endpoint:**

1. **Create file:**
   ```bash
   touch app/api/my-endpoint/route.ts
   ```

2. **Add handler:**
   ```typescript
   import { auth } from '@clerk/nextjs/server';
   import { NextResponse } from 'next/server';

   export async function POST(req: Request) {
     const { userId } = await auth();
     if (!userId) {
       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
     }

     const body = await req.json();
     // Your logic here

     return NextResponse.json({ success: true });
   }
   ```

3. **Deploy:**
   ```bash
   git add app/api/my-endpoint/route.ts
   git commit -m "Add new API endpoint"
   git push
   ```

4. **Available at:**
   ```
   https://sme-ad-builder.vercel.app/api/my-endpoint
   ```

---

## 📞 Troubleshooting

### **"Where do I check logs?"**
- Vercel Dashboard → Project → Logs
- Shows all function executions in real-time

### **"How do I debug API routes?"**
```typescript
export async function POST(req: Request) {
  console.log('Request received'); // Shows in Vercel logs

  try {
    // Your code
  } catch (error) {
    console.error('Error:', error); // Shows in Vercel logs
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
```

### **"How do I test locally?"**
```bash
npm run dev
# Functions run on localhost:3000/api/*
```

---

## 🎓 Summary

**Your backend is:**
- ✅ Running on Vercel Edge Network (serverless)
- ✅ Global distribution (100+ locations)
- ✅ Auto-scaling (0 to infinity)
- ✅ Cost-efficient (pay per execution)
- ✅ Production-ready (enterprise-grade)

**Your backend is NOT:**
- ❌ On your laptop (only during dev)
- ❌ A traditional server
- ❌ Running 24/7
- ❌ Expensive to scale

**Location of backend code:**
```
app/api/
├─ campaigns/route.ts   ← Campaign API
├─ ads/route.ts         ← Ads API
└─ images/generate/route.ts ← Image API

These files deploy as serverless functions to Vercel!
```

---

**Questions? Your backend is fully serverless and running globally on Vercel! 🚀**
