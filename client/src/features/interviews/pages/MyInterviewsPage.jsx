import axios from 'axios'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import ErrorState from '../../../components/feedback/ErrorState'
import PageLoader from '../../../components/feedback/PageLoader'
import { getInterviewErrorMessage } from '../utils/interviewErrors'
import { formatDateTime } from '../../../utils/date'
import InterviewStatusBadge from '../components/InterviewStatusBadge'
import InterviewJobContext from '../components/InterviewJobContext'
import { candidateInterviewApi } from '../services/interviewApi'
import { INTERVIEW_STATUS_VALUES, meetingTypeLabel } from '../utils/interview'

export default function MyInterviewsPage() {
  const [filters, setFilters] = useState({
    page: 1,
    status: '',
    order: 'ASC',
    window: 'upcoming',
  })
  const [retry, setRetry] = useState(0)
  const [state, setState] = useState({
    key: '',
    data: null,
    error: '',
  })

  const { page, status, order, window } = filters
  const key = JSON.stringify([page, status, order, window, retry])

  useEffect(() => {
    const controller = new AbortController()

    const params = {
      page,
      order,
      ...(status && { status }),
      ...(window === 'upcoming' && { upcoming: true }),
      ...(window === 'past' && { past: true }),
    }

    candidateInterviewApi
      .list(params, { signal: controller.signal })
      .then((data) => {
        setState({
          key,
          data,
          error: '',
        })
      })
      .catch((error) => {
        if (!axios.isCancel(error)) {
          setState({
            key,
            data: null,
            error: getInterviewErrorMessage(error),
          })
        }
      })

    return () => controller.abort()
  }, [key, page, status, order, window])

  if (state.key !== key) {
    return <PageLoader label="Loading your interviews" />
  }

  if (state.error) {
    return (
      <ErrorState
        title="Unable to load interviews"
        message={state.error}
        onRetry={() => setRetry((value) => value + 1)}
      />
    )
  }

  const { interviews = [], pagination = {} } = state.data || {}

  return (
    <section className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold">My interviews</h1>
        <p className="mt-2 text-slate-600">
          Review interview schedules and respond to attendance requests.
        </p>
      </header>

      <div className="grid gap-3 rounded-2xl border bg-white p-4 sm:grid-cols-3">
        <select
          value={status}
          onChange={(event) =>
            setFilters((value) => ({
              ...value,
              status: event.target.value,
              page: 1,
            }))
          }
          className="rounded-lg border p-2"
        >
          <option value="">All statuses</option>
          {INTERVIEW_STATUS_VALUES.map((value) => (
            <option key={value}>{value}</option>
          ))}
        </select>

        <select
          value={window}
          onChange={(event) =>
            setFilters((value) => ({
              ...value,
              window: event.target.value,
              page: 1,
            }))
          }
          className="rounded-lg border p-2"
        >
          <option value="upcoming">Upcoming</option>
          <option value="past">Past</option>
          <option value="all">All</option>
        </select>

        <select
          value={order}
          onChange={(event) =>
            setFilters((value) => ({
              ...value,
              order: event.target.value,
              page: 1,
            }))
          }
          className="rounded-lg border p-2"
        >
          <option value="ASC">Soonest first</option>
          <option value="DESC">Latest first</option>
        </select>
      </div>

      {interviews.length ? (
        <div className="space-y-3">
          {interviews.map((interview) => (
            <Link
              key={interview.id}
              to={`/job-seeker/interviews/${interview.id}`}
              className="block rounded-2xl border bg-white p-5 hover:border-brand-300"
            >
              <div className="flex justify-between gap-3">
                <InterviewStatusBadge status={interview.status} />
                <span className="text-sm text-slate-500">
                  {meetingTypeLabel(interview.meetingType)}
                </span>
              </div>

              <InterviewJobContext jobId={interview.jobId} compact />

              <p className="mt-3 font-bold">
                {formatDateTime(interview.scheduledStartAt)}
              </p>

              <p className="mt-1 text-sm text-slate-600">
                {interview.timezone}
              </p>
            </Link>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed p-8 text-center text-slate-500">
          No interviews match this view.
        </div>
      )}

      <div className="flex justify-between">
        <button
          disabled={(pagination.page || 1) <= 1}
          onClick={() =>
            setFilters((value) => ({
              ...value,
              page: value.page - 1,
            }))
          }
          className="rounded-lg border px-3 py-2 disabled:opacity-50"
        >
          Previous
        </button>

        <span className="text-sm text-slate-500">
          Page {pagination.page || 1} of {pagination.totalPages || 1}
        </span>

        <button
          disabled={
            (pagination.page || 1) >= (pagination.totalPages || 1)
          }
          onClick={() =>
            setFilters((value) => ({
              ...value,
              page: value.page + 1,
            }))
          }
          className="rounded-lg border px-3 py-2 disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </section>
  )
}