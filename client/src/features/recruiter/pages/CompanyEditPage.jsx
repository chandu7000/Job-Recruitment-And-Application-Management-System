import { useCallback, useMemo, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import ErrorState from '../../../components/feedback/ErrorState'
import PageLoader from '../../../components/feedback/PageLoader'
import { getApiErrorMessage } from '../../../api/errorMapper'
import CompanyForm from '../components/CompanyForm'
import { getCompanyCapabilities } from '../constants/recruiterConstants'
import { useRecruiterResource } from '../hooks/useRecruiterResource'
import { recruiterApi } from '../services/recruiterApi'
import { companyEditSchema, compactPayload } from '../validation/recruiterSchemas'

function CompanyEditPage() {
  const navigate = useNavigate()
  const [saving, setSaving] = useState(false)
  const loader = useCallback((signal) => recruiterApi.companies(signal), [])
  const resource = useRecruiterResource(loader)
  const company = resource.data?.[0]
  const initialValues = useMemo(() => Object.fromEntries(['companyName', 'companyEmail', 'companyPhone', 'website', 'industry', 'companySize', 'foundedYear', 'description', 'location', 'address', 'city', 'state', 'country', 'postalCode'].map((field) => [field, company?.[field] ?? ''])), [company])
  if (resource.loading) return <PageLoader label="Loading company editor" />
  if (resource.error) return <ErrorState message={getApiErrorMessage(resource.error)} onRetry={resource.reload} />
  if (!company) return <Navigate to="/recruiter/company/new" replace />
  if (!getCompanyCapabilities(company).canEdit) return <Navigate to="/recruiter/company" replace />
  const submit = async (values) => { setSaving(true); try { await recruiterApi.updateCompany(compactPayload(values)); toast.success('Company updated'); navigate('/recruiter/company') } catch (error) { toast.error(getApiErrorMessage(error)) } finally { setSaving(false) } }
  return <div className="space-y-6"><header><p className="text-sm font-semibold text-brand-700">Company profile</p><h1 className="text-3xl font-bold">Edit {company.companyName}</h1><p className="mt-2 text-slate-600">Update company identity, contact information, headquarters and public details.</p></header><section className="rounded-2xl border border-slate-200 bg-white p-6"><CompanyForm editing schema={companyEditSchema} initialValues={initialValues} saving={saving} onSubmit={submit} /></section></div>
}
export default CompanyEditPage
