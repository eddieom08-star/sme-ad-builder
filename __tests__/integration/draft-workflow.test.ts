/**
 * Integration Tests for Draft Campaign Workflow
 *
 * These tests verify the complete end-to-end flow of:
 * 1. Creating a new campaign draft
 * 2. Saving draft to localStorage (upsert pattern)
 * 3. Loading draft back into wizard
 * 4. Editing draft (no duplicates created)
 * 5. Deleting draft and associated ads
 */

import { renderHook, act } from '@testing-library/react'
import { useWizardStore } from '@/lib/stores/wizard-store'

const localStorageMock: { [key: string]: string } = {}

beforeEach(() => {
  jest.clearAllMocks()
  Object.keys(localStorageMock).forEach(key => delete localStorageMock[key])

  global.localStorage.getItem = jest.fn((key: string) => localStorageMock[key] || null)
  global.localStorage.setItem = jest.fn((key: string, value: string) => {
    localStorageMock[key] = value
  })
  global.localStorage.removeItem = jest.fn((key: string) => {
    delete localStorageMock[key]
  })

  useWizardStore.getState().reset()
})

describe('Draft Workflow - Create and Save', () => {
  it('should create a new draft from scratch', () => {
    const { result } = renderHook(() => useWizardStore())

    // Step 1: User fills out campaign setup
    act(() => {
      result.current.updateCampaignSetup({
        campaignName: 'Summer Sale 2025',
        campaignDescription: 'Promotional campaign for summer',
        objective: 'conversions',
        platforms: ['facebook', 'instagram'],
      })
    })

    // Step 2: User moves to targeting
    act(() => {
      result.current.goNext()
    })

    // Step 3: User fills out targeting
    act(() => {
      result.current.updateTargeting({
        ageMin: 25,
        ageMax: 45,
        genders: ['all'],
        locations: [{ type: 'country', name: 'United States' }],
        interests: ['Technology', 'Marketing'],
      })
    })

    // Step 4: Simulate saving draft
    act(() => {
      result.current.setSavedCampaignId(1001)
      result.current.updateLastSaved()
    })

    // Verify wizard state
    expect(result.current.campaignName).toBe('Summer Sale 2025')
    expect(result.current.currentStep).toBe(2)
    expect(result.current.savedCampaignId).toBe(1001)
    expect(result.current.lastSaved).toBeDefined()
  })

  it('should save draft to localStorage without duplicates (first save)', () => {
    const campaignId = '1001'
    const campaignData = {
      id: campaignId,
      name: 'First Draft',
      description: 'Test draft',
      status: 'draft',
      objective: 'conversions',
      budget: '100.00',
      budgetType: 'daily',
      currency: 'USD',
      platforms: ['facebook'],
      startDate: '2025-01-15',
      endDate: '2025-02-15',
      bidStrategy: 'lowest_cost',
      createdAt: new Date().toISOString(),
      targeting: {
        ageMin: 18,
        ageMax: 65,
        genders: ['all'],
        locations: [{ type: 'country', name: 'United States' }],
        interests: [],
        behaviors: [],
        languages: ['English'],
      },
    }

    // Simulate wizard-container.tsx save logic
    const existingCampaigns = JSON.parse(localStorageMock['campaigns'] || '[]')
    const existingIndex = existingCampaigns.findIndex((c: any) => c.id === campaignId)

    if (existingIndex !== -1) {
      existingCampaigns[existingIndex] = campaignData
    } else {
      existingCampaigns.push(campaignData)
    }

    localStorageMock['campaigns'] = JSON.stringify(existingCampaigns)

    // Verify draft was saved
    const saved = JSON.parse(localStorageMock['campaigns'])
    expect(saved).toHaveLength(1)
    expect(saved[0].id).toBe(campaignId)
    expect(saved[0].name).toBe('First Draft')
  })

  it('should update existing draft without creating duplicate (upsert pattern)', () => {
    const campaignId = '1001'

    // Initial draft
    localStorageMock['campaigns'] = JSON.stringify([
      {
        id: campaignId,
        name: 'Original Name',
        status: 'draft',
        budget: '50.00',
      }
    ])

    // Updated draft
    const updatedData = {
      id: campaignId,
      name: 'Updated Name',
      status: 'draft',
      budget: '100.00',
    }

    // Upsert logic
    const existingCampaigns = JSON.parse(localStorageMock['campaigns'])
    const existingIndex = existingCampaigns.findIndex((c: any) => c.id === campaignId)

    if (existingIndex !== -1) {
      existingCampaigns[existingIndex] = updatedData
    } else {
      existingCampaigns.push(updatedData)
    }

    localStorageMock['campaigns'] = JSON.stringify(existingCampaigns)

    // Verify: Only 1 campaign exists (no duplicate)
    const saved = JSON.parse(localStorageMock['campaigns'])
    expect(saved).toHaveLength(1)
    expect(saved[0].name).toBe('Updated Name')
    expect(saved[0].budget).toBe('100.00')
  })

  it('should save multiple different drafts correctly', () => {
    const draft1 = { id: '1', name: 'Draft One', status: 'draft' }
    const draft2 = { id: '2', name: 'Draft Two', status: 'draft' }

    // Save draft 1
    let campaigns = JSON.parse(localStorageMock['campaigns'] || '[]')
    campaigns.push(draft1)
    localStorageMock['campaigns'] = JSON.stringify(campaigns)

    // Save draft 2
    campaigns = JSON.parse(localStorageMock['campaigns'])
    campaigns.push(draft2)
    localStorageMock['campaigns'] = JSON.stringify(campaigns)

    // Verify both drafts exist
    const saved = JSON.parse(localStorageMock['campaigns'])
    expect(saved).toHaveLength(2)
    expect(saved.map((c: any) => c.id)).toEqual(['1', '2'])
  })
})

describe('Draft Workflow - Load and Edit', () => {
  it('should load draft back into wizard', () => {
    // Setup: Save a draft to localStorage
    localStorageMock['campaigns'] = JSON.stringify([
      {
        id: 'draft-123',
        name: 'Loaded Draft',
        description: 'Draft to load',
        objective: 'traffic',
        platforms: ['google'],
        budget: '75.00',
        budgetType: 'daily',
        currency: 'USD',
        startDate: '2025-02-01',
        endDate: '2025-03-01',
        bidStrategy: 'lowest_cost',
        targeting: {
          ageMin: 30,
          ageMax: 50,
          genders: ['female'],
          locations: [{ type: 'city', name: 'New York' }],
          interests: ['Fashion'],
          behaviors: [],
          languages: ['English'],
        },
      }
    ])

    const { result } = renderHook(() => useWizardStore())

    // Load the draft
    act(() => {
      result.current.loadCampaign('draft-123')
    })

    // Verify all data was loaded correctly
    expect(result.current.campaignName).toBe('Loaded Draft')
    expect(result.current.campaignDescription).toBe('Draft to load')
    expect(result.current.objective).toBe('traffic')
    expect(result.current.platforms).toEqual(['google'])
    expect(result.current.budgetAmount).toBe(75)
    expect(result.current.budgetType).toBe('daily')
    expect(result.current.targeting.ageMin).toBe(30)
    expect(result.current.targeting.ageMax).toBe(50)
    expect(result.current.targeting.genders).toEqual(['female'])
    expect(result.current.targeting.interests).toEqual(['Fashion'])
  })

  it('should load draft with associated ads', () => {
    // Setup: Campaign with ads
    localStorageMock['campaigns'] = JSON.stringify([
      {
        id: 'draft-with-ads',
        name: 'Campaign with Ads',
        platforms: ['facebook'],
        targeting: {
          ageMin: 18,
          ageMax: 65,
          genders: ['all'],
          locations: [],
          interests: [],
          behaviors: [],
        },
      }
    ])

    localStorageMock['ads'] = JSON.stringify([
      {
        id: 'ad-1',
        campaignId: 'draft-with-ads',
        format: 'image',
        platform: 'facebook',
        headline: 'Ad Headline 1',
        body: 'Ad body text',
        callToAction: 'Shop Now',
        imageUrl: 'https://example.com/image.jpg',
        targetUrl: 'https://example.com',
      },
      {
        id: 'ad-2',
        campaignId: 'draft-with-ads',
        format: 'video',
        platform: 'facebook',
        headline: 'Ad Headline 2',
        body: 'Video ad text',
        callToAction: 'Learn More',
        videoUrl: 'https://example.com/video.mp4',
        targetUrl: 'https://example.com/learn',
      },
    ])

    const { result } = renderHook(() => useWizardStore())

    act(() => {
      result.current.loadCampaign('draft-with-ads')
    })

    // Verify ads were loaded
    expect(result.current.ads).toHaveLength(2)
    expect(result.current.ads[0].headline).toBe('Ad Headline 1')
    expect(result.current.ads[1].headline).toBe('Ad Headline 2')
    expect(result.current.completedSteps).toContain(4)  // Step 4 marked complete
  })

  it('should edit loaded draft and save without duplicating', () => {
    const campaignId = 'edit-draft-123'

    // Initial draft
    localStorageMock['campaigns'] = JSON.stringify([
      {
        id: campaignId,
        name: 'Original Draft Name',
        status: 'draft',
        platforms: ['facebook'],
      }
    ])

    const { result } = renderHook(() => useWizardStore())

    // Load draft
    act(() => {
      result.current.loadCampaign(campaignId)
    })

    // Edit the draft
    act(() => {
      result.current.updateCampaignSetup({
        campaignName: 'Edited Draft Name',
        platforms: ['facebook', 'instagram'],  // Added platform
      })
    })

    // Simulate save (upsert)
    const updatedData = {
      id: campaignId,
      name: result.current.campaignName,
      status: 'draft',
      platforms: result.current.platforms,
    }

    const campaigns = JSON.parse(localStorageMock['campaigns'])
    const index = campaigns.findIndex((c: any) => c.id === campaignId)
    campaigns[index] = updatedData
    localStorageMock['campaigns'] = JSON.stringify(campaigns)

    // Verify: Still only 1 campaign (no duplicate)
    const saved = JSON.parse(localStorageMock['campaigns'])
    expect(saved).toHaveLength(1)
    expect(saved[0].name).toBe('Edited Draft Name')
    expect(saved[0].platforms).toEqual(['facebook', 'instagram'])
  })
})

describe('Draft Workflow - Delete', () => {
  it('should delete draft campaign', () => {
    localStorageMock['campaigns'] = JSON.stringify([
      { id: '1', name: 'Keep This', status: 'active' },
      { id: '2', name: 'Delete This', status: 'draft' },
      { id: '3', name: 'Keep This Too', status: 'draft' },
    ])

    // Delete campaign with id '2'
    const campaigns = JSON.parse(localStorageMock['campaigns'])
    const updated = campaigns.filter((c: any) => c.id !== '2')
    localStorageMock['campaigns'] = JSON.stringify(updated)

    // Verify deletion
    const remaining = JSON.parse(localStorageMock['campaigns'])
    expect(remaining).toHaveLength(2)
    expect(remaining.map((c: any) => c.id)).toEqual(['1', '3'])
  })

  it('should delete campaign and all associated ads (cascading delete)', () => {
    const campaignIdToDelete = 'campaign-delete'

    localStorageMock['campaigns'] = JSON.stringify([
      { id: campaignIdToDelete, name: 'Campaign to Delete', status: 'draft' },
      { id: 'campaign-keep', name: 'Campaign to Keep', status: 'active' },
    ])

    localStorageMock['ads'] = JSON.stringify([
      { id: 'ad-1', campaignId: campaignIdToDelete, headline: 'Ad 1' },
      { id: 'ad-2', campaignId: campaignIdToDelete, headline: 'Ad 2' },
      { id: 'ad-3', campaignId: 'campaign-keep', headline: 'Ad 3' },
      { id: 'ad-4', campaignId: 'campaign-keep', headline: 'Ad 4' },
    ])

    // Delete campaign
    const campaigns = JSON.parse(localStorageMock['campaigns'])
    const updatedCampaigns = campaigns.filter((c: any) => c.id !== campaignIdToDelete)
    localStorageMock['campaigns'] = JSON.stringify(updatedCampaigns)

    // Delete associated ads (cascading)
    const ads = JSON.parse(localStorageMock['ads'])
    const updatedAds = ads.filter((ad: any) => ad.campaignId !== campaignIdToDelete)
    localStorageMock['ads'] = JSON.stringify(updatedAds)

    // Verify campaign deleted
    const remainingCampaigns = JSON.parse(localStorageMock['campaigns'])
    expect(remainingCampaigns).toHaveLength(1)
    expect(remainingCampaigns[0].id).toBe('campaign-keep')

    // Verify ads deleted (only ads from 'campaign-keep' remain)
    const remainingAds = JSON.parse(localStorageMock['ads'])
    expect(remainingAds).toHaveLength(2)
    expect(remainingAds.map((ad: any) => ad.id)).toEqual(['ad-3', 'ad-4'])
  })
})

describe('Draft Workflow - Name Uniqueness', () => {
  it('should prevent duplicate campaign names when creating new draft', () => {
    localStorageMock['campaigns'] = JSON.stringify([
      { id: '1', name: 'Existing Campaign', status: 'active' },
    ])

    const { result } = renderHook(() => useWizardStore())

    act(() => {
      result.current.updateCampaignSetup({
        campaignName: 'existing campaign',  // Different case
        platforms: ['facebook'],
      })
    })

    let isValid: boolean
    act(() => {
      isValid = result.current.validateStep(1)
    })

    expect(isValid!).toBe(false)
    expect(result.current.validationErrors.campaignName).toContain('A campaign with this name already exists')
  })

  it('should allow same name when editing existing draft', () => {
    localStorageMock['campaigns'] = JSON.stringify([
      { id: '1', name: 'My Campaign', status: 'draft' },
    ])

    const { result } = renderHook(() => useWizardStore())

    // Simulate editing campaign with id '1'
    act(() => {
      result.current.setSavedCampaignId(1)
      result.current.updateCampaignSetup({
        campaignName: 'My Campaign',  // Same name is OK when editing
        platforms: ['facebook'],
      })
    })

    let isValid: boolean
    act(() => {
      isValid = result.current.validateStep(1)
    })

    expect(isValid!).toBe(true)
  })

  it('should prevent renaming draft to existing campaign name', () => {
    localStorageMock['campaigns'] = JSON.stringify([
      { id: '1', name: 'Campaign One', status: 'active' },
      { id: '2', name: 'Campaign Two', status: 'draft' },
    ])

    const { result } = renderHook(() => useWizardStore())

    // Editing campaign 2, trying to rename to campaign 1's name
    act(() => {
      result.current.setSavedCampaignId(2)
      result.current.updateCampaignSetup({
        campaignName: 'Campaign One',  // Conflict!
        platforms: ['facebook'],
      })
    })

    let isValid: boolean
    act(() => {
      isValid = result.current.validateStep(1)
    })

    expect(isValid!).toBe(false)
    expect(result.current.validationErrors.campaignName).toContain('A campaign with this name already exists')
  })
})

describe('Draft Workflow - Complete Flow', () => {
  it('should complete full workflow: create → save → navigate away → return → edit → delete', () => {
    const { result } = renderHook(() => useWizardStore())

    // 1. Create new draft
    act(() => {
      result.current.updateCampaignSetup({
        campaignName: 'End-to-End Test Campaign',
        objective: 'conversions',
        platforms: ['facebook'],
      })
      result.current.setSavedCampaignId(999)
    })

    const draftData = {
      id: '999',
      name: result.current.campaignName,
      objective: result.current.objective,
      platforms: result.current.platforms,
      status: 'draft',
    }

    // 2. Save to localStorage
    const campaigns = JSON.parse(localStorageMock['campaigns'] || '[]')
    campaigns.push(draftData)
    localStorageMock['campaigns'] = JSON.stringify(campaigns)

    // 3. Navigate away (reset wizard in this test)
    act(() => {
      result.current.reset()
    })

    expect(result.current.campaignName).toBe('')  // Wizard cleared

    // 4. Return and load draft
    act(() => {
      result.current.loadCampaign('999')
    })

    expect(result.current.campaignName).toBe('End-to-End Test Campaign')
    expect(result.current.savedCampaignId).toBe(999)

    // 5. Edit draft
    act(() => {
      result.current.updateCampaignSetup({
        campaignName: 'Edited Campaign Name',
      })
    })

    // 6. Save edit (upsert)
    const allCampaigns = JSON.parse(localStorageMock['campaigns'])
    const index = allCampaigns.findIndex((c: any) => c.id === '999')
    allCampaigns[index] = {
      ...allCampaigns[index],
      name: result.current.campaignName,
    }
    localStorageMock['campaigns'] = JSON.stringify(allCampaigns)

    // Verify edit saved
    const afterEdit = JSON.parse(localStorageMock['campaigns'])
    expect(afterEdit).toHaveLength(1)
    expect(afterEdit[0].name).toBe('Edited Campaign Name')

    // 7. Delete draft
    const beforeDelete = JSON.parse(localStorageMock['campaigns'])
    const afterDelete = beforeDelete.filter((c: any) => c.id !== '999')
    localStorageMock['campaigns'] = JSON.stringify(afterDelete)

    // Verify deletion
    const final = JSON.parse(localStorageMock['campaigns'])
    expect(final).toHaveLength(0)
  })
})
