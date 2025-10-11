# Google Ads Campaign Creator - Quick Reference

## 🚀 Quick Start

```tsx
import { GoogleAdsCampaignCreator } from "@/components/google-ads/google-ads-campaign-creator";

<GoogleAdsCampaignCreator />
```

**Route**: `/onboarding/google-ads-campaign`

## 📋 Character Limits

```typescript
HEADLINE_MAX_LENGTH = 30
DESCRIPTION_MAX_LENGTH = 90
DISPLAY_PATH_MAX_LENGTH = 15
```

## 🔢 Requirements

```typescript
MIN_HEADLINES = 3
MAX_HEADLINES = 15

MIN_DESCRIPTIONS = 2
MAX_DESCRIPTIONS = 4

MIN_KEYWORDS = 3
RECOMMENDED_KEYWORDS = 5

AD_VERSIONS_MIN = 3
AD_VERSIONS_MAX = 5
```

## 🗂️ Store Access

```typescript
import { useGoogleAdsStore } from "@/lib/store/google-ads";

const {
  // Ad Versions
  adVersions,
  selectedVersionCount,
  toggleAdVersion,

  // Headlines
  headlines,
  addHeadline,
  updateHeadline,
  removeHeadline,

  // Descriptions
  descriptions,
  addDescription,
  updateDescription,
  removeDescription,

  // Keywords
  keywords,
  addKeyword,
  updateKeyword,
  removeKeyword,

  // URLs
  targetUrl,
  displayPath1,
  displayPath2,
  setTargetUrl,
  setDisplayPath,

  // Geographic
  geographicTarget,
  setGeographicTarget,

  // Budget
  selectedBudget,
  setSelectedBudget,

  // Utility
  reset,
} = useGoogleAdsStore();
```

## 📁 File Structure

```
components/google-ads/
├── ad-version-selector.tsx           # Step 1
├── education-modal.tsx                # Steps 2-3
├── headlines-editor.tsx               # Step 4
├── descriptions-editor.tsx            # Step 5
├── keywords-selector.tsx              # Step 6
├── url-configuration.tsx              # Step 7
├── geographic-targeting.tsx           # Step 8
├── budget-selection.tsx               # Step 9
├── ad-preview-panel.tsx               # Preview (sticky)
└── google-ads-campaign-creator.tsx    # Orchestrator

lib/store/google-ads.ts                # State
lib/constants/us-states.ts             # US States
```

## 🎯 Flow Steps

1. **Ad Versions** → Select 3-5 versions
2. **Education** → 3-page tutorial (skippable)
3. **Headlines** → Add 3-15 headlines (30 chars max)
4. **Descriptions** → Add 2-4 descriptions (90 chars max)
5. **Keywords** → Add 3+ keywords with match types
6. **URLs** → Set final URL + display paths
7. **Targeting** → Nationwide or local (city + radius)
8. **Budget** → Select $5-$13/day
9. **Review** → Launch campaign

## 🎨 Budget Tiers

```typescript
const budgetOptions = [
  {
    dailyBudget: 5,
    estimatedClicks: "2-4",
    estimatedImpressions: "100-200",
    estimatedCost: "$150/month",
  },
  {
    dailyBudget: 7,
    estimatedClicks: "3-6",
    estimatedImpressions: "150-300",
    estimatedCost: "$210/month",
  },
  {
    dailyBudget: 10, // Recommended
    estimatedClicks: "5-10",
    estimatedImpressions: "250-500",
    estimatedCost: "$300/month",
  },
  {
    dailyBudget: 13,
    estimatedClicks: "7-13",
    estimatedImpressions: "350-700",
    estimatedCost: "$390/month",
  },
];
```

## 🗺️ Geographic Targeting

```typescript
// Nationwide
{
  type: "nationwide"
}

// Local
{
  type: "local",
  city: "Boston",
  state: "MA",
  radius: 25 // miles
}
```

## 🔑 Keyword Match Types

```typescript
type KeywordType = "broad" | "phrase" | "exact";

// Broad: Shows for related searches
// Phrase: Shows for searches including phrase
// Exact: Shows only for exact keyword
```

## 📊 Ad Preview

```typescript
// Auto-cycles every 3 seconds through combinations
// Shows: headline + description + URL
// Total combinations = headlines.length × descriptions.length
```

## 🎨 Component Props Pattern

```typescript
interface StepProps {
  onContinue: () => void;
  onBack: () => void;
}
```

## ⚡ Actions Quick Reference

### Headlines
```typescript
addHeadline("24/7 Emergency Service")
updateHeadline("h-123", "New headline text")
removeHeadline("h-123")
```

### Descriptions
```typescript
addDescription("Expert plumbers available 24/7...")
updateDescription("d-123", "Updated description")
removeDescription("d-123")
```

### Keywords
```typescript
addKeyword("emergency plumber", "phrase")
updateKeyword("k-123", "plumber near me", "broad")
removeKeyword("k-123")
```

### URLs
```typescript
setTargetUrl("https://mywebsite.com")
setDisplayPath("services", "plumbing")
```

### Geographic
```typescript
setGeographicTarget({ type: "nationwide" })
setGeographicTarget({
  type: "local",
  city: "Boston",
  state: "MA",
  radius: 25
})
```

### Budget
```typescript
setSelectedBudget({
  dailyBudget: 10,
  estimatedClicks: "5-10",
  estimatedImpressions: "250-500",
  estimatedCost: "$300/month"
})
```

## 🎯 Validation Rules

### Headlines
- Minimum: 3
- Maximum: 15
- Max length: 30 characters
- Must be unique

### Descriptions
- Minimum: 2
- Maximum: 4
- Max length: 90 characters
- Must be unique

### Keywords
- Minimum: 3
- Recommended: 5+
- Must have match type

### URL
- Required
- Must be valid URL format
- Display paths: 15 chars, alphanumeric + hyphens only

### Geographic
- Nationwide: No additional requirements
- Local: City + State required, radius optional

### Budget
- Must select one option

## 🎨 Status Badges

```tsx
<Badge variant="default">3 of 3-15 headlines</Badge>
<Badge variant="secondary">5 keywords</Badge>
<Badge variant="outline">Recommended</Badge>
```

## ✅ Success Indicators

```tsx
{isValid && (
  <div className="flex items-center gap-1 text-sm text-green-600">
    <CheckCircle2 className="h-4 w-4" />
    <span>Minimum met</span>
  </div>
)}
```

## ⚠️ Error Alerts

```tsx
<Alert variant="destructive">
  <AlertTriangle className="h-4 w-4" />
  <AlertDescription>
    Please add at least 2 more headlines
  </AlertDescription>
</Alert>
```

## 🔄 Reset Campaign

```typescript
const { reset } = useGoogleAdsStore();
reset(); // Clears all data
```

## 📱 Responsive Layout

```tsx
// Desktop: Two columns (content + preview)
<div className="grid lg:grid-cols-[1fr,400px] gap-6">

// Mobile: Single column
<div className="space-y-6">
```

## 🎨 Card Selection Pattern

```tsx
<Card
  className={cn(
    "cursor-pointer transition-all hover:shadow-md",
    isSelected && "ring-2 ring-primary shadow-md"
  )}
  onClick={() => handleSelect(item)}
>
```

## 📏 Character Counter Pattern

```tsx
<div className={cn(
  "text-xs",
  text.length > MAX_LENGTH
    ? "text-destructive font-medium"
    : "text-muted-foreground"
)}>
  {text.length}/{MAX_LENGTH}
</div>
```

## 🎯 Preview URL Display

```tsx
const getDomain = () => {
  try {
    const url = targetUrl.startsWith("http")
      ? targetUrl
      : `https://${targetUrl}`;
    return new URL(url).hostname.replace("www.", "");
  } catch {
    return "yourwebsite.com";
  }
};

const getDisplayUrl = () => {
  const domain = getDomain();
  const path1 = displayPath1 ? `/${displayPath1}` : "";
  const path2 = displayPath2 ? `/${displayPath2}` : "";
  return `${domain}${path1}${path2}`;
};
```

## 🔍 Education Modal Pages

1. **How RSAs Work**: Visual of mixing headlines/descriptions
2. **Why Multiple Variations**: Performance comparison
3. **Writing Tips**: Good vs bad examples

## 🎨 Budget Card Layout

```tsx
- Header: $X/day, monthly cost
- Metrics:
  - Estimated clicks (with icon)
  - Estimated impressions (with icon)
  - Reach level (with icon)
- Footer: Cost per click range
```

## 🗺️ US States

```typescript
import { US_STATES } from "@/lib/constants/us-states";

// Array of { code: "MA", name: "Massachusetts" }
```

## 📊 Preview Stats

```typescript
{
  totalCombinations: headlines.length × descriptions.length,
  headlinesCount: headlines.length,
  descriptionsCount: descriptions.length,
  currentHeadlineIndex: 0-based,
  currentDescriptionIndex: 0-based,
}
```

## ⏱️ Auto-Cycle Timing

- Interval: 3000ms (3 seconds)
- Transition: 150ms fade
- Can be manually refreshed

---

**Status**: ✅ Complete
**Total Files**: 14
**Total Lines**: ~2,800
**Route**: `/onboarding/google-ads-campaign`
