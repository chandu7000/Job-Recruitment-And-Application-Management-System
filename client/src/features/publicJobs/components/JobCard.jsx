import { CalendarDays } from 'lucide-react'
import { Link } from 'react-router-dom'
import CompanyLogo from './CompanyLogo'
import JobMetadata from './JobMetadata'
import SkillsList from './SkillsList'
import { formatJobDeadline, formatPublishedDate } from '../utils/jobFormatters'
import SaveJobButton from '../../applications/components/SaveJobButton'

function JobCard({ job }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-md">
      <div className="flex gap-4">
        <CompanyLogo company={job.company} />
        <div className="min-w-0 flex-1">
          <Link to={`/jobs/${job.slug}`} className="text-lg font-bold text-slate-950 hover:text-brand-700">
            {job.title || 'Untitled position'}
          </Link>
          {job.company?.slug ? (
            <Link to={`/companies/${job.company.slug}`} className="mt-1 block truncate text-sm font-medium text-brand-700 hover:underline">
              {job.company.companyName || 'Company'}
            </Link>
          ) : <p className="mt-1 text-sm text-slate-600">{job.company?.companyName || 'Company unavailable'}</p>}
        </div>
      </div>

      <div className="mt-5"><JobMetadata job={job} compact /></div>
      <div className="mt-4"><SkillsList skills={job.skills} limit={5} /></div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-4 text-xs text-slate-500">
        <span className="flex items-center gap-1.5"><CalendarDays aria-hidden="true" className="size-4" />{formatJobDeadline(job.applicationDeadline)}</span>
        <div className="flex items-center gap-3"><span>{formatPublishedDate(job.publishedAt)}</span><SaveJobButton jobId={job.id} compact /></div>
      </div>
    </article>
  )
}

export default JobCard
