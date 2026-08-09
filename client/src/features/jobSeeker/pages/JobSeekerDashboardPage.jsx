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
  const loader = useCallback((signal) => jobSeekerApi.dashboard(signal), [])
  const { data, loading, error, reload } = useJobSeekerResource(loader)
  if (loading) return <PageLoader label="Loading your dashboard" />
  if (error) return <ErrorState message={getApiErrorMessage(error)} onRetry={reload} />
  const stats = [
    ['Applications', data?.applications?.total ?? 0], ['Saved jobs', data?.savedJobCount ?? 0], ['Interviews', data?.interviews?.total ?? 0], ['Unread notifications', data?.unreadNotificationCount ?? 0],
  ]
  return <div className="space-y-6"><header><p className="text-sm font-semibold text-brand-700">Welcome back</p><h1 className="text-3xl font-bold text-slate-950">{user?.email}</h1><p className="mt-2 text-slate-600">Keep your profile current so recruiters see your strongest work.</p></header>
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{stats.map(([label, value]) => <div key={label} className="rounded-2xl border border-slate-200 bg-white p-5"><p className="text-sm text-slate-500">{label}</p><p className="mt-2 text-3xl font-bold">{value}</p></div>)}</div>
    <SectionCard title="Profile completion"><div className="flex items-center gap-4"><div className="h-3 flex-1 overflow-hidden rounded-full bg-slate-200"><div className="h-full bg-brand-600" style={{ width: `${Math.min(data?.profileCompletionPercentage ?? 0, 100)}%` }} /></div><strong>{data?.profileCompletionPercentage ?? 0}%</strong></div><p className="mt-3 text-sm text-slate-600">Resume: {data?.resumeAvailable ? 'Uploaded' : 'Not uploaded'}</p><Link className="mt-4 inline-block font-semibold text-brand-700" to="/job-seeker/profile">Complete profile →</Link></SectionCard>
  </div>
}
export default JobSeekerDashboardPage
