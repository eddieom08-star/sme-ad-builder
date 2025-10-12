# Campaign Data Storage - Important Information

## Where Are My Campaigns?

### **Current Implementation: localStorage**

Starting from commit `50cde1c`, campaigns are saved to **browser localStorage** when you click "Launch Campaign".

### **Why You Don't See Previous Campaigns:**

1. **Campaigns created BEFORE the localStorage feature** are not stored anywhere
   - The previous version only sent data to the API
   - Since the API is in mock mode, data wasn't persisted
   - Those campaigns are lost

2. **localStorage is browser-specific**
   - Data is stored per-browser, per-domain
   - If you switch browsers, you won't see campaigns
   - If you clear browser data, campaigns are deleted
   - Incognito mode has separate storage

### **How It Works Now:**

```javascript
// When you launch a campaign:
1. API returns mock campaign ID (e.g., 3847)
2. Full campaign data is saved to localStorage
3. localStorage.getItem('campaigns') contains JSON array

// Data stored:
{
  id: "3847",
  name: "Your Campaign Name",
  status: "active",
  budget: "100.00",
  budgetType: "daily",
  platforms: ["facebook", "instagram"],
  startDate: "2025-10-15",
  endDate: "2025-10-30",
  createdAt: "2025-10-12T14:30:00.000Z",
  targeting: { ... }
}
```

### **To See Your Campaigns:**

1. **Launch a NEW campaign** (after deployment completes)
2. The campaign will be saved to localStorage
3. Navigate to `/campaigns` to see it in the list
4. Campaign will persist until you:
   - Clear browser cache/cookies
   - Use a different browser
   - Use incognito mode

### **Testing Checklist:**

1. ✅ Wait for Vercel deployment to complete (check: https://vercel.com/dashboard)
2. ✅ Hard refresh the page (Cmd+Shift+R on Mac, Ctrl+Shift+F5 on Windows)
3. ✅ Create a NEW campaign through the wizard
4. ✅ Click "Launch Campaign"
5. ✅ You should see success page
6. ✅ Navigate to `/campaigns` in sidebar
7. ✅ **Your campaign should now be visible!**

### **For Production: Database Integration**

This localStorage approach is temporary for UAT testing. For production:

1. Set up PostgreSQL database (Neon, Supabase, etc.)
2. Add `DATABASE_URL` to Vercel environment variables
3. Uncomment database code in:
   - `app/api/campaigns/route.ts`
   - `app/api/ads/route.ts`
4. Remove localStorage saving code
5. Campaigns will persist permanently in database

### **Dashboard Integration**

The Dashboard page needs to be updated to show campaign data. Currently it shows:
- Static placeholder data
- Zero campaigns
- No metrics

To add campaigns to Dashboard:
1. Import `CampaignsListClient` or create similar component
2. Read from localStorage
3. Calculate real metrics
4. Display recent campaigns

### **Debugging: View Your localStorage Data**

Open browser DevTools (F12):
```javascript
// Console tab - run this:
console.log(JSON.parse(localStorage.getItem('campaigns') || '[]'))

// Or in Application tab:
Application → Local Storage → https://sme-ad-builder.vercel.app
Look for key: "campaigns"
```

### **Quick Fix: Manual Data Entry (Development Only)**

If you need to test with fake data:
```javascript
// In browser console:
const fakeCampaigns = [
  {
    id: "1001",
    name: "Test Campaign 1",
    description: "Test campaign for UAT",
    status: "active",
    budget: "50.00",
    budgetType: "daily",
    platforms: ["facebook", "instagram"],
    startDate: "2025-10-12",
    endDate: "2025-10-25",
    createdAt: "2025-10-12T10:00:00.000Z",
    targeting: {}
  }
];
localStorage.setItem('campaigns', JSON.stringify(fakeCampaigns));
location.reload(); // Refresh page
```

### **Next Steps:**

1. **Clear your browser's localStorage** to start fresh:
   ```
   DevTools (F12) → Application → Local Storage → Clear All
   ```

2. **Create a test campaign** using the wizard

3. **Verify it appears** in the campaigns list

4. **Report any issues** you encounter

---

**Note:** The previous campaigns you created are not recoverable since they weren't saved anywhere. You'll need to create new test campaigns after this deployment.
