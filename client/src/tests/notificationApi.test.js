import { beforeEach, describe, expect, it, vi } from 'vitest'
import axiosClient from '../api/axiosClient'
import { API_ENDPOINTS } from '../api/endpoints'
import { notificationApi } from '../features/notifications/services/notificationApi'

vi.mock('../api/axiosClient', () => ({
  default: { get: vi.fn(), patch: vi.fn(), delete: vi.fn() },
}))

beforeEach(() => vi.clearAllMocks())

describe('notification api', () => {
  it('lists and normalizes notifications with pagination', async () => {
    axiosClient.get.mockResolvedValue({
      data: {
        data: { notifications: [{ id: 'n1', isRead: 0, title: 'Interview scheduled' }] },
        meta: { page: 2, limit: 10, totalItems: 11, totalPages: 2, hasPrevious: true },
      },
    })

    const result = await notificationApi.list({ page: 2 })
    expect(axiosClient.get).toHaveBeenCalledWith(API_ENDPOINTS.NOTIFICATIONS.LIST, { params: { page: 2 }, signal: undefined })
    expect(result.notifications[0].isRead).toBe(false)
    expect(result.pagination.totalItems).toBe(11)
    expect(result.pagination.hasPrevious).toBe(true)
  })

  it('reads unread count and marks one notification read', async () => {
    axiosClient.get.mockResolvedValue({ data: { data: { unreadCount: 3 } } })
    expect(await notificationApi.unreadCount()).toBe(3)

    axiosClient.patch.mockResolvedValue({ data: { data: { notification: { id: 'n1', isRead: true } } } })
    const notification = await notificationApi.markRead('n1')
    expect(axiosClient.patch).toHaveBeenCalledWith('/notifications/n1/read')
    expect(notification.isRead).toBe(true)
  })

  it('marks all read and deletes an owned notification', async () => {
    axiosClient.patch.mockResolvedValue({ data: { data: { updatedCount: 4 } } })
    expect(await notificationApi.markAllRead()).toBe(4)
    expect(axiosClient.patch).toHaveBeenCalledWith(API_ENDPOINTS.NOTIFICATIONS.MARK_ALL_READ)

    axiosClient.delete.mockResolvedValue({ data: { success: true } })
    await notificationApi.remove('n1')
    expect(axiosClient.delete).toHaveBeenCalledWith('/notifications/n1')
  })
})
