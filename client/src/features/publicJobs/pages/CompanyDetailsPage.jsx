import axios from 'axios'
import { ExternalLink, MapPin } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { getApiErrorMessage } from '../../../api/errorMapper'
import EmptyState from '../../../components/feedback/EmptyState'
import ErrorState from '../../../components/feedback/ErrorState'
import PageLoader from '../../../components/feedback/PageLoader'
import CompanyLogo from '../components/CompanyLogo'
import JobCard from '../components/JobCard'
import { JobCardSkeletonList } from '../components/JobCardSkeleton'
import Pagination from '../components/Pagination'
import ResultsCount from '../components/ResultsCount'
import { PUBLIC_JOB_SORTS } from '../constants/publicJobConstants'
import { usePublicJobs } from '../hooks/usePublicJobs'
import { publicCompanyApi } from '../services/publicCompanyApi'
import { companyLocation } from '../utils/jobFormatters'
import ReportAction from '../../reporting/components/ReportAction'
import { REPORT_TARGET_TYPES } from '../../reporting/constants/reportConstants'


function safeWebsite(value) {
  if (!value) return null
  try { const url = new URL(value); return ['http:', 'https:'].includes(url.protocol) ? url.toString() : null } catch { return null }
}

function CompanyDetailsPage() {
  const { companySlug } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const [companyState, setCompanyState] = useState({ company: null, loadedFor: '', error: '', notFound: false })
  const [retryKey, setRetryKey] = useState(0)
  const query = useMemo(() => ({ search: searchParams.get('search') || '', sort: searchParams.get('sort') || 'latest', page: searchParams.get('page') || '1', limit: 10 }), [searchParams])
  const jobsService = useCallback((jobQuery, options) => publicCompanyApi.listJobsBySlug(companySlug, jobQuery, options), [companySlug])
  const jobsState = usePublicJobs(query, jobsService)

  useEffect(() => {
    const controller = new AbortController()
    publicCompanyApi.getBySlug(companySlug, { signal: controller.signal })
      .then((company) => setCompanyState({ company, loadedFor: `${companySlug}:${retryKey}`, error: '', notFound: false }))
      .catch((error) => { if (!axios.isCancel(error)) setCompanyState({ company: null, loadedFor: `${companySlug}:${retryKey}`, error: getApiErrorMessage(error), notFound: error?.apiError?.status === 404 || error?.response?.status === 404 }) })
    return () => controller.abort()
  }, [companySlug, retryKey])

  const updateQuery = (values) => { const next = new URLSearchParams(searchParams); Object.entries(values).forEach(([key, value]) => value ? next.set(key, value) : next.delete(key)); if (values.search !== undefined || values.sort !== undefined) next.delete('page'); setSearchParams(next) }

  if (companyState.loadedFor !== `${companySlug}:${retryKey}`) return <PageLoader label="Loading company details" />
  if (companyState.error) return <div className="mx-auto max-w-4xl px-4 py-16"><ErrorState title={companyState.notFound ? 'Company not found' : 'Unable to load company'} message={companyState.notFound ? 'This company is unavailable or not publicly verified.' : companyState.error} onRetry={companyState.notFound ? undefined : () => setRetryKey((key) => key + 1)} /></div>

  const company = companyState.company
  const website = safeWebsite(company.website)
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <section className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm sm:p-10"><div className="flex flex-col gap-5 sm:flex-row"><CompanyLogo company={company} size="large" /><div className="min-w-0"><h1 className="text-3xl font-bold text-slate-950 sm:text-4xl">{company.companyName}</h1><p className="mt-3 flex items-center gap-2 text-slate-600"><MapPin className="size-4" />{companyLocation(company)}</p>{website && <a href={website} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-1.5 font-semibold text-brand-700 hover:underline">Visit website<ExternalLink className="size-4" /></a>}</div></div>{company.description && <p className="mt-7 max-w-4xl whitespace-pre-line leading-7 text-slate-700">{company.description}</p>}<dl className="mt-7 grid gap-4 border-t border-slate-200 pt-6 sm:grid-cols-2 lg:grid-cols-4">{[['Industry', company.industry], ['Company size', company.companySize], ['Founded', company.foundedYear], ['Location', companyLocation(company)]].map(([label, value]) => <div key={label}><dt className="text-sm text-slate-500">{label}</dt><dd className="mt-1 font-semibold text-slate-900">{value || 'Not specified'}</dd></div>)}</dl><div className="mt-6 border-t border-slate-200 pt-5"><ReportAction targetType={REPORT_TARGET_TYPES.COMPANY} targetResourceId={company.id} targetLabel={company.companyName} /></div></section>

      <section className="mt-10" aria-labelledby="company-jobs-heading"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><h2 id="company-jobs-heading" className="text-2xl font-bold">Open positions</h2><div className="mt-2"><ResultsCount pagination={jobsState.pagination} /></div></div><div className="flex flex-col gap-2 sm:flex-row"><label className="sr-only" htmlFor="company-job-search">Search company jobs</label><input id="company-job-search" value={query.search} onChange={(e) => updateQuery({ search: e.target.value })} placeholder="Search within company" className="rounded-lg border border-slate-300 px-3 py-2.5" /><select aria-label="Sort company jobs" value={query.sort} onChange={(e) => updateQuery({ sort: e.target.value })} className="rounded-lg border border-slate-300 bg-white px-3 py-2.5">{PUBLIC_JOB_SORTS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></div></div>
        <div className="mt-6" aria-busy={jobsState.loading}>{jobsState.loading ? <JobCardSkeletonList count={4} /> : jobsState.error ? <ErrorState message={jobsState.error} onRetry={jobsState.retry} /> : !jobsState.jobs.length ? <EmptyState title="No open positions" description="This company has no matching published jobs right now." /> : <div className="grid gap-5 lg:grid-cols-2">{jobsState.jobs.map((job) => <JobCard key={job.id} job={job} />)}</div>}</div>
        {!jobsState.loading && !jobsState.error && <div className="mt-8"><Pagination pagination={jobsState.pagination} onPageChange={(page) => updateQuery({ page: String(page) })} /></div>}
      </section>
    </div>
  )
}

export default CompanyDetailsPage
