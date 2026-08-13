import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import SavedJobsPage from '../features/applications/pages/SavedJobsPage'
import { savedJobsApi } from '../features/applications/services/applicationApi'

const remove = vi.fn()

vi.mock('../features/applications/services/applicationApi', () => ({
  savedJobsApi: { list: vi.fn() },
}))
vi.mock('../features/applications/hooks/useSavedJobs', () => ({
  useSavedJobs: () => ({ remove }),
}))

const savedJob = {
  id: 'saved-1',
  jobId: 'job-1',
  job: {
    id: 'job-1',
    title: 'Backend Engineer',
    slug: 'backend-engineer',
    status: 'PUBLISHED',
    location: 'Hyderabad',
    employmentType: 'FULL_TIME',
    workMode: 'HYBRID',
    applicationDeadline: '2030-12-31T23:59:59.000Z',
    company: { companyName: 'Acme Labs' },
  },
}

const pagination = {
  page: 1,
  totalPages: 1,
  hasPreviousPage: false,
  hasNextPage: false,
}

describe('saved jobs page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    remove.mockResolvedValue(true)
    savedJobsApi.list.mockResolvedValue({ savedJobs: [savedJob], pagination })
  })

  it('renders the backend saved-jobs listing and available job navigation', async () => {
    render(<MemoryRouter><SavedJobsPage /></MemoryRouter>)

    expect(await screen.findByRole('heading', { name: 'Backend Engineer' })).toBeInTheDocument()
    expect(screen.getByText('Acme Labs')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Open job' })).toHaveAttribute('href', '/jobs/backend-engineer')
    expect(savedJobsApi.list).toHaveBeenCalledWith(
      { page: 1, limit: 10 },
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    )
  })

  it('unsaves through shared saved-state logic and refreshes the backend listing', async () => {
    const user = userEvent.setup()
    render(<MemoryRouter><SavedJobsPage /></MemoryRouter>)

    await screen.findByRole('heading', { name: 'Backend Engineer' })
    await user.click(screen.getByRole('button', { name: 'Unsave' }))

    expect(remove).toHaveBeenCalledWith('job-1')
    await waitFor(() => expect(savedJobsApi.list).toHaveBeenCalledTimes(2))
  })
})
