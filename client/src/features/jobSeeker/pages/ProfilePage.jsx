import { Pencil } from 'lucide-react'
import { useCallback } from 'react'
import { Link } from 'react-router-dom'
import ErrorState from '../../../components/feedback/ErrorState'
import PageLoader from '../../../components/feedback/PageLoader'
import { getApiErrorMessage } from '../../../api/errorMapper'
import SectionCard from '../components/SectionCard'
import { useJobSeekerResource } from '../hooks/useJobSeekerResource'
import { jobSeekerApi } from '../services/jobSeekerApi'
import { formatLabel } from '../constants/jobSeekerConstants'

function ProfilePage() {
  const loader = useCallback(async (signal) => {
    const [profile, completion] = await Promise.all([
      jobSeekerApi.profile(signal),
      jobSeekerApi.completion(signal),
    ])

    return {
      profile,
      completion,
    }
  }, [])

  const {
    data,
    loading,
    error,
    reload,
  } = useJobSeekerResource(loader)

  if (loading) {
    return <PageLoader label="Loading profile" />
  }

  if (error) {
    return (
      <ErrorState
        message={getApiErrorMessage(error)}
        onRetry={reload}
      />
    )
  }

  const {
    profile = {},
    completion = {},
  } = data ?? {}

  const fullName =
    [profile.firstName, profile.lastName]
      .filter(Boolean)
      .join(' ') || 'Your profile'

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-5 sm:flex-row sm:items-center">
        {profile.profileImageUrl ? (
          <img
            className="size-24 shrink-0 rounded-full border border-slate-200 object-cover"
            src={profile.profileImageUrl}
            alt={`${fullName} profile`}
            loading="lazy"
          />
        ) : (
          <div
            aria-label="No profile image"
            className="flex size-24 shrink-0 items-center justify-center rounded-full bg-brand-100 text-3xl font-bold text-brand-700"
          >
            {profile.firstName?.[0] || 'C'}
          </div>
        )}

        <div className="min-w-0 flex-1">
          <h1 className="break-words text-3xl font-bold tracking-tight text-slate-950">
            {fullName}
          </h1>

          <p className="mt-1 break-words text-slate-600">
            {profile.headline || 'Add a professional headline'}
          </p>
        </div>

        <div className="flex flex-wrap gap-2 sm:ml-auto">
          <Link
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 py-2 font-semibold text-white transition hover:bg-brand-700"
            to="/job-seeker/profile/edit"
          >
            <Pencil
              className="size-4"
              aria-hidden="true"
            />

            Edit profile
          </Link>
        </div>
      </section>

      <SectionCard
        title={`Completion: ${completion.completionPercentage ?? 0}%`}
      >
        <p className="text-sm leading-6 text-slate-600">
          Completed:{' '}
          {(completion.completedSections ?? [])
            .map(formatLabel)
            .join(', ') || 'None yet'}
        </p>

        <p className="mt-2 text-sm leading-6 text-amber-700">
          Missing:{' '}
          {(completion.missingSections ?? [])
            .map(formatLabel)
            .join(', ') || 'Nothing—great work!'}
        </p>
      </SectionCard>

      <SectionCard title="About">
        <p className="whitespace-pre-wrap break-words text-slate-700">
          {profile.biography || 'No biography added.'}
        </p>
      </SectionCard>

      <SectionCard title="Contact and location">
        <dl className="grid gap-4 sm:grid-cols-2">
          {[
            ['Phone', profile.phoneNumber],
            ['Location', profile.location],
            ['City', profile.city],
            ['State', profile.state],
            ['Country', profile.country],
            ['Postal code', profile.postalCode],
          ].map(([label, value]) => (
            <div
              key={label}
              className="min-w-0"
            >
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                {label}
              </dt>

              <dd className="mt-1 break-words text-slate-900">
                {value || 'Not provided'}
              </dd>
            </div>
          ))}
        </dl>
      </SectionCard>
    </div>
  )
}

export default ProfilePage