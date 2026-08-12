import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import AppButton from '../../../components/common/AppButton'
import PageHeader from '../../../components/common/PageHeader'
import ErrorState from '../../../components/feedback/ErrorState'
import PageLoader from '../../../components/feedback/PageLoader'
import AppInput from '../../../components/forms/AppInput'
import AppTextarea from '../../../components/forms/AppTextarea'
import { getApiErrorMessage } from '../../../api/errorMapper'
import { formatDateTime } from '../../../utils/date'
import AdminStatusBadge from '../components/AdminStatusBadge'
import { humanize } from '../constants/adminModerationConstants'
import { reportTransitions } from '../utils/adminModerationUtils'
import { adminApi } from '../services/adminApi'

function AdminReportDetailsPage(){
 const {reportId}=useParams(); const [state,setState]=useState({report:null,loading:true,error:null}); const [nextStatus,setNextStatus]=useState(''); const [resolution,setResolution]=useState(''); const [remarks,setRemarks]=useState(''); const [saving,setSaving]=useState(false)
 const load=useCallback(async(signal)=>{await Promise.resolve();try{setState(s=>({...s,loading:true,error:null}));const report=await adminApi.getReport(reportId,signal);setState({report,loading:false,error:null})}catch(error){if(error?.name!=='CanceledError'&&error?.code!=='ERR_CANCELED')setState({report:null,loading:false,error})}},[reportId])
 useEffect(()=>{const c=new AbortController();load(c.signal);return()=>c.abort()},[load])
 const process=async()=>{if(!nextStatus)return;setSaving(true);try{await adminApi.processReport(reportId,{status:nextStatus,...(resolution.trim()?{adminResolution:resolution.trim()}:{}),...(remarks.trim()?{adminRemarks:remarks.trim()}: {})});toast.success(`Report moved to ${humanize(nextStatus)}.`);setNextStatus('');setResolution('');setRemarks('');await load()}catch(e){toast.error(getApiErrorMessage(e))}finally{setSaving(false)}}
 if(state.loading)return <PageLoader label="Loading report details"/>; if(state.error)return <ErrorState message={getApiErrorMessage(state.error)} onRetry={()=>load()}/>; const r=state.report||{}; const transitions=reportTransitions(r.status)
 return <div className="space-y-6"><PageHeader title="Report details" description="Inspect the report and apply only backend-supported status transitions." actions={<Link className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold" to="/admin/reports">Back to reports</Link>}/><section className="rounded-2xl border border-slate-200 bg-white p-6"><div className="flex flex-wrap justify-between gap-3"><div><p className="text-sm text-slate-500">Current status</p><div className="mt-2"><AdminStatusBadge status={r.status}/></div></div><p className="text-sm text-slate-500">Created {formatDateTime(r.createdAt)}</p></div><dl className="mt-6 grid gap-4 sm:grid-cols-2">{[['Report ID',r.id],['Reporter',r.reporter?.email],['Reporter role',humanize(r.reporter?.role)],['Target type',humanize(r.targetType)],['Target ID',r.targetResourceId],['Category',humanize(r.category)],['Reviewed by',r.reviewer?.email],['Reviewed at',formatDateTime(r.reviewedAt)],['Resolution',r.adminResolution],['Remarks',r.adminRemarks]].map(([l,v])=><div key={l} className="rounded-xl bg-slate-50 p-4"><dt className="text-sm text-slate-500">{l}</dt><dd className="mt-1 break-words font-semibold">{v||'—'}</dd></div>)}</dl><div className="mt-5"><h2 className="font-bold">Description</h2><p className="mt-2 whitespace-pre-wrap text-slate-700">{r.description}</p></div></section>
 {transitions.length>0&&<section className="rounded-2xl border border-slate-200 bg-white p-6"><h2 className="text-lg font-bold">Process report</h2><p className="mt-1 text-sm text-slate-600">Choose a valid next status. Resolution and remarks are sent to the backend when provided.</p><div className="mt-4 flex flex-wrap gap-2">{transitions.map(s=><AppButton key={s} variant={s==='DISMISSED'?'danger':'secondary'} onClick={()=>setNextStatus(s)}>{humanize(s)}</AppButton>)}</div>{nextStatus&&<div className="mt-5 space-y-4 rounded-xl bg-slate-50 p-4"><p className="font-semibold">Selected: {humanize(nextStatus)}</p><div><label className="mb-1 block text-sm font-semibold" htmlFor="report-resolution">Admin resolution</label><AppInput id="report-resolution" maxLength={500} value={resolution} onChange={e=>setResolution(e.target.value)}/></div><div><label className="mb-1 block text-sm font-semibold" htmlFor="report-remarks">Admin remarks</label><AppTextarea id="report-remarks" rows={4} value={remarks} onChange={e=>setRemarks(e.target.value)}/></div><div className="flex justify-end gap-2"><AppButton variant="secondary" disabled={saving} onClick={()=>setNextStatus('')}>Cancel</AppButton><AppButton variant={nextStatus==='DISMISSED'?'danger':'primary'} loading={saving} onClick={process}>Confirm {humanize(nextStatus)}</AppButton></div></div>}</section>}
 </div>
}
export default AdminReportDetailsPage
