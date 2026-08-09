import { useCallback, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import AppButton from '../../../components/common/AppButton'
import ErrorState from '../../../components/feedback/ErrorState'
import PageLoader from '../../../components/feedback/PageLoader'
import { getApiErrorMessage } from '../../../api/errorMapper'
import { API_ENDPOINTS } from '../../../api/endpoints'
import SectionCard from '../components/SectionCard'
import { useJobSeekerResource } from '../hooks/useJobSeekerResource'
import { jobSeekerApi } from '../services/jobSeekerApi'

const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']; const RESUME_TYPES = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
function UploadControl({ title, endpoint, field, accept, allowed, maxMb, current, onChanged, image }) {
  const [file, setFile] = useState(null); const [progress, setProgress] = useState(0); const [busy, setBusy] = useState(false)
  const preview = useMemo(() => file && image ? URL.createObjectURL(file) : null, [file, image])
  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview) }, [preview])
  const select = (event) => { const chosen = event.target.files?.[0]; if (!chosen) return; if (!allowed.includes(chosen.type) || chosen.size > maxMb * 1024 * 1024) { toast.error(`Choose an allowed file up to ${maxMb} MB`); event.target.value = ''; return } setFile(chosen) }
  const upload = async () => { setBusy(true); try { await jobSeekerApi.upload(endpoint, field, file, (event) => setProgress(event.total ? Math.round(event.loaded * 100 / event.total) : 0)); toast.success(`${title} uploaded`); setFile(null); onChanged() } catch (error) { toast.error(getApiErrorMessage(error)) } finally { setBusy(false) } }
  const remove = async () => { if (!window.confirm(`Delete your ${title.toLowerCase()}?`)) return; setBusy(true); try { await jobSeekerApi.deleteUpload(endpoint); toast.success(`${title} deleted`); onChanged() } catch (error) { toast.error(getApiErrorMessage(error)) } finally { setBusy(false) } }
  return <SectionCard title={title}>{image && (preview || current) && <img src={preview || current} alt="Profile preview" className="mb-4 size-32 rounded-full object-cover" />}<p className="mb-3 text-sm text-slate-600">{current ? 'A file is currently uploaded.' : 'No file uploaded.'} Allowed size: {maxMb} MB.</p><input aria-label={`Choose ${title}`} type="file" accept={accept} onChange={select} />{busy && <p className="mt-2 text-sm" aria-live="polite">Uploading: {progress}%</p>}<div className="mt-4 flex gap-2"><AppButton disabled={!file} loading={busy} onClick={upload}>{current ? 'Replace' : 'Upload'}</AppButton>{current && <AppButton variant="danger" loading={busy} onClick={remove}>Delete</AppButton>}</div></SectionCard>
}
function DocumentsPage() { const loader = useCallback((signal) => jobSeekerApi.profile(signal), []); const { data, loading, error, reload } = useJobSeekerResource(loader); if (loading) return <PageLoader label="Loading documents" />; if (error) return <ErrorState message={getApiErrorMessage(error)} onRetry={reload} />; return <div className="space-y-6"><h1 className="text-3xl font-bold">Profile image and resume</h1><div className="grid gap-5 lg:grid-cols-2"><UploadControl title="Profile image" endpoint={API_ENDPOINTS.JOB_SEEKER.PROFILE_IMAGE} field="profileImage" accept="image/jpeg,image/png,image/webp" allowed={IMAGE_TYPES} maxMb={5} current={data?.profileImageUrl} image onChanged={reload} /><UploadControl title="Resume" endpoint={API_ENDPOINTS.JOB_SEEKER.RESUME} field="resume" accept=".pdf,.doc,.docx" allowed={RESUME_TYPES} maxMb={10} current={data?.resumeUrl} onChanged={reload} /></div></div> }
export default DocumentsPage
