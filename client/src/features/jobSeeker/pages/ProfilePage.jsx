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
  const loader = useCallback(async (signal) => { const [profile, completion] = await Promise.all([jobSeekerApi.profile(signal), jobSeekerApi.completion(signal)]); return { profile, completion } }, [])
  const { data, loading, error, reload } = useJobSeekerResource(loader)
  if (loading) return <PageLoader label="Loading profile" />
  if (error) return <ErrorState message={getApiErrorMessage(error)} onRetry={reload} />
  const { profile = {}, completion = {} } = data ?? {}
  return <div className="space-y-6"><div className="flex flex-wrap items-center gap-4">{profile.profileImageUrl ? <img className="size-24 rounded-full border object-cover" src={profile.profileImageUrl} alt="Profile" /> : <div aria-label="No profile image" className="flex size-24 items-center justify-center rounded-full bg-brand-100 text-3xl font-bold text-brand-700">{profile.firstName?.[0] || 'C'}</div>}<div><h1 className="text-3xl font-bold">{[profile.firstName, profile.lastName].filter(Boolean).join(' ') || 'Your profile'}</h1><p className="text-slate-600">{profile.headline || 'Add a professional headline'}</p></div><Link className="ml-auto rounded-lg bg-brand-600 px-4 py-2 font-semibold text-white" to="/job-seeker/profile/edit">Edit profile</Link></div>
    <SectionCard title={`Completion: ${completion.completionPercentage ?? 0}%`}><p className="text-sm text-slate-600">Completed: {(completion.completedSections ?? []).map(formatLabel).join(', ') || 'None yet'}</p><p className="mt-2 text-sm text-amber-700">Missing: {(completion.missingSections ?? []).map(formatLabel).join(', ') || 'Nothing—great work!'}</p></SectionCard>
    <SectionCard title="About"><p className="whitespace-pre-wrap text-slate-700">{profile.biography || 'No biography added.'}</p></SectionCard>
    <SectionCard title="Contact and location"><dl className="grid gap-3 sm:grid-cols-2">{[['Phone', profile.phoneNumber], ['Location', profile.location], ['City', profile.city], ['State', profile.state], ['Country', profile.country], ['Postal code', profile.postalCode]].map(([label, value]) => <div key={label}><dt className="text-xs font-semibold uppercase text-slate-500">{label}</dt><dd>{value || 'Not provided'}</dd></div>)}</dl></SectionCard>
  </div>
}
export default ProfilePage
