# Project Structure Overview

## Directory Tree

```
sme-ad-builder/
│
├── app/                                    # Next.js App Router
│   ├── (dashboard)/                        # Route group with shared layout
│   │   ├── layout.tsx                      # Dashboard layout with nav/header
│   │   ├── dashboard/                      # Main dashboard
│   │   │   └── page.tsx                    # /dashboard route
│   │   ├── campaigns/                      # Campaign management
│   │   │   ├── page.tsx                    # /campaigns route
│   │   │   ├── new/                        # Create campaign
│   │   │   │   └── page.tsx                # /campaigns/new
│   │   │   └── [id]/                       # Campaign detail
│   │   │       ├── page.tsx                # /campaigns/[id]
│   │   │       └── edit/                   # Edit campaign
│   │   │           └── page.tsx            # /campaigns/[id]/edit
│   │   ├── ads/                            # Ad management
│   │   │   ├── page.tsx                    # /ads route
│   │   │   ├── new/                        # Ad builder
│   │   │   │   └── page.tsx                # /ads/new
│   │   │   └── [id]/                       # Ad detail/edit
│   │   │       └── page.tsx                # /ads/[id]
│   │   ├── leads/                          # Lead management
│   │   │   ├── page.tsx                    # /leads route
│   │   │   └── [id]/                       # Lead detail
│   │   │       └── page.tsx                # /leads/[id]
│   │   ├── analytics/                      # Analytics dashboard
│   │   │   └── page.tsx                    # /analytics route
│   │   └── settings/                       # User/business settings
│   │       └── page.tsx                    # /settings route
│   │
│   ├── auth/                               # Authentication pages
│   │   ├── login/
│   │   │   └── page.tsx                    # /auth/login
│   │   ├── register/
│   │   │   └── page.tsx                    # /auth/register
│   │   └── error/
│   │       └── page.tsx                    # /auth/error
│   │
│   ├── api/                                # API Routes
│   │   ├── auth/
│   │   │   └── [...nextauth]/
│   │   │       └── route.ts                # NextAuth handlers
│   │   ├── campaigns/
│   │   │   ├── route.ts                    # GET /api/campaigns, POST
│   │   │   └── [id]/
│   │   │       └── route.ts                # GET/PATCH/DELETE /api/campaigns/[id]
│   │   ├── ads/
│   │   │   └── route.ts                    # Ads CRUD
│   │   ├── leads/
│   │   │   └── route.ts                    # Leads CRUD
│   │   └── analytics/
│   │       └── route.ts                    # Analytics data
│   │
│   ├── layout.tsx                          # Root layout
│   ├── page.tsx                            # Home page (redirects)
│   └── globals.css                         # Global styles
│
├── components/                             # React Components
│   ├── dashboard/                          # Dashboard components
│   │   ├── nav.tsx                         # Sidebar navigation
│   │   └── header.tsx                      # Top header with user menu
│   │
│   ├── campaigns/                          # Campaign components
│   │   ├── campaign-card.tsx               # Campaign card display
│   │   ├── campaign-form.tsx               # Create/edit form
│   │   └── campaign-stats.tsx              # Campaign statistics
│   │
│   ├── ads/                                # Ad components
│   │   ├── ad-builder/                     # Ad builder workflow
│   │   │   ├── step-select-campaign.tsx
│   │   │   ├── step-select-format.tsx
│   │   │   ├── step-create-content.tsx
│   │   │   └── step-preview.tsx
│   │   ├── ad-card.tsx                     # Ad display card
│   │   └── ad-preview.tsx                  # Ad preview component
│   │
│   ├── leads/                              # Lead components
│   │   ├── lead-table.tsx                  # Leads data table
│   │   ├── lead-detail.tsx                 # Lead detail view
│   │   └── lead-status-badge.tsx           # Status indicator
│   │
│   ├── analytics/                          # Analytics components
│   │   ├── metrics-overview.tsx            # Key metrics cards
│   │   ├── performance-chart.tsx           # Line/bar charts
│   │   └── date-range-picker.tsx           # Date range selector
│   │
│   ├── ui/                                 # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── dropdown-menu.tsx
│   │   ├── form.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   ├── select.tsx
│   │   ├── table.tsx
│   │   ├── tabs.tsx
│   │   ├── toast.tsx
│   │   ├── toaster.tsx
│   │   └── ... (other shadcn components)
│   │
│   └── providers.tsx                       # App-level providers
│
├── lib/                                    # Libraries & Utilities
│   ├── actions/                            # Server Actions
│   │   ├── user.ts                         # User-related actions
│   │   ├── business.ts                     # Business actions
│   │   ├── campaign.ts                     # Campaign CRUD
│   │   ├── ad.ts                           # Ad CRUD
│   │   ├── lead.ts                         # Lead CRUD
│   │   └── analytics.ts                    # Analytics queries
│   │
│   ├── auth/                               # Authentication
│   │   ├── auth.config.ts                  # NextAuth config
│   │   └── index.ts                        # Auth exports
│   │
│   ├── db/                                 # Database
│   │   ├── schema.ts                       # Drizzle schema
│   │   └── index.ts                        # DB connection
│   │
│   ├── store/                              # Zustand stores
│   │   └── index.ts                        # All stores
│   │
│   └── utils.ts                            # Utility functions
│
├── types/                                  # TypeScript Types
│   ├── index.ts                            # App types & schemas
│   └── next-auth.d.ts                      # NextAuth type extensions
│
├── drizzle/                                # Database migrations (generated)
│   └── ... (migration files)
│
├── public/                                 # Static assets
│   ├── images/
│   └── ... (other static files)
│
├── .env.example                            # Environment variables template
├── .gitignore                              # Git ignore rules
├── drizzle.config.ts                       # Drizzle Kit configuration
├── middleware.ts                           # Next.js middleware
├── next.config.mjs                         # Next.js configuration
├── package.json                            # Dependencies & scripts
├── postcss.config.js                       # PostCSS config
├── tailwind.config.ts                      # Tailwind configuration
├── tsconfig.json                           # TypeScript configuration
├── README.md                               # Project documentation
├── MIGRATION_GUIDE.md                      # Migration guide
└── STRUCTURE.md                            # This file
```

## Key Patterns

### Server Components (Default in app/)
```tsx
// app/(dashboard)/campaigns/page.tsx
import { auth } from "@/lib/auth";
import { getCampaigns } from "@/lib/actions/campaign";

export default async function CampaignsPage() {
  const session = await auth();
  const campaigns = await getCampaigns(session.user.businessId);

  return <CampaignList campaigns={campaigns} />;
}
```

### Client Components (Interactive)
```tsx
// components/campaigns/campaign-form.tsx
"use client";

import { useForm } from "react-hook-form";
import { useState } from "react";

export function CampaignForm() {
  const [isLoading, setIsLoading] = useState(false);
  // ... component logic
}
```

### Server Actions
```tsx
// lib/actions/campaign.ts
"use server";

import { db } from "@/lib/db";
import { campaigns } from "@/lib/db/schema";

export async function getCampaigns(businessId: number) {
  return await db.query.campaigns.findMany({
    where: eq(campaigns.businessId, businessId),
  });
}

export async function createCampaign(data: CampaignInput) {
  // Validation, authorization, etc.
  return await db.insert(campaigns).values(data).returning();
}
```

### API Routes
```tsx
// app/api/campaigns/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const session = await auth();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // ... fetch and return data
  return NextResponse.json(campaigns);
}
```

### Zustand Store
```tsx
// lib/store/index.ts
import { create } from "zustand";

export const useCampaignStore = create<CampaignState>((set) => ({
  selectedCampaignId: null,
  setSelectedCampaign: (id) => set({ selectedCampaignId: id }),
}));

// Usage in component
"use client";
import { useCampaignStore } from "@/lib/store";

export function CampaignSelector() {
  const { selectedCampaignId, setSelectedCampaign } = useCampaignStore();
  // ...
}
```

## Naming Conventions

### Files
- **Routes**: `page.tsx`, `layout.tsx`, `route.ts`
- **Components**: `kebab-case.tsx` (e.g., `campaign-card.tsx`)
- **Actions**: `entity.ts` (e.g., `campaign.ts`)
- **Types**: `index.ts` or descriptive names

### Components
- **PascalCase**: `CampaignCard`, `AdBuilder`
- **Props interfaces**: `ComponentNameProps`

### Functions
- **camelCase**: `getCampaigns`, `createAd`, `formatCurrency`
- **Server Actions**: Prefix with verb (`get`, `create`, `update`, `delete`)

### Constants
- **UPPER_SNAKE_CASE**: `PLATFORMS`, `AD_FORMATS`

## Data Flow

```
User Interaction
    ↓
Client Component
    ↓
Server Action / API Route
    ↓
Database (via Drizzle)
    ↓
Response
    ↓
Client Update (optimistic or refetch)
```

## Authentication Flow

```
User visits protected route
    ↓
Middleware checks session (middleware.ts)
    ↓
If no session → Redirect to /auth/login
    ↓
User logs in
    ↓
NextAuth validates credentials (lib/auth/auth.config.ts)
    ↓
Session created with JWT
    ↓
Redirect to requested page
    ↓
Server components can access session via auth()
```
