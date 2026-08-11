import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import NotificationBell from '../features/notifications/components/NotificationBell'

const refreshSummary = vi.fn().mockResolvedValue(undefined)

vi.mock('../features/auth/hooks/useAuth', () => ({
  useAuth: () => ({ role: 'RECRUITER' }),
}))

vi.mock('../features/notifications/hooks/useNotifications', () => ({
  useNotifications: () => ({
    unreadCount: 2,
    recentNotifications: [{ id: 'n1', title: 'Candidate confirmed', message: 'The candidate confirmed attendance.', isRead: false, createdAt: '2026-08-11T08:00:00.000Z' }],
    isSummaryLoading: false,
    refreshSummary,
  }),
}))

describe('notification bell', () => {
  it('shows unread badge, recent summary, and role notification route', () => {
    render(<MemoryRouter><NotificationBell /></MemoryRouter>)
    expect(screen.getByRole('button', { name: 'Notifications, 2 unread' })).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Notifications, 2 unread' }))
    expect(screen.getByText('Candidate confirmed')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'View all notifications' })).toHaveAttribute('href', '/recruiter/notifications')
    expect(refreshSummary).toHaveBeenCalled()
  })
})
