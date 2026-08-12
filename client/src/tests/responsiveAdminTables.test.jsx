import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import AdminUsersPage from '../features/admin/pages/AdminUsersPage'
import { adminApi } from '../features/admin/services/adminApi'

vi.mock('../features/admin/services/adminApi', () => ({
  adminApi: { listUsers: vi.fn() },
}))

const user = {
  id: 'user-1',
  email: 'candidate@example.com',
  role: 'JOB_SEEKER',
  status: 'ACTIVE',
  emailVerifiedAt: '2026-08-01T10:00:00.000Z',
  createdAt: '2026-07-01T10:00:00.000Z',
}

describe('responsive admin tables', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    adminApi.listUsers.mockResolvedValue({
      users: [user],
      pagination: {
        page: 1,
        totalPages: 1,
        totalRecords: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      },
    })
  })

  it('keeps one semantic table and provides mobile field labels without duplicating records', async () => {
    render(
      <MemoryRouter>
        <AdminUsersPage />
      </MemoryRouter>,
    )

    expect(await screen.findByText('candidate@example.com')).toBeInTheDocument()

    const table = screen.getByRole('table')
    expect(table).toHaveClass('responsive-data-table')
    expect(screen.getAllByText('candidate@example.com')).toHaveLength(1)

    expect(screen.getByText('candidate@example.com').closest('td')).toHaveAttribute('data-label', 'Email')
    expect(screen.getByRole('link', { name: 'View details' }).closest('td')).toHaveAttribute('data-label', 'Action')
  })
})
