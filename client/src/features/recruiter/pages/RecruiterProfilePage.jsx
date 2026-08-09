import { useCallback } from 'react'
import { Link } from 'react-router-dom'
import EmptyState from '../../../components/feedback/EmptyState'
import ErrorState from '../../../components/feedback/ErrorState'
import PageLoader from '../../../components/feedback/PageLoader'
import { getApiErrorMessage } from '../../../api/errorMapper'
import { useRecruiterResource } from '../hooks/useRecruiterResource'
import { recruiterApi } from '../services/recruiterApi'

function RecruiterProfilePage() {
  const loader = useCallback((signal) => recruiterApi.profile(signal), [])
  const { data, loading, error, reload } = useRecruiterResource(loader)
  if (loading) return <PageLoader label="Loading recruiter profile" />
  if (error) return <ErrorState message={getApiErrorMessage(error)} onRetry={reload} />
  if (!data) return <EmptyState title="Profile unavailable" description="Your recruiter profile could not be loaded." />
  const details = [['Name', [data.firstName, data.lastName].filter(Boolean).join(' ')], ['Designation', data.designation], ['Phone', data.phoneNumber], ['LinkedIn', data.linkedinUrl]]
  return <div className="space-y-6"><header className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-sm font-semibold text-brand-700">Recruiter profile</p><h1 className="text-3xl font-bold">Professional information</h1></div><Link className="rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white" to="/recruiter/profile/edit">Edit profile</Link></header><section className="rounded-2xl border border-slate-200 bg-white p-6"><dl className="grid gap-5 sm:grid-cols-2">{details.map(([label, value]) => <div key={label}><dt className="text-sm font-medium text-slate-500">{label}</dt><dd className="mt-1 break-words font-semibold text-slate-900">{value || 'Not provided'}</dd></div>)}</dl><div className="mt-6 border-t border-slate-200 pt-5"><h2 className="font-semibold">Biography</h2><p className="mt-2 whitespace-pre-wrap text-slate-600">{data.biography || 'Add a short professional biography.'}</p></div></section></div>
}
export default RecruiterProfilePage
