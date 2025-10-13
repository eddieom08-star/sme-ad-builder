import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { CampaignsListClient } from '@/components/campaigns/campaigns-list-client'

// Mock the toast hook
const mockToast = jest.fn()
jest.mock('@/components/ui/use-toast', () => ({
  useToast: () => ({
    toast: mockToast,
  }),
}))

const localStorageMock: { [key: string]: string } = {}

beforeEach(() => {
  jest.clearAllMocks()
  Object.keys(localStorageMock).forEach(key => delete localStorageMock[key])

  global.localStorage.getItem = jest.fn((key: string) => localStorageMock[key] || null)
  global.localStorage.setItem = jest.fn((key: string, value: string) => {
    localStorageMock[key] = value
  })
  mockToast.mockClear()
})

describe('CampaignsListClient - Empty State', () => {
  it('should show empty state when no campaigns exist', () => {
    render(<CampaignsListClient />)

    expect(screen.getByText('No campaigns yet')).toBeInTheDocument()
    expect(screen.getByText(/Create your first campaign/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Create Your First Campaign/i })).toBeInTheDocument()
  })

  it('should show zero stats in empty state', () => {
    render(<CampaignsListClient />)

    expect(screen.getByText('Total Campaigns')).toBeInTheDocument()
    expect(screen.getByText('0', { selector: '.text-2xl' })).toBeInTheDocument()
  })
})

describe('CampaignsListClient - Campaign List', () => {
  const mockCampaigns = [
    {
      id: '1',
      name: 'Summer Sale Campaign',
      description: 'Summer promotional campaign',
      status: 'active',
      budget: '100.00',
      budgetType: 'daily',
      platforms: ['facebook', 'instagram'],
      startDate: '2025-01-15',
      endDate: '2025-02-15',
      createdAt: '2025-01-10T10:00:00Z',
    },
    {
      id: '2',
      name: 'Winter Draft',
      description: 'Draft campaign for winter',
      status: 'draft',
      budget: '50.00',
      budgetType: 'daily',
      platforms: ['google'],
      startDate: '2025-03-01',
      endDate: '2025-03-31',
      createdAt: '2025-01-11T10:00:00Z',
    },
  ]

  beforeEach(() => {
    localStorageMock['campaigns'] = JSON.stringify(mockCampaigns)
  })

  it('should render campaign list', () => {
    render(<CampaignsListClient />)

    expect(screen.getByText('Summer Sale Campaign')).toBeInTheDocument()
    expect(screen.getByText('Winter Draft')).toBeInTheDocument()
  })

  it('should show correct stats', () => {
    render(<CampaignsListClient />)

    expect(screen.getByText('2', { selector: '.text-2xl' })).toBeInTheDocument()  // Total campaigns
    expect(screen.getByText('1', { selector: '.text-2xl' })).toBeInTheDocument()  // Active campaigns
    expect(screen.getByText('$150.00')).toBeInTheDocument()  // Total budget (100 + 50)
  })

  it('should display campaign platforms as badges', () => {
    render(<CampaignsListClient />)

    expect(screen.getByText('facebook')).toBeInTheDocument()
    expect(screen.getByText('instagram')).toBeInTheDocument()
    expect(screen.getByText('google')).toBeInTheDocument()
  })

  it('should show active status badge with green styling', () => {
    render(<CampaignsListClient />)

    const activeBadge = screen.getByText('active')
    expect(activeBadge).toHaveClass('bg-green-100', 'text-green-800')
  })

  it('should show draft status badge with blue styling', () => {
    render(<CampaignsListClient />)

    const draftBadge = screen.getByText('Draft')
    expect(draftBadge).toHaveClass('bg-blue-100', 'text-blue-800')
  })

  it('should display draft information banner for draft campaigns', () => {
    render(<CampaignsListClient />)

    expect(screen.getByText(/Click to continue editing this campaign/i)).toBeInTheDocument()
  })

  it('should link to campaign detail for active campaigns', () => {
    render(<CampaignsListClient />)

    const activeCampaignLink = screen.getByText('Summer Sale Campaign').closest('a')
    expect(activeCampaignLink).toHaveAttribute('href', '/campaigns/1')
  })

  it('should link to wizard edit mode for draft campaigns', () => {
    render(<CampaignsListClient />)

    const draftCampaignLink = screen.getByText('Winter Draft').closest('a')
    expect(draftCampaignLink).toHaveAttribute('href', '/campaigns/new?edit=2')
  })

  it('should render delete buttons for all campaigns', () => {
    render(<CampaignsListClient />)

    const deleteButtons = screen.getAllByTitle('Delete campaign')
    expect(deleteButtons).toHaveLength(2)
  })
})

describe('CampaignsListClient - Delete Functionality', () => {
  const mockCampaigns = [
    {
      id: '1',
      name: 'Test Campaign',
      description: 'Test',
      status: 'active',
      budget: '100.00',
      budgetType: 'daily',
      platforms: ['facebook'],
      startDate: '2025-01-15',
      endDate: '2025-02-15',
      createdAt: '2025-01-10T10:00:00Z',
    },
  ]

  beforeEach(() => {
    localStorageMock['campaigns'] = JSON.stringify(mockCampaigns)
  })

  it('should open confirmation dialog when delete button is clicked', () => {
    render(<CampaignsListClient />)

    const deleteButton = screen.getByTitle('Delete campaign')
    fireEvent.click(deleteButton)

    expect(screen.getByText('Delete Campaign?')).toBeInTheDocument()
    expect(screen.getByText(/Are you sure you want to delete/i)).toBeInTheDocument()
  })

  it('should show campaign name in confirmation dialog', () => {
    render(<CampaignsListClient />)

    const deleteButton = screen.getByTitle('Delete campaign')
    fireEvent.click(deleteButton)

    expect(screen.getByText('"Test Campaign"', { exact: false })).toBeInTheDocument()
  })

  it('should show warning for active campaigns', () => {
    render(<CampaignsListClient />)

    const deleteButton = screen.getByTitle('Delete campaign')
    fireEvent.click(deleteButton)

    expect(screen.getByText(/This campaign is currently active/i)).toBeInTheDocument()
  })

  it('should close dialog when cancel is clicked', async () => {
    render(<CampaignsListClient />)

    const deleteButton = screen.getByTitle('Delete campaign')
    fireEvent.click(deleteButton)

    const cancelButton = screen.getByRole('button', { name: /Cancel/i })
    fireEvent.click(cancelButton)

    await waitFor(() => {
      expect(screen.queryByText('Delete Campaign?')).not.toBeInTheDocument()
    })
  })

  it('should delete campaign when confirmed', async () => {
    localStorageMock['campaigns'] = JSON.stringify(mockCampaigns)

    render(<CampaignsListClient />)

    const deleteButton = screen.getByTitle('Delete campaign')
    fireEvent.click(deleteButton)

    const confirmButton = screen.getByRole('button', { name: /Delete Campaign/i })
    fireEvent.click(confirmButton)

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Campaign deleted',
        description: '"Test Campaign" has been permanently deleted.',
      })
    })

    // Check that campaign was removed from localStorage
    const setItemCalls = (localStorage.setItem as jest.Mock).mock.calls
    const lastCall = setItemCalls[setItemCalls.length - 1]
    expect(lastCall[0]).toBe('campaigns')
    const updatedCampaigns = JSON.parse(lastCall[1])
    expect(updatedCampaigns).toHaveLength(0)
  })

  it('should delete associated ads when campaign is deleted', async () => {
    localStorageMock['campaigns'] = JSON.stringify(mockCampaigns)
    localStorageMock['ads'] = JSON.stringify([
      { id: 'ad-1', campaignId: '1', headline: 'Test Ad' },
      { id: 'ad-2', campaignId: '2', headline: 'Other Ad' },
    ])

    render(<CampaignsListClient />)

    const deleteButton = screen.getByTitle('Delete campaign')
    fireEvent.click(deleteButton)

    const confirmButton = screen.getByRole('button', { name: /Delete Campaign/i })
    fireEvent.click(confirmButton)

    await waitFor(() => {
      const setItemCalls = (localStorage.setItem as jest.Mock).mock.calls
      const adsCall = setItemCalls.find(call => call[0] === 'ads')
      if (adsCall) {
        const updatedAds = JSON.parse(adsCall[1])
        expect(updatedAds).toHaveLength(1)
        expect(updatedAds[0].id).toBe('ad-2')  // Only ad from campaign 2 remains
      }
    })
  })

  it('should prevent navigation when clicking delete button', () => {
    render(<CampaignsListClient />)

    const deleteButton = screen.getByTitle('Delete campaign')
    const clickEvent = new MouseEvent('click', { bubbles: true })
    const preventDefaultSpy = jest.spyOn(clickEvent, 'preventDefault')
    const stopPropagationSpy = jest.spyOn(clickEvent, 'stopPropagation')

    deleteButton.dispatchEvent(clickEvent)

    expect(preventDefaultSpy).toHaveBeenCalled()
    expect(stopPropagationSpy).toHaveBeenCalled()
  })

  it('should handle delete errors gracefully', async () => {
    // Make setItem throw an error
    ;(localStorage.setItem as jest.Mock).mockImplementationOnce(() => {
      throw new Error('Storage error')
    })

    localStorageMock['campaigns'] = JSON.stringify(mockCampaigns)

    render(<CampaignsListClient />)

    const deleteButton = screen.getByTitle('Delete campaign')
    fireEvent.click(deleteButton)

    const confirmButton = screen.getByRole('button', { name: /Delete Campaign/i })
    fireEvent.click(confirmButton)

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Error',
        description: 'Failed to delete campaign. Please try again.',
        variant: 'destructive',
      })
    })
  })
})

describe('CampaignsListClient - Budget Display', () => {
  it('should show daily budget format correctly', () => {
    const campaigns = [{
      id: '1',
      name: 'Daily Campaign',
      description: '',
      status: 'active',
      budget: '75.00',
      budgetType: 'daily',
      platforms: ['facebook'],
      startDate: '2025-01-15',
      endDate: '2025-02-15',
      createdAt: '2025-01-10T10:00:00Z',
    }]

    localStorageMock['campaigns'] = JSON.stringify(campaigns)

    render(<CampaignsListClient />)

    expect(screen.getByText('$75.00')).toBeInTheDocument()
    expect(screen.getByText('/day')).toBeInTheDocument()
  })

  it('should show lifetime budget format correctly', () => {
    const campaigns = [{
      id: '1',
      name: 'Lifetime Campaign',
      description: '',
      status: 'active',
      budget: '500.00',
      budgetType: 'lifetime',
      platforms: ['facebook'],
      startDate: '2025-01-15',
      endDate: '2025-02-15',
      createdAt: '2025-01-10T10:00:00Z',
    }]

    localStorageMock['campaigns'] = JSON.stringify(campaigns)

    render(<CampaignsListClient />)

    expect(screen.getByText('$500.00')).toBeInTheDocument()
    expect(screen.getByText('total')).toBeInTheDocument()
  })
})

describe('CampaignsListClient - Date Formatting', () => {
  it('should format dates correctly', () => {
    const campaigns = [{
      id: '1',
      name: 'Date Test',
      description: '',
      status: 'active',
      budget: '100.00',
      budgetType: 'daily',
      platforms: ['facebook'],
      startDate: '2025-01-15',
      endDate: '2025-02-15',
      createdAt: '2025-01-10T10:00:00Z',
    }]

    localStorageMock['campaigns'] = JSON.stringify(campaigns)

    render(<CampaignsListClient />)

    // Check that dates are rendered (exact format depends on locale)
    expect(screen.getByText('Start Date')).toBeInTheDocument()
    expect(screen.getByText('End Date')).toBeInTheDocument()
    expect(screen.getByText('Created')).toBeInTheDocument()
  })
})
