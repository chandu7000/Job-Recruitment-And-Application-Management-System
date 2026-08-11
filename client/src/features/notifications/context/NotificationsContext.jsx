import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'

import { useAuth } from '../../auth/hooks/useAuth'
import { notificationApi } from '../services/notificationApi'
import { NotificationsContext } from './NotificationsContextDefinition'

const POLL_INTERVAL_MS = 60_000

export function NotificationsProvider({ children }) {
  const { isAuthenticated } = useAuth()

  const [unreadCount, setUnreadCount] = useState(0)
  const [recentNotifications, setRecentNotifications] = useState([])
  const [isSummaryLoading, setIsSummaryLoading] = useState(false)

  const unreadRequestRef = useRef(false)
  const summaryRequestRef = useRef(false)

  const refreshUnreadCount = useCallback(async () => {
    if (!isAuthenticated || unreadRequestRef.current) {
      return
    }

    unreadRequestRef.current = true

    try {
      const count = await notificationApi.unreadCount()
      setUnreadCount(count)
    } catch {
      // Notification polling failure must not break authenticated navigation.
    } finally {
      unreadRequestRef.current = false
    }
  }, [isAuthenticated])

  const refreshSummary = useCallback(async () => {
    if (!isAuthenticated || summaryRequestRef.current) {
      return
    }

    summaryRequestRef.current = true
    setIsSummaryLoading(true)

    try {
      const result = await notificationApi.list({
        page: 1,
        limit: 5,
        order: 'newest',
      })

      setRecentNotifications(result.notifications)
    } finally {
      setIsSummaryLoading(false)
      summaryRequestRef.current = false
    }
  }, [isAuthenticated])

  const syncNotifications = useCallback(async () => {
    await Promise.allSettled([
      refreshUnreadCount(),
      refreshSummary(),
    ])
  }, [refreshSummary, refreshUnreadCount])

  useEffect(() => {
    if (!isAuthenticated) {
      const resetTimer = window.setTimeout(() => {
        setUnreadCount(0)
        setRecentNotifications([])
        setIsSummaryLoading(false)
      }, 0)

      return () => {
        window.clearTimeout(resetTimer)
      }
    }

    const initialRefreshTimer = window.setTimeout(() => {
      refreshUnreadCount()
    }, 0)

    const intervalId = window.setInterval(() => {
      refreshUnreadCount()
    }, POLL_INTERVAL_MS)

    return () => {
      window.clearTimeout(initialRefreshTimer)
      window.clearInterval(intervalId)

      unreadRequestRef.current = false
      summaryRequestRef.current = false
    }
  }, [isAuthenticated, refreshUnreadCount])

  const value = useMemo(
    () => ({
      unreadCount,
      recentNotifications,
      isSummaryLoading,
      refreshUnreadCount,
      refreshSummary,
      syncNotifications,
    }),
    [
      unreadCount,
      recentNotifications,
      isSummaryLoading,
      refreshUnreadCount,
      refreshSummary,
      syncNotifications,
    ],
  )

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  )
}