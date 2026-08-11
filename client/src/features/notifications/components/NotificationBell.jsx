import { Bell } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../auth/hooks/useAuth'
import { useNotifications } from '../hooks/useNotifications'
import { formatNotificationTime, notificationCenterPath } from '../utils/notification'

function NotificationBell() {
  const { role } = useAuth()
  const { unreadCount, recentNotifications, isSummaryLoading, refreshSummary } = useNotifications()
  const [open, setOpen] = useState(false)
  const containerRef = useRef(null)
  const centerPath = notificationCenterPath(role)

  useEffect(() => {
    if (!open) return undefined
    const handleOutside = (event) => {
      if (!containerRef.current?.contains(event.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleOutside)
    return () => document.removeEventListener('mousedown', handleOutside)
  }, [open])

  if (!centerPath) return null

  const toggle = () => {
    const next = !open
    setOpen(next)
    if (next) refreshSummary().catch(() => {})
  }

  return (
    <div className="relative" ref={containerRef}>
      <button type="button" aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ''}`} aria-expanded={open} onClick={toggle} className="relative rounded-lg p-2 text-slate-600 transition hover:bg-slate-100 hover:text-slate-950">
        <Bell className="size-5" aria-hidden="true" />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 min-w-5 rounded-full bg-red-600 px-1.5 py-0.5 text-center text-[10px] font-bold leading-4 text-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
            <p className="font-semibold text-slate-950">Notifications</p>
            <span className="text-xs text-slate-500">{unreadCount} unread</span>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {isSummaryLoading ? (
              <p className="p-4 text-sm text-slate-500">Loading notifications...</p>
            ) : recentNotifications.length === 0 ? (
              <p className="p-4 text-sm text-slate-500">No notifications yet.</p>
            ) : recentNotifications.map((notification) => (
              <div key={notification.id} className={`border-b border-slate-100 px-4 py-3 last:border-b-0 ${notification.isRead ? '' : 'bg-brand-50/40'}`}>
                <p className="truncate text-sm font-semibold text-slate-900">{notification.title}</p>
                <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-600">{notification.message}</p>
                <p className="mt-1 text-[11px] text-slate-400">{formatNotificationTime(notification.createdAt)}</p>
              </div>
            ))}
          </div>
          <Link to={centerPath} onClick={() => setOpen(false)} className="block border-t border-slate-200 px-4 py-3 text-center text-sm font-semibold text-brand-700 hover:bg-slate-50">
            View all notifications
          </Link>
        </div>
      )}
    </div>
  )
}

export default NotificationBell
