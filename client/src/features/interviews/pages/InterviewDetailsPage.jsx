import { zodResolver } from '@hookform/resolvers/zod'
import axios from 'axios'
import {
  CalendarCheck,
  Clock3,
  ExternalLink,
  Globe2,
  Link2,
  MapPin,
  Phone,
  ShieldCheck,
  Video,
  X,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import AppButton from '../../../components/common/AppButton'
import ErrorState from '../../../components/feedback/ErrorState'
import PageLoader from '../../../components/feedback/PageLoader'
import { getInterviewErrorMessage } from '../utils/interviewErrors'
import { formatDateTime } from '../../../utils/date'
import InterviewHistory from '../components/InterviewHistory'
import InterviewStatusBadge from '../components/InterviewStatusBadge'
import InterviewJobContext from '../components/InterviewJobContext'
import { candidateInterviewApi } from '../services/interviewApi'
import {
  getCandidateInterviewActions,
  meetingTypeLabel,
} from '../utils/interview'
import { interviewReasonSchema } from '../validation/interviewSchemas'

export default function InterviewDetailsPage() {
  const { interviewId } = useParams()

  const [retry, setRetry] = useState(0)
  const [state, setState] = useState({
    key: '',
    interview: null,
    error: '',
  })
  const [declining, setDeclining] = useState(false)

  const key = `${interviewId}:${retry}`

  const form = useForm({
    resolver: zodResolver(interviewReasonSchema),
    defaultValues: {
      reason: '',
    },
  })

  useEffect(() => {
    const controller = new AbortController()

    candidateInterviewApi
      .details(interviewId, {
        signal: controller.signal,
      })
      .then((interview) => {
        setState({
          key,
          interview,
          error: '',
        })
      })
      .catch((error) => {
        if (!axios.isCancel(error)) {
          setState({
            key,
            interview: null,
            error: getInterviewErrorMessage(error),
          })
        }
      })

    return () => controller.abort()
  }, [interviewId, key])

  const confirm = async () => {
    try {
      await candidateInterviewApi.confirm(interviewId)
      toast.success('Attendance confirmed.')
      setRetry((value) => value + 1)
    } catch (error) {
      toast.error(getInterviewErrorMessage(error))
    }
  }

  const decline = form.handleSubmit(async ({ reason }) => {
    try {
      await candidateInterviewApi.decline(interviewId, reason)

      toast.success('Interview declined.')
      setDeclining(false)
      form.reset()
      setRetry((value) => value + 1)
    } catch (error) {
      toast.error(getInterviewErrorMessage(error))
    }
  })

  if (state.key !== key) {
    return <PageLoader label="Loading interview details" />
  }

  if (state.error) {
    return (
      <ErrorState
        title="Unable to load interview"
        message={state.error}
        onRetry={() => setRetry((value) => value + 1)}
      />
    )
  }

  const interview = state.interview

  if (!interview) {
    return null
  }

  const actions = getCandidateInterviewActions(interview)

  return (
    <section className="space-y-6">
      <Link
        to="/job-seeker/interviews"
        className="inline-flex items-center text-sm font-semibold text-brand-700 hover:text-brand-800"
      >
        ← Back to my interviews
      </Link>

      <header className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <InterviewStatusBadge status={interview.status} />

          <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950">
            Interview details
          </h1>

          <div className="mt-4">
            <InterviewJobContext jobId={interview.jobId} />
          </div>

          <Link
            to={`/job-seeker/applications/${interview.applicationId}`}
            className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-brand-700 hover:text-brand-800"
          >
            View application
            <span aria-hidden="true">→</span>
          </Link>
        </div>

        {(actions.includes('confirm') || actions.includes('decline')) && (
          <div className="flex flex-col items-start gap-3 xl:items-end">
            <div className="flex flex-wrap gap-3">
              {actions.includes('confirm') && (
                <button
                  type="button"
                  onClick={confirm}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  <CalendarCheck size={18} />
                  Confirm attendance
                </button>
              )}

              {actions.includes('decline') && (
                <button
                  type="button"
                  onClick={() => setDeclining(true)}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-red-300 bg-white px-5 py-3 text-sm font-semibold text-red-600 shadow-sm transition hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2"
                >
                  <X size={18} />
                  Decline
                </button>
              )}
            </div>

            <div className="inline-flex items-center gap-2 text-xs text-slate-500">
              <ShieldCheck size={15} />
              Your response will be shared with the recruiter
            </div>
          </div>
        )}
      </header>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <dl className="grid gap-x-12 gap-y-6 md:grid-cols-2">
          <div>
            <dt className="flex items-center gap-2 text-sm font-medium text-slate-500">
              <Clock3 size={17} />
              Starts
            </dt>
            <dd className="mt-2 text-base font-semibold text-slate-950">
              {formatDateTime(interview.scheduledStartAt)}
            </dd>
          </div>

          <div>
            <dt className="flex items-center gap-2 text-sm font-medium text-slate-500">
              <Clock3 size={17} />
              Ends
            </dt>
            <dd className="mt-2 text-base font-semibold text-slate-950">
              {formatDateTime(interview.scheduledEndAt)}
            </dd>
          </div>

          <div>
            <dt className="flex items-center gap-2 text-sm font-medium text-slate-500">
              <Globe2 size={17} />
              Timezone
            </dt>
            <dd className="mt-2 text-base text-slate-800">
              {interview.timezone}
            </dd>
          </div>

          <div>
            <dt className="flex items-center gap-2 text-sm font-medium text-slate-500">
              {interview.meetingType === 'ONLINE' ? (
                <Video size={17} />
              ) : interview.meetingType === 'IN_PERSON' ? (
                <MapPin size={17} />
              ) : (
                <Phone size={17} />
              )}
              Meeting type
            </dt>

            <dd className="mt-2 text-base text-slate-800">
              {meetingTypeLabel(interview.meetingType)}
            </dd>
          </div>
        </dl>

        {interview.meetingLink && (
          <div className="mt-7">
            <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
              <Link2 size={17} />
              Join online interview
            </div>

            <a
              href={interview.meetingLink}
              target="_blank"
              rel="noreferrer"
              className="mt-2 inline-flex items-center gap-2 break-all font-semibold text-brand-700 hover:text-brand-800"
            >
              {interview.meetingLink}
              <ExternalLink size={16} />
            </a>
          </div>
        )}

        {interview.physicalLocation && (
          <div className="mt-7">
            <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
              <MapPin size={17} />
              Interview location
            </div>

            <p className="mt-2 text-sm text-slate-700">
              {interview.physicalLocation}
            </p>
          </div>
        )}

        {interview.phoneInstructions && (
          <div className="mt-7">
            <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
              <Phone size={17} />
              Phone instructions
            </div>

            <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">
              {interview.phoneInstructions}
            </p>
          </div>
        )}

        {interview.interviewInstructions && (
          <div className="mt-6 rounded-xl bg-slate-50 px-4 py-3">
            <p className="whitespace-pre-wrap text-sm leading-6 text-slate-700">
              {interview.interviewInstructions}
            </p>
          </div>
        )}

        {interview.declineReason && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
            <p className="text-sm text-red-700">
              <strong>Your decline reason:</strong>{' '}
              {interview.declineReason}
            </p>
          </div>
        )}

        {interview.cancellationReason && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
            <p className="text-sm text-red-700">
              <strong>Cancellation reason:</strong>{' '}
              {interview.cancellationReason}
            </p>
          </div>
        )}
      </section>

      {interview.feedbackVisibleToCandidate &&
        interview.status === 'COMPLETED' && (
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-950">
              Interview feedback
            </h2>

            {interview.rating && (
              <p className="mt-4 text-sm text-slate-700">
                <strong>Rating:</strong> {interview.rating}/5
              </p>
            )}

            {interview.feedback && (
              <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-700">
                {interview.feedback}
              </p>
            )}

            {interview.strengths && (
              <p className="mt-3 text-sm text-slate-700">
                <strong>Strengths:</strong> {interview.strengths}
              </p>
            )}

            {interview.concerns && (
              <p className="mt-3 text-sm text-slate-700">
                <strong>Concerns:</strong> {interview.concerns}
              </p>
            )}

            {interview.recommendation && (
              <p className="mt-3 text-sm text-slate-700">
                <strong>Recommendation:</strong>{' '}
                {interview.recommendation}
              </p>
            )}
          </section>
        )}

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-950">
          Schedule history
        </h2>

        <div className="mt-5">
          <InterviewHistory history={interview.history} />
        </div>
      </section>

      {declining && (
        <form
          onSubmit={decline}
          className="rounded-2xl border border-red-200 bg-white p-6 shadow-sm"
        >
          <h2 className="text-lg font-bold text-slate-950">
            Decline interview
          </h2>

          <p className="mt-1 text-sm text-slate-600">
            Tell the recruiter why you cannot attend this interview.
          </p>

          <textarea
            {...form.register('reason')}
            rows="4"
            maxLength="1000"
            className="mt-4 w-full rounded-xl border border-slate-300 p-3 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
            placeholder="Reason for declining"
          />

          {form.formState.errors.reason && (
            <p className="mt-2 text-sm text-red-600">
              {form.formState.errors.reason.message}
            </p>
          )}

          <div className="mt-4 flex flex-wrap gap-3">
            <AppButton
              type="submit"
              variant="danger"
              loading={form.formState.isSubmitting}
            >
              Confirm decline
            </AppButton>

            <AppButton
              type="button"
              variant="secondary"
              onClick={() => {
                setDeclining(false)
                form.reset()
              }}
            >
              Go back
            </AppButton>
          </div>
        </form>
      )}
    </section>
  )
}