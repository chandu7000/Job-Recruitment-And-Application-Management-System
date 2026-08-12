import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import PageHeader from '../../../components/common/PageHeader'
import EmptyState from '../../../components/feedback/EmptyState'
import ErrorState from '../../../components/feedback/ErrorState'
import PageLoader from '../../../components/feedback/PageLoader'
import AppSelect from '../../../components/forms/AppSelect'
import Pagination from '../../publicJobs/components/Pagination'
import { getApiErrorMessage } from '../../../api/errorMapper'
import { formatDateTime } from '../../../utils/date'
import AdminStatusBadge from '../components/AdminStatusBadge'
import { REPORT_CATEGORIES, REPORT_STATUSES, REPORT_TARGET_TYPES, humanize } from '../constants/adminModerationConstants'
import { adminApi } from '../services/adminApi'

function AdminReportsPage(){
 const [params,setParams]=useSearchParams(); const page=Number(params.get('page')||1); const status=params.get('status')||''; const targetType=params.get('targetType')||''; const category=params.get('category')||''; const query=useMemo(()=>({page,status,targetType,category}),[page,status,targetType,category]); const [state,setState]=useState({reports:[],pagination:null,loading:true,error:null})
 const load=useCallback(async(signal)=>{await Promise.resolve();setState(s=>({...s,loading:true,error:null}));try{const result=await adminApi.listReports(query,signal);setState({...result,loading:false,error:null})}catch(error){if(error?.name!=='CanceledError'&&error?.code!=='ERR_CANCELED')setState({reports:[],pagination:null,loading:false,error})}},[query])
 useEffect(()=>{const c=new AbortController();load(c.signal);return()=>c.abort()},[load])
 const change=(key,value)=>{const n=new URLSearchParams(params);if(value)n.set(key,value);else n.delete(key);n.set('page','1');setParams(n)}
 return <div className="space-y-6"><PageHeader title="Report management" description="Review and process job/company reports using backend-supported statuses and target types."/><div className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 md:grid-cols-3"><div><label className="mb-1 block text-sm font-semibold" htmlFor="report-status">Status</label><AppSelect id="report-status" value={query.status} onChange={e=>change('status',e.target.value)}><option value="">All statuses</option>{REPORT_STATUSES.map(v=><option key={v} value={v}>{humanize(v)}</option>)}</AppSelect></div><div><label className="mb-1 block text-sm font-semibold" htmlFor="report-target">Target type</label><AppSelect id="report-target" value={query.targetType} onChange={e=>change('targetType',e.target.value)}><option value="">All target types</option>{REPORT_TARGET_TYPES.map(v=><option key={v} value={v}>{humanize(v)}</option>)}</AppSelect></div><div><label className="mb-1 block text-sm font-semibold" htmlFor="report-category">Category</label><AppSelect id="report-category" value={query.category} onChange={e=>change('category',e.target.value)}><option value="">All categories</option>{REPORT_CATEGORIES.map(v=><option key={v} value={v}>{humanize(v)}</option>)}</AppSelect></div></div>
 {state.loading?<PageLoader label="Loading reports"/>:state.error?<ErrorState message={getApiErrorMessage(state.error)} onRetry={()=>load()}/>:state.reports.length===0?<EmptyState title="No reports found" description="No reports match the selected backend filters."/>:<><div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white"><table className="min-w-full divide-y divide-slate-200 text-sm"><thead className="bg-slate-50 text-left text-slate-600"><tr><th className="px-4 py-3">Report</th><th className="px-4 py-3">Target</th><th className="px-4 py-3">Category</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Created</th><th className="px-4 py-3">Action</th></tr></thead><tbody className="divide-y divide-slate-100">{state.reports.map(r=><tr key={r.id}><td className="px-4 py-3"><p className="font-semibold">{r.id}</p><p className="text-slate-500">{r.reporter?.email||'Reporter unavailable'}</p></td><td className="px-4 py-3">{humanize(r.targetType)}<p className="text-xs text-slate-500">{r.targetResourceId}</p></td><td className="px-4 py-3">{humanize(r.category)}</td><td className="px-4 py-3"><AdminStatusBadge status={r.status}/></td><td className="px-4 py-3">{formatDateTime(r.createdAt)}</td><td className="px-4 py-3"><Link className="font-semibold text-brand-700 hover:underline" to={`/admin/reports/${r.id}`}>View details</Link></td></tr>)}</tbody></table></div><Pagination pagination={state.pagination} onPageChange={p=>{const n=new URLSearchParams(params);n.set('page',String(p));setParams(n)}}/></>}
 </div>
}
export default AdminReportsPage
