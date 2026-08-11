import { act, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { NotificationsProvider } from '../features/notifications/context/NotificationsContext'
import { useNotifications } from '../features/notifications/hooks/useNotifications'
import { notificationApi } from '../features/notifications/services/notificationApi'

let authenticated = true

vi.mock('../features/auth/hooks/useAuth', () => ({
  useAuth: () => ({ isAuthenticated: authenticated }),
}))

vi.mock('../features/notifications/services/notificationApi', () => ({
  notificationApi: {
    unreadCount: vi.fn(),
    list: vi.fn(),
  },
}))

function Consumer() {
  const { unreadCount } = useNotifications()

  return <span>{unreadCount}</span>
}

describe('notifications context', () => {
  beforeEach(() => {
    authenticated = true

    vi.clearAllMocks()

    notificationApi.unreadCount.mockResolvedValue(2)

    notificationApi.list.mockResolvedValue({
      notifications: [],
      pagination: {},
    })
  })

  it('loads unread count for an authenticated user', async () => {
    render(
      <NotificationsProvider>
        <Consumer />
      </NotificationsProvider>,
    )

    expect(await screen.findByText('2')).toBeInTheDocument()

    expect(notificationApi.unreadCount).toHaveBeenCalledTimes(1)
  })

  it('does not poll when logged out', () => {
    authenticated = false

    render(
      <NotificationsProvider>
        <Consumer />
      </NotificationsProvider>,
    )

    expect(screen.getByText('0')).toBeInTheDocument()

    expect(notificationApi.unreadCount).not.toHaveBeenCalled()
  })

  it('refreshes unread count on the controlled polling interval', async () => {
    vi.useFakeTimers()

    try {
      render(
        <NotificationsProvider>
          <Consumer />
        </NotificationsProvider>,
      )

      await act(async () => {
        vi.advanceTimersByTime(0)
        await Promise.resolve()
      })

      expect(notificationApi.unreadCount).toHaveBeenCalledTimes(1)

      await act(async () => {
        vi.advanceTimersByTime(60_000)
        await Promise.resolve()
      })

      expect(notificationApi.unreadCount).toHaveBeenCalledTimes(2)
    } finally {
      vi.useRealTimers()
    }
  })
})