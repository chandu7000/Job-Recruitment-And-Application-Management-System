import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import AppButton from '../../../components/common/AppButton'
import { getInterviewErrorMessage } from '../utils/interviewErrors'
import ScheduleFields from '../components/ScheduleFields'
import { recruiterInterviewApi } from '../services/interviewApi'
import { scheduleInterviewSchema } from '../validation/interviewSchemas'
import { localScheduleDefaults, toIsoSchedule } from '../utils/interview'
import { recruiterApplicationApi } from '../../applications/services/recruiterApplicationApi'

export default function ScheduleInterviewPage() {
  const { applicationId } = useParams()
  const navigate = useNavigate()

  const [application, setApplication] = useState(null)

  const form = useForm({
    resolver: zodResolver(scheduleInterviewSchema),
    defaultValues: localScheduleDefaults(),
  })

  const meetingType = useWatch({
    control: form.control,
    name: 'meetingType',
  })

  useEffect(() => {
    const controller = new AbortController()

    recruiterApplicationApi
      .details(applicationId, {
        signal: controller.signal,
      })
      .then(setApplication)
      .catch(() => setApplication(null))

    return () => controller.abort()
  }, [applicationId])

  const submit = form.handleSubmit(async (values) => {
    try {
      const schedule = toIsoSchedule(values)

      const interview = await recruiterInterviewApi.schedule(
        applicationId,
        {
          ...schedule,
          timezone: values.timezone.trim(),
          meetingType: values.meetingType,
          meetingLink:
            values.meetingType === 'ONLINE'
              ? values.meetingLink.trim()
              : null,
          physicalLocation:
            values.meetingType === 'IN_PERSON'
              ? values.physicalLocation.trim()
              : null,
          phoneInstructions:
            values.meetingType === 'PHONE'
              ? values.phoneInstructions.trim()
              : null,
          interviewInstructions:
            values.interviewInstructions.trim() || null,
        },
      )

      toast.success('Interview scheduled successfully.')
      navigate(`/recruiter/interviews/${interview.id}`)
    } catch (error) {
      toast.error(getInterviewErrorMessage(error))
    }
  })

  return (
    <section className="space-y-6">
      <Link
        to={`/recruiter/applications/${applicationId}`}
        className="text-sm font-semibold text-brand-700"
      >
        ← Back to application
      </Link>

      <header>
        <h1 className="text-3xl font-bold text-slate-950">
          Schedule interview
        </h1>

        <p className="mt-2 text-slate-600">
          Schedule the shortlisted candidate using the backend-validated
          interview contract.
        </p>
      </header>

      {application && (
        <section className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="font-bold text-slate-900">
            {[
              application.candidateSnapshot?.firstName,
              application.candidateSnapshot?.lastName,
            ]
              .filter(Boolean)
              .join(' ') || 'Candidate'}
          </p>

          <p className="text-sm text-slate-600">
            {application.jobSnapshot?.title || 'Job'} · Application status:{' '}
            {application.status}
          </p>
        </section>
      )}

      <form
        onSubmit={submit}
        className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5"
      >
        <ScheduleFields
          register={form.register}
          errors={form.formState.errors}
          meetingType={meetingType}
        />

        <AppButton
          type="submit"
          loading={form.formState.isSubmitting}
        >
          Schedule interview
        </AppButton>
      </form>
    </section>
  )
}