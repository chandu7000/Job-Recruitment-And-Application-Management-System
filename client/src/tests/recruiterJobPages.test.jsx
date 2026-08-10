import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import JobDetailsPage from '../features/recruiterJobs/pages/JobDetailsPage'
import RecruiterJobsPage from '../features/recruiterJobs/pages/RecruiterJobsPage'
import { recruiterJobApi } from '../features/recruiterJobs/services/recruiterJobApi'

vi.mock('../features/recruiterJobs/services/recruiterJobApi', () => ({
  recruiterJobApi: {
    list: vi.fn(),
    getById: vi.fn(),
    publish: vi.fn(),
    close: vi.fn(),
    deleteDraft: vi.fn(),
  },
}))

describe('recruiter job pages', () => {
  beforeEach(() => vi.clearAllMocks())

  it('renders the owned jobs workspace from backend results', async () => {
    recruiterJobApi.list.mockResolvedValue({
      jobs: [
        {
          id: 'job-1',
          title: 'Backend Engineer',
          status: 'DRAFT',
          company: { companyName: 'CareerForge' },
          viewCount: 0,
          applicationCount: 0,
        },
      ],
      pagination: {
        page: 1,
        totalPages: 1,
        totalRecords: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      },
    })

    render(
      <MemoryRouter initialEntries={['/recruiter/jobs']}>
        <RecruiterJobsPage />
      </MemoryRouter>,
    )

    expect(
      await screen.findByRole('heading', { name: 'Recruiter jobs' }),
    ).toBeInTheDocument()
    expect(
      await screen.findByRole('link', { name: 'Backend Engineer' }),
    ).toHaveAttribute('href', '/recruiter/jobs/job-1')
    expect(screen.getByText('CareerForge')).toBeInTheDocument()
  })

  it('renders job details and no reopen action for a closed job', async () => {
    recruiterJobApi.getById.mockResolvedValue({
      id: 'job-1',
      title: 'Backend Engineer',
      status: 'CLOSED',
      company: { companyName: 'CareerForge', status: 'VERIFIED' },
      skills: ['Java'],
      applicationCount: 2,
      viewCount: 5,
      closedAt: '2026-08-10T08:00:00.000Z',
    })

    render(
      <MemoryRouter initialEntries={['/recruiter/jobs/job-1']}>
        <Routes>
          <Route path="/recruiter/jobs/:jobId" element={<JobDetailsPage />} />
        </Routes>
      </MemoryRouter>,
    )

    expect(
      await screen.findByRole('heading', { name: 'Backend Engineer' }),
    ).toBeInTheDocument()
    expect(
      screen.getByText(/Closed jobs cannot be reopened/i),
    ).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /reopen/i })).not.toBeInTheDocument()
  })
})
