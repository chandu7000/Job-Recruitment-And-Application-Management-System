import axiosClient from '../../../api/axiosClient'
import { API_ENDPOINTS } from '../../../api/endpoints'
import { normalizeNotification, normalizeNotificationPagination } from '../utils/notification'

const unwrap = (response) => response?.data ?? {}

export const notificationApi = Object.freeze({
  list: (params = {}, { signal } = {}) =>
    axiosClient.get(API_ENDPOINTS.NOTIFICATIONS.LIST, { params, signal }).then((response) => {
      const envelope = unwrap(response)
      const items = envelope?.data?.notifications
      return {
        notifications: Array.isArray(items)
          ? items.map(normalizeNotification).filter(Boolean)
          : [],
        pagination: normalizeNotificationPagination(envelope?.meta),
      }
    }),

  unreadCount: ({ signal } = {}) =>
    axiosClient.get(API_ENDPOINTS.NOTIFICATIONS.UNREAD_COUNT, { signal })
      .then((response) => Number(unwrap(response)?.data?.unreadCount) || 0),

  markRead: (notificationId) =>
    axiosClient.patch(API_ENDPOINTS.NOTIFICATIONS.MARK_READ(notificationId))
      .then((response) => normalizeNotification(unwrap(response)?.data?.notification)),

  markAllRead: () =>
    axiosClient.patch(API_ENDPOINTS.NOTIFICATIONS.MARK_ALL_READ)
      .then((response) => Number(unwrap(response)?.data?.updatedCount) || 0),

  remove: (notificationId) =>
    axiosClient.delete(API_ENDPOINTS.NOTIFICATIONS.DELETE(notificationId)),
})
