# UAT Guide - Campaign Wizard

**Deployment URL:** https://sme-ad-builder.vercel.app/
**UAT Date:** October 12, 2025
**Version:** Complete 5-Step Campaign Wizard

---

## 🎯 What to Test

This UAT covers the complete campaign creation wizard from start to finish.

---

## 📋 Pre-Test Setup

1. **Access the Application**
   - URL: https://sme-ad-builder.vercel.app/
   - Sign in with your Clerk account
   - If not signed up, create an account (takes 30 seconds)

2. **Clear Browser Cache** (Optional but recommended)
   - Chrome: Cmd+Shift+Delete (Mac) or Ctrl+Shift+Delete (Windows)
   - Select "Cached images and files"
   - This ensures you're testing the latest version

---

## 🧪 Test Scenarios

### **Scenario 1: Complete Happy Path** ⭐ PRIORITY

**Goal:** Create a complete campaign from start to finish

**Steps:**

1. **Navigate to Campaigns**
   - Click "Campaigns" in sidebar
   - Should see empty state or list of campaigns
   - Click "New Campaign" button

2. **Step 1: Campaign Setup**
   - Enter campaign name: "UAT Test Campaign"
   - Select objective: "Conversions"
   - Select platforms: Facebook + Instagram
   - Click "Next"
   - ✅ **Expected:** Progress to Step 2, no errors

3. **Step 2: Audience Targeting**
   - Set age range: 25-45 using slider
   - Select gender: "All Genders"
   - Click "United States" and "United Kingdom" locations
   - Type "Fashion" and press Enter to add interest
   - Add "Technology" interest
   - ✅ **Expected:** See "Estimated Audience Size: ~1,000,000 people"
   - Click "Next"

4. **Step 3: Budget & Schedule**
   - Budget Type: Daily
   - Budget Amount: 50
   - Currency: USD
   - Start Date: Today
   - End Date: 30 days from today
   - Bid Strategy: "Lowest Cost"
   - ✅ **Expected:** See budget summary showing total budget
   - Click "Next"

5. **Step 4: Ad Creative**
   - Click "Create Ad" button
   - Platform: Facebook (pre-selected)
   - Format: Image
   - Click "Upload Media (Demo)" button
   - ✅ **Expected:** See sample image appear
   - Headline: "Summer Sale - 30% Off"
   - Primary Text: "Shop our collection today. Limited time offer!"
   - Call to Action: "Shop Now"
   - Destination URL: "https://example.com"
   - ✅ **Expected:** Character count shows (28/40 for headline)
   - Click "Next"

6. **Step 5: Review & Launch**
   - ✅ **Expected:** See green "Ready to launch!" banner
   - Review campaign overview
   - Review audience section
   - Review budget section
   - Review ad preview with image
   - Click "Launch Campaign" button
   - ✅ **Expected:**
     - Success toast appears
     - Redirects to campaign details page

**Success Criteria:**
- ✅ All steps complete without errors
- ✅ Campaign saves to database
- ✅ All data displays correctly in review
- ✅ Launch button works

---

### **Scenario 2: Validation Testing** 🔍

**Goal:** Ensure validation catches errors

**Steps:**

1. **Navigate to New Campaign**
   - Click "Campaigns" → "New Campaign"

2. **Test Empty Campaign Name**
   - Leave campaign name empty
   - Select objective and platforms
   - Click "Next"
   - ✅ **Expected:** Error message "Campaign name is required"
   - Should NOT progress to next step

3. **Test Short Campaign Name**
   - Enter "AB" (2 characters)
   - Click "Next"
   - ✅ **Expected:** Error "Campaign name must be at least 3 characters"

4. **Test No Platforms Selected**
   - Enter valid name
   - Select objective
   - Don't select any platforms
   - Click "Next"
   - ✅ **Expected:** Error "Select at least one platform"

5. **Fix Errors and Continue**
   - Enter: "Validation Test Campaign"
   - Select: Facebook
   - Click "Next"
   - ✅ **Expected:** Progress to Step 2

6. **Test Budget Validation**
   - Skip through to Step 3
   - Budget Amount: 2 (below minimum)
   - Click "Next"
   - ✅ **Expected:** Error "Minimum daily budget is $5"

7. **Test Invalid Date Range**
   - Set End Date before Start Date
   - Click "Next"
   - ✅ **Expected:** Error "End date must be after start date"

**Success Criteria:**
- ✅ All validation rules trigger correctly
- ✅ Error messages are clear and helpful
- ✅ Cannot proceed with invalid data

---

### **Scenario 3: Save Draft Functionality** 💾

**Goal:** Test draft saving

**Steps:**

1. **Start New Campaign**
   - Navigate to "New Campaign"

2. **Fill Step 1 Only**
   - Campaign name: "Draft Test Campaign"
   - Objective: "Traffic"
   - Platform: Google
   - Click "Save Draft" button (bottom left)
   - ✅ **Expected:** Toast "Draft saved" appears

3. **Navigate Away**
   - Click "Dashboard" in sidebar
   - Then click "Campaigns"
   - ✅ **Expected:** Should see draft campaign in list (if implemented)

4. **Return to Wizard**
   - Refresh page (Cmd+R or Ctrl+R)
   - Go back to "New Campaign"
   - ✅ **Expected:** Form data persists (from localStorage)

**Success Criteria:**
- ✅ Draft saves successfully
- ✅ Data persists in localStorage
- ✅ User can resume later

---

### **Scenario 4: Multi-Ad Creation** 🎨

**Goal:** Test creating multiple ads

**Steps:**

1. **Navigate to Step 4**
   - Complete Steps 1-3 with any valid data
   - Reach Step 4 (Ad Creative)

2. **Create First Ad**
   - Click "Create Ad"
   - Fill out ad details
   - Upload demo media
   - ✅ **Expected:** Ad appears in list

3. **Create Second Ad**
   - Click "Create Ad" again
   - Platform: Instagram
   - Format: Story
   - Fill different copy
   - ✅ **Expected:** Two ads show in list

4. **Switch Between Ads**
   - Click on first ad card
   - ✅ **Expected:** Form updates to show first ad details
   - Click on second ad card
   - ✅ **Expected:** Form shows second ad details

5. **Delete an Ad**
   - Click trash icon on first ad
   - ✅ **Expected:** Ad removed from list
   - Only second ad remains

**Success Criteria:**
- ✅ Can create multiple ads
- ✅ Can switch between ads
- ✅ Can delete ads
- ✅ Each ad maintains independent data

---

### **Scenario 5: Mobile Responsiveness** 📱

**Goal:** Ensure wizard works on mobile

**Device:** iPhone/Android or Chrome DevTools mobile view

**Steps:**

1. **Open in Mobile View**
   - Chrome DevTools: Cmd+Option+I (Mac) or F12 (Windows)
   - Click device icon (top left)
   - Select "iPhone 12 Pro"

2. **Navigate Through Wizard**
   - Complete all 5 steps
   - ✅ **Expected:** All elements visible and usable
   - ✅ **Expected:** No horizontal scrolling
   - ✅ **Expected:** Buttons are touch-friendly (min 44px)

3. **Test Touch Interactions**
   - Tap platform cards (should highlight)
   - Use slider for age range
   - Tap to add interests
   - ✅ **Expected:** All interactions work smoothly

**Success Criteria:**
- ✅ Layout adapts to mobile
- ✅ All text readable
- ✅ All buttons reachable
- ✅ Forms easy to fill

---

### **Scenario 6: Keyboard Navigation** ⌨️

**Goal:** Test accessibility

**Steps:**

1. **Navigate with Tab Key**
   - Start at Step 1
   - Press Tab repeatedly
   - ✅ **Expected:** Focus moves logically through fields
   - ✅ **Expected:** Focus indicator is visible

2. **Complete Form with Keyboard**
   - Use Tab to navigate
   - Use Space to select checkboxes/cards
   - Use Enter to click buttons
   - ✅ **Expected:** Can complete entire wizard without mouse

**Success Criteria:**
- ✅ All interactive elements are keyboard accessible
- ✅ Focus order is logical
- ✅ Can complete wizard keyboard-only

---

### **Scenario 7: Character Limits** 📝

**Goal:** Test platform-specific limits

**Steps:**

1. **Navigate to Step 4**
   - Create an ad
   - Platform: Facebook

2. **Test Headline Limit**
   - Type 50 characters in headline
   - ✅ **Expected:** Stops at 40 characters
   - ✅ **Expected:** Counter shows "40/40"

3. **Switch to Google**
   - Change platform to Google
   - ✅ **Expected:** Headline counter changes to "30"
   - ✅ **Expected:** Text truncates if over 30 chars

4. **Test Primary Text**
   - Fill primary text with 150 characters
   - ✅ **Expected:** Stops at platform limit
   - ✅ **Expected:** Counter updates in real-time

**Success Criteria:**
- ✅ Character limits enforce correctly
- ✅ Counters show accurate numbers
- ✅ Different limits per platform

---

## 🐛 Known Issues / Limitations

1. **Media Upload**
   - Currently demo only (adds Unsplash images)
   - Real upload coming in next phase

2. **AI Copy Generation**
   - Button present but disabled
   - Coming in next phase

3. **Campaign Editing**
   - Can only create new campaigns
   - Edit functionality coming soon

4. **Real Audience API**
   - Audience size is estimated/mocked
   - Real API integration planned

---

## 📊 What to Look For

### **Visual Quality**
- [ ] Clean, professional design
- [ ] Consistent spacing and alignment
- [ ] Icons appropriate and clear
- [ ] Colors accessible (good contrast)
- [ ] Typography readable

### **Functionality**
- [ ] All buttons work
- [ ] Forms submit correctly
- [ ] Validation triggers appropriately
- [ ] Navigation smooth between steps
- [ ] Data persists across steps

### **Performance**
- [ ] Pages load quickly (<3 seconds)
- [ ] No lag when typing
- [ ] Smooth animations
- [ ] No console errors (F12 → Console tab)

### **User Experience**
- [ ] Clear what to do next
- [ ] Error messages helpful
- [ ] Progress indicator accurate
- [ ] Can complete in ~9 minutes
- [ ] Feels professional

---

## 🚨 Bug Reporting Template

If you find issues, please report using this format:

```
**Issue Title:** Brief description

**Severity:** Critical / High / Medium / Low

**Steps to Reproduce:**
1. Go to...
2. Click on...
3. Enter...
4. See error

**Expected Behavior:**
What should happen

**Actual Behavior:**
What actually happened

**Screenshots:**
(Attach if possible)

**Browser/Device:**
Chrome 119 / Safari 17 / iPhone 14

**Console Errors:**
(Press F12, check Console tab, copy any red errors)
```

---

## ✅ Sign-Off Checklist

After testing, confirm:

- [ ] Scenario 1 (Happy Path) - PASSED
- [ ] Scenario 2 (Validation) - PASSED
- [ ] Scenario 3 (Save Draft) - PASSED
- [ ] Scenario 4 (Multi-Ad) - PASSED
- [ ] Scenario 5 (Mobile) - PASSED
- [ ] Scenario 6 (Keyboard) - PASSED
- [ ] Scenario 7 (Char Limits) - PASSED

**Overall Assessment:**
- [ ] Ready for Production
- [ ] Minor fixes needed
- [ ] Major fixes needed

---

## 📞 Support

**Issues:** Report bugs in GitHub Issues
**Questions:** Contact development team

---

**Happy Testing! 🚀**
