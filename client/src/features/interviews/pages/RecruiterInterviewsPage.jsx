import axios from 'axios'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import ErrorState from '../../../components/feedback/ErrorState'
import PageLoader from '../../../components/feedback/PageLoader'
import { getInterviewErrorMessage } from '../utils/interviewErrors'
import { formatDateTime } from '../../../utils/date'
import InterviewStatusBadge from '../components/InterviewStatusBadge'
import InterviewJobContext from '../components/InterviewJobContext'
import { recruiterInterviewApi } from '../services/interviewApi'
import { INTERVIEW_STATUS_VALUES, meetingTypeLabel } from '../utils/interview'

export default function RecruiterInterviewsPage() {
  const [filters, setFilters] = useState({
    page: 1,
    status: '',
    meetingType: '',
    order: 'ASC',
  })
  const [retry, setRetry] = useState(0)
  const [state, setState] = useState({
    key: '',
    data: null,
    error: '',
  })

  const { page, status, meetingType, order } = filters
  const key = JSON.stringify([page, status, meetingType, order, retry])

  useEffect(() => {
    const controller = new AbortController()

    const params = {
      page,
      order,
      ...(status && { status }),
      ...(meetingType && { meetingType }),
    }

    recruiterInterviewApi
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
  }, [key, page, status, meetingType, order])

  if (state.key !== key) {
    return <PageLoader label="Loading interviews" />
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
        <h1 className="text-3xl font-bold text-slate-950">My interviews</h1>
        <p className="mt-2 text-slate-600">
          Manage scheduled candidate interviews.
        </p>
      </header>

      <div className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:grid-cols-3">
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
          value={meetingType}
          onChange={(event) =>
            setFilters((value) => ({
              ...value,
              meetingType: event.target.value,
              page: 1,
            }))
          }
          className="rounded-lg border p-2"
        >
          <option value="">All meeting types</option>
          <option value="ONLINE">Online</option>
          <option value="IN_PERSON">In person</option>
          <option value="PHONE">Phone</option>
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
              to={`/recruiter/interviews/${interview.id}`}
              className="block rounded-2xl border border-slate-200 bg-white p-5 hover:border-brand-300"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <InterviewStatusBadge status={interview.status} />
                <span className="text-sm text-slate-500">
                  {meetingTypeLabel(interview.meetingType)}
                </span>
              </div>

              <InterviewJobContext jobId={interview.jobId} compact />

              <p className="mt-3 font-bold text-slate-950">
                {formatDateTime(interview.scheduledStartAt)}
              </p>

              <p className="mt-1 text-sm text-slate-600">
                Ends {formatDateTime(interview.scheduledEndAt)} ·{' '}
                {interview.timezone}
              </p>
            </Link>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed p-8 text-center text-slate-500">
          No interviews match these filters.
        </div>
      )}

      <div className="flex items-center justify-between">
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