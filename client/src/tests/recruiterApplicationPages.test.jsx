import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import RecruiterApplicantsPage from '../features/applications/pages/RecruiterApplicantsPage'
import RecruiterApplicationDetailsPage from '../features/applications/pages/RecruiterApplicationDetailsPage'
import { recruiterApplicationApi } from '../features/applications/services/recruiterApplicationApi'

vi.mock('../features/applications/services/recruiterApplicationApi', () => ({
  recruiterApplicationApi: {
    listByJob: vi.fn(),
    details: vi.fn(),
    saveNotes: vi.fn(),
    updateStatus: vi.fn(),
  },
}))

describe('recruiter applicant pages', () => {
  beforeEach(() => vi.clearAllMocks())

  it('renders applicants for the route job id', async () => {
    recruiterApplicationApi.listByJob.mockResolvedValue({
      applications: [{
        id: 'a1',
        jobId: 'job-1',
        status: 'APPLIED',
        createdAt: '2026-08-11T08:00:00.000Z',
        candidateSnapshot: { firstName: 'Asha', lastName: 'Rao', headline: 'Java Developer' },
        resumeSnapshot: { url: 'https://example.com/resume.pdf' },
      }],
      pagination: { page: 1, totalPages: 1 },
    })

    render(
      <MemoryRouter initialEntries={['/recruiter/jobs/job-1/applicants']}>
        <Routes>
          <Route path="/recruiter/jobs/:jobId/applicants" element={<RecruiterApplicantsPage />} />
        </Routes>
      </MemoryRouter>,
    )

    expect(await screen.findByRole('heading', { name: 'Applicants' })).toBeInTheDocument()
    expect(await screen.findAllByText('Asha Rao')).not.toHaveLength(0)
    expect(recruiterApplicationApi.listByJob).toHaveBeenCalledWith(
      'job-1',
      expect.objectContaining({ page: 1, limit: 10 }),
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    )
  })

  it('renders candidate details, recruiter note and recruiter actions', async () => {
    recruiterApplicationApi.details.mockResolvedValue({
      id: 'a1',
      jobId: 'job-1',
      status: 'APPLIED',
      createdAt: '2026-08-11T08:00:00.000Z',
      candidateSnapshot: { firstName: 'Asha', lastName: 'Rao', email: 'asha@example.com' },
      candidateProfile: {
        biography: 'Backend candidate',
        skills: [{ id: 's1', skillName: 'Java' }],
        experiences: [],
        educations: [],
        projects: [],
      },
      jobSnapshot: { title: 'Junior Software Engineer' },
      resumeSnapshot: { url: 'https://example.com/resume.pdf', originalName: 'asha.pdf' },
      recruiterNotes: 'Strong fundamentals',
      statusHistory: [],
    })

    render(
      <MemoryRouter initialEntries={['/recruiter/applications/a1']}>
        <Routes>
          <Route path="/recruiter/applications/:applicationId" element={<RecruiterApplicationDetailsPage />} />
        </Routes>
      </MemoryRouter>,
    )

    expect(await screen.findByRole('heading', { name: 'Asha Rao' })).toBeInTheDocument()
    expect(screen.getByText('Java')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Strong fundamentals')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Move to under review' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Shortlisted' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Rejected' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /interview/i })).not.toBeInTheDocument()
  })
})
