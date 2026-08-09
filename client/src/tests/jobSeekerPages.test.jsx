import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import ProfilePage from '../features/jobSeeker/pages/ProfilePage'
import ResourceManagementPage from '../features/jobSeeker/pages/ResourceManagementPage'
import { jobSeekerApi } from '../features/jobSeeker/services/jobSeekerApi'

vi.mock('../features/jobSeeker/services/jobSeekerApi', () => ({
  jobSeekerApi: {
    profile: vi.fn(), completion: vi.fn(), list: vi.fn(), create: vi.fn(), update: vi.fn(), remove: vi.fn(),
  },
}))

describe('Phase 5 job seeker pages', () => {
  beforeEach(() => vi.clearAllMocks())

  it('renders backend profile completion fields and missing sections', async () => {
    jobSeekerApi.profile.mockResolvedValue({ firstName: 'Chandra', lastName: 'Sekhar', headline: 'Java Developer', location: 'Vijayawada' })
    jobSeekerApi.completion.mockResolvedValue({ completionPercentage: 50, completedSections: ['personal'], missingSections: ['resume'] })
    render(<MemoryRouter><ProfilePage /></MemoryRouter>)
    expect(await screen.findByRole('heading', { name: 'Chandra Sekhar' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Completion: 50%' })).toBeInTheDocument()
    expect(screen.getByText(/Missing: Resume/)).toBeInTheDocument()
  })

  it('renders an accessible empty state and opens the education form', async () => {
    jobSeekerApi.list.mockResolvedValue([])
    render(<ResourceManagementPage resource="education" />)
    expect(await screen.findByRole('heading', { name: 'No education yet' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Add' }))
    expect(screen.getByLabelText(/Institution/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Degree/)).toBeInTheDocument()
  })
})
