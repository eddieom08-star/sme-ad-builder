import { renderHook, act } from '@testing-library/react'
import { useWizardStore } from '@/lib/stores/wizard-store'

// Mock localStorage
const localStorageMock: { [key: string]: string } = {}

beforeEach(() => {
  // Clear all mocks before each test
  jest.clearAllMocks()

  // Reset localStorage mock
  Object.keys(localStorageMock).forEach(key => delete localStorageMock[key])

  global.localStorage.getItem = jest.fn((key: string) => localStorageMock[key] || null)
  global.localStorage.setItem = jest.fn((key: string, value: string) => {
    localStorageMock[key] = value
  })
  global.localStorage.removeItem = jest.fn((key: string) => {
    delete localStorageMock[key]
  })

  // Reset store to initial state
  useWizardStore.getState().reset()
})

describe('Wizard Store - Navigation', () => {
  it('should start at step 1', () => {
    const { result } = renderHook(() => useWizardStore())
    expect(result.current.currentStep).toBe(1)
  })

  it('should navigate to next step', () => {
    const { result } = renderHook(() => useWizardStore())

    act(() => {
      result.current.goNext()
    })

    expect(result.current.currentStep).toBe(2)
  })

  it('should navigate to previous step', () => {
    const { result } = renderHook(() => useWizardStore())

    act(() => {
      result.current.setStep(3)
      result.current.goBack()
    })

    expect(result.current.currentStep).toBe(2)
  })

  it('should not go below step 1', () => {
    const { result } = renderHook(() => useWizardStore())

    act(() => {
      result.current.goBack()
    })

    expect(result.current.currentStep).toBe(1)
  })

  it('should not go above step 5', () => {
    const { result } = renderHook(() => useWizardStore())

    act(() => {
      result.current.setStep(5)
      result.current.goNext()
    })

    expect(result.current.currentStep).toBe(5)
  })

  it('should mark step as complete when moving forward', () => {
    const { result } = renderHook(() => useWizardStore())

    act(() => {
      result.current.goNext()
    })

    expect(result.current.completedSteps).toContain(1)
  })
})

describe('Wizard Store - Campaign Setup (Step 1)', () => {
  it('should update campaign setup data', () => {
    const { result } = renderHook(() => useWizardStore())

    act(() => {
      result.current.updateCampaignSetup({
        campaignName: 'Summer Sale 2025',
        campaignDescription: 'Summer promotional campaign',
        objective: 'conversions',
        platforms: ['facebook', 'instagram'],
      })
    })

    expect(result.current.campaignName).toBe('Summer Sale 2025')
    expect(result.current.campaignDescription).toBe('Summer promotional campaign')
    expect(result.current.objective).toBe('conversions')
    expect(result.current.platforms).toEqual(['facebook', 'instagram'])
  })

  it('should validate campaign name is required', () => {
    const { result } = renderHook(() => useWizardStore())

    const isValid = result.current.validateStep(1)

    expect(isValid).toBe(false)
    expect(result.current.validationErrors.campaignName).toBeDefined()
  })

  it('should validate campaign name length (min 3 characters)', () => {
    const { result } = renderHook(() => useWizardStore())

    act(() => {
      result.current.updateCampaignSetup({ campaignName: 'AB' })
    })

    const isValid = result.current.validateStep(1)

    expect(isValid).toBe(false)
    expect(result.current.validationErrors.campaignName).toContain('Campaign name must be at least 3 characters')
  })

  it('should validate campaign name length (max 100 characters)', () => {
    const { result } = renderHook(() => useWizardStore())

    act(() => {
      result.current.updateCampaignSetup({
        campaignName: 'A'.repeat(101)
      })
    })

    const isValid = result.current.validateStep(1)

    expect(isValid).toBe(false)
    expect(result.current.validationErrors.campaignName).toContain('Campaign name must be less than 100 characters')
  })

  it('should validate platform selection is required', () => {
    const { result } = renderHook(() => useWizardStore())

    act(() => {
      result.current.updateCampaignSetup({
        campaignName: 'Test Campaign',
        platforms: []
      })
    })

    const isValid = result.current.validateStep(1)

    expect(isValid).toBe(false)
    expect(result.current.validationErrors.platforms).toBeDefined()
  })

  it('should detect duplicate campaign names (case-insensitive)', () => {
    // Add existing campaign to localStorage
    localStorageMock['campaigns'] = JSON.stringify([
      { id: '1', name: 'Summer Sale' }
    ])

    const { result } = renderHook(() => useWizardStore())

    act(() => {
      result.current.updateCampaignSetup({
        campaignName: 'summer sale',  // Different case
        platforms: ['facebook']
      })
    })

    const isValid = result.current.validateStep(1)

    expect(isValid).toBe(false)
    expect(result.current.validationErrors.campaignName).toContain('A campaign with this name already exists')
  })

  it('should allow editing campaign with same name', () => {
    // Add existing campaign to localStorage
    localStorageMock['campaigns'] = JSON.stringify([
      { id: '1', name: 'Summer Sale' }
    ])

    const { result } = renderHook(() => useWizardStore())

    act(() => {
      result.current.setSavedCampaignId(1)  // Editing campaign 1
      result.current.updateCampaignSetup({
        campaignName: 'Summer Sale',  // Same name is OK when editing
        platforms: ['facebook']
      })
    })

    const isValid = result.current.validateStep(1)

    expect(isValid).toBe(true)
  })

  it('should pass validation with valid data', () => {
    const { result } = renderHook(() => useWizardStore())

    act(() => {
      result.current.updateCampaignSetup({
        campaignName: 'Valid Campaign',
        objective: 'conversions',
        platforms: ['facebook'],
      })
    })

    const isValid = result.current.validateStep(1)

    expect(isValid).toBe(true)
    expect(Object.keys(result.current.validationErrors)).toHaveLength(0)
  })
})

describe('Wizard Store - Targeting (Step 2)', () => {
  it('should update targeting data', () => {
    const { result } = renderHook(() => useWizardStore())

    act(() => {
      result.current.updateTargeting({
        ageMin: 25,
        ageMax: 45,
        genders: ['female'],
        locations: [{ type: 'country', name: 'United States' }],
        interests: ['Technology', 'Marketing'],
      })
    })

    expect(result.current.targeting.ageMin).toBe(25)
    expect(result.current.targeting.ageMax).toBe(45)
    expect(result.current.targeting.genders).toEqual(['female'])
    expect(result.current.targeting.locations).toHaveLength(1)
    expect(result.current.targeting.interests).toEqual(['Technology', 'Marketing'])
  })

  it('should validate minimum age (at least 13)', () => {
    const { result } = renderHook(() => useWizardStore())

    act(() => {
      result.current.updateTargeting({ ageMin: 10 })
    })

    const isValid = result.current.validateStep(2)

    expect(isValid).toBe(false)
    expect(result.current.validationErrors.ageMin).toBeDefined()
  })

  it('should validate age range logic', () => {
    const { result } = renderHook(() => useWizardStore())

    act(() => {
      result.current.updateTargeting({
        ageMin: 40,
        ageMax: 30  // Min > Max
      })
    })

    const isValid = result.current.validateStep(2)

    expect(isValid).toBe(false)
    expect(result.current.validationErrors.ageRange).toBeDefined()
  })

  it('should require at least one location', () => {
    const { result } = renderHook(() => useWizardStore())

    act(() => {
      result.current.updateTargeting({
        locations: []
      })
    })

    const isValid = result.current.validateStep(2)

    expect(isValid).toBe(false)
    expect(result.current.validationErrors.locations).toBeDefined()
  })
})

describe('Wizard Store - Budget & Schedule (Step 3)', () => {
  it('should update budget data', () => {
    const { result } = renderHook(() => useWizardStore())

    act(() => {
      result.current.updateBudget({
        budgetType: 'daily',
        budgetAmount: 100,
        currency: 'USD',
        startDate: '2025-01-15',
        endDate: '2025-02-15',
        bidStrategy: 'lowest_cost',
      })
    })

    expect(result.current.budgetType).toBe('daily')
    expect(result.current.budgetAmount).toBe(100)
    expect(result.current.currency).toBe('USD')
  })

  it('should validate minimum daily budget ($5)', () => {
    const { result } = renderHook(() => useWizardStore())

    act(() => {
      result.current.updateBudget({
        budgetType: 'daily',
        budgetAmount: 3
      })
    })

    const isValid = result.current.validateStep(3)

    expect(isValid).toBe(false)
    expect(result.current.validationErrors.budgetAmount).toContain('Minimum daily budget is $5')
  })

  it('should validate minimum lifetime budget ($35)', () => {
    const { result } = renderHook(() => useWizardStore())

    act(() => {
      result.current.updateBudget({
        budgetType: 'lifetime',
        budgetAmount: 20
      })
    })

    const isValid = result.current.validateStep(3)

    expect(isValid).toBe(false)
    expect(result.current.validationErrors.budgetAmount).toContain('Minimum lifetime budget is $35')
  })

  it('should validate maximum budget ($10,000)', () => {
    const { result } = renderHook(() => useWizardStore())

    act(() => {
      result.current.updateBudget({
        budgetAmount: 15000
      })
    })

    const isValid = result.current.validateStep(3)

    expect(isValid).toBe(false)
    expect(result.current.validationErrors.budgetAmount).toContain('Budget exceeds $10,000')
  })

  it('should validate start date is not in the past', () => {
    const { result } = renderHook(() => useWizardStore())

    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)

    act(() => {
      result.current.updateBudget({
        startDate: yesterday.toISOString().split('T')[0]
      })
    })

    const isValid = result.current.validateStep(3)

    expect(isValid).toBe(false)
    expect(result.current.validationErrors.startDate).toBeDefined()
  })

  it('should validate end date is after start date', () => {
    const { result } = renderHook(() => useWizardStore())

    act(() => {
      result.current.updateBudget({
        startDate: '2025-02-01',
        endDate: '2025-01-15'  // Before start date
      })
    })

    const isValid = result.current.validateStep(3)

    expect(isValid).toBe(false)
    expect(result.current.validationErrors.endDate).toBeDefined()
  })
})

describe('Wizard Store - Creative (Step 4)', () => {
  it('should add ad creative', () => {
    const { result } = renderHook(() => useWizardStore())

    act(() => {
      result.current.addAd({
        format: 'image',
        platform: 'facebook',
        headline: 'Limited Time Offer',
        primaryText: 'Shop our summer sale now!',
        callToAction: 'Shop Now',
        media: [{ url: 'https://example.com/image.jpg', type: 'image' }],
        destinationUrl: 'https://example.com/sale',
      })
    })

    expect(result.current.ads).toHaveLength(1)
    expect(result.current.ads[0].headline).toBe('Limited Time Offer')
    expect(result.current.ads[0].id).toBe('test-uuid-12345')
  })

  it('should update existing ad', () => {
    const { result } = renderHook(() => useWizardStore())

    act(() => {
      result.current.addAd({
        format: 'image',
        platform: 'facebook',
        headline: 'Original Headline',
        primaryText: 'Original Text',
        callToAction: 'Learn More',
        media: [{ url: 'https://example.com/image.jpg', type: 'image' }],
        destinationUrl: 'https://example.com',
      })
    })

    const adId = result.current.ads[0].id!

    act(() => {
      result.current.updateAd(adId, {
        headline: 'Updated Headline',
      })
    })

    expect(result.current.ads[0].headline).toBe('Updated Headline')
    expect(result.current.ads[0].primaryText).toBe('Original Text')  // Unchanged
  })

  it('should remove ad', () => {
    const { result } = renderHook(() => useWizardStore())

    act(() => {
      result.current.addAd({
        format: 'image',
        platform: 'facebook',
        headline: 'Test Ad',
        primaryText: 'Test Text',
        callToAction: 'Learn More',
        media: [{ url: 'https://example.com/image.jpg', type: 'image' }],
        destinationUrl: 'https://example.com',
      })
    })

    const adId = result.current.ads[0].id!

    act(() => {
      result.current.removeAd(adId)
    })

    expect(result.current.ads).toHaveLength(0)
  })

  it('should validate at least one ad is required', () => {
    const { result } = renderHook(() => useWizardStore())

    const isValid = result.current.validateStep(4)

    expect(isValid).toBe(false)
    expect(result.current.validationErrors.ads).toBeDefined()
  })

  it('should validate ad headline is required', () => {
    const { result } = renderHook(() => useWizardStore())

    act(() => {
      result.current.addAd({
        format: 'image',
        platform: 'facebook',
        headline: '',  // Empty
        primaryText: 'Test Text',
        callToAction: 'Learn More',
        media: [{ url: 'https://example.com/image.jpg', type: 'image' }],
        destinationUrl: 'https://example.com',
      })
    })

    const isValid = result.current.validateStep(4)

    expect(isValid).toBe(false)
    expect(result.current.validationErrors['ad_0_headline']).toBeDefined()
  })

  it('should validate destination URL', () => {
    const { result } = renderHook(() => useWizardStore())

    act(() => {
      result.current.addAd({
        format: 'image',
        platform: 'facebook',
        headline: 'Test',
        primaryText: 'Test Text',
        callToAction: 'Learn More',
        media: [{ url: 'https://example.com/image.jpg', type: 'image' }],
        destinationUrl: 'not-a-valid-url',  // Invalid URL
      })
    })

    const isValid = result.current.validateStep(4)

    expect(isValid).toBe(false)
    expect(result.current.validationErrors['ad_0_url']).toBeDefined()
  })
})

describe('Wizard Store - Persistence', () => {
  it('should save campaign ID', () => {
    const { result } = renderHook(() => useWizardStore())

    act(() => {
      result.current.setSavedCampaignId(123)
    })

    expect(result.current.savedCampaignId).toBe(123)
  })

  it('should update last saved timestamp', () => {
    const { result } = renderHook(() => useWizardStore())

    const beforeTimestamp = new Date().toISOString()

    act(() => {
      result.current.updateLastSaved()
    })

    expect(result.current.lastSaved).toBeDefined()
    expect(new Date(result.current.lastSaved!).getTime()).toBeGreaterThanOrEqual(new Date(beforeTimestamp).getTime())
  })

  it('should reset to initial state', () => {
    const { result } = renderHook(() => useWizardStore())

    act(() => {
      result.current.updateCampaignSetup({ campaignName: 'Test' })
      result.current.setStep(3)
      result.current.setSavedCampaignId(456)
    })

    act(() => {
      result.current.reset()
    })

    expect(result.current.currentStep).toBe(1)
    expect(result.current.campaignName).toBe('')
    expect(result.current.savedCampaignId).toBeUndefined()
  })
})

describe('Wizard Store - Load Campaign', () => {
  it('should load existing campaign data', () => {
    // Setup: Add campaign and ads to localStorage
    localStorageMock['campaigns'] = JSON.stringify([
      {
        id: 'campaign-123',
        name: 'Loaded Campaign',
        description: 'Campaign description',
        objective: 'traffic',
        platforms: ['facebook', 'instagram'],
        budget: '100.00',
        budgetType: 'daily',
        currency: 'USD',
        startDate: '2025-01-15',
        endDate: '2025-02-15',
        bidStrategy: 'lowest_cost',
        targeting: {
          ageMin: 25,
          ageMax: 45,
          genders: ['all'],
          locations: [{ type: 'country', name: 'United States' }],
          interests: ['Technology'],
          behaviors: [],
          languages: ['English'],
        },
      }
    ])

    localStorageMock['ads'] = JSON.stringify([
      {
        id: 'ad-1',
        campaignId: 'campaign-123',
        format: 'image',
        platform: 'facebook',
        headline: 'Test Ad',
        body: 'Ad body text',
        callToAction: 'Shop Now',
        imageUrl: 'https://example.com/image.jpg',
        targetUrl: 'https://example.com',
      }
    ])

    const { result } = renderHook(() => useWizardStore())

    act(() => {
      result.current.loadCampaign('campaign-123')
    })

    expect(result.current.campaignName).toBe('Loaded Campaign')
    expect(result.current.objective).toBe('traffic')
    expect(result.current.platforms).toEqual(['facebook', 'instagram'])
    expect(result.current.budgetAmount).toBe(100)
    expect(result.current.targeting.ageMin).toBe(25)
    expect(result.current.ads).toHaveLength(1)
    expect(result.current.ads[0].headline).toBe('Test Ad')
    expect(result.current.savedCampaignId).toBe(NaN)  // parseInt('campaign-123') = NaN
  })
})
