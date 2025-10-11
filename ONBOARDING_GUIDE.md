# Onboarding System Guide

## Overview

The SME Ad Builder onboarding system is a 6-step guided process that collects business information and sets up initial marketing campaigns. Built with Next.js 14, React Hook Form, Zod validation, and Zustand state management.

## Architecture

### State Management

**Zustand Store** (`lib/store/onboarding.ts`)
- Persists onboarding data to localStorage
- Tracks current step and completed steps
- Auto-saves form data across steps
- Stores all 6 steps of data

### Steps Overview

1. **Business Profile** ✅ - Business info, services, location, hours
2. **Target Audience** - Demographics, interests, locations
3. **Marketing Goals** - Objectives, KPIs, competitors
4. **Budget & Timeline** - Budget, duration, ROI expectations
5. **Campaign Preferences** - Platforms, formats, creative style
6. **Review & Launch** - Final review and campaign creation

## Step 1: Business Profile

### Route
`/onboarding/business-profile`

### Features

#### Form Fields
- **Business Name** - Required, 2-100 characters
- **Category** - Dropdown with 13 categories (Plumber, Electrician, HVAC, etc.)
- **Services** - Multi-tag input, 1-10 services
- **Description** - Optional, 20-500 characters
- **Location**
  - Street address
  - City, State (2-letter code), ZIP
  - Service radius (1-100 miles)
- **Contact**
  - Phone (US format validation)
  - Email
  - Website (optional)
- **Business Hours**
  - Hours for each day of week
  - Checkbox to mark days as closed

#### Validation
- Real-time validation with Zod
- Phone: US format `(555) 123-4567`
- ZIP: 5-digit or 9-digit format
- State: 2-letter codes only
- Email: Standard email validation
- URL: Valid website URLs

#### Auto-Save
- Saves to Zustand store every 1 second (debounced)
- Shows last saved timestamp
- Persists across page refreshes
- Can save to database via server action

### Mobile Responsive

**Desktop (≥1024px)**
```
┌─────────────────────────────────────┐
│ Sidebar       │     Form Content    │
│               │                     │
│ ✓ Step 1      │  Business Profile   │
│ ○ Step 2      │  [Form Fields...]   │
│ ○ Step 3      │                     │
│ ...           │                     │
│               │  [Back] [Continue]  │
└─────────────────────────────────────┘
```

**Mobile (<1024px)**
```
┌──────────────────────┐
│ Step 1/6  [50%]      │ ← Sticky progress
├──────────────────────┤
│                      │
│  Business Profile    │
│  [Form Fields...]    │
│                      │
│                      │
├──────────────────────┤
│ [Back] [Continue]    │ ← Sticky actions
└──────────────────────┘
```

### Components

**OnboardingLayout** (`components/onboarding/onboarding-layout.tsx`)
- Progress sidebar (desktop)
- Progress bar (mobile)
- Step indicators
- Responsive grid layout

**BusinessProfileForm** (`components/onboarding/business-profile-form.tsx`)
- React Hook Form integration
- Zod validation
- Auto-save functionality
- Service tags management
- Business hours picker

## Usage

### Start Onboarding
```tsx
// From dashboard or landing page
<Link href="/onboarding">
  <Button>Get Started</Button>
</Link>
```

### Access Onboarding Store
```tsx
import { useOnboardingStore } from "@/lib/store/onboarding";

function MyComponent() {
  const {
    businessProfile,
    updateBusinessProfile,
    currentStep,
    setCurrentStep,
    markStepComplete,
  } = useOnboardingStore();

  // Update business profile
  updateBusinessProfile({
    businessName: "Smith Plumbing",
    category: "Plumber",
  });

  // Navigate steps
  setCurrentStep(2);
  markStepComplete(1);
}
```

### Server Actions

**Save Business Profile**
```tsx
import { saveBusinessProfile } from "@/lib/actions/onboarding";

// In a server component or server action
const result = await saveBusinessProfile({
  businessName: "Smith Plumbing",
  category: "Plumber",
  // ... other fields
});

if (result.success) {
  console.log("Saved! Business ID:", result.businessId);
}
```

**Auto-Save (Debounced)**
```tsx
import { autoSaveBusinessProfile } from "@/lib/actions/onboarding";

// Called automatically by form
useEffect(() => {
  const timer = setTimeout(async () => {
    await autoSaveBusinessProfile(formData);
  }, 1000);

  return () => clearTimeout(timer);
}, [formData]);
```

## Data Flow

```
User Input
    ↓
React Hook Form
    ↓
Zod Validation
    ↓
Zustand Store (auto-save every 1s)
    ↓
LocalStorage (persistence)
    ↓
Server Action (on submit)
    ↓
Database (PostgreSQL via Drizzle)
```

## Validation Schema

```typescript
// lib/validations/onboarding.ts
export const businessProfileSchema = z.object({
  businessName: z.string().min(2).max(100),
  category: z.enum(BUSINESS_CATEGORIES),
  services: z.array(z.string()).min(1).max(10),
  description: z.string().min(20).max(500).optional(),
  location: z.object({
    address: z.string().min(5),
    city: z.string().min(2),
    state: z.string().min(2).max(2),
    zipCode: z.string().regex(/^\d{5}(-\d{4})?$/),
    serviceRadius: z.number().min(1).max(100),
  }),
  contact: z.object({
    phone: z.string().regex(phoneRegex),
    email: z.string().email(),
    website: z.string().url().optional(),
  }),
  hours: z.object({
    monday: businessHoursSchema,
    // ... other days
  }),
});
```

## Database Schema

**businesses table** (lib/db/schema.ts)
```typescript
businesses = pgTable("businesses", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  industry: text("industry").notNull(), // category
  description: text("description"),
  website: text("website"),
  ownerId: integer("owner_id").notNull(),
  settings: jsonb("settings"), // stores services, location, contact, hours
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});
```

**settings JSON structure:**
```json
{
  "services": ["Emergency Repairs", "Installation"],
  "location": {
    "address": "123 Main St",
    "city": "Boston",
    "state": "MA",
    "zipCode": "02101",
    "serviceRadius": 25
  },
  "contact": {
    "phone": "(555) 123-4567",
    "email": "info@example.com",
    "website": "https://example.com"
  },
  "hours": {
    "monday": { "open": "09:00", "close": "17:00", "closed": false },
    // ... other days
  }
}
```

## Testing

### Manual Testing Checklist

**Form Validation**
- [ ] Business name: min 2, max 100 chars
- [ ] Category: required selection
- [ ] Services: min 1, max 10 tags
- [ ] Phone: valid US format
- [ ] Email: valid email format
- [ ] ZIP: 5 or 9 digit format
- [ ] State: 2-letter code only
- [ ] Website: valid URL or empty

**Functionality**
- [ ] Auto-save works (check localStorage)
- [ ] Form persists on page refresh
- [ ] Services can be added/removed
- [ ] Business hours checkbox works
- [ ] Navigation to next step works
- [ ] Back button works
- [ ] Mobile responsive layout
- [ ] Progress indicator updates

**Mobile Testing**
- [ ] Bottom sticky buttons work
- [ ] Progress bar shows correctly
- [ ] Forms are touch-friendly
- [ ] All fields accessible on small screens

## Customization

### Add Business Category
```typescript
// lib/store/onboarding.ts
export const BUSINESS_CATEGORIES = [
  // ... existing
  "Your New Category",
] as const;
```

### Modify Form Fields
Edit `components/onboarding/business-profile-form.tsx`

### Change Validation Rules
Edit `lib/validations/onboarding.ts`

### Add Custom Auto-Save Logic
```typescript
// In form component
useEffect(() => {
  const timer = setTimeout(async () => {
    // Your custom save logic
    await customSaveFunction(formData);
  }, 1000);

  return () => clearTimeout(timer);
}, [formData]);
```

## Next Steps

### Step 2: Target Audience
- Demographics selection
- Interest targeting
- Geographic targeting
- Pain points identification

### Step 3: Marketing Goals
- Primary/secondary goals
- KPI selection
- Competitor analysis
- Success metrics

### Step 4: Budget & Timeline
- Monthly budget input
- Campaign duration
- Start date picker
- Expected ROI

### Step 5: Campaign Preferences
- Platform selection (Facebook, Google, etc.)
- Ad format preferences
- Creative style selection
- CTA options

### Step 6: Review & Launch
- Summary of all steps
- Edit capabilities
- Final confirmation
- Campaign creation

## Troubleshooting

**Form doesn't save**
- Check localStorage is enabled
- Verify Zustand store is initialized
- Check browser console for errors

**Validation errors**
- Review Zod schema in `lib/validations/onboarding.ts`
- Check error messages in form

**Auto-save not working**
- Verify useEffect dependency array
- Check debounce timing (1000ms)
- Verify server action is called

**Mobile layout issues**
- Test at different breakpoints (320px, 768px, 1024px)
- Check Tailwind classes (`lg:` prefix)
- Verify sticky positioning

## Files Reference

```
/lib
  /store
    onboarding.ts          # Zustand store
  /validations
    onboarding.ts          # Zod schemas
  /actions
    onboarding.ts          # Server actions

/components
  /onboarding
    onboarding-layout.tsx  # Layout wrapper
    business-profile-form.tsx  # Step 1 form
  /ui
    badge.tsx              # Service tags
    use-toast.ts           # Toast notifications

/app
  /(onboarding)
    /onboarding
      layout.tsx           # Auth check
      page.tsx             # Redirect to step 1
      /business-profile
        page.tsx           # Step 1 page
      /target-audience
        page.tsx           # Step 2 placeholder
```

## Best Practices

1. **Always validate on client and server**
2. **Use debounced auto-save (1000ms minimum)**
3. **Provide clear error messages**
4. **Show progress indicators**
5. **Make forms mobile-friendly**
6. **Persist state to prevent data loss**
7. **Test on real devices**
8. **Handle loading states**
9. **Provide exit confirmation if data exists**
10. **Log important actions for debugging**
