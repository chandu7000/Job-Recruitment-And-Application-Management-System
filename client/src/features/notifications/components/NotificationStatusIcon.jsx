import { Bell, BriefcaseBusiness, Building2, CalendarClock, CircleUserRound, FileText } from 'lucide-react'

const iconByResource = {
  APPLICATION: FileText,
  COMPANY: Building2,
  JOB: BriefcaseBusiness,
  INTERVIEW: CalendarClock,
  USER: CircleUserRound,
}

function NotificationStatusIcon({ resourceType }) {
  const Icon = iconByResource[resourceType] || Bell
  return (
    <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-700">
      <Icon className="size-4" aria-hidden="true" />
    </span>
  )
}

export default NotificationStatusIcon
