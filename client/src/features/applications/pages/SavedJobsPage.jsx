import axios from 'axios'
import { BookmarkX, BriefcaseBusiness } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { getApiErrorMessage } from '../../../api/errorMapper'
import AppButton from '../../../components/common/AppButton'
import EmptyState from '../../../components/feedback/EmptyState'
import ErrorState from '../../../components/feedback/ErrorState'
import PageLoader from '../../../components/feedback/PageLoader'
import Pagination from '../../publicJobs/components/Pagination'
import { formatJobDeadline } from '../../publicJobs/utils/jobFormatters'
import { savedJobsApi } from '../services/applicationApi'
import { useSavedJobs } from '../hooks/useSavedJobs'

function availability(job) {
  if (!job) return { available: false, label: 'UNAVAILABLE' }
  const deadline = job.applicationDeadline ? new Date(job.applicationDeadline) : null
  if (job.status !== 'PUBLISHED') return { available: false, label: job.status || 'UNAVAILABLE' }
  if (!deadline || Number.isNaN(deadline.getTime()) || deadline.getTime() < Date.now()) return { available: false, label: 'EXPIRED' }
  return { available: true, label: 'AVAILABLE' }
}

function SavedJobsPage() {
  const [params, setParams] = useSearchParams()
  const page = Math.max(Number(params.get('page') || 1), 1)
  const [retryKey, setRetryKey] = useState(0)
  const [state, setState] = useState({ loadedFor: '', items: [], pagination: {}, error: '' })
  const { remove } = useSavedJobs()
  const key = `${page}:${retryKey}`

  useEffect(() => {
    const controller = new AbortController()
    savedJobsApi.list({ page, limit: 10 }, { signal: controller.signal })
      .then((result) => setState({ loadedFor: key, items: result.savedJobs, pagination: result.pagination, error: '' }))
      .catch((error) => { if (!axios.isCancel(error)) setState({ loadedFor: key, items: [], pagination: {}, error: getApiErrorMessage(error) }) })
    return () => controller.abort()
  }, [key, page])

  const handleRemove = async (jobId) => {
    if (await remove(jobId)) setRetryKey((value) => value + 1)
  }

  if (state.loadedFor !== key) return <PageLoader label="Loading saved jobs" />
  if (state.error) return <ErrorState title="Unable to load saved jobs" message={state.error} onRetry={() => setRetryKey((value) => value + 1)} />

  return <section className="space-y-6"><header><p className="text-sm font-semibold text-brand-700">Job Seeker</p><h1 className="mt-1 text-3xl font-bold text-slate-950">Saved jobs</h1><p className="mt-2 text-slate-600">Keep promising opportunities together and apply when you are ready.</p></header>
    {state.items.length === 0 ? <EmptyState icon={BriefcaseBusiness} title="No saved jobs yet" description="Save jobs from search results or job details and they will appear here." action={<Link className="font-semibold text-brand-700 hover:underline" to="/jobs">Browse jobs</Link>} /> : <div className="space-y-4">{state.items.map((item) => { const job = item.job; const status = availability(job); return <article key={item.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"><div><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{status.label}</p><h2 className="mt-1 text-xl font-bold text-slate-950">{job?.title || 'Job unavailable'}</h2><p className="mt-1 text-sm font-medium text-brand-700">{job?.company?.companyName || 'Company unavailable'}</p><p className="mt-3 text-sm text-slate-600">{job?.location || 'Location unavailable'}{job?.employmentType ? ` · ${job.employmentType}` : ''}{job?.workMode ? ` · ${job.workMode}` : ''}</p><p className="mt-2 text-xs text-slate-500">Deadline: {formatJobDeadline(job?.applicationDeadline)}</p>{!status.available && <p className="mt-3 text-sm font-medium text-amber-700">This saved job is no longer accepting applications.</p>}</div><div className="flex flex-wrap gap-2">{status.available && job?.slug && <Link to={`/jobs/${job.slug}`} className="inline-flex items-center rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold hover:bg-slate-50">Open job</Link>}<AppButton variant="secondary" size="small" onClick={() => handleRemove(item.jobId ?? job?.id)}><BookmarkX className="size-4" />Unsave</AppButton></div></div></article> })}</div>}
    {Number(state.pagination?.totalPages || 1) > 1 && <Pagination pagination={state.pagination} onPageChange={(next) => setParams({ page: String(next) })} />}
  </section>
}

export default SavedJobsPage
