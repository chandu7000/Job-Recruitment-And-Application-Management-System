import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AuthContext } from '../features/auth/context/AuthContextDefinition'
import ApplyJobLink from '../features/applications/components/ApplyJobLink'
import SaveJobButton from '../features/applications/components/SaveJobButton'
import { SavedJobsContext } from '../features/applications/context/SavedJobsContextDefinition'
import { applicationsApi } from '../features/applications/services/applicationApi'

vi.mock('../features/applications/services/applicationApi', () => ({
  applicationsApi: {
    list: vi.fn(),
  },
}))

const job = {
  id: 'job-1',
  title: 'Engineer',
}

describe('Phase 8 job actions', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    applicationsApi.list.mockResolvedValue({
      applications: [],
      pagination: {},
    })
  })

  it('shows sign in to apply for a guest', () => {
    render(
      <MemoryRouter>
        <ApplyJobLink job={job} />
      </MemoryRouter>,
    )

    expect(
      screen.getByRole('link', {
        name: /sign in to apply/i,
      }),
    ).toHaveAttribute('href', '/login')
  })

  it('shows apply and saved controls for a job seeker', async () => {
    const remove = vi.fn()

    render(
      <AuthContext.Provider
        value={{
          isAuthenticated: true,
          role: 'JOB_SEEKER',
        }}
      >
        <SavedJobsContext.Provider
          value={{
            isSaved: () => true,
            isPending: () => false,
            save: vi.fn(),
            remove,
          }}
        >
          <MemoryRouter>
            <ApplyJobLink job={job} />
            <SaveJobButton jobId={job.id} />
          </MemoryRouter>
        </SavedJobsContext.Provider>
      </AuthContext.Provider>,
    )

    const applyLink = await screen.findByRole('link', {
      name: /apply now/i,
    })

    expect(applyLink).toHaveAttribute(
      'href',
      '/job-seeker/apply/job-1',
    )

    fireEvent.click(
      screen.getByRole('button', {
        name: /saved/i,
      }),
    )

    expect(remove).toHaveBeenCalledWith('job-1')
  })

  it('saves an unsaved job and disables the control while a mutation is pending', async () => {
    const save = vi.fn()
    const { rerender } = render(
      <AuthContext.Provider value={{ isAuthenticated: true, role: 'JOB_SEEKER' }}>
        <SavedJobsContext.Provider
          value={{
            isSaved: () => false,
            isPending: () => false,
            save,
            remove: vi.fn(),
          }}
        >
          <SaveJobButton jobId={job.id} />
        </SavedJobsContext.Provider>
      </AuthContext.Provider>,
    )

    fireEvent.click(screen.getByRole('button', { name: /save job/i }))
    expect(save).toHaveBeenCalledWith('job-1')

    rerender(
      <AuthContext.Provider value={{ isAuthenticated: true, role: 'JOB_SEEKER' }}>
        <SavedJobsContext.Provider
          value={{
            isSaved: () => false,
            isPending: () => true,
            save,
            remove: vi.fn(),
          }}
        >
          <SaveJobButton jobId={job.id} />
        </SavedJobsContext.Provider>
      </AuthContext.Provider>,
    )

    expect(screen.getByRole('button', { name: /save job/i })).toBeDisabled()
  })

  it('hides save action for recruiter role', () => {
    render(
      <AuthContext.Provider
        value={{
          isAuthenticated: true,
          role: 'RECRUITER',
        }}
      >
        <SavedJobsContext.Provider
          value={{
            isSaved: () => false,
            isPending: () => false,
          }}
        >
          <SaveJobButton jobId={job.id} />
        </SavedJobsContext.Provider>
      </AuthContext.Provider>,
    )

    expect(
      screen.queryByRole('button', {
        name: /save job/i,
      }),
    ).not.toBeInTheDocument()
  })
})