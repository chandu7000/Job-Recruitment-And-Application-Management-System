import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import ApplyPage from '../features/applications/pages/ApplyPage'
import { applicationsApi } from '../features/applications/services/applicationApi'
import { jobSeekerApi } from '../features/jobSeeker/services/jobSeekerApi'
import { publicJobApi } from '../features/publicJobs/services/publicJobApi'
import { toast } from 'sonner'

vi.mock('../features/applications/services/applicationApi', () => ({
  applicationsApi: { apply: vi.fn() },
}))
vi.mock('../features/jobSeeker/services/jobSeekerApi', () => ({
  jobSeekerApi: { profile: vi.fn() },
}))
vi.mock('../features/publicJobs/services/publicJobApi', () => ({
  publicJobApi: { getById: vi.fn() },
}))
vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}))

const job = {
  id: 'job-1',
  title: 'Backend Engineer',
  slug: 'backend-engineer',
  location: 'Hyderabad',
  company: { companyName: 'Acme Labs' },
}

const completeProfile = {
  firstName: 'Asha',
  lastName: 'Rao',
  resumeUrl: 'https://example.com/resume.pdf',
  resumeOriginalName: 'asha-resume.pdf',
}

function renderApplyPage() {
  return render(
    <MemoryRouter initialEntries={['/job-seeker/apply/job-1']}>
      <Routes>
        <Route path="/job-seeker/apply/:jobId" element={<ApplyPage />} />
        <Route path="/job-seeker/application-success/:applicationId" element={<h1>Application submitted</h1>} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('application submission page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    publicJobApi.getById.mockResolvedValue(job)
    jobSeekerApi.profile.mockResolvedValue({ profile: completeProfile })
  })

  it('shows a loading state while application prerequisites are being prepared', () => {
    publicJobApi.getById.mockReturnValue(new Promise(() => { }))
    jobSeekerApi.profile.mockReturnValue(new Promise(() => { }))

    renderApplyPage()

    expect(screen.getByRole('status')).toBeInTheDocument()
    expect(screen.getAllByText('Loading page')).toHaveLength(2)
  })

  it('blocks submission when required candidate profile or resume data is missing', async () => {
    jobSeekerApi.profile.mockResolvedValue({ profile: { ...completeProfile, resumeUrl: null } })

    renderApplyPage()

    expect(await screen.findByText('An uploaded resume is required.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Submit application' })).toBeDisabled()
    expect(applicationsApi.apply).not.toHaveBeenCalled()
  })

  it('submits the backend-supported cover-letter payload once and redirects after success', async () => {
    const user = userEvent.setup()
    applicationsApi.apply.mockResolvedValue({ id: 'application-1', status: 'APPLIED' })

    renderApplyPage()

    const coverLetter = await screen.findByLabelText(/Cover letter/i)
    await user.type(coverLetter, '  I am interested in this role.  ')
    await user.click(screen.getByRole('button', { name: 'Submit application' }))

    await waitFor(() => expect(applicationsApi.apply).toHaveBeenCalledWith('job-1', {
      coverLetter: 'I am interested in this role.',
    }))
    expect(applicationsApi.apply).toHaveBeenCalledTimes(1)
    expect(toast.success).toHaveBeenCalledWith('Application submitted successfully.')
    expect(await screen.findByRole('heading', { name: 'Application submitted' })).toBeInTheDocument()
  })

  it('prevents rapid double submission while the backend request is pending', async () => {
    const user = userEvent.setup()
    let resolveApply
    applicationsApi.apply.mockReturnValue(new Promise((resolve) => { resolveApply = resolve }))

    renderApplyPage()

    await screen.findByText('asha-resume.pdf')
    const submitButton = screen.getByRole('button', { name: 'Submit application' })
    await user.click(submitButton)

    expect(submitButton).toBeDisabled()
    await user.click(submitButton)
    expect(applicationsApi.apply).toHaveBeenCalledTimes(1)

    resolveApply({ id: 'application-1', status: 'APPLIED' })
    await screen.findByRole('heading', { name: 'Application submitted' })
  })

  it('keeps the form available and shows backend conflict guidance after a duplicate application', async () => {
    const user = userEvent.setup()
    applicationsApi.apply.mockRejectedValue({
      apiError: {
        status: 409,
        code: 'APPLICATION_ALREADY_EXISTS',
        message: 'You have already applied for this job.',
      },
    })

    renderApplyPage()

    const coverLetter = await screen.findByLabelText(/Cover letter/i)
    await user.type(coverLetter, 'Keep this value')
    await user.click(screen.getByRole('button', { name: 'Submit application' }))

    await waitFor(() => expect(toast.error).toHaveBeenCalled())
    expect(coverLetter).toHaveValue('Keep this value')
  })
})
