import { useCallback, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import AppButton from '../../../components/common/AppButton'
import EmptyState from '../../../components/feedback/EmptyState'
import ErrorState from '../../../components/feedback/ErrorState'
import PageLoader from '../../../components/feedback/PageLoader'
import ConfirmationModal from '../../../components/modals/ConfirmationModal'
import { getApiErrorMessage } from '../../../api/errorMapper'
import CompanyStatusBadge from '../components/CompanyStatusBadge'
import { COMPANY_LOGO_RULES, COMPANY_STATUS_CONTENT, getCompanyCapabilities } from '../constants/recruiterConstants'
import { useRecruiterResource } from '../hooks/useRecruiterResource'
import { recruiterApi } from '../services/recruiterApi'

function CompanyPage() {
  const inputRef = useRef(null)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const loader = useCallback((signal) => recruiterApi.companies(signal), [])
  const historyLoader = useCallback((signal) => recruiterApi.verificationHistory(signal), [])
  const resource = useRecruiterResource(loader)
  const historyResource = useRecruiterResource(historyLoader)
  const company = useMemo(() => resource.data?.[0] ?? null, [resource.data])
  if (resource.loading) return <PageLoader label="Loading company" />
  if (resource.error) return <ErrorState message={getApiErrorMessage(resource.error)} onRetry={resource.reload} />
  if (!company) return <EmptyState title="No company profile" description="Create a company profile to begin recruiter onboarding." action={<Link className="rounded-lg bg-brand-600 px-4 py-2.5 font-semibold text-white" to="/recruiter/company/new">Create company</Link>} />
  const capabilities = getCompanyCapabilities(company)
  const statusContent = COMPANY_STATUS_CONTENT[company.status] ?? { description: 'Company status returned by the server.' }
  const upload = async (event) => { const file = event.target.files?.[0]; event.target.value = ''; if (!file) return; if (!COMPANY_LOGO_RULES.acceptedTypes.includes(file.type) || file.size > COMPANY_LOGO_RULES.maximumSize) { toast.error('Choose a JPG, PNG or WebP image no larger than 5 MB.'); return } setUploading(true); setProgress(0); try { await recruiterApi.uploadLogo(file, ({ loaded, total }) => setProgress(total ? Math.round((loaded / total) * 100) : 0)); toast.success('Company logo updated'); await resource.reload() } catch (error) { toast.error(getApiErrorMessage(error)) } finally { setUploading(false) } }
  const removeLogo = async () => { setUploading(true); try { await recruiterApi.deleteLogo(); toast.success('Company logo removed'); setConfirmDelete(false); await resource.reload() } catch (error) { toast.error(getApiErrorMessage(error)) } finally { setUploading(false) } }
  const submitVerification = async () => { setSubmitting(true); try { await recruiterApi.submitVerification(); toast.success('Company submitted for verification'); await resource.reload() } catch (error) { toast.error(getApiErrorMessage(error)) } finally { setSubmitting(false) } }
  const resubmitVerification = async () => { setSubmitting(true); try { await recruiterApi.resubmitVerification(); toast.success('Company corrections resubmitted'); await Promise.all([resource.reload(), historyResource.reload()]) } catch (error) { toast.error(getApiErrorMessage(error)) } finally { setSubmitting(false) } }
  const details = [['Industry', company.industry], ['Company size', company.companySize], ['Founded', company.foundedYear], ['Website', company.website], ['Email', company.companyEmail], ['Phone', company.companyPhone], ['Location', company.location], ['Address', [company.address, company.city, company.state, company.country, company.postalCode].filter(Boolean).join(', ')]]
  return <div className="space-y-6"><header className="flex flex-wrap items-start justify-between gap-4"><div className="flex items-center gap-4">{company.logoUrl ? <img className="size-20 rounded-xl border border-slate-200 object-contain" src={company.logoUrl} alt={`${company.companyName} logo`} /> : <div className="flex size-20 items-center justify-center rounded-xl bg-brand-50 text-2xl font-bold text-brand-700" aria-label="Company logo not uploaded">{company.companyName?.[0] ?? 'C'}</div>}<div><CompanyStatusBadge status={company.status} /><h1 className="mt-2 text-3xl font-bold">{company.companyName}</h1></div></div>{capabilities.canEdit && <Link className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold" to="/recruiter/company/edit">Edit company</Link>}</header>
    <section className="rounded-2xl border border-slate-200 bg-white p-6"><h2 className="text-xl font-semibold">Verification status</h2><p className="mt-2 text-slate-600">{statusContent.description}</p>{company.verificationReason && <p className="mt-3 rounded-lg bg-red-50 p-4 text-sm text-red-800"><strong>Review reason:</strong> {company.verificationReason}</p>}{capabilities.canSubmit && <AppButton className="mt-4" loading={submitting} onClick={submitVerification}>Submit for verification</AppButton>}{capabilities.isRejected && <div className="mt-4"><p className="mb-3 text-sm text-amber-800">Correct the rejected information, then resubmit it for review.</p><AppButton loading={submitting} onClick={resubmitVerification}>Resubmit corrections</AppButton></div>}</section>
    <section className="rounded-2xl border border-slate-200 bg-white p-6"><h2 className="text-xl font-semibold">Verification history</h2>{historyResource.loading ? <p className="mt-3 text-sm text-slate-600" role="status">Loading verification history…</p> : historyResource.error ? <p className="mt-3 text-sm text-red-700" role="alert">{getApiErrorMessage(historyResource.error)}</p> : historyResource.data?.length ? <ol className="mt-4 space-y-3">{historyResource.data.map((entry) => <li key={entry.id} className="rounded-xl bg-slate-50 p-4"><div className="flex flex-wrap items-center gap-2"><CompanyStatusBadge status={entry.oldStatus} /><span aria-hidden="true">→</span><CompanyStatusBadge status={entry.newStatus} /></div>{entry.reason && <p className="mt-2 text-sm text-slate-700">{entry.reason}</p>}<time className="mt-2 block text-xs text-slate-500" dateTime={entry.createdAt}>{entry.createdAt ? new Date(entry.createdAt).toLocaleString() : 'Date unavailable'}</time></li>)}</ol> : <p className="mt-3 text-sm text-slate-600">No verification activity yet.</p>}</section>
    <section className="rounded-2xl border border-slate-200 bg-white p-6"><h2 className="text-xl font-semibold">Company details</h2><p className="mt-4 whitespace-pre-wrap text-slate-600">{company.description || 'No description provided.'}</p><dl className="mt-6 grid gap-5 sm:grid-cols-2">{details.map(([label, value]) => <div key={label}><dt className="text-sm text-slate-500">{label}</dt><dd className="mt-1 break-words font-medium">{value || 'Not provided'}</dd></div>)}</dl></section>
    <section className="rounded-2xl border border-slate-200 bg-white p-6"><h2 className="text-xl font-semibold">Company logo</h2><p className="mt-2 text-sm text-slate-600">JPG, PNG or WebP; maximum 5 MB.</p><input ref={inputRef} className="sr-only" type="file" accept={COMPANY_LOGO_RULES.accept} onChange={upload} /><div className="mt-4 flex flex-wrap gap-3"><AppButton loading={uploading} disabled={!capabilities.canManageLogo} onClick={() => inputRef.current?.click()}>{company.logoUrl ? 'Replace logo' : 'Upload logo'}</AppButton>{company.logoUrl && <AppButton variant="danger" disabled={!capabilities.canManageLogo || uploading} onClick={() => setConfirmDelete(true)}>Delete logo</AppButton>}</div>{uploading && <p className="mt-3 text-sm" role="status" aria-live="polite">Upload progress: {progress}%</p>}</section>
    <ConfirmationModal isOpen={confirmDelete} title="Delete company logo?" message="This removes the current company logo." confirmLabel="Delete logo" loading={uploading} onConfirm={removeLogo} onCancel={() => setConfirmDelete(false)} />
  </div>
}
export default CompanyPage
