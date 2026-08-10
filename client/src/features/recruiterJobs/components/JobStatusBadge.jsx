import { JOB_STATUS_CONTENT } from '../constants/recruiterJobConstants'

const tones = {
  slate: 'bg-slate-100 text-slate-700',
  green: 'bg-emerald-100 text-emerald-800',
  amber: 'bg-amber-100 text-amber-800',
  red: 'bg-red-100 text-red-800',
}

function JobStatusBadge({ status }) {
  const content = JOB_STATUS_CONTENT[status] ?? {
    label: status || 'Unknown',
    tone: 'slate',
  }

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${tones[content.tone]}`}
    >
      {content.label}
    </span>
  )
}

export default JobStatusBadge
