# Session Persistence & Data Integrity - Production Fix

## Executive Summary

Implemented production-grade solutions for three critical issues affecting user experience and data quality, following engineering principles from Meta/Google.

## Problems Identified

### 1. Session Data Loss (HIGH SEVERITY)
**Impact:** Users lost ALL entered campaign data when navigating away from wizard

**Root Cause:**
```typescript
// wizard-client.tsx - OLD CODE
useEffect(() => {
  const editCampaignId = searchParams.get('edit');
  if (editCampaignId) {
    loadCampaign(editCampaignId);
  } else {
    reset();  // ❌ ALWAYS called, wiping persisted data!
  }
}, [searchParams, reset, loadCampaign]);
```

**Why it failed:**
1. Zustand persist middleware correctly saved data to `localStorage`
2. When user navigated to /dashboard then back to /campaigns/new
3. Component remounted → `useEffect` ran → `reset()` called
4. Persisted data wiped BEFORE user could see it
5. Result: Empty wizard, frustrated users

### 2. Duplicate Draft Creation (MEDIUM SEVERITY)
**Impact:** localStorage polluted with duplicate campaigns

**Root Cause:**
```typescript
// wizard-container.tsx - OLD CODE
const existingCampaigns = JSON.parse(localStorage.getItem('campaigns') || '[]');
existingCampaigns.push(fullCampaignData);  // ❌ Always pushes, never checks
localStorage.setItem('campaigns', JSON.stringify(existingCampaigns));
```

**Why it failed:**
- No check if draft with same ID already exists
- Each "Save Draft" click created new entry
- Campaign list showed duplicates
- Data integrity compromised

### 3. No Campaign Name Validation (MEDIUM SEVERITY)
**Impact:** Users could create infinite campaigns with identical names

**Root Cause:**
- No uniqueness validation in Step 1
- Database allows duplicates (no UNIQUE constraint)
- Poor UX and data quality

## Solutions Implemented

### Fix 1: Smart Reset Logic

**File:** `app/(dashboard)/campaigns/new/wizard-client.tsx`

```typescript
// NEW CODE
const { currentStep, savedCampaignId, reset, loadCampaign } = useWizardStore();

useEffect(() => {
  const editCampaignId = searchParams.get('edit');

  if (editCampaignId) {
    // Load existing campaign for editing
    loadCampaign(editCampaignId);
  } else if (!savedCampaignId) {
    // ✅ Only reset if we don't have an in-progress draft
    // If savedCampaignId exists, user is working on a draft - preserve it
    reset();
  }
  // Otherwise, preserve the in-progress wizard session (draft in progress)
}, [searchParams, reset, loadCampaign, savedCampaignId]);
```

**How it works:**
1. Check if `?edit=` parameter exists → Load that campaign
2. Check if `savedCampaignId` exists (draft in progress) → Preserve session
3. Otherwise → Fresh wizard, safe to reset

**Benefits:**
- ✅ Preserves user work across navigation
- ✅ Still supports edit mode correctly
- ✅ Only resets when truly starting fresh
- ✅ Respects Zustand persistence

### Fix 2: Upsert Pattern for Drafts

**File:** `components/campaign-wizard/wizard-container.tsx`

```typescript
// NEW CODE - Upsert instead of blind push
const existingCampaigns = JSON.parse(localStorage.getItem('campaigns') || '[]');
const existingIndex = existingCampaigns.findIndex((c: any) => c.id === campaignId.toString());

if (existingIndex !== -1) {
  // Update existing draft
  existingCampaigns[existingIndex] = fullCampaignData;
} else {
  // Add new draft
  existingCampaigns.push(fullCampaignData);
}

localStorage.setItem('campaigns', JSON.stringify(existingCampaigns));
```

**How it works:**
1. Find existing campaign with same ID
2. If found → Update in place (no duplicate)
3. If not found → Add new entry
4. Classic **upsert** pattern (UPDATE or INSERT)

**Benefits:**
- ✅ No duplicate drafts
- ✅ Clean localStorage
- ✅ Proper data integrity
- ✅ Idempotent operation (safe to call multiple times)

### Fix 3: Campaign Name Uniqueness Validation

**File:** `lib/stores/wizard-store.ts`

```typescript
// NEW CODE - In validateStep case 1:
} else {
  // Check for duplicate campaign names (unless editing existing campaign)
  try {
    const stored = localStorage.getItem('campaigns');
    if (stored) {
      const campaigns = JSON.parse(stored);
      const duplicate = campaigns.find((c: any) =>
        c.name.toLowerCase() === state.campaignName.toLowerCase() &&
        c.id !== state.savedCampaignId?.toString()
      );
      if (duplicate) {
        errors.campaignName = ['A campaign with this name already exists. Please choose a unique name.'];
      }
    }
  } catch (error) {
    console.error('Error checking campaign name uniqueness:', error);
  }
}
```

**How it works:**
1. Convert both names to lowercase (case-insensitive)
2. Check if any campaign has matching name
3. Exclude current campaign when editing (allow keeping same name)
4. Show clear error message if duplicate found

**Benefits:**
- ✅ Prevents duplicate names
- ✅ Case-insensitive matching ("Test" === "test")
- ✅ Allows editing existing campaigns without conflict
- ✅ Clear, actionable error message
- ✅ Blocks progression at validation layer

## Testing Scenarios

### Scenario 1: Draft Persistence
```
1. Go to /campaigns/new
2. Enter campaign name "Test Draft"
3. Click "Save Draft"
4. Navigate to /dashboard
5. Navigate back to /campaigns/new
6. ✅ Should see "Test Draft" and all data preserved
```

### Scenario 2: Edit Mode
```
1. From /campaigns, click on existing campaign
2. URL should be /campaigns/new?edit=123
3. ✅ Should see all campaign data loaded
4. Make changes
5. Save
6. ✅ Should update, not create duplicate
```

### Scenario 3: Duplicate Name Prevention
```
1. Create campaign named "Summer Sale"
2. Launch it
3. Create new campaign
4. Try to name it "summer sale" (different case)
5. ✅ Should show error: "A campaign with this name already exists"
6. Cannot proceed to next step
```

### Scenario 4: Multiple Draft Saves
```
1. Start new campaign
2. Enter some data
3. Click "Save Draft" 3 times
4. Go to /campaigns
5. ✅ Should see only ONE draft, not three duplicates
```

## Technical Decisions

### Why Upsert Instead of Delete + Insert?
```typescript
// ❌ BAD: Delete + Insert
const filtered = existingCampaigns.filter(c => c.id !== campaignId);
filtered.push(newCampaign);

// ✅ GOOD: Upsert
const index = existingCampaigns.findIndex(c => c.id === campaignId);
if (index !== -1) {
  existingCampaigns[index] = newCampaign;  // Preserve array order
} else {
  existingCampaigns.push(newCampaign);
}
```

**Benefits:**
- Preserves array order (stable UI)
- Single source of truth
- Standard database pattern
- More maintainable

### Why Check savedCampaignId Instead of Persisted Data?
```typescript
// Could have done this:
const persistedData = localStorage.getItem('campaign-wizard-storage');
if (!persistedData) reset();

// But we do this:
if (!savedCampaignId) reset();
```

**Reasoning:**
- `savedCampaignId` is part of wizard state
- More semantic (tells us "is there a draft in progress?")
- Already available in store
- Less dependent on storage implementation details
- Cleaner dependency injection

### Why Case-Insensitive Name Matching?
```typescript
c.name.toLowerCase() === state.campaignName.toLowerCase()
```

**Reasoning:**
- Users expect "Test" and "test" to be the same
- Follows user expectations from Google Ads, Facebook Ads
- Prevents confusion
- Standard practice in enterprise systems

## Migration Notes

### For Existing Drafts
Old drafts created before this fix may have duplicates. To clean up:

```javascript
// Run in browser console on /campaigns
function deduplicateDrafts() {
  const campaigns = JSON.parse(localStorage.getItem('campaigns') || '[]');
  const seen = new Map();
  const deduplicated = [];

  campaigns.forEach(campaign => {
    if (!seen.has(campaign.id)) {
      seen.set(campaign.id, true);
      deduplicated.push(campaign);
    }
  });

  localStorage.setItem('campaigns', JSON.stringify(deduplicated));
  console.log(`Removed ${campaigns.length - deduplicated.length} duplicates`);
  window.location.reload();
}

deduplicateDrafts();
```

## Monitoring & Metrics

Track these metrics to validate fix effectiveness:

1. **Draft Completion Rate**: % of saved drafts that get launched
2. **Duplicate Campaign Names**: Should trend to 0
3. **Session Persistence**: Track wizard exits → returns with data preserved
4. **localStorage Size**: Should not grow indefinitely

## Future Improvements

1. **Server-Side Validation**
   - Move uniqueness check to API
   - More reliable than localStorage check
   - Handles concurrent users

2. **Soft Deletes**
   - Don't actually delete drafts
   - Add `deletedAt` timestamp
   - Allow recovery

3. **Draft Expiration**
   - Auto-delete drafts older than 30 days
   - Prevent localStorage bloat

4. **Conflict Resolution**
   - Handle case where draft saved in localStorage but deleted in DB
   - Show merge UI if needed

## Summary

These fixes address fundamental data integrity and UX issues using industry-standard patterns:

1. **Smart Reset** → Preserves user work
2. **Upsert Pattern** → Prevents duplicates
3. **Name Validation** → Enforces data quality

Result: **Reliable, professional campaign management** that respects user input and maintains data integrity.
