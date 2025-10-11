# Onboarding Quick Reference

## 🚀 Quick Start

### Access Onboarding
```tsx
// Route
/onboarding/business-profile

// Link from anywhere
<Link href="/onboarding">Start Onboarding</Link>
```

### Use Store
```tsx
import { useOnboardingStore } from "@/lib/store/onboarding";

const {
  businessProfile,
  updateBusinessProfile,
  markStepComplete,
  setCurrentStep,
} = useOnboardingStore();
```

## 📝 Form Fields

### Business Profile (Step 1)
| Field | Type | Validation | Required |
|-------|------|------------|----------|
| Business Name | Text | 2-100 chars | ✅ |
| Category | Dropdown | 13 options | ✅ |
| Services | Multi-tag | 1-10 items | ✅ |
| Description | Textarea | 20-500 chars | ❌ |
| Address | Text | Min 5 chars | ✅ |
| City | Text | Min 2 chars | ✅ |
| State | Dropdown | 2-letter code | ✅ |
| ZIP Code | Text | 12345 or 12345-6789 | ✅ |
| Service Radius | Number | 1-100 miles | ✅ |
| Phone | Tel | (555) 123-4567 | ✅ |
| Email | Email | Standard format | ✅ |
| Website | URL | Valid URL | ❌ |
| Business Hours | Time | HH:MM format | ✅ |

## 🎨 Business Categories

```typescript
const CATEGORIES = [
  "Plumber",
  "Electrician",
  "HVAC",
  "General Contractor",
  "Carpenter",
  "Painter",
  "Landscaper",
  "Roofer",
  "Flooring Specialist",
  "Handyman",
  "Pool Service",
  "Cleaning Service",
  "Other"
];
```

## 🔄 State Management

### Store Structure
```typescript
{
  currentStep: number;           // 1-6
  completedSteps: number[];      // [1, 2, 3]
  businessProfile: { ... };      // Step 1 data
  targetAudience: { ... };       // Step 2
  marketingGoals: { ... };       // Step 3
  budgetTimeline: { ... };       // Step 4
  campaignPreferences: { ... };  // Step 5
  isCompleted: boolean;
  lastSaved: string | null;
}
```

### Store Actions
```typescript
setCurrentStep(step: number)
markStepComplete(step: number)
updateBusinessProfile(data: Partial<BusinessProfileData>)
completeOnboarding()
resetOnboarding()
updateLastSaved()
```

## 💾 Server Actions

### Save Business Profile
```typescript
import { saveBusinessProfile } from "@/lib/actions/onboarding";

const result = await saveBusinessProfile({
  businessName: "Smith Plumbing",
  category: "Plumber",
  // ... other fields
});

// Returns: { success: boolean, businessId?: number, error?: string }
```

### Get Business Profile
```typescript
import { getBusinessProfile } from "@/lib/actions/onboarding";

const profile = await getBusinessProfile();
// Returns: BusinessProfileData | null
```

### Auto-Save
```typescript
import { autoSaveBusinessProfile } from "@/lib/actions/onboarding";

await autoSaveBusinessProfile(partialData);
// Returns: { success: boolean }
```

## 📱 Responsive Breakpoints

```
Mobile:  < 768px   (lg:hidden)
Desktop: ≥ 1024px  (hidden lg:block)

Progress: Mobile = bar, Desktop = sidebar
Actions:  Mobile = sticky bottom, Desktop = inline
```

## 🎯 Navigation Flow

```
Step 1: Business Profile       → /onboarding/business-profile
Step 2: Target Audience        → /onboarding/target-audience
Step 3: Marketing Goals        → /onboarding/marketing-goals
Step 4: Budget & Timeline      → /onboarding/budget-timeline
Step 5: Campaign Preferences   → /onboarding/campaign-preferences
Step 6: Review & Launch        → /onboarding/review
```

## ✅ Validation Patterns

```typescript
// Phone (US)
/^(\+1|1)?[-.\s]?\(?[2-9]\d{2}\)?[-.\s]?\d{3}[-.\s]?\d{4}$/

// ZIP Code
/^\d{5}(-\d{4})?$/

// Time
/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/

// Email
z.string().email()

// URL
z.string().url().optional().or(z.literal(""))
```

## 🗂️ File Locations

```
lib/
  store/onboarding.ts          # Store
  validations/onboarding.ts    # Validation
  actions/onboarding.ts        # Server actions

components/onboarding/
  onboarding-layout.tsx        # Layout
  business-profile-form.tsx    # Form

app/(onboarding)/onboarding/
  business-profile/page.tsx    # Page
```

## 🐛 Debug Checklist

1. **Form not validating?**
   - Check Zod schema in `lib/validations/onboarding.ts`
   - Verify field names match schema

2. **Store not persisting?**
   - Check localStorage in DevTools
   - Look for "onboarding-storage" key

3. **Auto-save not working?**
   - Check 1s debounce timer
   - Verify useEffect dependencies

4. **Navigation stuck?**
   - Check `currentStep` in store
   - Verify `markStepComplete()` called

5. **Mobile layout broken?**
   - Test at 320px, 768px, 1024px
   - Check `lg:` Tailwind prefix

## 🚨 Common Patterns

### Check if Step Complete
```typescript
const { completedSteps } = useOnboardingStore();
const isStep1Complete = completedSteps.includes(1);
```

### Navigate to Next Step
```typescript
const router = useRouter();
markStepComplete(1);
setCurrentStep(2);
router.push('/onboarding/target-audience');
```

### Add Service Tag
```typescript
const [services, setServices] = useState<string[]>([]);

const addService = () => {
  if (input.trim() && services.length < 10) {
    setServices([...services, input.trim()]);
    setValue("services", [...services, input.trim()]);
  }
};
```

### Toggle Business Hours
```typescript
<Checkbox
  checked={watch(`hours.monday.closed`)}
  onCheckedChange={(checked) => {
    setValue(`hours.monday.closed`, checked);
    if (checked) {
      setValue(`hours.monday.open`, "");
      setValue(`hours.monday.close`, "");
    }
  }}
/>
```

## 📊 Database Fields

```sql
businesses.settings JSONB:
{
  "services": ["Emergency Repairs"],
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
    "monday": { "open": "09:00", "close": "17:00", "closed": false }
    // ... other days
  }
}
```

## 🎨 Styling Classes

```tsx
// Desktop sidebar
className="hidden lg:block"

// Mobile progress
className="lg:hidden"

// Responsive spacing
className="p-4 lg:p-6"

// Responsive grid
className="grid-cols-1 md:grid-cols-3"

// Sticky buttons (mobile)
className="sticky bottom-0 bg-background py-4"

// Error state
className={cn(errors.field && "border-destructive")}
```

---

**Quick Links:**
- [Full Guide](./ONBOARDING_GUIDE.md)
- [Summary](./ONBOARDING_SUMMARY.md)
- [React Hook Form](https://react-hook-form.com/)
- [Zod](https://zod.dev/)
