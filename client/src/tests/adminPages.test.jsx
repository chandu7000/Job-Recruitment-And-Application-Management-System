import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import AdminDashboardPage from '../features/admin/pages/AdminDashboardPage'
import AdminUsersPage from '../features/admin/pages/AdminUsersPage'
import AdminUserDetailsPage from '../features/admin/pages/AdminUserDetailsPage'
import { adminApi } from '../features/admin/services/adminApi'

vi.mock('../features/admin/services/adminApi', () => ({
  adminApi: {
    dashboard: vi.fn(),
    listUsers: vi.fn(),
    getUser: vi.fn(),
    activateUser: vi.fn(),
    disableUser: vi.fn(),
    suspendUser: vi.fn(),
  },
}))

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}))

const user = {
  id: 'user-1',
  email: 'candidate@example.com',
  role: 'JOB_SEEKER',
  status: 'ACTIVE',
  emailVerifiedAt: '2026-08-01T10:00:00.000Z',
  createdAt: '2026-07-01T10:00:00.000Z',
  updatedAt: '2026-08-01T10:00:00.000Z',
  lastLoginAt: '2026-08-10T10:00:00.000Z',
}

describe('Recruiter API service', () => {
  beforeEach(() => vi.clearAllMocks())

  it('renders real dashboard metrics without invented values', async () => {
    adminApi.dashboard.mockResolvedValue({
      users: {
        total: 12,
        byRole: { JOB_SEEKER: 8, RECRUITER: 3, ADMIN: 1 },
        byStatus: { ACTIVE: 9, DISABLED: 1, SUSPENDED: 1, PENDING_VERIFICATION: 1 },
      },
    })

    render(<AdminDashboardPage />)

    expect(await screen.findByRole('heading', { name: 'Admin dashboard' })).toBeInTheDocument()
    expect(screen.getByText('12')).toBeInTheDocument()
    expect(screen.getByText('Job Seekers')).toBeInTheDocument()
    expect(screen.queryByText(/recent registrations/i)).not.toBeInTheDocument()
  })

  it('renders users and sends backend-supported search/filter values', async () => {
    adminApi.listUsers.mockResolvedValue({
      users: [user],
      pagination: { page: 1, totalPages: 1, totalRecords: 1, hasNextPage: false, hasPreviousPage: false },
    })

    render(
      <MemoryRouter initialEntries={['/admin/users']}>
        <AdminUsersPage />
      </MemoryRouter>,
    )

    expect(await screen.findByText('candidate@example.com')).toBeInTheDocument()
    expect(screen.getAllByText('Job Seeker')).toHaveLength(2)
    expect(screen.getByRole('link', { name: 'View details' })).toHaveAttribute('href', '/admin/users/user-1')

    fireEvent.change(screen.getByLabelText('Search users by email'), { target: { value: 'candidate@example.com' } })
    fireEvent.change(screen.getByLabelText('Filter users by role'), { target: { value: 'JOB_SEEKER' } })
    fireEvent.click(screen.getByRole('button', { name: 'Search' }))

    await waitFor(() => expect(adminApi.listUsers).toHaveBeenLastCalledWith(
      expect.objectContaining({ search: 'candidate@example.com', role: 'JOB_SEEKER', page: 1 }),
      expect.any(AbortSignal),
    ))
  })

  it('requires confirmation and refreshes after a backend-confirmed disable', async () => {
    adminApi.getUser.mockResolvedValueOnce(user).mockResolvedValueOnce({ ...user, status: 'DISABLED' })
    adminApi.disableUser.mockResolvedValue({ ...user, status: 'DISABLED' })

    render(
      <MemoryRouter initialEntries={['/admin/users/user-1']}>
        <Routes>
          <Route path="/admin/users/:userId" element={<AdminUserDetailsPage />} />
        </Routes>
      </MemoryRouter>,
    )

    expect(await screen.findByText('candidate@example.com')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Disable user' }))
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Disable user' }))

    await waitFor(() => expect(adminApi.disableUser).toHaveBeenCalledWith('user-1'))
    await waitFor(() => expect(adminApi.getUser).toHaveBeenCalledTimes(2))
    expect(await screen.findByText('Disabled')).toBeInTheDocument()
  })
})
