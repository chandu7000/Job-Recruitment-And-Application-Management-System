import { ArrowRight, BriefcaseBusiness, Search, Users } from 'lucide-react'
import { useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import EmptyState from '../components/feedback/EmptyState'
import ErrorState from '../components/feedback/ErrorState'
import JobCard from '../features/publicJobs/components/JobCard'
import { JobCardSkeletonList } from '../features/publicJobs/components/JobCardSkeleton'
import { useAuth } from '../features/auth/hooks/useAuth'
import { getRoleHomePath } from '../features/auth/utils'
import { usePublicJobs } from '../features/publicJobs/hooks/usePublicJobs'

function HomePage() {
  const navigate = useNavigate()
  const { isAuthenticated, role } = useAuth()
  const latestQuery = useMemo(() => ({ sort: 'latest', limit: 6 }), [])
  const { jobs, loading, error, retry } = usePublicJobs(latestQuery)

  const search = (event) => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const params = new URLSearchParams()
    const keyword = String(form.get('search') || '').trim()
    const location = String(form.get('location') || '').trim()
    if (keyword) params.set('search', keyword)
    if (location) params.set('location', location)
    navigate(`/jobs${params.size ? `?${params}` : ''}`)
  }

  return (
    <>
      <section className="overflow-hidden bg-gradient-to-br from-brand-950 via-brand-800 to-brand-600 text-white"><div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8"><div className="max-w-4xl"><p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-200">CareerForge</p><h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-6xl">Build a career that moves you forward.</h1><p className="mt-6 max-w-2xl text-lg leading-8 text-brand-100">Discover verified opportunities from growing companies, or find the right people to build your team.</p><form onSubmit={search} className="mt-9 grid gap-3 rounded-2xl bg-white p-3 shadow-xl md:grid-cols-[1fr_1fr_auto]"><label className="sr-only" htmlFor="home-keyword">Job title or keyword</label><div className="flex items-center gap-2 rounded-lg border border-slate-200 px-3"><Search className="size-5 text-slate-400" /><input id="home-keyword" name="search" maxLength="200" placeholder="Job title or keyword" className="w-full py-3 text-slate-950 outline-none" /></div><label className="sr-only" htmlFor="home-location">Location</label><input id="home-location" name="location" maxLength="255" placeholder="City or location" className="rounded-lg border border-slate-200 px-4 py-3 text-slate-950" /><button className="rounded-lg bg-brand-600 px-6 py-3 font-semibold hover:bg-brand-700">Search jobs</button></form></div></div></section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8"><div className="flex items-end justify-between"><div><p className="text-sm font-semibold uppercase tracking-wider text-brand-700">Fresh opportunities</p><h2 className="mt-2 text-3xl font-bold">Latest jobs</h2></div><Link to="/jobs" className="hidden items-center gap-1 font-semibold text-brand-700 sm:flex">View all jobs<ArrowRight className="size-4" /></Link></div><div className="mt-8" aria-busy={loading}>{loading ? <JobCardSkeletonList count={6} /> : error ? <ErrorState message={error} onRetry={retry} /> : !jobs.length ? <EmptyState title="No jobs published yet" description="Please check again later for new opportunities." /> : <div className="grid gap-5 lg:grid-cols-2">{jobs.map((job) => <JobCard key={job.id} job={job} />)}</div>}</div></section>

      <section className="bg-slate-100"><div className="mx-auto grid max-w-7xl gap-6 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:px-8"><article className="rounded-3xl bg-white p-8"><Users className="size-9 text-brand-600" /><h2 className="mt-5 text-2xl font-bold">For job seekers</h2><p className="mt-3 leading-7 text-slate-600">Explore public opportunities and create your account when you are ready to manage your career.</p><Link to={isAuthenticated ? getRoleHomePath(role) : '/register/job-seeker'} className="mt-6 inline-flex items-center gap-1 font-semibold text-brand-700">{isAuthenticated ? 'Go to dashboard' : 'Create job-seeker account'}<ArrowRight className="size-4" /></Link></article><article className="rounded-3xl bg-brand-950 p-8 text-white"><BriefcaseBusiness className="size-9 text-brand-300" /><h2 className="mt-5 text-2xl font-bold">For recruiters</h2><p className="mt-3 leading-7 text-brand-100">Join CareerForge to manage your company and connect with qualified candidates.</p><Link to={isAuthenticated ? getRoleHomePath(role) : '/register/recruiter'} className="mt-6 inline-flex items-center gap-1 font-semibold text-brand-200">{isAuthenticated ? 'Go to dashboard' : 'Create recruiter account'}<ArrowRight className="size-4" /></Link></article></div></section>
    </>
  )
}

export default HomePage
