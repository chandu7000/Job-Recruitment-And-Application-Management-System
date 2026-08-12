import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import PageHeader from '../../../components/common/PageHeader'
import EmptyState from '../../../components/feedback/EmptyState'
import ErrorState from '../../../components/feedback/ErrorState'
import PageLoader from '../../../components/feedback/PageLoader'
import AppInput from '../../../components/forms/AppInput'
import AppSelect from '../../../components/forms/AppSelect'
import Pagination from '../../publicJobs/components/Pagination'
import { getApiErrorMessage } from '../../../api/errorMapper'
import { formatDate } from '../../../utils/date'
import AdminStatusBadge from '../components/AdminStatusBadge'
import { JOB_STATUSES, humanize } from '../constants/adminModerationConstants'
import { adminApi } from '../services/adminApi'

function AdminJobsPage() {
  const [params, setParams] = useSearchParams()
  const [draft, setDraft] = useState({ search: params.get('search') || '', status: params.get('status') || '', location: params.get('location') || '' })
  const page = Number(params.get('page') || 1)
  const search = params.get('search') || ''
  const status = params.get('status') || ''
  const location = params.get('location') || ''
  const sort = params.get('sort') || ''
  const query = useMemo(() => ({ page, search, status, location, sort }), [page, search, status, location, sort])
  const [state, setState] = useState({ jobs: [], pagination: null, loading: true, error: null })

  const load = useCallback(async (signal) => {
    await Promise.resolve()
    setState((s) => ({ ...s, loading: true, error: null }))
    try { const result = await adminApi.listJobs(query, signal); setState({ ...result, loading: false, error: null }) }
    catch (error) { if (error?.name !== 'CanceledError' && error?.code !== 'ERR_CANCELED') setState({ jobs: [], pagination: null, loading: false, error }) }
  }, [query])
  useEffect(() => { const c = new AbortController(); load(c.signal); return () => c.abort() }, [load])

  const apply = (e) => { e.preventDefault(); const next = new URLSearchParams(); Object.entries(draft).forEach(([k,v]) => v.trim() && next.set(k, v.trim())); next.set('page','1'); setParams(next) }

  return <div className="space-y-6">
    <PageHeader title="Job moderation" description="Search and moderate platform-wide jobs using the real admin job API." />
    <form onSubmit={apply} className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 md:grid-cols-4">
      <div><label className="mb-1 block text-sm font-semibold" htmlFor="admin-job-search">Title search</label><AppInput id="admin-job-search" value={draft.search} onChange={(e)=>setDraft({...draft,search:e.target.value})} /></div>
      <div><label className="mb-1 block text-sm font-semibold" htmlFor="admin-job-status">Status</label><AppSelect id="admin-job-status" value={draft.status} onChange={(e)=>setDraft({...draft,status:e.target.value})}><option value="">All statuses</option>{JOB_STATUSES.map((s)=><option key={s} value={s}>{humanize(s)}</option>)}</AppSelect></div>
      <div><label className="mb-1 block text-sm font-semibold" htmlFor="admin-job-location">Location</label><AppInput id="admin-job-location" value={draft.location} onChange={(e)=>setDraft({...draft,location:e.target.value})} /></div>
      <div className="flex items-end gap-2"><button type="submit" className="rounded-lg bg-brand-700 px-4 py-2.5 text-sm font-semibold text-white">Search</button><button type="button" onClick={()=>{setDraft({search:'',status:'',location:''});setParams({page:'1'})}} className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold">Clear</button></div>
    </form>
    {state.loading ? <PageLoader label="Loading jobs" /> : state.error ? <ErrorState message={getApiErrorMessage(state.error)} onRetry={()=>load()} /> : state.jobs.length===0 ? <EmptyState title="No jobs found" description="No jobs match the current backend filters." /> : <>
      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white"><table className="min-w-full divide-y divide-slate-200 text-sm"><thead className="bg-slate-50 text-left text-slate-600"><tr><th className="px-4 py-3">Job</th><th className="px-4 py-3">Company</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Created</th><th className="px-4 py-3">Action</th></tr></thead><tbody className="divide-y divide-slate-100">{state.jobs.map((job)=><tr key={job.id}><td className="px-4 py-3"><p className="font-semibold">{job.title || 'Untitled job'}</p><p className="text-slate-500">{job.location || '—'}</p></td><td className="px-4 py-3">{job.company?.companyName || '—'}</td><td className="px-4 py-3"><AdminStatusBadge status={job.status} /></td><td className="px-4 py-3">{formatDate(job.createdAt)}</td><td className="px-4 py-3"><Link className="font-semibold text-brand-700 hover:underline" to={`/admin/jobs/${job.id}`}>View details</Link></td></tr>)}</tbody></table></div>
      <Pagination pagination={state.pagination} onPageChange={(p)=>{const n=new URLSearchParams(params);n.set('page',String(p));setParams(n)}} />
    </>}
  </div>
}
export default AdminJobsPage
