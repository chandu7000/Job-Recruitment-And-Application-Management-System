import { formatApplicationStatus } from '../utils/applicationTracking'

const tones = {
  APPLIED: 'bg-blue-50 text-blue-700 ring-blue-200',
  UNDER_REVIEW: 'bg-indigo-50 text-indigo-700 ring-indigo-200',
  SHORTLISTED: 'bg-violet-50 text-violet-700 ring-violet-200',
  INTERVIEW: 'bg-purple-50 text-purple-700 ring-purple-200',
  INTERVIEW_SCHEDULED: 'bg-purple-50 text-purple-700 ring-purple-200',
  INTERVIEW_COMPLETED: 'bg-cyan-50 text-cyan-700 ring-cyan-200',
  OFFERED: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  HIRED: 'bg-green-50 text-green-700 ring-green-200',
  REJECTED: 'bg-red-50 text-red-700 ring-red-200',
  WITHDRAWN: 'bg-slate-100 text-slate-700 ring-slate-200',
}

function ApplicationStatusBadge({ status }) {
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${tones[status] ?? 'bg-slate-100 text-slate-700 ring-slate-200'}`}>{formatApplicationStatus(status)}</span>
}

export default ApplicationStatusBadge
