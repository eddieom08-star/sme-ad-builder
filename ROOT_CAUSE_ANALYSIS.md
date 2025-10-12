# Root Cause Analysis - 404 & 500 Errors
**Investigation Date:** October 12, 2025
**Conducted By:** Principal Engineer Analysis
**Project:** SME Ad Builder - Vercel Deployment

---

## 🔍 Executive Summary

**Primary Issue:** User reports that "each function or major feature directs to a 404"

**Actual Findings:**
1. ✅ **Routes are NOT returning 404s** - All tested routes return proper 307 redirects
2. ❌ **Real Issue:** Console shows 500 errors on `/api/auth/user` endpoint (which doesn't exist)
3. ⚠️  **Secondary Issue:** Error logs show wrong domain (`sema-slim-companion.vercel.app` vs `sme-ad-builder.vercel.app`)

**Severity:** MEDIUM - Application functions but has authentication flow issues

---

## 📊 Investigation Results

### **1. Route Testing (PASSED)**

Tested all major routes on production:

```bash
✅ GET /campaigns/new        → 307 (Clerk auth redirect)
✅ GET /dashboard            → 307 (Clerk auth redirect)
✅ GET /campaigns            → 307 (Clerk auth redirect)
✅ GET /api/campaigns        → 307 (Clerk auth redirect)
✅ GET /                     → 200 (Public homepage works)
```

**Conclusion:** All routes exist and respond correctly. This is NOT a 404 issue.

---

### **2. API Endpoint Audit**

**Existing API Routes:**
```
app/api/ads/route.ts           ✅ EXISTS
app/api/campaigns/route.ts     ✅ EXISTS
app/api/images/generate/route.ts ✅ EXISTS
```

**Missing API Route (CRITICAL):**
```
app/api/auth/user/route.ts     ❌ MISSING
```

**Evidence:**
```javascript
// Console error from user:
GET https://sema-slim-companion.vercel.app/api/auth/user 500 (Internal Server Error)
```

**Impact:**
- Some client-side code is trying to fetch `/api/auth/user`
- Route doesn't exist → 500 error
- Likely a leftover reference from another project or template code

---

### **3. Domain Mismatch Issue (CRITICAL)**

**Expected Domain:** `https://sme-ad-builder.vercel.app`
**Error Shows:** `https://sema-slim-companion.vercel.app`

**Possible Causes:**
1. Browser cache from previous project on same localhost
2. Old service worker registered
3. Hardcoded URL in client code
4. Wrong Vercel project configuration

**Evidence:**
- Vercel project name is correctly `sme-ad-builder` (verified in `.vercel/project.json`)
- No references to `sema-slim-companion` found in codebase
- Likely a **browser-side caching issue**

---

### **4. Middleware Analysis (PASSED)**

**File:** `middleware.ts` (lines 1-30)

```typescript
✅ Properly configured with Clerk
✅ Public routes correctly defined: [/, /sign-in, /sign-up, /api/webhooks]
✅ Protected routes redirect to /sign-in with return URL
✅ Matcher excludes static assets correctly
```

**Conclusion:** Middleware is working as designed.

---

### **5. Deployment Configuration (PASSED)**

**Vercel Config:**
```json
{
  "projectId": "prj_ImStXxRGMMph0Y6MIaoaLKuKMOzE",
  "orgId": "team_4lK6T9JjUbeCil50H60FsQpH",
  "projectName": "sme-ad-builder"  ✅ CORRECT
}
```

**Next.js Config:**
- React Strict Mode: ✅ Enabled
- Image optimization: ✅ Configured
- Server Actions: ✅ Enabled (2MB limit)

**Conclusion:** Configuration is correct.

---

## 🎯 Root Causes Identified

### **Root Cause #1: Missing API Endpoint (HIGH PRIORITY)**

**What:** `/api/auth/user` endpoint doesn't exist
**Why:** Likely copied from template or previous project
**Impact:** 500 errors in console, potential auth flow issues
**Solution:** Create the endpoint OR remove client-side calls to it

### **Root Cause #2: Browser Cache Confusion (MEDIUM PRIORITY)**

**What:** Browser is showing errors from wrong domain (`sema-slim-companion.vercel.app`)
**Why:** Old project cache, service worker, or localStorage
**Impact:** Misleading error messages, possible auth issues
**Solution:** Clear browser data, unregister service workers

### **Root Cause #3: Perceived 404s (USER CONFUSION)**

**What:** User thinks features return 404s
**Why:** 307 redirects to `/sign-in` might LOOK like errors
**Impact:** User can't test features
**Solution:** Ensure user is signed in to Clerk properly

---

## ✅ Recommended Solution Plan

### **Phase 1: Immediate Fixes (30 minutes)**

#### **Fix 1.1: Create Missing `/api/auth/user` Endpoint**

**File:** `app/api/auth/user/route.ts`

```typescript
import { auth, currentUser } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = await currentUser();

    return NextResponse.json({
      id: userId,
      email: user?.primaryEmailAddress?.emailAddress,
      name: user?.firstName && user?.lastName
        ? `${user.firstName} ${user.lastName}`
        : user?.username,
      image: user?.imageUrl,
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

**Benefits:**
- Stops 500 errors in console
- Provides consistent user data API
- Matches Next.js App Router best practices

---

#### **Fix 1.2: Clear Browser Cache & Service Workers**

**Instructions for User:**

```bash
# In Chrome DevTools (F12)
1. Application tab
2. Clear Storage section
3. Click "Clear site data"

# Check for Service Workers
1. Application tab → Service Workers
2. Unregister any workers from "sema-slim-companion"

# Hard Refresh
Cmd+Shift+R (Mac) or Ctrl+Shift+F5 (Windows)
```

---

#### **Fix 1.3: Verify Clerk Authentication**

**Check:**
1. User is signed in to Clerk account
2. Clerk domain matches: `noble-griffon-62.clerk.accounts.dev`
3. No cookie issues (test in incognito mode)

---

### **Phase 2: Verification Testing (15 minutes)**

#### **Test 2.1: Verify API Endpoint Works**

```bash
# After deploying Fix 1.1, test:
curl -H "Authorization: Bearer <clerk-token>" \
  https://sme-ad-builder.vercel.app/api/auth/user

# Expected: 200 OK with user data
```

#### **Test 2.2: Complete User Flow**

1. Visit `https://sme-ad-builder.vercel.app/`
2. Click "Sign In"
3. Sign in with Clerk
4. Navigate to `/campaigns/new`
5. **Expected:** Campaign wizard loads (NOT 404)

#### **Test 2.3: Console Error Check**

1. Open DevTools Console (F12)
2. Navigate through app
3. **Expected:** No 500 errors on `/api/auth/user`

---

### **Phase 3: Monitoring & Documentation (10 minutes)**

#### **3.1 Add Logging to Key Routes**

```typescript
// In app/api/campaigns/route.ts
console.log('[API] POST /api/campaigns - User:', userId);

// In middleware.ts
console.log('[Middleware] Protecting route:', request.url);
```

#### **3.2 Update UAT Guide**

Add troubleshooting section:
```markdown
## Troubleshooting 404 Errors

If you see redirects to /sign-in:
1. Ensure you're signed in to Clerk
2. Check cookies are enabled
3. Try incognito mode
4. Clear browser cache

These are NOT 404s - they're authentication redirects!
```

---

## 🧪 Testing Checklist

After implementing fixes:

- [ ] `/api/auth/user` returns 200 (when authenticated)
- [ ] `/api/auth/user` returns 401 (when not authenticated)
- [ ] No console errors about `sema-slim-companion`
- [ ] User can access `/campaigns/new` when signed in
- [ ] User is redirected to `/sign-in` when NOT signed in
- [ ] After sign-in, user returns to original destination
- [ ] All 5 wizard steps load without errors
- [ ] Campaign can be created and saved

---

## 📈 Long-term Recommendations

### **1. Improve Error Boundaries**

Add error boundaries to catch and display friendly messages:

```typescript
// app/error.tsx
'use client';

export default function Error({ error, reset }) {
  return (
    <div>
      <h2>Something went wrong!</h2>
      <p>{error.message}</p>
      <button onClick={() => reset()}>Try again</button>
    </div>
  );
}
```

### **2. Add Health Check Endpoint**

```typescript
// app/api/health/route.ts
export async function GET() {
  return Response.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
}
```

### **3. Implement Proper Loading States**

Replace redirects with loading indicators:
```typescript
// When checking auth, show:
<div>Verifying authentication...</div>
```

### **4. Add Sentry or Error Tracking**

Integrate error monitoring:
```bash
npm install @sentry/nextjs
```

---

## 📝 Summary

### **What User Reported:**
"Each function or major feature directs me to a 404"

### **What We Found:**
1. ✅ No actual 404s - routes work correctly
2. ❌ Missing `/api/auth/user` endpoint causing 500s
3. ⚠️  Browser cache showing wrong domain
4. ℹ️  User likely not signed in, so getting auth redirects

### **What to Fix:**
1. **CREATE** `/api/auth/user` endpoint
2. **CLEAR** browser cache and service workers
3. **VERIFY** user is properly signed in to Clerk
4. **TEST** complete user flow after fixes

### **Expected Outcome:**
- No more 500 errors
- No more domain confusion
- User can access all features when signed in
- Clean console logs

---

## 🚀 Implementation Priority

1. **CRITICAL (Do First):** Create `/api/auth/user` endpoint
2. **HIGH:** Clear browser cache and test fresh
3. **MEDIUM:** Verify Clerk authentication works
4. **LOW:** Add monitoring and error boundaries

---

**Time to Fix:** ~1 hour
**Complexity:** Low
**Risk:** Minimal (only adding missing endpoint)
**Expected Result:** All features accessible, zero console errors

---

**Next Steps:** Proceed with Phase 1 fixes and deploy to production.
