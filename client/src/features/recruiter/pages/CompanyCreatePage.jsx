import { useCallback, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import ErrorState from '../../../components/feedback/ErrorState'
import PageLoader from '../../../components/feedback/PageLoader'
import { getApiErrorMessage } from '../../../api/errorMapper'
import CompanyForm from '../components/CompanyForm'
import { useRecruiterResource } from '../hooks/useRecruiterResource'
import { recruiterApi } from '../services/recruiterApi'
import { companyCreateSchema, compactPayload } from '../validation/recruiterSchemas'

function CompanyCreatePage() {
  const navigate = useNavigate()
  const [saving, setSaving] = useState(false)
  const loader = useCallback((signal) => recruiterApi.companies(signal), [])
  const resource = useRecruiterResource(loader)
  if (resource.loading) return <PageLoader label="Checking company account" />
  if (resource.error) return <ErrorState message={getApiErrorMessage(resource.error)} onRetry={resource.reload} />
  if (resource.data?.length) return <Navigate to="/recruiter/company" replace />
  const submit = async (values) => { setSaving(true); try { await recruiterApi.createCompany(compactPayload(values)); toast.success('Company created'); navigate('/recruiter/company', { replace: true }) } catch (error) { toast.error(getApiErrorMessage(error)) } finally { setSaving(false) } }
  return <div className="space-y-6"><header><p className="text-sm font-semibold text-brand-700">Company onboarding</p><h1 className="text-3xl font-bold">Create your company profile</h1><p className="mt-2 text-slate-600">Your company begins in Draft status. Add its required details and logo before verification.</p></header><section className="rounded-2xl border border-slate-200 bg-white p-6"><CompanyForm schema={companyCreateSchema} saving={saving} onSubmit={submit} /></section></div>
}
export default CompanyCreatePage
