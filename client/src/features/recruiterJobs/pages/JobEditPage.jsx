import { useCallback, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import PageHeader from '../../../components/common/PageHeader'
import ErrorState from '../../../components/feedback/ErrorState'
import PageLoader from '../../../components/feedback/PageLoader'
import { getApiErrorMessage } from '../../../api/errorMapper'
import { useRecruiterResource } from '../../recruiter/hooks/useRecruiterResource'
import RecruiterJobForm from '../components/RecruiterJobForm'
import { recruiterJobApi } from '../services/recruiterJobApi'
import { getRecruiterJobCapabilities } from '../utils/recruiterJobCapabilities'

function JobEditPage() {
  const { jobId } = useParams()
  const navigate = useNavigate()
  const [saving, setSaving] = useState(false)
  const [serverError, setServerError] = useState(null)
  const loader = useCallback(
    (signal) => recruiterJobApi.getById(jobId, signal),
    [jobId],
  )
  const resource = useRecruiterResource(loader)

  if (resource.loading) return <PageLoader label="Loading job" />
  if (resource.error) {
    return (
      <ErrorState
        message={getApiErrorMessage(resource.error)}
        onRetry={resource.reload}
      />
    )
  }

  const job = resource.data
  const capabilities = getRecruiterJobCapabilities(job)

  if (!capabilities.canEdit) {
    return (
      <div className="space-y-5">
        <PageHeader title="Job cannot be edited" />
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-5 text-amber-900">
          The backend does not allow recruiter editing for a {job?.status || 'current'} job.
        </div>
        <Link className="font-semibold text-brand-700" to={`/recruiter/jobs/${jobId}`}>
          Return to job details
        </Link>
      </div>
    )
  }

  const submit = async (payload) => {
    setSaving(true)
    setServerError(null)
    try {
      const updated = await recruiterJobApi.update(jobId, payload)
      toast.success('Job updated successfully')
      navigate(`/recruiter/jobs/${updated.id}`, { replace: true })
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
        title={`Edit ${job.title || 'job draft'}`}
        description="Only fields supported for the current backend job status can be changed."
      />
      <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
        <RecruiterJobForm
          job={job}
          saving={saving}
          serverError={serverError}
          onSubmit={submit}
          onCancel={() => navigate(`/recruiter/jobs/${jobId}`)}
        />
      </section>
    </div>
  )
}

export default JobEditPage
