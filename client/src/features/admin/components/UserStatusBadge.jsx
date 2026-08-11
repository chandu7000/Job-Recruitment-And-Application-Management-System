import { statusLabel } from '../constants/adminConstants'

const styles = {
  ACTIVE: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  DISABLED: 'bg-red-50 text-red-700 ring-red-200',
  SUSPENDED: 'bg-amber-50 text-amber-800 ring-amber-200',
  PENDING_VERIFICATION: 'bg-slate-100 text-slate-700 ring-slate-200',
}

function UserStatusBadge({ status }) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${styles[status] ?? styles.PENDING_VERIFICATION}`}>
      {statusLabel(status)}
    </span>
  )
}

export default UserStatusBadge
