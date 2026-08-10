import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import AppButton from '../../../components/common/AppButton'
import AppTextarea from '../../../components/forms/AppTextarea'
import FormField from '../../../components/forms/FormField'
import ConfirmationModal from '../../../components/modals/ConfirmationModal'
import { getApiErrorMessage } from '../../../api/errorMapper'
import { JOB_FIELD_LIMITS } from '../constants/recruiterJobConstants'
import { recruiterJobApi } from '../services/recruiterJobApi'
import { getRecruiterJobCapabilities } from '../utils/recruiterJobCapabilities'
import { validatePublicationReadiness } from '../validation/recruiterJobSchemas'

function JobLifecycleActions({ job, onChanged, onDeleted }) {
  const [action, setAction] = useState('')
  const [loading, setLoading] = useState(false)
  const [showCloseForm, setShowCloseForm] = useState(false)
  const [closureReason, setClosureReason] = useState('')
  const capabilities = useMemo(() => getRecruiterJobCapabilities(job), [job])
  const publicationIssues = useMemo(
    () => validatePublicationReadiness(job),
    [job],
  )
  const companyVerified = job?.company?.status === 'VERIFIED'
  const canPublish =
    capabilities.canPublish &&
    companyVerified &&
    publicationIssues.length === 0

  const publish = async () => {
    setLoading(true)
    try {
      const updated = await recruiterJobApi.publish(job.id)
      toast.success('Job published successfully')
      setAction('')
      await onChanged?.(updated)
    } catch (error) {
      toast.error(getApiErrorMessage(error))
    } finally {
      setLoading(false)
    }
  }

  const close = async () => {
    setLoading(true)
    try {
      const updated = await recruiterJobApi.close(job.id, closureReason)
      toast.success('Job closed successfully')
      setShowCloseForm(false)
      setClosureReason('')
      await onChanged?.(updated)
    } catch (error) {
      toast.error(getApiErrorMessage(error))
    } finally {
      setLoading(false)
    }
  }

  const remove = async () => {
    setLoading(true)
    try {
      await recruiterJobApi.deleteDraft(job.id)
      toast.success('Draft deleted successfully')
      setAction('')
      await onDeleted?.()
    } catch (error) {
      toast.error(getApiErrorMessage(error))
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5">
      <h2 className="text-lg font-bold text-slate-950">Job actions</h2>
      <div className="mt-4 flex flex-wrap gap-3">
        {capabilities.canEdit && (
          <Link
            className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            to={`/recruiter/jobs/${job.id}/edit`}
          >
            Edit job
          </Link>
        )}

        {capabilities.canPublish && (
          <AppButton
            disabled={!canPublish || loading}
            onClick={() => setAction('publish')}
          >
            Publish
          </AppButton>
        )}

        {capabilities.canClose && (
          <AppButton
            variant="secondary"
            disabled={loading}
            onClick={() => setShowCloseForm((current) => !current)}
          >
            Close job
          </AppButton>
        )}

        {capabilities.canDelete && (
          <AppButton
            variant="danger"
            disabled={loading}
            onClick={() => setAction('delete')}
          >
            Delete draft
          </AppButton>
        )}
      </div>

      {capabilities.canPublish && !companyVerified && (
        <p className="mt-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-900">
          Your company must be verified before this draft can be published.{' '}
          <Link className="font-semibold underline" to="/recruiter/company">
            Review company status
          </Link>
        </p>
      )}

      {capabilities.canPublish &&
        companyVerified &&
        publicationIssues.length > 0 && (
          <div className="mt-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-900">
            <p className="font-semibold">Complete these items before publishing:</p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              {publicationIssues.map((issue) => (
                <li key={issue}>{issue}</li>
              ))}
            </ul>
          </div>
        )}

      {showCloseForm && capabilities.canClose && (
        <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <FormField
            id="job-closure-reason"
            label="Closure reason (optional)"
            hint="The backend defaults to RECRUITER_CLOSED when no reason is supplied."
          >
            <AppTextarea
              id="job-closure-reason"
              rows={3}
              maxLength={JOB_FIELD_LIMITS.closureReasonMax}
              value={closureReason}
              disabled={loading}
              onChange={(event) => setClosureReason(event.target.value)}
            />
          </FormField>
          <div className="mt-3 flex flex-wrap gap-3">
            <AppButton variant="danger" loading={loading} onClick={close}>
              Confirm close
            </AppButton>
            <AppButton
              variant="secondary"
              disabled={loading}
              onClick={() => {
                setShowCloseForm(false)
                setClosureReason('')
              }}
            >
              Cancel
            </AppButton>
          </div>
        </div>
      )}

      {!capabilities.canEdit &&
        !capabilities.canPublish &&
        !capabilities.canClose &&
        !capabilities.canDelete && (
          <p className="mt-4 text-sm text-slate-600">
            No recruiter lifecycle actions are available for this job status.
            Closed jobs cannot be reopened by the current backend contract.
          </p>
        )}

      <ConfirmationModal
        isOpen={action === 'publish'}
        title="Publish this job?"
        message="The job will become visible through the public job APIs after the backend confirms publication."
        confirmLabel="Publish job"
        confirmVariant="primary"
        loading={loading}
        onConfirm={publish}
        onCancel={() => setAction('')}
      />

      <ConfirmationModal
        isOpen={action === 'delete'}
        title="Delete this draft?"
        message="This is allowed only for an owned draft with no applications. The action cannot be undone from the recruiter workspace."
        confirmLabel="Delete draft"
        loading={loading}
        onConfirm={remove}
        onCancel={() => setAction('')}
      />
    </section>
  )
}

export default JobLifecycleActions
