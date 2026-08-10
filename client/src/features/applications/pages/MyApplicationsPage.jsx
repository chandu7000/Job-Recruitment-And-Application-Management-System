import axios from 'axios'
import { BriefcaseBusiness, Search } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { getApiErrorMessage } from '../../../api/errorMapper'
import EmptyState from '../../../components/feedback/EmptyState'
import ErrorState from '../../../components/feedback/ErrorState'
import PageLoader from '../../../components/feedback/PageLoader'
import Pagination from '../../publicJobs/components/Pagination'
import { formatDate } from '../../../utils/date'
import ApplicationStatusBadge from '../components/ApplicationStatusBadge'
import { applicationsApi } from '../services/applicationApi'
import { APPLICATION_SORT_OPTIONS, APPLICATION_STATUSES, formatApplicationStatus, parseApplicationSort } from '../utils/applicationTracking'

function MyApplicationsPage() {
  const [params, setParams] = useSearchParams()
  const page = Math.max(Number(params.get('page') || 1), 1)
  const status = params.get('status') || ''
  const search = params.get('search') || ''
  const sortValue = params.get('sort') || 'createdAt:DESC'
  const [searchInput, setSearchInput] = useState(search)
  const [retryKey, setRetryKey] = useState(0)
  const [state, setState] = useState({ key: '', items: [], pagination: {}, error: '' })
  const key = `${page}:${status}:${search}:${sortValue}:${retryKey}`

  useEffect(() => {
    const controller = new AbortController()
    const sort = parseApplicationSort(sortValue)
    applicationsApi.list({ page, limit: 10, ...(status && { status }), ...(search && { search }), ...sort }, { signal: controller.signal })
      .then((result) => setState({ key, items: result.applications, pagination: result.pagination, error: '' }))
      .catch((error) => { if (!axios.isCancel(error)) setState({ key, items: [], pagination: {}, error: getApiErrorMessage(error) }) })
    return () => controller.abort()
  }, [key, page, search, sortValue, status])

  const updateParams = (updates) => {
    const next = new URLSearchParams(params)
    Object.entries(updates).forEach(([name, value]) => value ? next.set(name, value) : next.delete(name))
    if (!Object.prototype.hasOwnProperty.call(updates, 'page')) next.set('page', '1')
    setParams(next)
  }

  if (state.key !== key) return <PageLoader label="Loading applications" />
  if (state.error) return <ErrorState title="Unable to load applications" message={state.error} onRetry={() => setRetryKey((value) => value + 1)} />

  return <section className="space-y-6"><header><p className="text-sm font-semibold text-brand-700">Job Seeker</p><h1 className="mt-1 text-3xl font-bold text-slate-950">My applications</h1><p className="mt-2 text-slate-600">Track every application and review its latest progress.</p></header>
    <div className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 md:grid-cols-[1fr_220px_220px]"><form onSubmit={(event) => { event.preventDefault(); updateParams({ search: searchInput.trim() }) }} className="flex gap-2"><label className="sr-only" htmlFor="application-search">Search applications</label><div className="relative flex-1"><Search className="absolute left-3 top-3 size-4 text-slate-400" /><input id="application-search" value={searchInput} onChange={(event) => setSearchInput(event.target.value)} placeholder="Search applications" className="w-full rounded-lg border border-slate-300 py-2.5 pl-9 pr-3 text-sm" /></div><button className="rounded-lg bg-brand-600 px-4 text-sm font-semibold text-white" type="submit">Search</button></form><select aria-label="Filter by status" value={status} onChange={(event) => updateParams({ status: event.target.value })} className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm"><option value="">All statuses</option>{APPLICATION_STATUSES.map((value) => <option key={value} value={value}>{formatApplicationStatus(value)}</option>)}</select><select aria-label="Sort applications" value={sortValue} onChange={(event) => updateParams({ sort: event.target.value })} className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm">{APPLICATION_SORT_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></div>
    {state.items.length === 0 ? <EmptyState icon={BriefcaseBusiness} title="No applications found" description="Applications matching your current filters will appear here." action={<Link to="/jobs" className="font-semibold text-brand-700 hover:underline">Browse jobs</Link>} /> : <div className="space-y-4">{state.items.map((application) => <article key={application.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"><div><ApplicationStatusBadge status={application.status} /><h2 className="mt-3 text-xl font-bold text-slate-950">{application.jobSnapshot?.title || 'Job unavailable'}</h2><p className="mt-1 font-medium text-brand-700">{application.companySnapshot?.name || 'Company unavailable'}</p><p className="mt-3 text-sm text-slate-600">Applied {formatDate(application.createdAt)}</p>{application.jobSnapshot?.location && <p className="mt-1 text-sm text-slate-500">{application.jobSnapshot.location}</p>}</div><Link className="inline-flex rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50" to={`/job-seeker/applications/${application.id}`}>View details</Link></div></article>)}</div>}
    <Pagination pagination={state.pagination} onPageChange={(nextPage) => updateParams({ page: String(nextPage) })} />
  </section>
}

export default MyApplicationsPage
