import { BriefcaseBusiness, CalendarDays, Eye, MapPin, Users } from 'lucide-react'
import { Link } from 'react-router-dom'
import { formatDate } from '../../../utils/date'
import { formatStatusLabel } from '../../../utils/status'
import JobStatusBadge from './JobStatusBadge'

function RecruiterJobCard({ job }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <JobStatusBadge status={job.status} />
          <h2 className="mt-2 truncate text-xl font-bold text-slate-950">
            <Link
              className="hover:text-brand-700"
              to={`/recruiter/jobs/${job.id}`}
            >
              {job.title || 'Untitled draft'}
            </Link>
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            {job.company?.companyName || 'Company'}
          </p>
        </div>

        <Link
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          to={`/recruiter/jobs/${job.id}`}
        >
          View details
        </Link>
      </div>

      <dl className="mt-5 grid gap-3 text-sm text-slate-600 sm:grid-cols-2 lg:grid-cols-4">
        <div className="flex items-center gap-2">
          <MapPin className="size-4 shrink-0" aria-hidden="true" />
          <span>{job.location || formatStatusLabel(job.workMode)}</span>
        </div>
        <div className="flex items-center gap-2">
          <BriefcaseBusiness className="size-4 shrink-0" aria-hidden="true" />
          <span>{formatStatusLabel(job.employmentType)}</span>
        </div>
        <div className="flex items-center gap-2">
          <CalendarDays className="size-4 shrink-0" aria-hidden="true" />
          <span>Deadline {formatDate(job.applicationDeadline)}</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="inline-flex items-center gap-1">
            <Eye className="size-4" aria-hidden="true" />
            {Number(job.viewCount ?? 0)}
          </span>
          <span className="inline-flex items-center gap-1">
            <Users className="size-4" aria-hidden="true" />
            {Number(job.applicationCount ?? 0)}
          </span>
        </div>
      </dl>
    </article>
  )
}

export default RecruiterJobCard
