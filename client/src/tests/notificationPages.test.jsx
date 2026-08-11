import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import NotificationsPage from '../features/notifications/pages/NotificationsPage'
import { notificationApi } from '../features/notifications/services/notificationApi'

const syncNotifications = vi.fn()
const navigate = vi.fn()

vi.mock('../features/notifications/services/notificationApi', () => ({
  notificationApi: {
    list: vi.fn(),
    markRead: vi.fn(),
    markAllRead: vi.fn(),
    remove: vi.fn(),
  },
}))

vi.mock('../features/auth/hooks/useAuth', () => ({
  useAuth: () => ({ role: 'JOB_SEEKER' }),
}))

vi.mock('../features/notifications/hooks/useNotifications', () => ({
  useNotifications: () => ({ syncNotifications }),
}))

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => navigate }
})

const listResult = {
  notifications: [
    {
      id: 'n1',
      type: 'INTERVIEW_SCHEDULED',
      title: 'Interview scheduled',
      message: 'Your interview has been scheduled.',
      resourceType: 'INTERVIEW',
      resourceId: 'i1',
      isRead: false,
      createdAt: '2026-08-11T08:00:00.000Z',
    },
  ],
  pagination: { page: 1, limit: 10, totalItems: 1, totalPages: 1, hasNext: false, hasPrevious: false },
}

beforeEach(() => {
  vi.clearAllMocks()
  notificationApi.list.mockResolvedValue(listResult)
  notificationApi.markRead.mockResolvedValue({ ...listResult.notifications[0], isRead: true })
  notificationApi.markAllRead.mockResolvedValue(1)
  notificationApi.remove.mockResolvedValue(undefined)
  syncNotifications.mockResolvedValue(undefined)
})

describe('notification center', () => {
  it('renders backend notifications and safe related navigation', async () => {
    render(<MemoryRouter><NotificationsPage /></MemoryRouter>)
    expect(await screen.findByRole('heading', { name: 'Notifications' })).toBeInTheDocument()
    expect(await screen.findByRole('heading', {
      name: 'Interview scheduled',
    })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Open related item' }))
    await waitFor(() => expect(notificationApi.markRead).toHaveBeenCalledWith('n1'))
    await waitFor(() => expect(navigate).toHaveBeenCalledWith('/job-seeker/interviews/i1'))
  })

  it('marks all notifications read and refreshes backend-confirmed data', async () => {
    render(<MemoryRouter><NotificationsPage /></MemoryRouter>)
    await screen.findByRole('heading', {
      name: 'Interview scheduled',
    })
    fireEvent.click(screen.getByRole('button', { name: 'Mark all as read' }))
    await waitFor(() => expect(notificationApi.markAllRead).toHaveBeenCalled())
    await waitFor(() => expect(notificationApi.list).toHaveBeenCalledTimes(2))
    expect(syncNotifications).toHaveBeenCalled()
  })

  it('deletes a notification through the verified backend endpoint', async () => {
    render(<MemoryRouter><NotificationsPage /></MemoryRouter>)
    await screen.findByRole('heading', {
      name: 'Interview scheduled',
    })
    fireEvent.click(screen.getByRole('button', { name: 'Delete' }))
    await waitFor(() => expect(notificationApi.remove).toHaveBeenCalledWith('n1'))
  })
})
