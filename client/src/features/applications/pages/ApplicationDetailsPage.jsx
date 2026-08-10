import { zodResolver } from '@hookform/resolvers/zod'
import axios from 'axios'
import { ArrowLeft, FileText } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { getApiErrorMessage } from '../../../api/errorMapper'
import AppButton from '../../../components/common/AppButton'
import ErrorState from '../../../components/feedback/ErrorState'
import PageLoader from '../../../components/feedback/PageLoader'
import ConfirmationModal from '../../../components/modals/ConfirmationModal'
import { formatDate, formatDateTime } from '../../../utils/date'
import ApplicationStatusBadge from '../components/ApplicationStatusBadge'
import ApplicationTimeline from '../components/ApplicationTimeline'
import InterviewSummary from '../components/InterviewSummary'
import {
  applicationsApi,
  candidateInterviewsApi,
} from '../services/applicationApi'
import { canWithdrawApplication } from '../utils/applicationTracking'
import { withdrawalSchema } from '../validation/withdrawalSchema'

function Detail({ label, children }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </dt>

      <dd className="mt-1 text-sm text-slate-800">
        {children || '—'}
      </dd>
    </div>
  )
}

function ApplicationDetailsPage() {
  const { applicationId } = useParams()
  const navigate = useNavigate()

  const [retryKey, setRetryKey] = useState(0)

  const [state, setState] = useState({
    key: '',
    application: null,
    interview: null,
    interviewLoading: true,
    error: '',
  })

  const [showWithdraw, setShowWithdraw] = useState(false)
  const [confirmWithdraw, setConfirmWithdraw] = useState(false)
  const [pendingReason, setPendingReason] = useState('')
  const [withdrawing, setWithdrawing] = useState(false)

  const withdrawalSectionRef = useRef(null)

  const key = `${applicationId}:${retryKey}`

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(withdrawalSchema),
    defaultValues: {
      reason: '',
    },
  })

  useEffect(() => {
    const controller = new AbortController()

    applicationsApi
      .details(applicationId, {
        signal: controller.signal,
      })
      .then((application) => {
        setState({
          key,
          application,
          interview: null,
          interviewLoading: true,
          error: '',
        })

        candidateInterviewsApi
          .findForApplication(applicationId, {
            signal: controller.signal,
          })
          .then((interview) =>
            setState((current) =>
              current.key === key
                ? {
                    ...current,
                    interview,
                    interviewLoading: false,
                  }
                : current
            )
          )
          .catch((error) => {
            if (!axios.isCancel(error)) {
              setState((current) =>
                current.key === key
                  ? {
                      ...current,
                      interviewLoading: false,
                    }
                  : current
              )
            }
          })
      })
      .catch((error) => {
        if (!axios.isCancel(error)) {
          setState({
            key,
            application: null,
            interview: null,
            interviewLoading: false,
            error: getApiErrorMessage(error),
          })
        }
      })

    return () => controller.abort()
  }, [applicationId, key])

  useEffect(() => {
    if (showWithdraw && withdrawalSectionRef.current) {
      withdrawalSectionRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      })
    }
  }, [showWithdraw])

  const prepareWithdrawal = handleSubmit(({ reason }) => {
    setPendingReason(reason.trim())
    setConfirmWithdraw(true)
  })

  const onWithdraw = async () => {
    setWithdrawing(true)

    try {
      await applicationsApi.withdraw(
        applicationId,
        pendingReason
          ? {
              reason: pendingReason,
            }
          : {}
      )

      toast.success('Application withdrawn successfully.')

      setConfirmWithdraw(false)
      setShowWithdraw(false)
      setPendingReason('')

      reset()

      setRetryKey((value) => value + 1)
    } catch (error) {
      toast.error(getApiErrorMessage(error))
    } finally {
      setWithdrawing(false)
    }
  }

  if (state.key !== key) {
    return (
      <PageLoader label="Loading application details" />
    )
  }

  if (state.error) {
    return (
      <ErrorState
        title="Unable to load application"
        message={state.error}
        onRetry={() =>
          setRetryKey((value) => value + 1)
        }
      />
    )
  }

  const application = state.application

  if (!application) {
    return null
  }

  return (
    <section className="space-y-6">
      <button
        type="button"
        onClick={() =>
          navigate('/job-seeker/applications')
        }
        className="inline-flex items-center gap-2 text-sm font-semibold text-brand-700"
      >
        <ArrowLeft className="size-4" />
        Back to applications
      </button>

      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <ApplicationStatusBadge
            status={application.status}
          />

          <h1 className="mt-3 text-3xl font-bold text-slate-950">
            {application.jobSnapshot?.title ||
              'Job unavailable'}
          </h1>

          <p className="mt-1 text-lg font-medium text-brand-700">
            {application.companySnapshot?.name ||
              'Company unavailable'}
          </p>

          <p className="mt-2 text-sm text-slate-600">
            Applied {formatDate(application.createdAt)}
          </p>
        </div>

        {canWithdrawApplication(application.status) && (
          <AppButton
            variant="danger"
            onClick={() => setShowWithdraw(true)}
          >
            Withdraw application
          </AppButton>
        )}
      </header>

      {!application.jobSnapshot && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          The original job is no longer available. Your
          saved application history is still shown below.
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <h2 className="text-lg font-bold text-slate-950">
              Application information
            </h2>

            <dl className="mt-4 grid gap-4 sm:grid-cols-2">
              <Detail label="Current status">
                <ApplicationStatusBadge
                  status={application.status}
                />
              </Detail>

              <Detail label="Applied date">
                {formatDateTime(application.createdAt)}
              </Detail>

              <Detail label="Location">
                {application.jobSnapshot?.location}
              </Detail>

              <Detail label="Employment type">
                {application.jobSnapshot?.employmentType}
              </Detail>

              <Detail label="Work mode">
                {application.jobSnapshot?.workMode}
              </Detail>

              <Detail label="Experience level">
                {application.jobSnapshot?.experienceLevel}
              </Detail>
            </dl>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <h2 className="text-lg font-bold text-slate-950">
              Resume snapshot
            </h2>

            {application.resumeSnapshot ? (
              <div className="mt-4 flex items-start gap-3">
                <FileText className="mt-0.5 size-5 text-brand-600" />

                <div>
                  <p className="font-semibold text-slate-900">
                    {application.resumeSnapshot
                      .originalName || 'Submitted resume'}
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    Captured{' '}
                    {formatDateTime(
                      application.resumeSnapshot.capturedAt
                    )}
                  </p>

                  {application.resumeSnapshot.url && (
                    <a
                      href={application.resumeSnapshot.url}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-2 inline-block text-sm font-semibold text-brand-700 hover:underline"
                    >
                      Open resume
                    </a>
                  )}
                </div>
              </div>
            ) : (
              <p className="mt-3 text-sm text-slate-500">
                Resume snapshot unavailable.
              </p>
            )}
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <h2 className="text-lg font-bold text-slate-950">
              Cover letter
            </h2>

            <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-700">
              {application.coverLetter ||
                'No cover letter was submitted.'}
            </p>
          </section>
        </div>

        <div className="space-y-6">
          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <h2 className="text-lg font-bold text-slate-950">
              Status history
            </h2>

            <div className="mt-5">
              <ApplicationTimeline
                history={application.statusHistory}
              />
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <h2 className="text-lg font-bold text-slate-950">
              Interview summary
            </h2>

            <div className="mt-4">
              <InterviewSummary
                interview={state.interview}
                loading={state.interviewLoading}
              />
            </div>
          </section>

          {application.status === 'WITHDRAWN' && (
            <section className="rounded-2xl border border-slate-200 bg-white p-5">
              <h2 className="text-lg font-bold text-slate-950">
                Withdrawal
              </h2>

              <p className="mt-3 text-sm text-slate-600">
                Withdrawn{' '}
                {formatDateTime(application.withdrawnAt)}
              </p>

              {application.withdrawalReason && (
                <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">
                  {application.withdrawalReason}
                </p>
              )}
            </section>
          )}
        </div>
      </div>

      {showWithdraw && (
        <section
          ref={withdrawalSectionRef}
          className="rounded-2xl border border-red-200 bg-red-50 p-5"
        >
          <h2 className="text-lg font-bold text-slate-950">
            Withdrawal reason
          </h2>

          <p className="mt-1 text-sm text-slate-600">
            The backend accepts an optional reason up to
            1000 characters.
          </p>

          <form
            onSubmit={prepareWithdrawal}
            className="mt-4"
          >
            <label
              htmlFor="withdrawal-reason"
              className="text-sm font-semibold text-slate-700"
            >
              Reason (optional)
            </label>

            <textarea
              id="withdrawal-reason"
              rows="4"
              maxLength={1000}
              {...register('reason')}
              className="mt-2 w-full rounded-lg border border-slate-300 bg-white p-3 text-sm"
              placeholder="You may add a reason for withdrawing."
            />

            {errors.reason && (
              <p className="mt-1 text-sm text-red-600">
                {errors.reason.message}
              </p>
            )}

            <div className="mt-4 flex gap-3">
              <AppButton
                type="submit"
                variant="danger"
              >
                Continue
              </AppButton>

              <AppButton
                variant="secondary"
                onClick={() => {
                  setShowWithdraw(false)
                  reset()
                }}
              >
                Cancel
              </AppButton>
            </div>
          </form>
        </section>
      )}

      <ConfirmationModal
        isOpen={confirmWithdraw}
        title="Withdraw this application?"
        message="This changes the application to Withdrawn. Your previous application history will remain available."
        confirmLabel="Withdraw application"
        confirmVariant="danger"
        loading={withdrawing}
        onConfirm={onWithdraw}
        onCancel={() => {
          if (!withdrawing) {
            setConfirmWithdraw(false)
          }
        }}
      />
    </section>
  )
}

export default ApplicationDetailsPage