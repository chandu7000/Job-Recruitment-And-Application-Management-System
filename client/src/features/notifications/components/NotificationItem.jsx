import { Check, ExternalLink, Trash2 } from 'lucide-react'
import AppButton from '../../../components/common/AppButton'
import NotificationStatusIcon from './NotificationStatusIcon'
import { formatNotificationTime, getNotificationLabel } from '../utils/notification'

function NotificationItem({ notification, target, onOpen, onMarkRead, onDelete, busyAction }) {
  const busy = busyAction === notification.id
  return (
    <article className={`rounded-xl border p-4 ${notification.isRead ? 'border-slate-200 bg-white' : 'border-brand-200 bg-brand-50/40'}`}>
      <div className="flex items-start gap-3">
        <NotificationStatusIcon resourceType={notification.resourceType} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{getNotificationLabel(notification.type)}</p>
              <h2 className="mt-1 font-semibold text-slate-950">{notification.title}</h2>
            </div>
            {!notification.isRead && <span className="rounded-full bg-brand-600 px-2 py-1 text-xs font-semibold text-white">Unread</span>}
          </div>
          <p className="mt-2 text-sm leading-6 text-slate-600">{notification.message}</p>
          <p className="mt-2 text-xs text-slate-500">{formatNotificationTime(notification.createdAt)}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {target && (
              <AppButton size="small" onClick={() => onOpen(notification, target)} disabled={busy}>
                <ExternalLink className="size-4" aria-hidden="true" />
                Open related item
              </AppButton>
            )}
            {!notification.isRead && (
              <AppButton variant="secondary" size="small" onClick={() => onMarkRead(notification)} disabled={busy}>
                <Check className="size-4" aria-hidden="true" />
                Mark as read
              </AppButton>
            )}
            <AppButton variant="ghost" size="small" onClick={() => onDelete(notification)} disabled={busy}>
              <Trash2 className="size-4" aria-hidden="true" />
              Delete
            </AppButton>
          </div>
        </div>
      </div>
    </article>
  )
}

export default NotificationItem
