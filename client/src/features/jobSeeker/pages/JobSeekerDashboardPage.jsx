import { useCallback } from 'react'
import { Link } from 'react-router-dom'

import ErrorState from '../../../components/feedback/ErrorState'
import PageLoader from '../../../components/feedback/PageLoader'
import { getApiErrorMessage } from '../../../api/errorMapper'

import { useAuth } from '../../auth/hooks/useAuth'
import SectionCard from '../components/SectionCard'
import { useJobSeekerResource } from '../hooks/useJobSeekerResource'
import { jobSeekerApi } from '../services/jobSeekerApi'

function JobSeekerDashboardPage() {
  const { user } = useAuth()

  const loader = useCallback(
    (signal) => jobSeekerApi.dashboard(signal),
    [],
  )

  const {
    data,
    loading,
    error,
    reload,
  } = useJobSeekerResource(loader)

  if (loading) {
    return (
      <PageLoader label="Loading job seeker dashboard" />
    )
  }

  if (error) {
    return (
      <ErrorState
        message={getApiErrorMessage(error)}
        onRetry={reload}
      />
    )
  }

  const jobSeekerName = [
    data?.profile?.firstName,
    data?.profile?.lastName,
  ]
    .filter(Boolean)
    .join(' ')

  const displayName =
    jobSeekerName ||
    user?.email ||
    'Job seeker'

  const stats = [
    [
      'Applications',
      data?.applications?.total ?? 0,
    ],
    [
      'Saved jobs',
      data?.savedJobCount ?? 0,
    ],
    [
      'Interviews',
      data?.interviews?.total ?? 0,
    ],
    [
      'Unread notifications',
      data?.unreadNotificationCount ?? 0,
    ],
  ]

  const profileCompletion =
    Math.min(
      data?.profileCompletionPercentage ?? 0,
      100,
    )

  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm font-semibold text-brand-700">
          Job seeker workspace
        </p>

        <h1 className="text-3xl font-bold text-slate-950">
          Welcome back, {displayName}
        </h1>

        <p className="mt-2 text-slate-600">
          Keep your profile current so recruiters see your strongest work.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(([label, value]) => (
          <section
            key={label}
            className="rounded-2xl border border-slate-200 bg-white p-5"
          >
            <p className="text-sm text-slate-500">
              {label}
            </p>

            <p className="mt-2 text-3xl font-bold text-slate-950">
              {value}
            </p>
          </section>
        ))}
      </div>

      <SectionCard
        title="Profile readiness"
        description="Complete your profile so recruiters can understand your experience and skills."
      >
        <div className="space-y-4">
          <div>
            <div className="mb-2 flex items-center justify-between gap-3">
              <span className="text-sm font-medium text-slate-700">
                Profile completion
              </span>

              <span className="text-sm font-semibold text-slate-950">
                {profileCompletion}%
              </span>
            </div>

            <div className="h-2 overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full bg-brand-600"
                style={{
                  width: `${profileCompletion}%`,
                }}
              />
            </div>
          </div>

          <p className="text-sm text-slate-600">
            Resume:{' '}
            <strong>
              {data?.resumeAvailable
                ? 'Uploaded'
                : 'Not uploaded'}
            </strong>
          </p>

          <Link
            className="inline-flex font-semibold text-brand-700"
            to="/job-seeker/profile"
          >
            Complete profile →
          </Link>
        </div>
      </SectionCard>
    </div>
  )
}

export default JobSeekerDashboardPage