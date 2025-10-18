# Comprehensive Bug Analysis & Fix Plan

## Executive Summary

**Status**: 🔴 **CRITICAL** - 52 of 81 tests failing (64% failure rate)
**Root Cause**: Multiple overlapping issues with wizard state management
**Impact**: Production functionality likely broken for edit mode and draft loading

---

## Bug Categories

### 1. **Wizard Client Reset Logic** (PRIMARY ISSUE)
**File**: `app/(dashboard)/campaigns/new/wizard-client.tsx`

**Problem**: The useEffect was changed to ALWAYS reset when visiting `/campaigns/new` without edit param. This breaks:
- Direct calls to `loadCampaign()` in tests
- Zustand persist middleware rehydration
- Draft-in-progress preservation

**Current Code** (lines 18-34):
```typescript
useEffect(() => {
  if (initializedRef.current) return;
  initializedRef.current = true;

  const editCampaignId = searchParams.get('edit');

  if (editCampaignId) {
    loadCampaign(editCampaignId);
  } else if (!savedCampaignId) {
    reset(); // This runs even when tests call loadCampaign directly
  }
}, [searchParams, reset, loadCampaign, savedCampaignId]);
```

**Issue**: The `initializedRef` prevents multiple resets, BUT:
1. Tests don't mount the component, they call `loadCampaign()` directly on the store
2. When tests DO mount the component, the ref prevents proper cleanup between tests
3. The `savedCampaignId` check brings back the original race condition

---

### 2. **Test Infrastructure** (SECONDARY ISSUE)

**Problem**: Tests are not properly mocking Zustand's persist middleware

**Evidence**:
```typescript
beforeEach(() => {
  useWizardStore.getState().reset() // Calls reset
  // But persist middleware might rehydrate old state after this!
})
```

**Missing**:
- Proper persist middleware mocking
- localStorage clearing between tests
- Zustand store isolation

---

### 3. **Name Uniqueness Validation** (TERTIARY ISSUE)

**Tests Failing**:
- "should prevent duplicate campaign names when creating new draft" - Expected false, got true
- "should prevent renaming draft to existing campaign name" - Expected false, got true

**Problem**: The validation is checking `savedCampaignId` correctly, but tests are calling `setSavedCampaignId()` with a NUMBER while localStorage campaigns have STRING ids.

**Code** (wizard-store.ts:269):
```typescript
c.id !== state.savedCampaignId?.toString()
```

**Test** (draft-workflow.test.ts:240):
```typescript
result.current.setSavedCampaignId(1) // Number
```

**Campaigns in storage** (draft-workflow.test.ts:233):
```typescript
{ id: '1', name: 'My Campaign', status: 'draft' } // String
```

**Mismatch**: `1.toString() === '1'` but comparison happens before toString in some cases

---

## Failed Tests Breakdown

### Category A: loadCampaign() Not Working (5 tests)
1. "should load draft back into wizard" - campaignName is ""
2. "should load draft with associated ads" - ads array is []
3. "should edit loaded draft and save without duplicating" - can't load initial draft
4. "should complete full workflow" - can't reload after reset
5. Multiple wizard-client tests

**Root Cause**: wizard-client useEffect or persist middleware interfering

---

### Category B: Name Uniqueness Validation (2 tests)
1. "should prevent duplicate campaign names" - validation not triggering
2. "should prevent renaming draft to existing campaign name" - validation not triggering

**Root Cause**: ID type mismatch (number vs string)

---

### Category C: Component Rendering Tests (~45 tests)
Various rendering and interaction tests failing

**Root Cause**: Likely cascade failures from Category A issues

---

## Recommended Solution

### Option 1: **Revert to Simple Logic** (RECOMMENDED)
Go back to the working version before commit `9e27336`, but keep the `reset()` call in `wizard-container.tsx` after save.

**Pros**:
- Known working state
- Tests will pass
- Production functionality restored

**Cons**:
- User might still land on step 3 if they save draft and immediately click "Create Campaign" again

**Mitigation**: The `reset()` in wizard-container DOES clear the state. The issue was Zustand persist async save. We can add a small delay or force sync.

---

### Option 2: **Fix Test Infrastructure** (COMPLEX)
Properly mock Zustand persist middleware in all tests

**Pros**:
- Tests become more reliable
- Better isolation

**Cons**:
- Time-consuming
- Doesn't fix the actual user-facing "step 3" bug

---

### Option 3: **Hybrid Approach** (BALANCED)
1. Simplify wizard-client to original logic with savedCampaignId check
2. Add explicit localStorage.removeItem('campaign-wizard-storage') in wizard-container after save
3. Fix ID type consistency (always use strings)

**Implementation**:
```typescript
// wizard-container.tsx - after save
reset();
localStorage.removeItem('campaign-wizard-storage'); // Force clear persist
setTimeout(() => router.push('/campaigns'), 800);
```

```typescript
// wizard-client.tsx - revert to simple logic
useEffect(() => {
  const editCampaignId = searchParams.get('edit');

  if (editCampaignId) {
    loadCampaign(editCampaignId);
  } else if (!savedCampaignId) {
    reset();
  }
}, [searchParams, reset, loadCampaign, savedCampaignId]);
```

---

## Immediate Action Required

### Priority 1: Restore Test Suite
- 52 failing tests means we have NO regression protection
- Production bugs may exist that we don't know about
- CI/CD pipeline is red

### Priority 2: Fix User-Facing "Step 3" Bug
- User reported landing on step 3 instead of step 1
- This is the bug we were trying to fix
- Need solution that doesn't break tests

### Priority 3: Type Consistency
- Ensure all campaign IDs are consistently strings OR numbers
- Update wizard-store to use consistent types

---

## Decision Matrix

| Approach | Time | Risk | Test Pass Rate | User Bug Fixed |
|----------|------|------|----------------|----------------|
| Option 1: Revert | 10 min | Low | ~95% | Partial |
| Option 2: Fix Tests | 2-3 hours | Medium | ~100% | No |
| Option 3: Hybrid | 30 min | Low-Med | ~90% | Yes |

**Recommendation**: **Option 3 - Hybrid Approach**

---

## Implementation Plan (Option 3)

### Step 1: Revert wizard-client.tsx (5 min)
```bash
git show c541a5a:app/\(dashboard\)/campaigns/new/wizard-client.tsx > temp.tsx
# Review and apply selectively
```

### Step 2: Add Force Clear in wizard-container.tsx (2 min)
After `reset()` call, add:
```typescript
localStorage.removeItem('campaign-wizard-storage');
```

### Step 3: Fix ID Type Consistency (10 min)
Update all campaign ID usage to strings:
```typescript
// wizard-store.ts
savedCampaignId?: string; // Change from number

// wizard-container.tsx
setSavedCampaignId(campaignId.toString())

// loadCampaign function
savedCampaignId: campaign.id, // Already string
```

### Step 4: Run Tests (5 min)
```bash
npm test
```

### Step 5: Manual Testing (10 min)
1. Create campaign → Save draft → Check campaigns list (no duplicates)
2. Click "Create Campaign" → Should start at step 1
3. Edit draft → Changes save correctly
4. Delete draft → Cascades correctly

---

## Success Criteria

✅ All 81 tests passing
✅ No duplicate drafts created
✅ Wizard starts at step 1 for new campaigns
✅ Edit mode loads drafts correctly
✅ Name uniqueness validation works
✅ Cascading deletes work

---

**Created**: January 18, 2025
**Status**: Awaiting implementation decision
**Severity**: Critical
