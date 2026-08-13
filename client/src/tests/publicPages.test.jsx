import {
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react'
import {
  MemoryRouter,
  Route,
  Routes,
} from 'react-router-dom'
import {
  afterEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest'
import CompanyDetailsPage from '../features/publicJobs/pages/CompanyDetailsPage'
import JobDetailsPage from '../features/publicJobs/pages/JobDetailsPage'
import JobsPage from '../features/publicJobs/pages/JobsPage'
import { publicCompanyApi } from '../features/publicJobs/services/publicCompanyApi'
import { publicJobApi } from '../features/publicJobs/services/publicJobApi'
import { AuthContext } from '../features/auth/context/AuthContextDefinition'
import HomePage from '../pages/HomePage'

vi.mock(
  '../features/publicJobs/services/publicJobApi',
  () => ({
    publicJobApi: {
      list: vi.fn(),
      getBySlug: vi.fn(),
      getSimilar: vi.fn(),
    },
  }),
)

vi.mock(
  '../features/publicJobs/services/publicCompanyApi',
  () => ({
    publicCompanyApi: {
      getBySlug: vi.fn(),
      listJobsBySlug: vi.fn(),
    },
  }),
)

const company = {
  id: 'company-1',
  companyName: 'Acme Labs',
  slug: 'acme-labs',
  industry: 'Technology',
  website: 'https://example.com',
}

const job = {
  id: 'job-1',
  title: 'Backend Engineer',
  slug: 'backend-engineer',
  description: 'Build reliable services.',
  skills: ['Java'],
  company,
}

const pagination = {
  page: 1,
  totalPages: 1,
  totalRecords: 1,
  hasPreviousPage: false,
  hasNextPage: false,
}

function renderAt(path, route, element) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route
          path={route}
          element={element}
        />
      </Routes>
    </MemoryRouter>,
  )
}

describe('Phase 4 public pages', () => {
  afterEach(() => {
    vi.resetAllMocks()
  })

  it('loads the latest jobs on home and carries search into the jobs URL', async () => {
    publicJobApi.list.mockResolvedValue({
      jobs: [job],
      pagination,
    })

    render(
      <AuthContext.Provider
        value={{
          isAuthenticated: false,
          role: null,
        }}
      >
        <MemoryRouter initialEntries={['/']}>
          <Routes>
            <Route
              path="/"
              element={<HomePage />}
            />

            <Route
              path="/jobs"
              element={<JobsPage />}
            />
          </Routes>
        </MemoryRouter>
      </AuthContext.Provider>,
    )

    expect(
      await screen.findByRole('link', {
        name: 'Backend Engineer',
      }),
    ).toBeInTheDocument()

    fireEvent.change(
      screen.getByLabelText(
        'Job title or keyword',
      ),
      {
        target: {
          value: 'Java',
        },
      },
    )

    fireEvent.change(
      screen.getByLabelText('Location'),
      {
        target: {
          value: 'Hyderabad',
        },
      },
    )

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Search jobs',
      }),
    )

    expect(
      await screen.findByDisplayValue('Java'),
    ).toBeInTheDocument()

    expect(
      screen.getByDisplayValue('Hyderabad'),
    ).toBeInTheDocument()
  })

  it('loads URL-restored job results, filters, and sorting', async () => {
    const list =
      publicJobApi.list.mockResolvedValue({
        jobs: [job],
        pagination,
      })

    renderAt(
      '/jobs?search=backend&workMode=REMOTE&sort=relevance',
      '/jobs',
      <JobsPage />,
    )

    expect(
      await screen.findByRole('link', {
        name: 'Backend Engineer',
      }),
    ).toBeInTheDocument()

    expect(
      screen.getByDisplayValue('backend'),
    ).toBeInTheDocument()

    expect(
      screen.getByRole('combobox', {
        name: 'Sort jobs',
      }),
    ).toHaveValue('relevance')

    expect(list).toHaveBeenCalledWith(
      expect.objectContaining({
        search: 'backend',
        workMode: 'REMOTE',
        sort: 'relevance',
      }),
      expect.any(Object),
    )
  })

  it('shows and then clears the API-driven loading state when job results resolve', async () => {
    let resolveList

    publicJobApi.list.mockReturnValue(
      new Promise((resolve) => {
        resolveList = resolve
      }),
    )

    renderAt(
      '/jobs',
      '/jobs',
      <JobsPage />,
    )

    expect(
      screen.getByRole('status'),
    ).toHaveTextContent('Loading jobs')

    resolveList({
      jobs: [job],
      pagination,
    })

    expect(
      await screen.findByRole('link', {
        name: 'Backend Engineer',
      }),
    ).toBeInTheDocument()

    expect(
      screen.queryByRole('status'),
    ).not.toBeInTheDocument()
  })

  it('changes pagination through URL state, preserves filters, and resets page when search changes', async () => {
    window.scrollTo = vi.fn()

    publicJobApi.list.mockResolvedValue({
      jobs: [job],
      pagination: {
        page: 2,
        totalPages: 3,
        totalRecords: 21,
        hasPreviousPage: true,
        hasNextPage: true,
      },
    })

    renderAt(
      '/jobs?search=java&location=Hyderabad&page=2',
      '/jobs',
      <JobsPage />,
    )

    expect(
      await screen.findByRole('link', {
        name: 'Backend Engineer',
      }),
    ).toBeInTheDocument()

    fireEvent.click(
      screen.getByRole('button', {
        name: /next/i,
      }),
    )

    await waitFor(() =>
      expect(
        publicJobApi.list,
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          search: 'java',
          location: 'Hyderabad',
          page: '3',
        }),
        expect.any(Object),
      ),
    )

    fireEvent.change(
      screen.getByLabelText('Keyword'),
      {
        target: {
          value: 'spring',
        },
      },
    )

    await waitFor(() =>
      expect(
        publicJobApi.list,
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          search: 'spring',
          location: 'Hyderabad',
          page: '1',
        }),
        expect.any(Object),
      ),
    )
  })

  it('loads job details and similar jobs from real service boundaries', async () => {
    publicJobApi.getBySlug.mockResolvedValue(
      job,
    )

    publicJobApi.getSimilar.mockResolvedValue({
      jobs: [],
      meta: {},
    })

    renderAt(
      '/jobs/backend-engineer',
      '/jobs/:jobSlug',
      <JobDetailsPage />,
    )

    expect(
      await screen.findByRole('heading', {
        name: 'Backend Engineer',
      }),
    ).toBeInTheDocument()

    expect(
      screen.getByText(
        'Build reliable services.',
      ),
    ).toBeInTheDocument()

    await waitFor(() =>
      expect(
        publicJobApi.getSimilar,
      ).toHaveBeenCalledWith(
        'job-1',
        5,
        expect.any(Object),
      ),
    )
  })

  it('loads company details and its public jobs', async () => {
    publicCompanyApi.getBySlug.mockResolvedValue(
      company,
    )

    publicCompanyApi.listJobsBySlug.mockResolvedValue({
      jobs: [job],
      pagination,
    })

    renderAt(
      '/companies/acme-labs',
      '/companies/:companySlug',
      <CompanyDetailsPage />,
    )

    expect(
      await screen.findByRole('heading', {
        name: 'Acme Labs',
      }),
    ).toBeInTheDocument()

    expect(
      await screen.findByRole('link', {
        name: 'Backend Engineer',
      }),
    ).toBeInTheDocument()

    expect(
      screen.getByRole('link', {
        name: /visit website/i,
      }),
    ).toHaveAttribute(
      'rel',
      'noopener noreferrer',
    )
  })

  it('renders empty and error job-result states', async () => {
    publicJobApi.list.mockResolvedValueOnce({
      jobs: [],
      pagination: {
        ...pagination,
        totalRecords: 0,
      },
    })

    const view = renderAt(
      '/jobs',
      '/jobs',
      <JobsPage />,
    )

    expect(
      await screen.findByRole('heading', {
        name: 'No jobs match your search',
      }),
    ).toBeInTheDocument()

    view.unmount()

    publicJobApi.list.mockRejectedValueOnce(
      new Error('Connection unavailable'),
    )

    renderAt(
      '/jobs',
      '/jobs',
      <JobsPage />,
    )

    expect(
      await screen.findByText(
        'Connection unavailable',
      ),
    ).toBeInTheDocument()
  })

  it('renders unavailable states for invalid job and company slugs', async () => {
    const notFound = {
      response: {
        status: 404,
        data: {
          message: 'Not found',
        },
      },
    }

    publicJobApi.getBySlug.mockRejectedValueOnce(
      notFound,
    )

    const jobView = renderAt(
      '/jobs/missing',
      '/jobs/:jobSlug',
      <JobDetailsPage />,
    )

    expect(
      await screen.findByRole('heading', {
        name: 'Job not found',
      }),
    ).toBeInTheDocument()

    jobView.unmount()

    publicCompanyApi.getBySlug.mockRejectedValueOnce(
      notFound,
    )

    publicCompanyApi.listJobsBySlug.mockResolvedValue({
      jobs: [],
      pagination,
    })

    renderAt(
      '/companies/missing',
      '/companies/:companySlug',
      <CompanyDetailsPage />,
    )

    expect(
      await screen.findByRole('heading', {
        name: 'Company not found',
      }),
    ).toBeInTheDocument()
  })
})