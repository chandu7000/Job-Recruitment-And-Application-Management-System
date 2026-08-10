import { CheckCircle2 } from 'lucide-react'
import { Link, Navigate, useLocation, useParams } from 'react-router-dom'

function ApplicationSuccessPage() {
  const { applicationId } = useParams()
  const { state } = useLocation()
  if (!state?.application || state.application.id !== applicationId) return <Navigate to="/job-seeker/dashboard" replace />
  const job = state.job
  return <section className="mx-auto max-w-2xl rounded-3xl border border-emerald-200 bg-white p-8 text-center shadow-sm"><CheckCircle2 className="mx-auto size-14 text-emerald-600" /><p className="mt-5 text-sm font-semibold uppercase tracking-wide text-emerald-700">Application submitted</p><h1 className="mt-2 text-3xl font-bold text-slate-950">Your application is confirmed.</h1><p className="mt-3 text-slate-600">{job?.title ? `Your application for ${job.title}` : 'Your application'} has been recorded successfully.</p><p className="mt-2 text-xs text-slate-500">Application ID: {applicationId}</p><div className="mt-7 flex flex-wrap justify-center gap-3"><Link to="/jobs" className="rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white">Browse more jobs</Link><Link to="/job-seeker/saved-jobs" className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold">Saved jobs</Link><Link to="/job-seeker/dashboard" className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold">Dashboard</Link></div></section>
}

export default ApplicationSuccessPage
