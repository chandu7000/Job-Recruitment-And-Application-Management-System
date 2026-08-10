import { zodResolver } from '@hookform/resolvers/zod'
import axios from 'axios'
import { FileText } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import AppButton from '../../../components/common/AppButton'
import ErrorState from '../../../components/feedback/ErrorState'
import PageLoader from '../../../components/feedback/PageLoader'
import { jobSeekerApi } from '../../jobSeeker/services/jobSeekerApi'
import { publicJobApi } from '../../publicJobs/services/publicJobApi'
import { applicationsApi } from '../services/applicationApi'
import { getApplicationErrorGuidance } from '../utils/applicationErrors'
import { applicationSchema, COVER_LETTER_MAX_LENGTH } from '../validation/applicationSchema'

function ApplyPage() {
  const { jobId } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const [state, setState] = useState({ loading: true, job: location.state?.job ?? null, profile: null, error: '' })
  const { register, handleSubmit, control, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(applicationSchema), defaultValues: { coverLetter: '' } })
  const coverLetter = useWatch({ control, name: 'coverLetter' }) || ''

  useEffect(() => {
    const controller = new AbortController()
    Promise.all([
      state.job?.id === jobId ? Promise.resolve(state.job) : publicJobApi.getById(jobId, { signal: controller.signal }),
      jobSeekerApi.profile(controller.signal),
    ]).then(([job, profileData]) => {
      const profile = profileData?.profile ?? profileData
      setState({ loading: false, job, profile, error: '' })
    }).catch((error) => { if (!axios.isCancel(error)) setState((current) => ({ ...current, loading: false, error: getApplicationErrorGuidance(error) })) })
    return () => controller.abort()
  }, [jobId]) // eslint-disable-line react-hooks/exhaustive-deps

  if (state.loading) return <PageLoader label="Preparing application" />
  if (state.error) return <ErrorState title="Unable to prepare application" message={state.error} />

  const profile = state.profile
  const missingName = !profile?.firstName || !profile?.lastName
  const missingResume = !profile?.resumeUrl
  const blocked = missingName || missingResume

  const submit = async (values) => {
    try {
      const application = await applicationsApi.apply(jobId, { coverLetter: values.coverLetter.trim() || null })
      toast.success('Application submitted successfully.')
      navigate(`/job-seeker/application-success/${application.id}`, { replace: true, state: { application, job: state.job } })
    } catch (error) {
      toast.error(getApplicationErrorGuidance(error))
    }
  }

  return <section className="mx-auto max-w-3xl space-y-6"><header><p className="text-sm font-semibold text-brand-700">Application</p><h1 className="mt-1 text-3xl font-bold">Apply for {state.job?.title}</h1><p className="mt-2 text-slate-600">{state.job?.company?.companyName || 'Company'} · {state.job?.location || 'Location not specified'}</p></header>
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><h2 className="font-bold">Current resume</h2><div className="mt-3 flex items-center gap-3"><FileText className="size-5 text-brand-700" /><div><p className="font-medium">{profile?.resumeOriginalName || 'No resume uploaded'}</p><p className="text-sm text-slate-500">CareerForge will snapshot your current resume with this application.</p></div></div>{blocked && <div className="mt-4 rounded-xl bg-amber-50 p-4 text-sm text-amber-900">{missingName && <p>First name and last name are required.</p>}{missingResume && <p>An uploaded resume is required.</p>}<div className="mt-3 flex gap-4"><Link className="font-semibold underline" to="/job-seeker/profile/edit">Update profile</Link><Link className="font-semibold underline" to="/job-seeker/documents">Manage resume</Link></div></div>}</div>
    <form onSubmit={handleSubmit(submit)} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><label htmlFor="coverLetter" className="font-bold">Cover letter <span className="font-normal text-slate-500">(optional)</span></label><textarea id="coverLetter" rows="10" {...register('coverLetter')} className="mt-3 w-full rounded-xl border border-slate-300 p-3 outline-none focus:border-brand-500" placeholder="Explain why you are interested and how your experience fits this role." /><div className="mt-2 flex justify-between text-xs"><span className="text-red-700">{errors.coverLetter?.message}</span><span className="text-slate-500">{coverLetter.length}/{COVER_LETTER_MAX_LENGTH}</span></div><div className="mt-6 flex flex-wrap gap-3"><AppButton type="submit" loading={isSubmitting} disabled={blocked}>Submit application</AppButton><Link to={state.job?.slug ? `/jobs/${state.job.slug}` : '/jobs'} className="inline-flex items-center rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold">Cancel</Link></div></form>
  </section>
}

export default ApplyPage
