import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { CampaignWizardClient } from '@/app/(dashboard)/campaigns/new/wizard-client'
import { useWizardStore } from '@/lib/stores/wizard-store'

// Mock useSearchParams
const mockGet = jest.fn()
jest.mock('next/navigation', () => ({
  useSearchParams: () => ({
    get: mockGet,
  }),
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
  usePathname: () => '/campaigns/new',
}))

// Mock wizard steps
jest.mock('@/components/campaign-wizard/steps/campaign-setup-step', () => ({
  CampaignSetupStep: () => <div data-testid="step-1">Campaign Setup Step</div>,
}))

jest.mock('@/components/campaign-wizard/steps/targeting-step', () => ({
  TargetingStep: () => <div data-testid="step-2">Targeting Step</div>,
}))

jest.mock('@/components/campaign-wizard/steps/budget-schedule-step', () => ({
  BudgetScheduleStep: () => <div data-testid="step-3">Budget Schedule Step</div>,
}))

jest.mock('@/components/campaign-wizard/steps/creative-step', () => ({
  CreativeStep: () => <div data-testid="step-4">Creative Step</div>,
}))

jest.mock('@/components/campaign-wizard/steps/preview-step', () => ({
  PreviewStep: () => <div data-testid="step-5">Preview Step</div>,
}))

const localStorageMock: { [key: string]: string } = {}

beforeEach(() => {
  jest.clearAllMocks()
  Object.keys(localStorageMock).forEach(key => delete localStorageMock[key])

  global.localStorage.getItem = jest.fn((key: string) => localStorageMock[key] || null)
  global.localStorage.setItem = jest.fn((key: string, value: string) => {
    localStorageMock[key] = value
  })

  mockGet.mockReturnValue(null)

  // Reset wizard store
  useWizardStore.getState().reset()
})

describe('CampaignWizardClient - Rendering Steps', () => {
  it('should render step 1 by default', () => {
    render(<CampaignWizardClient />)

    expect(screen.getByTestId('step-1')).toBeInTheDocument()
    expect(screen.queryByTestId('step-2')).not.toBeInTheDocument()
  })

  it('should render correct step based on store state', () => {
    useWizardStore.getState().setStep(3)

    render(<CampaignWizardClient />)

    expect(screen.getByTestId('step-3')).toBeInTheDocument()
    expect(screen.queryByTestId('step-1')).not.toBeInTheDocument()
  })
})

describe('CampaignWizardClient - Smart Reset Logic', () => {
  it('should reset wizard when starting fresh (no edit param, no saved campaign)', async () => {
    // Setup: No edit parameter, no saved campaign
    mockGet.mockReturnValue(null)

    const resetSpy = jest.spyOn(useWizardStore.getState(), 'reset')

    render(<CampaignWizardClient />)

    await waitFor(() => {
      expect(resetSpy).toHaveBeenCalled()
    })
  })

  it('should NOT reset when draft in progress (savedCampaignId exists)', async () => {
    // Setup: Set savedCampaignId to simulate draft in progress
    useWizardStore.getState().setSavedCampaignId(123)
    useWizardStore.getState().updateCampaignSetup({
      campaignName: 'Draft Campaign',
      platforms: ['facebook'],
    })

    mockGet.mockReturnValue(null)  // No edit param

    const resetSpy = jest.spyOn(useWizardStore.getState(), 'reset')

    render(<CampaignWizardClient />)

    await waitFor(() => {
      // Reset should NOT be called because we have a draft in progress
      expect(resetSpy).not.toHaveBeenCalled()
    })

    // Verify draft data is preserved
    const state = useWizardStore.getState()
    expect(state.campaignName).toBe('Draft Campaign')
    expect(state.savedCampaignId).toBe(123)
  })

  it('should load campaign when edit parameter is present', async () => {
    // Setup: Add campaign to localStorage
    localStorageMock['campaigns'] = JSON.stringify([
      {
        id: 'edit-123',
        name: 'Existing Campaign',
        description: 'Edit this campaign',
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
          interests: [],
          behaviors: [],
          languages: ['English'],
        },
      }
    ])

    mockGet.mockReturnValue('edit-123')  // Edit mode

    const loadCampaignSpy = jest.spyOn(useWizardStore.getState(), 'loadCampaign')

    render(<CampaignWizardClient />)

    await waitFor(() => {
      expect(loadCampaignSpy).toHaveBeenCalledWith('edit-123')
    })

    // Verify campaign data was loaded
    const state = useWizardStore.getState()
    expect(state.campaignName).toBe('Existing Campaign')
    expect(state.objective).toBe('traffic')
  })

  it('should prioritize edit mode over draft preservation', async () => {
    // Setup: Both savedCampaignId exists AND edit param provided
    useWizardStore.getState().setSavedCampaignId(456)
    useWizardStore.getState().updateCampaignSetup({
      campaignName: 'Draft Campaign',
    })

    localStorageMock['campaigns'] = JSON.stringify([
      {
        id: 'edit-789',
        name: 'Edit This Campaign',
        description: '',
        objective: 'conversions',
        platforms: ['google'],
        budget: '50.00',
        budgetType: 'daily',
        currency: 'USD',
        startDate: '2025-01-15',
        endDate: '2025-02-15',
        targeting: {
          ageMin: 18,
          ageMax: 65,
          genders: ['all'],
          locations: [],
          interests: [],
          behaviors: [],
          languages: ['English'],
        },
      }
    ])

    mockGet.mockReturnValue('edit-789')

    const loadCampaignSpy = jest.spyOn(useWizardStore.getState(), 'loadCampaign')

    render(<CampaignWizardClient />)

    await waitFor(() => {
      expect(loadCampaignSpy).toHaveBeenCalledWith('edit-789')
    })

    // Verify edit campaign was loaded (not draft)
    const state = useWizardStore.getState()
    expect(state.campaignName).toBe('Edit This Campaign')
  })
})

describe('CampaignWizardClient - Session Persistence Scenarios', () => {
  it('should preserve wizard state when user navigates away and returns', async () => {
    // Scenario: User fills out wizard, navigates to dashboard, then returns

    // Step 1: User fills out some data
    useWizardStore.getState().updateCampaignSetup({
      campaignName: 'My Campaign',
      platforms: ['facebook'],
    })
    useWizardStore.getState().setStep(2)
    useWizardStore.getState().setSavedCampaignId(123)  // Draft saved

    const initialState = {
      campaignName: useWizardStore.getState().campaignName,
      currentStep: useWizardStore.getState().currentStep,
      savedCampaignId: useWizardStore.getState().savedCampaignId,
    }

    // Step 2: User navigates away (component unmounts)
    const { unmount } = render(<CampaignWizardClient />)
    unmount()

    // Step 3: User navigates back (component remounts)
    // Mock should show no edit param
    mockGet.mockReturnValue(null)

    render(<CampaignWizardClient />)

    await waitFor(() => {
      // Verify state is preserved
      const state = useWizardStore.getState()
      expect(state.campaignName).toBe(initialState.campaignName)
      expect(state.currentStep).toBe(initialState.currentStep)
      expect(state.savedCampaignId).toBe(initialState.savedCampaignId)
    })
  })

  it('should start fresh when user explicitly creates new campaign (no savedCampaignId)', async () => {
    // Scenario: User completes a campaign, then clicks "Create New Campaign"

    // Mock: No savedCampaignId, no edit param
    mockGet.mockReturnValue(null)

    render(<CampaignWizardClient />)

    await waitFor(() => {
      const state = useWizardStore.getState()
      expect(state.campaignName).toBe('')
      expect(state.currentStep).toBe(1)
      expect(state.savedCampaignId).toBeUndefined()
    })
  })

  it('should handle transition from draft to launched campaign', async () => {
    // Scenario: User saves draft, then launches it

    // Step 1: Draft exists
    useWizardStore.getState().setSavedCampaignId(123)
    useWizardStore.getState().updateCampaignSetup({
      campaignName: 'Draft to Launch',
    })

    const { unmount } = render(<CampaignWizardClient />)

    // Verify draft is preserved
    expect(useWizardStore.getState().savedCampaignId).toBe(123)

    unmount()

    // Step 2: User launches campaign (savedCampaignId cleared after launch)
    useWizardStore.getState().reset()

    // After reset, wizard should start fresh
    expect(useWizardStore.getState().savedCampaignId).toBeUndefined()
    expect(useWizardStore.getState().campaignName).toBe('')
  })
})

describe('CampaignWizardClient - Edge Cases', () => {
  it('should handle invalid edit campaign ID gracefully', async () => {
    mockGet.mockReturnValue('invalid-id-999')

    // No campaign with this ID exists in localStorage
    localStorageMock['campaigns'] = JSON.stringify([])

    const loadCampaignSpy = jest.spyOn(useWizardStore.getState(), 'loadCampaign')

    render(<CampaignWizardClient />)

    await waitFor(() => {
      expect(loadCampaignSpy).toHaveBeenCalledWith('invalid-id-999')
    })

    // Should not crash, state should remain at defaults
    const state = useWizardStore.getState()
    expect(state.campaignName).toBe('')
  })

  it('should handle corrupted localStorage data', async () => {
    // Corrupt localStorage data
    localStorageMock['campaigns'] = 'invalid json {'

    mockGet.mockReturnValue('some-id')

    // Should not crash
    expect(() => {
      render(<CampaignWizardClient />)
    }).not.toThrow()
  })

  it('should load different campaign when edit param changes', async () => {
    localStorageMock['campaigns'] = JSON.stringify([
      {
        id: 'edit-123',
        name: 'Changed Campaign',
        platforms: ['facebook'],
        targeting: { ageMin: 18, ageMax: 65, genders: ['all'], locations: [], interests: [], behaviors: [], languages: ['English'] },
      }
    ])

    mockGet.mockReturnValue('edit-123')

    const loadCampaignSpy = jest.spyOn(useWizardStore.getState(), 'loadCampaign')

    render(<CampaignWizardClient />)

    await waitFor(() => {
      expect(loadCampaignSpy).toHaveBeenCalledWith('edit-123')
    })
  })
})
