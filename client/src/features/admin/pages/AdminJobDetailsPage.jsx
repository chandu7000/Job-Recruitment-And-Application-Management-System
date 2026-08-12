import { useCallback, useEffect, useRef, useState } from 'react'
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
import useDialogFocus from '../../../hooks/useDialogFocus'
import AdminStatusBadge from '../components/AdminStatusBadge'
import { humanize } from '../constants/adminModerationConstants'
import { validateJobRemovalReason } from '../utils/adminModerationUtils'
import { adminApi } from '../services/adminApi'

function AdminJobDetailsPage() {
  const { jobId } = useParams()

  const [state, setState] = useState({
    job: null,
    loading: true,
    error: null,
  })

  const [action, setAction] = useState('')
  const [reason, setReason] = useState('')
  const [validation, setValidation] = useState('')
  const [saving, setSaving] = useState(false)
  const removalReasonRef = useRef(null)

  const closeRemoveDialog = useCallback(() => {
    if (saving) return
    setAction('')
  }, [saving])

  const removalDialogRef = useDialogFocus({
    isOpen: action === 'remove',
    initialFocusRef: removalReasonRef,
    onEscape: closeRemoveDialog,
    canClose: !saving,
  })

  useEffect(() => {
    const controller = new AbortController()
    let active = true

    adminApi
      .getJob(jobId, controller.signal)
      .then((job) => {
        if (!active) return

        setState({
          job,
          loading: false,
          error: null,
        })
      })
      .catch((error) => {
        if (
          !active ||
          error?.name === 'CanceledError' ||
          error?.code === 'ERR_CANCELED'
        ) {
          return
        }

        setState({
          job: null,
          loading: false,
          error,
        })
      })

    return () => {
      active = false
      controller.abort()
    }
  }, [jobId])

  const reload = useCallback(async () => {
    setState((current) => ({
      ...current,
      loading: true,
      error: null,
    }))

    try {
      const job = await adminApi.getJob(jobId)

      setState({
        job,
        loading: false,
        error: null,
      })
    } catch (error) {
      setState({
        job: null,
        loading: false,
        error,
      })
    }
  }, [jobId])

  const confirm = async () => {
    if (action === 'remove') {
      const error = validateJobRemovalReason(reason)

      if (error) {
        setValidation(error)
        return
      }
    }

    setSaving(true)

    try {
      if (action === 'remove') {
        await adminApi.removeJob(jobId, reason.trim())
      } else {
        await adminApi.restoreJob(jobId)
      }

      toast.success(
        action === 'remove'
          ? 'Job removed successfully.'
          : 'Job restored successfully.',
      )

      setAction('')
      setReason('')
      setValidation('')

      await reload()
    } catch (error) {
      toast.error(getApiErrorMessage(error))
    } finally {
      setSaving(false)
    }
  }

  if (state.loading) {
    return <PageLoader label="Loading job details" />
  }

  if (state.error) {
    return (
      <ErrorState
        message={getApiErrorMessage(state.error)}
        onRetry={reload}
      />
    )
  }

  const job = state.job || {}

  const fields = [
    ['Company', job.company?.companyName],
    ['Recruiter', job.creator?.email],
    ['Location', job.location],
    ['Work mode', humanize(job.workMode)],
    ['Employment type', humanize(job.employmentType)],
    ['Experience', humanize(job.experienceLevel)],
    ['Vacancies', job.vacancies],
    ['Application deadline', formatDateTime(job.applicationDeadline)],
    ['Published', formatDateTime(job.publishedAt)],
    ['Created', formatDateTime(job.createdAt)],
    ['Removed', formatDateTime(job.removedAt)],
    ['Removal reason', job.removalReason],
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title={job.title || 'Job details'}
        description="Platform job details and supported moderation actions."
        actions={
          <Link
            className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold"
            to="/admin/jobs"
          >
            Back to jobs
          </Link>
        }
      />

      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <div className="flex flex-wrap justify-between gap-4">
          <AdminStatusBadge status={job.status} />

          <div>
            {['PUBLISHED', 'CLOSED'].includes(job.status) && (
              <AppButton
                variant="danger"
                onClick={() => setAction('remove')}
              >
                Remove job
              </AppButton>
            )}

            {job.status === 'REMOVED' && (
              <AppButton onClick={() => setAction('restore')}>
                Restore job
              </AppButton>
            )}
          </div>
        </div>

        <dl className="mt-6 grid gap-4 sm:grid-cols-2">
          {fields.map(([label, value]) => (
            <div key={label} className="rounded-xl bg-slate-50 p-4">
              <dt className="text-sm text-slate-500">{label}</dt>
              <dd className="mt-1 break-words font-semibold">
                {value ?? '—'}
              </dd>
            </div>
          ))}
        </dl>

        {job.skills?.length > 0 && (
          <div className="mt-5">
            <h2 className="font-bold">Skills</h2>
            <p className="mt-2 text-slate-700">
              {job.skills.join(', ')}
            </p>
          </div>
        )}

        {job.description && (
          <div className="mt-5">
            <h2 className="font-bold">Description</h2>
            <p className="mt-2 whitespace-pre-wrap text-slate-700">
              {job.description}
            </p>
          </div>
        )}
      </section>

      {action === 'remove' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="job-removal-title"
            aria-describedby="job-removal-description"
            ref={removalDialogRef}
            tabIndex={-1}
            className="max-h-[calc(100vh-2rem)] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-5 shadow-xl sm:p-6"
          >
            <h2 id="job-removal-title" className="text-xl font-bold">Remove job?</h2>

            <p id="job-removal-description" className="mt-2 text-slate-600">
              Provide a moderation reason. This is not recruiter deletion.
            </p>

            <label
              className="mt-4 block text-sm font-semibold"
              htmlFor="job-removal-reason"
            >
              Removal reason
            </label>

            <AppTextarea
              ref={removalReasonRef}
              id="job-removal-reason"
              error={Boolean(validation)}
              aria-describedby={validation ? 'job-removal-error' : undefined}
              rows={5}
              maxLength={2000}
              value={reason}
              onChange={(event) => {
                setReason(event.target.value)
                setValidation('')
              }}
            />

            {validation && (
              <p id="job-removal-error" className="mt-2 text-sm text-rose-600">
                {validation}
              </p>
            )}

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <AppButton
                variant="secondary"
                disabled={saving}
                onClick={closeRemoveDialog}
              >
                Cancel
              </AppButton>

              <AppButton
                variant="danger"
                loading={saving}
                onClick={confirm}
              >
                Remove job
              </AppButton>
            </div>
          </section>
        </div>
      )}

      <ConfirmationModal
        isOpen={action === 'restore'}
        title="Restore job?"
        message="The backend will restore this job to its stored previous status, or CLOSED when no previous status is available."
        confirmLabel="Restore job"
        confirmVariant="primary"
        loading={saving}
        onConfirm={confirm}
        onCancel={() => setAction('')}
      />
    </div>
  )
}

export default AdminJobDetailsPage