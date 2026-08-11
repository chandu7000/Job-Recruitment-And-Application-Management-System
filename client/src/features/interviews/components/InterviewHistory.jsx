import { formatDateTime } from '../../../utils/date'
import { interviewStatusLabel } from '../utils/interview'
export default function InterviewHistory({ history = [] }) {
  if (!history.length) return <p className="text-sm text-slate-500">No interview history is available.</p>
  return <ol className="space-y-3">{history.map((item,index)=><li key={item.id||index} className="border-l-2 border-slate-200 pl-4"><p className="font-semibold text-slate-900">{item.event?.replaceAll('_',' ') || `${interviewStatusLabel(item.previousStatus)} → ${interviewStatusLabel(item.newStatus)}`}</p><p className="text-sm text-slate-500">{formatDateTime(item.createdAt)}</p>{item.reason&&<p className="mt-1 text-sm text-slate-700">{item.reason}</p>}{item.previousSchedule&&<p className="mt-1 text-xs text-slate-500">Previous: {formatDateTime(item.previousSchedule.scheduledStartAt)} → {formatDateTime(item.previousSchedule.scheduledEndAt)}</p>}</li>)}</ol>
}
