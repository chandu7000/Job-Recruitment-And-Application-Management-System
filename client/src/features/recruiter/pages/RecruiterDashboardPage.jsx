import { useCallback } from 'react'
import { Link } from 'react-router-dom'
import ErrorState from '../../../components/feedback/ErrorState'
import PageLoader from '../../../components/feedback/PageLoader'
import { getApiErrorMessage } from '../../../api/errorMapper'
import { useAuth } from '../../auth/hooks/useAuth'
import { useRecruiterResource } from '../hooks/useRecruiterResource'
import { recruiterApi } from '../services/recruiterApi'
import CompanyStatusBadge from '../components/CompanyStatusBadge'

function RecruiterDashboardPage() {
  const { user } = useAuth()
  const loader = useCallback((signal) => recruiterApi.dashboard(signal), [])
  const { data, loading, error, reload } = useRecruiterResource(loader)
  if (loading) return <PageLoader label="Loading recruiter dashboard" />
  if (error) return <ErrorState message={getApiErrorMessage(error)} onRetry={reload} />
  const jobStatuses = data?.jobs?.byStatus ?? {}
  const applicationStatuses = data?.applications?.byStatus ?? {}
  const interviewStatuses = data?.interviews?.byStatus ?? {}
  const stats = [['Total jobs', data?.jobs?.total ?? 0], ['Active jobs', jobStatuses.PUBLISHED ?? jobStatuses.ACTIVE ?? 0], ['Draft jobs', jobStatuses.DRAFT ?? 0], ['Applications', data?.applications?.total ?? 0], ['Shortlisted', applicationStatuses.SHORTLISTED ?? 0], ['Interviews', data?.interviews?.total ?? 0], ['Upcoming interviews', data?.interviews?.upcoming ?? interviewStatuses.SCHEDULED ?? 0], ['Unread notifications', data?.unreadNotificationCount ?? 0]]
  const companies = Array.isArray(data?.companyStatus) ? data.companyStatus : []
  return <div className="space-y-6"><header><p className="text-sm font-semibold text-brand-700">Recruiter workspace</p><h1 className="text-3xl font-bold text-slate-950">Welcome, {user?.email}</h1><p className="mt-2 text-slate-600">Review your real recruitment activity and company readiness.</p></header>
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{stats.map(([label, value]) => <section key={label} className="rounded-2xl border border-slate-200 bg-white p-5"><p className="text-sm text-slate-500">{label}</p><p className="mt-2 text-3xl font-bold text-slate-950">{value}</p></section>)}</div>
    <section className="rounded-2xl border border-slate-200 bg-white p-6"><div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-xl font-semibold">Company status</h2><Link className="font-semibold text-brand-700" to={companies.length ? '/recruiter/company' : '/recruiter/company/new'}>{companies.length ? 'View company →' : 'Create company →'}</Link></div>{companies.length ? <ul className="mt-4 space-y-3">{companies.map((company) => <li key={company.id} className="flex items-center justify-between rounded-xl bg-slate-50 p-4"><span className="text-sm font-medium">{company.companyName || 'Company account'}</span><CompanyStatusBadge status={company.status} /></li>)}</ul> : <p className="mt-4 text-slate-600">Create your company profile to begin verification.</p>}<p className="mt-4 text-sm text-slate-600">Recruiter profile completion: <strong>{data?.profile?.completionPercentage ?? 0}%</strong></p></section>
  </div>
}
export default RecruiterDashboardPage
