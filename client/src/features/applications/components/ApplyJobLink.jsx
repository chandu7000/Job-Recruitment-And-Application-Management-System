import axios from 'axios'
import { CheckCircle2, Send } from 'lucide-react'
import { useContext, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AuthContext } from '../../auth/context/AuthContextDefinition'
import { applicationsApi } from '../services/applicationApi'

function ApplyJobLink({ job }) {
  const auth = useContext(AuthContext)

  const lookupKey =
    job?.id &&
    auth?.isAuthenticated &&
    auth.role === 'JOB_SEEKER'
      ? String(job.id)
      : ''

  const [applicationState, setApplicationState] = useState({
    key: '',
    application: null,
  })

  useEffect(() => {
    if (!lookupKey) {
      return undefined
    }

    const controller = new AbortController()

    applicationsApi
      .list(
        {
          page: 1,
          limit: 100,
        },
        {
          signal: controller.signal,
        },
      )
      .then((result) => {
        const existingApplication =
          result.applications.find(
            (application) =>
              String(application.jobId) === String(job.id),
          ) ?? null

        setApplicationState({
          key: lookupKey,
          application: existingApplication,
        })
      })
      .catch((error) => {
        if (!axios.isCancel(error)) {
          setApplicationState({
            key: lookupKey,
            application: null,
          })
        }
      })

    return () => controller.abort()
  }, [job?.id, lookupKey])

  if (!job?.id) {
    return null
  }

  if (!auth?.isAuthenticated) {
    return (
      <Link
        to="/login"
        className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
      >
        Sign in to apply
      </Link>
    )
  }

  if (auth.role !== 'JOB_SEEKER') {
    return null
  }

  if (applicationState.key !== lookupKey) {
    return (
      <button
        type="button"
        disabled
        className="inline-flex items-center gap-2 rounded-lg bg-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-500"
      >
        Checking application...
      </button>
    )
  }

  if (applicationState.application) {
    return (
      <Link
        to={`/job-seeker/applications/${applicationState.application.id}`}
        className="inline-flex items-center gap-2 rounded-lg border border-emerald-300 bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100"
      >
        <CheckCircle2
          aria-hidden="true"
          className="size-4"
        />
        Already applied
      </Link>
    )
  }

  return (
    <Link
      to={`/job-seeker/apply/${encodeURIComponent(job.id)}`}
      state={{ job }}
      className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
    >
      <Send
        aria-hidden="true"
        className="size-4"
      />
      Apply now
    </Link>
  )
}

export default ApplyJobLink