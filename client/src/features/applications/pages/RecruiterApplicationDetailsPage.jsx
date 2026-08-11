import { zodResolver } from '@hookform/resolvers/zod'
import axios from 'axios'
import { ArrowLeft, FileText } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { getApiErrorMessage } from '../../../api/errorMapper'
import AppButton from '../../../components/common/AppButton'
import ConfirmationModal from '../../../components/modals/ConfirmationModal'
import ErrorState from '../../../components/feedback/ErrorState'
import PageLoader from '../../../components/feedback/PageLoader'
import { formatDateTime } from '../../../utils/date'
import ApplicationStatusBadge from '../components/ApplicationStatusBadge'
import ApplicationTimeline from '../components/ApplicationTimeline'
import { recruiterApplicationApi } from '../services/recruiterApplicationApi'
import { getRecruiterProcessingActions } from '../utils/recruiterApplicationProcessing'
import { recruiterNoteSchema, recruiterTransitionSchema } from '../validation/recruiterApplicationSchemas'

function Detail({ label, children }) {
  return <div><dt className="text-sm text-slate-500">{label}</dt><dd className="mt-1 break-words font-medium text-slate-900">{children || '—'}</dd></div>
}

function ListSection({ title, items, renderItem }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5">
      <h2 className="text-lg font-bold text-slate-950">{title}</h2>
      {Array.isArray(items) && items.length ? (
        <div className="mt-4 space-y-3">
          {items.map((item, index) => <div key={item.id || index} className="rounded-xl bg-slate-50 p-3 text-sm text-slate-700">{renderItem(item)}</div>)}
        </div>
      ) : <p className="mt-3 text-sm text-slate-500">No {title.toLowerCase()} provided.</p>}
    </section>
  )
}

function RecruiterApplicationDetailsPage() {
  const { applicationId } = useParams()
  const [retryKey, setRetryKey] = useState(0)
  const [state, setState] = useState({ key: '', application: null, error: '' })
  const [savingNote, setSavingNote] = useState(false)
const [transition, setTransition] = useState(null)
const [transitioning, setTransitioning] = useState(false)
const transitionSectionRef = useRef(null)
  const key = `${applicationId}:${retryKey}`

  const noteForm = useForm({ resolver: zodResolver(recruiterNoteSchema), defaultValues: { notes: '' } })
  const transitionForm = useForm({ resolver: zodResolver(recruiterTransitionSchema), defaultValues: { reason: '' } })

  useEffect(() => {
    const controller = new AbortController()
    recruiterApplicationApi.details(applicationId, { signal: controller.signal })
      .then((application) => {
        setState({ key, application, error: '' })
        noteForm.reset({ notes: application?.recruiterNotes || '' })
      })
      .catch((error) => {
        if (!axios.isCancel(error)) setState({ key, application: null, error: getApiErrorMessage(error) })
      })
    return () => controller.abort()
  }, [applicationId, key, noteForm])

  useEffect(() => {
    if (transition && transitionSectionRef.current) {
      transitionSectionRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      })
    }
  }, [transition])

  const saveNote = noteForm.handleSubmit(async ({ notes }) => {
    setSavingNote(true)
    try {
      await recruiterApplicationApi.saveNotes(applicationId, notes.trim() || null)
      toast.success(notes.trim() ? 'Recruiter note saved.' : 'Recruiter note cleared.')
      setRetryKey((value) => value + 1)
    } catch (error) {
      toast.error(getApiErrorMessage(error))
    } finally {
      setSavingNote(false)
    }
  })

  const submitTransition = transitionForm.handleSubmit(({ reason }) => {
    if (!transition) return
    setTransition({ ...transition, reason: reason.trim() })
  })

  const confirmTransition = async () => {
    if (!transition) return
    setTransitioning(true)
    try {
      await recruiterApplicationApi.updateStatus(applicationId, transition.value, transition.reason)
      toast.success('Application status updated successfully.')
      setTransition(null)
      transitionForm.reset({ reason: '' })
      setRetryKey((value) => value + 1)
    } catch (error) {
      toast.error(getApiErrorMessage(error))
    } finally {
      setTransitioning(false)
    }
  }

  if (state.key !== key) return <PageLoader label="Loading applicant details" />
  if (state.error) return <ErrorState title="Unable to load applicant" message={state.error} onRetry={() => setRetryKey((value) => value + 1)} />
  if (!state.application) return null

  const application = state.application
  const candidate = application.candidateProfile
  const actions = getRecruiterProcessingActions(application.status)
  const candidateName = [application.candidateSnapshot?.firstName, application.candidateSnapshot?.lastName].filter(Boolean).join(' ') || 'Candidate'

  return (
    <section className="space-y-6">
      <Link to={`/recruiter/jobs/${application.jobId}/applicants`} className="inline-flex items-center gap-2 text-sm font-semibold text-brand-700">
        <ArrowLeft className="size-4" /> Back to applicants
      </Link>

      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <ApplicationStatusBadge status={application.status} />
          <h1 className="mt-3 text-3xl font-bold text-slate-950">{candidateName}</h1>
          <p className="mt-1 text-lg font-medium text-brand-700">{application.jobSnapshot?.title || 'Job unavailable'}</p>
          <p className="mt-2 text-sm text-slate-600">Applied {formatDateTime(application.createdAt)}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {actions.map((action) => (
            <AppButton
              key={action.value}
              variant={action.sensitive ? 'danger' : 'primary'}
              onClick={() => {
                transitionForm.reset({ reason: '' })
                setTransition(action)
              }}
            >
              {action.label}
            </AppButton>
          ))}
        </div>
      </header>

      {actions.length === 0 && (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
          No Phase 10 recruiter processing actions are available for this application status.
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <h2 className="text-lg font-bold text-slate-950">Candidate summary</h2>
            <dl className="mt-4 grid gap-4 sm:grid-cols-2">
              <Detail label="Name">{candidateName}</Detail>
              <Detail label="Email">{application.candidateSnapshot?.email}</Detail>
              <Detail label="Phone">{application.candidateSnapshot?.phoneNumber}</Detail>
              <Detail label="Location">{application.candidateSnapshot?.location || candidate?.location}</Detail>
              <Detail label="Headline">{application.candidateSnapshot?.headline || candidate?.headline}</Detail>
              <Detail label="Current status"><ApplicationStatusBadge status={application.status} /></Detail>
            </dl>
            {candidate?.biography && <p className="mt-5 whitespace-pre-wrap text-sm leading-6 text-slate-700">{candidate.biography}</p>}
          </section>

          <ListSection
            title="Skills"
            items={candidate?.skills}
            renderItem={(item) => item.skillName || item.name || 'Skill'}
          />
          <ListSection
            title="Experience"
            items={candidate?.experiences}
            renderItem={(item) => `${item.role || 'Role'}${item.company ? ` — ${item.company}` : ''}`}
          />
          <ListSection
            title="Education"
            items={candidate?.educations}
            renderItem={(item) => `${item.degree || 'Education'}${item.institution ? ` — ${item.institution}` : ''}`}
          />
          <ListSection
            title="Projects"
            items={candidate?.projects}
            renderItem={(item) => item.projectName || item.title || 'Project'}
          />
        </div>

        <div className="space-y-6">
          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <h2 className="text-lg font-bold text-slate-950">Resume snapshot</h2>
            {application.resumeSnapshot?.url ? (
              <div className="mt-4 flex items-start gap-3">
                <FileText className="mt-0.5 size-5 text-brand-600" />
                <div>
                  <p className="font-semibold text-slate-900">{application.resumeSnapshot.originalName || 'Submitted resume'}</p>
                  <p className="mt-1 text-sm text-slate-500">Captured {formatDateTime(application.resumeSnapshot.capturedAt)}</p>
                  <a href={application.resumeSnapshot.url} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-sm font-semibold text-brand-700 hover:underline">
                    Open resume
                  </a>
                </div>
              </div>
            ) : <p className="mt-3 text-sm text-slate-500">Resume snapshot unavailable.</p>}
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <h2 className="text-lg font-bold text-slate-950">Cover letter</h2>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-700">{application.coverLetter || 'No cover letter was submitted.'}</p>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <h2 className="text-lg font-bold text-slate-950">Private recruiter note</h2>
            <p className="mt-1 text-sm text-slate-500">Visible only in recruiter workflows. Maximum 5000 characters.</p>
            <form onSubmit={saveNote} className="mt-4">
              <textarea
                rows="6"
                maxLength={5000}
                {...noteForm.register('notes')}
                className="w-full rounded-lg border border-slate-300 p-3 text-sm"
                placeholder="Add a private note about this candidate."
              />
              {noteForm.formState.errors.notes && <p className="mt-1 text-sm text-red-600">{noteForm.formState.errors.notes.message}</p>}
              <div className="mt-3 flex gap-3">
                <AppButton type="submit" loading={savingNote}>Save note</AppButton>
                <AppButton
                  variant="secondary"
                  disabled={savingNote}
                  onClick={() => noteForm.setValue('notes', '')}
                >
                  Clear text
                </AppButton>
              </div>
            </form>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <h2 className="text-lg font-bold text-slate-950">Status history</h2>
            <div className="mt-5"><ApplicationTimeline history={application.statusHistory} /></div>
          </section>
        </div>
      </div>

      {transition && (
        <section
          ref={transitionSectionRef}
          className="rounded-2xl border border-slate-200 bg-white p-5"
        >
          <h2 className="text-lg font-bold text-slate-950">{transition.label}</h2>
          <p className="mt-1 text-sm text-slate-500">A reason is optional. Maximum 1000 characters.</p>
          <form onSubmit={submitTransition} className="mt-4 space-y-3">
            <textarea rows="4" maxLength={1000} {...transitionForm.register('reason')} className="w-full rounded-lg border border-slate-300 p-3 text-sm" placeholder="Reason (optional)" />
            {transitionForm.formState.errors.reason && <p className="text-sm text-red-600">{transitionForm.formState.errors.reason.message}</p>}
            <div className="flex gap-3">
              <AppButton type="submit">Continue</AppButton>
              <AppButton variant="secondary" onClick={() => setTransition(null)}>Cancel</AppButton>
            </div>
          </form>
        </section>
      )}

      <ConfirmationModal
        isOpen={Boolean(transition?.reason !== undefined)}
        title={`${transition?.label || 'Update application'}?`}
        message="The backend will validate this status transition before any final status is displayed."
        confirmLabel={transition?.label || 'Confirm'}
        confirmVariant={transition?.sensitive ? 'danger' : 'primary'}
        loading={transitioning}
        onConfirm={confirmTransition}
        onCancel={() => { if (!transitioning) setTransition(null) }}
      />
    </section>
  )
}

export default RecruiterApplicationDetailsPage
