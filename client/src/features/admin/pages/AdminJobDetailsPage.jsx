import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import AppButton from '../../../components/common/AppButton'
import PageHeader from '../../../components/common/PageHeader'
import ErrorState from '../../../components/feedback/ErrorState'
import PageLoader from '../../../components/feedback/PageLoader'
import AppTextarea from '../../../components/forms/AppTextarea'
import ConfirmationModal from '../../../components/modals/ConfirmationModal'
import { getApiErrorMessage } from '../../../api/errorMapper'
import { formatDateTime } from '../../../utils/date'
import AdminStatusBadge from '../components/AdminStatusBadge'
import { humanize } from '../constants/adminModerationConstants'
import { validateJobRemovalReason } from '../utils/adminModerationUtils'
import { adminApi } from '../services/adminApi'

function AdminJobDetailsPage(){
 const {jobId}=useParams(); const [state,setState]=useState({job:null,loading:true,error:null}); const [action,setAction]=useState(''); const [reason,setReason]=useState(''); const [validation,setValidation]=useState(''); const [saving,setSaving]=useState(false)
 const load=useCallback(async(signal)=>{await Promise.resolve();try{setState(s=>({...s,loading:true,error:null}));const job=await adminApi.getJob(jobId,signal);setState({job,loading:false,error:null})}catch(error){if(error?.name!=='CanceledError'&&error?.code!=='ERR_CANCELED')setState({job:null,loading:false,error})}},[jobId])
 useEffect(()=>{const c=new AbortController();load(c.signal);return()=>c.abort()},[load])
 const confirm=async()=>{if(action==='remove'){const e=validateJobRemovalReason(reason);if(e){setValidation(e);return}}setSaving(true);try{if(action==='remove')await adminApi.removeJob(jobId,reason.trim());else await adminApi.restoreJob(jobId);toast.success(action==='remove'?'Job removed successfully.':'Job restored successfully.');setAction('');setReason('');setValidation('');await load()}catch(e){toast.error(getApiErrorMessage(e))}finally{setSaving(false)}}
 if(state.loading)return <PageLoader label="Loading job details"/>; if(state.error)return <ErrorState message={getApiErrorMessage(state.error)} onRetry={()=>load()}/>; const j=state.job||{}
 const fields=[['Company',j.company?.companyName],['Recruiter',j.creator?.email],['Location',j.location],['Work mode',humanize(j.workMode)],['Employment type',humanize(j.employmentType)],['Experience',humanize(j.experienceLevel)],['Vacancies',j.vacancies],['Application deadline',formatDateTime(j.applicationDeadline)],['Published',formatDateTime(j.publishedAt)],['Created',formatDateTime(j.createdAt)],['Removed',formatDateTime(j.removedAt)],['Removal reason',j.removalReason]]
 return <div className="space-y-6"><PageHeader title={j.title||'Job details'} description="Platform job details and backend-supported moderation." actions={<Link className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold" to="/admin/jobs">Back to jobs</Link>}/><section className="rounded-2xl border border-slate-200 bg-white p-6"><div className="flex flex-wrap justify-between gap-4"><AdminStatusBadge status={j.status}/><div>{['PUBLISHED','CLOSED'].includes(j.status)&&<AppButton variant="danger" onClick={()=>setAction('remove')}>Remove job</AppButton>}{j.status==='REMOVED'&&<AppButton onClick={()=>setAction('restore')}>Restore job</AppButton>}</div></div><dl className="mt-6 grid gap-4 sm:grid-cols-2">{fields.map(([l,v])=><div key={l} className="rounded-xl bg-slate-50 p-4"><dt className="text-sm text-slate-500">{l}</dt><dd className="mt-1 break-words font-semibold">{v??'—'}</dd></div>)}</dl>{j.skills?.length>0&&<div className="mt-5"><h2 className="font-bold">Skills</h2><p className="mt-2 text-slate-700">{j.skills.join(', ')}</p></div>}{j.description&&<div className="mt-5"><h2 className="font-bold">Description</h2><p className="mt-2 whitespace-pre-wrap text-slate-700">{j.description}</p></div>}</section>
 {action==='remove'&&<div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4"><section role="dialog" aria-modal="true" className="w-full max-w-lg rounded-2xl bg-white p-6"><h2 className="text-xl font-bold">Remove job?</h2><p className="mt-2 text-slate-600">Provide a moderation reason. This is not recruiter deletion.</p><label className="mt-4 block text-sm font-semibold" htmlFor="job-removal-reason">Removal reason</label><AppTextarea id="job-removal-reason" rows={5} maxLength={2000} value={reason} onChange={(e)=>{setReason(e.target.value);setValidation('')}}/>{validation&&<p className="mt-2 text-sm text-rose-600">{validation}</p>}<div className="mt-6 flex justify-end gap-3"><AppButton variant="secondary" disabled={saving} onClick={()=>setAction('')}>Cancel</AppButton><AppButton variant="danger" loading={saving} onClick={confirm}>Remove job</AppButton></div></section></div>}
 <ConfirmationModal isOpen={action==='restore'} title="Restore job?" message="The backend will restore this job to its stored previous status, or CLOSED when no previous status is available." confirmLabel="Restore job" confirmVariant="primary" loading={saving} onConfirm={confirm} onCancel={()=>setAction('')}/></div>
}
export default AdminJobDetailsPage
