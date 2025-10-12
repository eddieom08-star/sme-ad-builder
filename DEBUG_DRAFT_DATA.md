# Debugging Draft Campaign Data

## How to Check if Draft Data is Being Saved

After saving a draft, open your browser's Developer Console and run:

```javascript
// Check what draft campaigns are saved
const campaigns = JSON.parse(localStorage.getItem('campaigns') || '[]');
const drafts = campaigns.filter(c => c.status === 'draft');
console.log('Draft Campaigns:', drafts);

// Check the most recent draft
const latestDraft = drafts[drafts.length - 1];
console.log('Latest Draft Full Data:', latestDraft);
```

## Expected Draft Data Structure

A complete draft should have these fields:

```javascript
{
  id: "123",                      // Campaign ID
  name: "My Campaign",            // Campaign name
  description: "",                // Description
  status: "draft",                // Must be "draft"
  objective: "conversions",       // Campaign objective
  budget: "50.00",                // Budget amount
  budgetType: "daily",            // "daily" or "lifetime"
  currency: "USD",                // Currency code
  platforms: ["facebook"],        // Array of platforms
  startDate: "2025-01-01",        // ISO date string
  endDate: "2025-02-01",          // ISO date string
  bidStrategy: "lowest_cost",     // Bid strategy
  bidCap: undefined,              // Optional bid cap
  createdAt: "2025-01-01T...",    // ISO timestamp
  targeting: {
    ageMin: 18,
    ageMax: 65,
    genders: ["all"],
    locations: [                  // Full location objects
      {
        type: "country",
        name: "United States"
      }
    ],
    interests: ["Marketing"],
    behaviors: [],
    languages: ["English"]
  }
}
```

## Testing Draft Restoration

1. **Create a draft** with some data:
   - Fill in Campaign Name (e.g., "Test Draft")
   - Select Objective (e.g., "Conversions")
   - Choose Platform (e.g., "Facebook")
   - Click "Save Draft"

2. **Check it saved**:
   ```javascript
   const campaigns = JSON.parse(localStorage.getItem('campaigns') || '[]');
   const testDraft = campaigns.find(c => c.name === "Test Draft");
   console.log('Test Draft Data:', testDraft);
   ```

3. **Navigate away** - Go to /dashboard

4. **Return to campaigns** - Go to /campaigns

5. **Click on the draft** - Should open wizard with all data loaded

6. **Verify in console**:
   ```javascript
   // After clicking draft, check wizard store state
   // This should show your campaign data
   ```

## Common Issues

### Draft Opens But Shows Empty Wizard

**Cause**: The `loadCampaign()` function isn't being triggered or the campaign ID doesn't match.

**Debug**:
```javascript
// Check URL has ?edit= parameter
console.log('Current URL:', window.location.href);
// Should be: /campaigns/new?edit=123
```

### Some Fields Are Missing

**Cause**: Draft was saved before the fix. Delete old drafts.

**Fix**:
```javascript
// Clear all draft campaigns and start fresh
let campaigns = JSON.parse(localStorage.getItem('campaigns') || '[]');
campaigns = campaigns.filter(c => c.status !== 'draft');
localStorage.setItem('campaigns', JSON.stringify(campaigns));
console.log('Cleared all drafts. Create a new one.');
```

### Location Data Not Loading

**Cause**: Old drafts saved locations as strings instead of objects.

**Check**:
```javascript
const draft = campaigns.find(c => c.status === 'draft');
console.log('Location Format:', draft?.targeting?.locations);
// Should be: [{type: "country", name: "USA"}]
// NOT: ["USA"]
```

## Quick Test Script

Run this in console after saving a draft to verify all data:

```javascript
function verifyDraft() {
  const campaigns = JSON.parse(localStorage.getItem('campaigns') || '[]');
  const drafts = campaigns.filter(c => c.status === 'draft');

  if (drafts.length === 0) {
    console.error('❌ No drafts found');
    return;
  }

  const draft = drafts[drafts.length - 1];
  const required = ['id', 'name', 'objective', 'budget', 'budgetType', 'currency',
                    'platforms', 'startDate', 'endDate', 'bidStrategy', 'targeting'];

  const missing = required.filter(field => !draft[field]);

  if (missing.length > 0) {
    console.error('❌ Missing fields:', missing);
  } else {
    console.log('✅ Draft has all required fields');
  }

  console.log('Draft Data:', draft);
}

verifyDraft();
```
