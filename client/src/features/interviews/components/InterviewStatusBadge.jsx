import { interviewStatusLabel } from '../utils/interview'
const styles = { SCHEDULED:'bg-blue-50 text-blue-700', RESCHEDULED:'bg-amber-50 text-amber-700', CONFIRMED:'bg-emerald-50 text-emerald-700', DECLINED:'bg-red-50 text-red-700', CANCELLED:'bg-slate-100 text-slate-700', COMPLETED:'bg-violet-50 text-violet-700' }
export default function InterviewStatusBadge({ status }) { return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${styles[status] || styles.CANCELLED}`}>{interviewStatusLabel(status)}</span> }
