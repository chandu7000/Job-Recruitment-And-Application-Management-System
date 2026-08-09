import axios from 'axios'
import { Building2, CalendarDays, Eye, MapPin, Users } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getApiErrorMessage } from '../../../api/errorMapper'
import ErrorState from '../../../components/feedback/ErrorState'
import PageLoader from '../../../components/feedback/PageLoader'
import CompanyLogo from '../components/CompanyLogo'
import JobMetadata from '../components/JobMetadata'
import SimilarJobs from '../components/SimilarJobs'
import SkillsList from '../components/SkillsList'
import { publicJobApi } from '../services/publicJobApi'
import { formatJobDeadline, formatPublishedDate } from '../utils/jobFormatters'

function ContentSection({ title, content }) {
  if (!content) return null
  const lines = Array.isArray(content) ? content : String(content).split(/\n+/).filter(Boolean)
  return <section className="border-t border-slate-200 pt-7"><h2 className="text-xl font-bold text-slate-950">{title}</h2>{Array.isArray(content) ? <ul className="mt-4 list-disc space-y-2 pl-5 text-slate-700">{lines.map((line) => <li key={line}>{line}</li>)}</ul> : <div className="mt-4 space-y-3 whitespace-pre-line leading-7 text-slate-700">{content}</div>}</section>
}

function JobDetailsPage() {
  const { jobSlug } = useParams()
  const [state, setState] = useState({ job: null, loadedFor: '', error: '', notFound: false })
  const [retryKey, setRetryKey] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    publicJobApi.getBySlug(jobSlug, { signal: controller.signal })
      .then((job) => setState({ job, loadedFor: `${jobSlug}:${retryKey}`, error: '', notFound: false }))
      .catch((error) => {
        if (!axios.isCancel(error)) setState({ job: null, loadedFor: `${jobSlug}:${retryKey}`, error: getApiErrorMessage(error), notFound: error?.apiError?.status === 404 || error?.response?.status === 404 })
      })
    return () => controller.abort()
  }, [jobSlug, retryKey])

  if (state.loadedFor !== `${jobSlug}:${retryKey}`) return <PageLoader label="Loading job details" />
  if (state.error) return <div className="mx-auto max-w-4xl px-4 py-16"><ErrorState title={state.notFound ? 'Job not found' : 'Unable to load job'} message={state.notFound ? 'This job is unavailable or no longer published.' : state.error} onRetry={state.notFound ? undefined : () => setRetryKey((key) => key + 1)} /></div>

  const { job } = state
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <article className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <header className="bg-gradient-to-br from-brand-950 to-brand-700 p-7 text-white sm:p-10"><div className="flex flex-col gap-5 sm:flex-row sm:items-start"><CompanyLogo company={job.company} size="large" /><div><p className="text-sm font-semibold text-brand-100">{job.company?.companyName || 'Company'}</p><h1 className="mt-2 text-3xl font-bold sm:text-4xl">{job.title}</h1><p className="mt-3 flex items-center gap-2 text-brand-100"><MapPin className="size-4" />{job.location || 'Location not specified'}</p></div></div></header>
        <div className="grid gap-8 p-7 sm:p-10 lg:grid-cols-[1fr_260px]">
          <div className="space-y-7"><JobMetadata job={job} /><ContentSection title="Job description" content={job.description} /><ContentSection title="Responsibilities" content={job.responsibilities} /><ContentSection title="Requirements" content={job.requirements} /><section className="border-t border-slate-200 pt-7"><h2 className="text-xl font-bold">Required skills</h2><div className="mt-4"><SkillsList skills={job.skills} /></div></section></div>
          <aside className="h-fit rounded-2xl bg-slate-50 p-5"><h2 className="font-bold">Job overview</h2><dl className="mt-4 space-y-4 text-sm"><div><dt className="flex items-center gap-2 text-slate-500"><Users className="size-4" />Vacancies</dt><dd className="mt-1 font-semibold">{job.vacancies ?? 'Not specified'}</dd></div><div><dt className="flex items-center gap-2 text-slate-500"><CalendarDays className="size-4" />Deadline</dt><dd className="mt-1 font-semibold">{formatJobDeadline(job.applicationDeadline)}</dd></div><div><dt className="flex items-center gap-2 text-slate-500"><Eye className="size-4" />Views</dt><dd className="mt-1 font-semibold">{Number(job.viewCount || 0).toLocaleString('en-IN')}</dd></div><div><dt className="text-slate-500">Published</dt><dd className="mt-1 font-semibold">{formatPublishedDate(job.publishedAt)}</dd></div></dl>{job.company?.slug && <Link to={`/companies/${job.company.slug}`} className="mt-6 inline-flex items-center gap-2 font-semibold text-brand-700 hover:underline"><Building2 className="size-4" />View company</Link>}</aside>
        </div>
      </article>
      <SimilarJobs jobId={job.id} />
    </div>
  )
}

export default JobDetailsPage
