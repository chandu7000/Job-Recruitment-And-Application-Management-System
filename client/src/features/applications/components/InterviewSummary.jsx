import { CalendarClock, MapPin, Video } from 'lucide-react'
import { formatDateTime } from '../../../utils/date'
import { formatApplicationStatus } from '../utils/applicationTracking'

function InterviewSummary({ interview, loading = false }) {
  if (loading) return <p className="text-sm text-slate-500">Checking interview information…</p>
  if (!interview) return <p className="text-sm text-slate-500">No interview has been scheduled for this application.</p>
  return <div className="space-y-3 text-sm text-slate-700"><div className="flex items-center gap-2"><CalendarClock className="size-4 text-brand-600" /><strong>{formatApplicationStatus(interview.status)}</strong></div><p>{formatDateTime(interview.scheduledStartAt)} – {formatDateTime(interview.scheduledEndAt)}</p><p>{interview.timezone || 'Timezone unavailable'}</p><div className="flex items-center gap-2">{interview.meetingType === 'ONLINE' ? <Video className="size-4" /> : <MapPin className="size-4" />}<span>{formatApplicationStatus(interview.meetingType)}</span></div>{interview.physicalLocation && <p>{interview.physicalLocation}</p>}{interview.cancellationReason && <p className="text-amber-700">{interview.cancellationReason}</p>}</div>
}

export default InterviewSummary
