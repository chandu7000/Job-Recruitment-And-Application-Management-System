import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import AppButton from '../../../components/common/AppButton'
import PageHeader from '../../../components/common/PageHeader'
import EmptyState from '../../../components/feedback/EmptyState'
import ErrorState from '../../../components/feedback/ErrorState'
import PageLoader from '../../../components/feedback/PageLoader'
import { useAuth } from '../../auth/hooks/useAuth'
import NotificationItem from '../components/NotificationItem'
import { useNotifications } from '../hooks/useNotifications'
import { notificationApi } from '../services/notificationApi'
import { resolveNotificationTarget } from '../utils/notification'
import { getNotificationErrorMessage } from '../utils/notificationErrors'

const DEFAULT_PAGINATION = {
  page: 1,
  limit: 10,
  totalItems: 0,
  totalPages: 1,
  hasNext: false,
  hasPrevious: false,
}

function NotificationsPage() {
  const { role } = useAuth()
  const navigate = useNavigate()
  const { syncNotifications } = useNotifications()

  const [notifications, setNotifications] = useState([])
  const [pagination, setPagination] = useState(DEFAULT_PAGINATION)
  const [readFilter, setReadFilter] = useState('all')
  const [order, setOrder] = useState('newest')
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [busyAction, setBusyAction] = useState('')

  const requestIdRef = useRef(0)

  const load = useCallback(
    async (signal) => {
      const requestId = ++requestIdRef.current

      setLoading(true)
      setError('')

      const params = {
        page,
        limit: 10,
        order,
      }

      if (readFilter === 'read') {
        params.read = true
      }

      if (readFilter === 'unread') {
        params.unread = true
      }

      try {
        const result = await notificationApi.list(params, { signal })

        if (requestId !== requestIdRef.current) {
          return
        }

        setNotifications(result.notifications)
        setPagination(result.pagination)
      } catch (loadError) {
        if (signal?.aborted || requestId !== requestIdRef.current) {
          return
        }

        setError(getNotificationErrorMessage(loadError))
      } finally {
        if (requestId === requestIdRef.current) {
          setLoading(false)
        }
      }
    },
    [order, page, readFilter],
  )

  useEffect(() => {
    const controller = new AbortController()

    const loadTimer = window.setTimeout(() => {
      load(controller.signal)
    }, 0)

    return () => {
      window.clearTimeout(loadTimer)
      controller.abort()
    }
  }, [load])

  const refreshAfterAction = async () => {
    await Promise.allSettled([
      load(),
      syncNotifications(),
    ])
  }

  const runAction = async (id, action, successMessage) => {
    if (busyAction) {
      return false
    }

    setBusyAction(id)

    try {
      await action()

      toast.success(successMessage)

      await refreshAfterAction()

      return true
    } catch (actionError) {
      toast.error(getNotificationErrorMessage(actionError))
      return false
    } finally {
      setBusyAction('')
    }
  }

  const handleMarkRead = (notification) =>
    runAction(
      notification.id,
      () => notificationApi.markRead(notification.id),
      'Notification marked as read.',
    )

  const handleDelete = (notification) =>
    runAction(
      notification.id,
      () => notificationApi.remove(notification.id),
      'Notification deleted.',
    )

  const handleMarkAll = () =>
    runAction(
      'all',
      () => notificationApi.markAllRead(),
      'All notifications marked as read.',
    )

  const handleOpen = async (notification, target) => {
    let canNavigate = true

    if (!notification.isRead) {
      canNavigate = await runAction(
        notification.id,
        () => notificationApi.markRead(notification.id),
        'Notification marked as read.',
      )
    }

    if (canNavigate && target) {
      navigate(target)
    }
  }

  return (
    <section className="space-y-6">
      <PageHeader
        title="Notifications"
        description="Review and manage notifications sent to your account."
      />

      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-white p-4">
        <label className="text-sm font-medium text-slate-700">
          Status

          <select
            value={readFilter}
            onChange={(event) => {
              setReadFilter(event.target.value)
              setPage(1)
            }}
            className="ml-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
          >
            <option value="all">All</option>
            <option value="unread">Unread</option>
            <option value="read">Read</option>
          </select>
        </label>

        <label className="text-sm font-medium text-slate-700">
          Order

          <select
            value={order}
            onChange={(event) => {
              setOrder(event.target.value)
              setPage(1)
            }}
            className="ml-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
          </select>
        </label>

        <div className="sm:ml-auto">
          <AppButton
            variant="secondary"
            size="small"
            onClick={handleMarkAll}
            disabled={
              busyAction === 'all' ||
              notifications.length === 0 ||
              notifications.every((item) => item.isRead)
            }
          >
            Mark all as read
          </AppButton>
        </div>
      </div>

      {loading ? (
        <PageLoader label="Loading notifications" />
      ) : error ? (
        <ErrorState
          title="Could not load notifications"
          message={error}
          onRetry={() => load()}
        />
      ) : notifications.length === 0 ? (
        <EmptyState
          title="No notifications"
          description="There are no notifications matching this view."
        />
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              target={resolveNotificationTarget(notification, role)}
              onOpen={handleOpen}
              onMarkRead={handleMarkRead}
              onDelete={handleDelete}
              busyAction={busyAction}
            />
          ))}
        </div>
      )}

      {!loading && !error && pagination.totalItems > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-sm text-slate-600">
            Page {pagination.page} of {pagination.totalPages} ·{' '}
            {pagination.totalItems} notifications
          </p>

          <div className="flex gap-2">
            <AppButton
              variant="secondary"
              size="small"
              disabled={!pagination.hasPrevious}
              onClick={() =>
                setPage((value) => Math.max(1, value - 1))
              }
            >
              Previous
            </AppButton>

            <AppButton
              variant="secondary"
              size="small"
              disabled={!pagination.hasNext}
              onClick={() => setPage((value) => value + 1)}
            >
              Next
            </AppButton>
          </div>
        </div>
      )}
    </section>
  )
}

export default NotificationsPage