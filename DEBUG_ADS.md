# Debugging: Ad Creatives Not Showing

## Quick Checks

### 1. Check localStorage in Browser Console

Open DevTools (F12 or Cmd+Option+I on Mac) and run these commands:

```javascript
// Check if ads exist in localStorage
console.log('Ads:', JSON.parse(localStorage.getItem('ads') || '[]'));

// Check if campaigns exist
console.log('Campaigns:', JSON.parse(localStorage.getItem('campaigns') || '[]'));

// Check wizard state
console.log('Wizard:', JSON.parse(localStorage.getItem('campaign-wizard-storage') || '{}'));
```

### 2. Check Campaign Creation Flow

When creating a campaign, watch the Console tab for these messages:
- Any errors from `/api/ads` endpoint
- "Failed to create ad:" messages
- Check Network tab for POST requests to `/api/ads`

### 3. Verify Ad Structure

The wizard creates ads with this structure:
```javascript
{
  id: "1234",
  campaignId: "5678",
  name: "Campaign Name - facebook - image",
  format: "image",
  platform: "facebook",
  headline: "Your headline",
  body: "Your primary text",
  callToAction: "Learn More",
  imageUrl: "https://...",
  targetUrl: "https://...",
  status: "active",
  createdAt: "2025-10-12T...",
  impressions: 0,
  clicks: 0,
  spend: "0.00"
}
```

## Common Issues

### Issue 1: No Ads in localStorage
**Symptom:** `localStorage.getItem('ads')` returns `null` or `[]`

**Causes:**
1. Campaign was created before ad-saving feature was deployed
2. Ad creation failed silently
3. Browser localStorage was cleared

**Solution:** Create a NEW campaign after latest deployment

### Issue 2: Ads Exist but Don't Display
**Symptom:** localStorage shows ads but `/ads` page is empty

**Causes:**
1. Component not reading localStorage correctly
2. Loading state stuck
3. TypeScript type mismatch

**Debug:**
```javascript
// In /ads page, check if AdsListClient is loading
// Look for "Loading ads..." text
// If stuck, check browser console for errors
```

### Issue 3: Wizard Not Creating Ads
**Symptom:** Campaign launches but no ads saved

**Causes:**
1. `ads` array in wizard store is empty
2. API endpoint `/api/ads` returning errors
3. Ad validation failing

**Debug:**
Check wizard store before launching:
```javascript
// In browser console on Step 5 (Review)
const wizardState = JSON.parse(localStorage.getItem('campaign-wizard-storage') || '{}');
console.log('Ads in wizard:', wizardState.ads);
```

## Manual Fix: Add Test Ad Data

If you need to test the ads page immediately, run this in browser console:

```javascript
const testAds = [
  {
    id: "test-001",
    campaignId: "1234",
    name: "Test Campaign - Facebook - Image",
    format: "image",
    platform: "facebook",
    headline: "Summer Sale - 50% Off",
    body: "Don't miss our biggest sale of the year. Shop now and save!",
    callToAction: "Shop Now",
    imageUrl: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1200",
    targetUrl: "https://example.com",
    status: "active",
    createdAt: new Date().toISOString(),
    impressions: 1234,
    clicks: 56,
    spend: "12.50"
  },
  {
    id: "test-002",
    campaignId: "1234",
    name: "Test Campaign - Instagram - Story",
    format: "story",
    platform: "instagram",
    headline: "New Arrivals",
    body: "Check out our latest collection. Limited time offer!",
    callToAction: "Learn More",
    imageUrl: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200",
    targetUrl: "https://example.com",
    status: "active",
    createdAt: new Date().toISOString(),
    impressions: 2345,
    clicks: 123,
    spend: "23.75"
  }
];

// Save to localStorage
localStorage.setItem('ads', JSON.stringify(testAds));

// Reload page
location.reload();
```

## Expected Behavior

After creating a campaign with 1 ad creative:

1. **Dashboard** should show:
   - Active Campaigns: 1
   - Total Ads: 1
   - Recent campaign listed
   - Recent ad listed

2. **Campaigns page** should show:
   - 1 campaign card with details

3. **Ads page** should show:
   - Total Ads: 1
   - Active: 1
   - Ad card with image, headline, body, stats

## Next Steps

1. **Clear all localStorage and start fresh:**
   ```javascript
   localStorage.clear();
   location.reload();
   ```

2. **Create a new test campaign:**
   - Go to `/campaigns/new`
   - Complete all 5 steps
   - Add at least 1 ad creative in Step 4
   - Click "Launch Campaign"

3. **Verify data was saved:**
   ```javascript
   console.log('Campaigns:', JSON.parse(localStorage.getItem('campaigns') || '[]').length);
   console.log('Ads:', JSON.parse(localStorage.getItem('ads') || '[]').length);
   ```

4. **Check all three pages:**
   - Dashboard: Should show 1 campaign, 1 ad
   - Campaigns: Should show 1 campaign
   - Ads: Should show 1 ad creative

## Report Back

If ads still don't show, please provide:
1. Screenshot of browser console showing localStorage data
2. Screenshot of Network tab showing /api/ads requests
3. Any error messages in console
4. Which step is failing (campaign creation, ad creation, or display)
