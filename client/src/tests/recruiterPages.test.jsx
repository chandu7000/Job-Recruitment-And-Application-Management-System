import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import CompanyPage from '../features/recruiter/pages/CompanyPage'
import RecruiterDashboardPage from '../features/recruiter/pages/RecruiterDashboardPage'
import RecruiterProfilePage from '../features/recruiter/pages/RecruiterProfilePage'
import { recruiterApi } from '../features/recruiter/services/recruiterApi'

vi.mock('../features/auth/hooks/useAuth', () => ({ useAuth: () => ({ user: { email: 'recruiter@careerforge.test' } }) }))
vi.mock('../features/recruiter/services/recruiterApi', () => ({
  recruiterApi: {
    dashboard: vi.fn(), profile: vi.fn(), companies: vi.fn(), verificationHistory: vi.fn(),
    uploadLogo: vi.fn(), deleteLogo: vi.fn(), submitVerification: vi.fn(), resubmitVerification: vi.fn(),
  },
}))

const renderPage = (page) => render(<MemoryRouter>{page}</MemoryRouter>)

describe('Recruiter pages', () => {
  beforeEach(() => vi.clearAllMocks())

  it('renders real dashboard statistics and company status', async () => {
    recruiterApi.dashboard.mockResolvedValue({ companyStatus: [{ id: 'c1', companyName: 'CareerForge', status: 'VERIFIED' }], jobs: { total: 3, byStatus: { PUBLISHED: 2, DRAFT: 1 } }, applications: { total: 5, byStatus: { SHORTLISTED: 2 } }, interviews: { total: 2, upcoming: 1, byStatus: {} }, unreadNotificationCount: 4, profile: { completionPercentage: 80 } })
    renderPage(<RecruiterDashboardPage />)
    expect(await screen.findByRole('heading', { name: /welcome/i })).toBeInTheDocument()
    expect(screen.getByText('CareerForge')).toBeInTheDocument()
    expect(screen.getByText('80%')).toBeInTheDocument()
  })

  it('renders recruiter profile with backend-supported fields', async () => {
    recruiterApi.profile.mockResolvedValue({ firstName: 'Chandra', lastName: 'Sekhar', designation: 'Recruiter', phoneNumber: '9876543210', biography: 'Hiring engineering talent.' })
    renderPage(<RecruiterProfilePage />)
    expect(await screen.findByText('Chandra Sekhar')).toBeInTheDocument()
    expect(screen.getByText('Hiring engineering talent.')).toBeInTheDocument()
  })

  it('renders company details, logo controls and verification history', async () => {
    recruiterApi.companies.mockResolvedValue([{ id: 'c1', companyName: 'CareerForge', status: 'REJECTED', description: 'A careers platform.', verificationReason: 'Add a clearer logo.' }])
    recruiterApi.verificationHistory.mockResolvedValue([{ id: 'h1', oldStatus: 'PENDING_VERIFICATION', newStatus: 'REJECTED', reason: 'Add a clearer logo.', createdAt: '2026-08-09T12:00:00.000Z' }])
    renderPage(<CompanyPage />)
    expect(await screen.findByRole('heading', { name: 'CareerForge' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Resubmit corrections' })).toBeInTheDocument()
    await waitFor(() => expect(screen.getAllByText('Add a clearer logo.').length).toBeGreaterThan(0))
  })

  it('shows company onboarding when no company exists', async () => {
    recruiterApi.companies.mockResolvedValue([])
    recruiterApi.verificationHistory.mockResolvedValue([])
    renderPage(<CompanyPage />)
    expect(await screen.findByRole('heading', { name: 'No company profile' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Create company' })).toHaveAttribute('href', '/recruiter/company/new')
  })
})
