import { formatDateTime } from '../../../utils/date'
import { formatApplicationStatus } from '../utils/applicationTracking'

function ApplicationTimeline({ history = [] }) {
  if (!history.length) return <p className="text-sm text-slate-500">No status history is available yet.</p>
  return <ol className="space-y-4">{history.map((item) => <li key={item.id ?? `${item.newStatus}-${item.createdAt}`} className="relative border-l-2 border-slate-200 pl-5"><span className="absolute -left-[5px] top-1 size-2 rounded-full bg-brand-600" /><p className="font-semibold text-slate-900">{formatApplicationStatus(item.newStatus)}</p><p className="mt-1 text-sm text-slate-500">{formatDateTime(item.createdAt)}</p>{item.reason && <p className="mt-2 text-sm text-slate-600">{item.reason}</p>}</li>)}</ol>
}

export default ApplicationTimeline
