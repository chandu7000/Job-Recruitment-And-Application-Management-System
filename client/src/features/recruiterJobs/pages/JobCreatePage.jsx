import { useCallback, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import PageHeader from '../../../components/common/PageHeader'
import EmptyState from '../../../components/feedback/EmptyState'
import ErrorState from '../../../components/feedback/ErrorState'
import PageLoader from '../../../components/feedback/PageLoader'
import { getApiErrorMessage } from '../../../api/errorMapper'
import { useRecruiterResource } from '../../recruiter/hooks/useRecruiterResource'
import { recruiterApi } from '../../recruiter/services/recruiterApi'
import RecruiterJobForm from '../components/RecruiterJobForm'
import { recruiterJobApi } from '../services/recruiterJobApi'

function JobCreatePage() {
  const navigate = useNavigate()
  const [saving, setSaving] = useState(false)
  const [serverError, setServerError] = useState(null)
  const companyLoader = useCallback(
    (signal) => recruiterApi.companies(signal),
    [],
  )
  const companies = useRecruiterResource(companyLoader)
  const company = useMemo(() => companies.data?.[0] ?? null, [companies.data])

  if (companies.loading) return <PageLoader label="Loading recruiter company" />
  if (companies.error) {
    return (
      <ErrorState
        message={getApiErrorMessage(companies.error)}
        onRetry={companies.reload}
      />
    )
  }

  if (!company) {
    return (
      <EmptyState
        title="Create your company first"
        description="A recruiter job draft must be associated with your owned company."
        action={
          <Link
            className="rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white"
            to="/recruiter/company/new"
          >
            Create company
          </Link>
        }
      />
    )
  }

  const submit = async (payload) => {
    setSaving(true)
    setServerError(null)
    try {
      const job = await recruiterJobApi.createDraft({
        companyId: company.id,
        ...payload,
      })
      toast.success('Job draft created successfully')
      navigate(`/recruiter/jobs/${job.id}`, { replace: true })
    } catch (error) {
      setServerError(error)
      toast.error(getApiErrorMessage(error))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Create job"
        description={`Save a recruiter-owned draft for ${company.companyName}. Publication is available only after the backend confirms all requirements.`}
      />

      {company.status !== 'VERIFIED' && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          You can save drafts now, but this company must be verified before a
          job can be published.
        </div>
      )}

      <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
        <RecruiterJobForm
          saving={saving}
          serverError={serverError}
          onSubmit={submit}
          onCancel={() => navigate('/recruiter/jobs')}
        />
      </section>
    </div>
  )
}

export default JobCreatePage
