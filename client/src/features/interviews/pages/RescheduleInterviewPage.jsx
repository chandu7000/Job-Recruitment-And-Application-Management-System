import { zodResolver } from '@hookform/resolvers/zod'
import axios from 'axios'
import { useEffect, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import AppButton from '../../../components/common/AppButton'
import PageLoader from '../../../components/feedback/PageLoader'
import ErrorState from '../../../components/feedback/ErrorState'
import { getInterviewErrorMessage } from '../utils/interviewErrors'
import ScheduleFields from '../components/ScheduleFields'
import { recruiterInterviewApi } from '../services/interviewApi'
import { localScheduleDefaults, toIsoSchedule } from '../utils/interview'
import { rescheduleInterviewSchema } from '../validation/interviewSchemas'

export default function RescheduleInterviewPage() {
  const { interviewId } = useParams()
  const navigate = useNavigate()

  const [load, setLoad] = useState({
    loading: true,
    error: '',
  })

  const form = useForm({
    resolver: zodResolver(rescheduleInterviewSchema),
    defaultValues: {
      ...localScheduleDefaults(),
      reason: '',
    },
  })

  const meetingType = useWatch({
    control: form.control,
    name: 'meetingType',
  })

  useEffect(() => {
    const controller = new AbortController()

    recruiterInterviewApi
      .details(interviewId, { signal: controller.signal })
      .then((interview) => {
        form.reset({
          ...localScheduleDefaults(interview),
          reason: '',
        })

        setLoad({
          loading: false,
          error: '',
        })
      })
      .catch((error) => {
        if (!axios.isCancel(error)) {
          setLoad({
            loading: false,
            error: getInterviewErrorMessage(error),
          })
        }
      })

    return () => controller.abort()
  }, [interviewId, form])

  if (load.loading) {
    return <PageLoader label="Loading interview" />
  }

  if (load.error) {
    return (
      <ErrorState
        title="Unable to load interview"
        message={load.error}
      />
    )
  }

  const submit = form.handleSubmit(async (values) => {
    try {
      await recruiterInterviewApi.reschedule(interviewId, {
        ...toIsoSchedule(values),
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
        reason: values.reason.trim(),
      })

      toast.success('Interview rescheduled.')
      navigate(`/recruiter/interviews/${interviewId}`)
    } catch (error) {
      toast.error(getInterviewErrorMessage(error))
    }
  })

  return (
    <section className="space-y-6">
      <Link
        to={`/recruiter/interviews/${interviewId}`}
        className="text-sm font-semibold text-brand-700"
      >
        ← Back to interview
      </Link>

      <h1 className="text-3xl font-bold">Reschedule interview</h1>

      <form
        onSubmit={submit}
        className="space-y-5 rounded-2xl border bg-white p-5"
      >
        <ScheduleFields
          register={form.register}
          errors={form.formState.errors}
          meetingType={meetingType}
        />

        <label className="block text-sm font-semibold">
          Reason
          <textarea
            {...form.register('reason')}
            rows="4"
            maxLength="1000"
            className="mt-1 w-full rounded-lg border p-3"
          />
        </label>

        {form.formState.errors.reason && (
          <p className="text-sm text-red-600">
            {form.formState.errors.reason.message}
          </p>
        )}

        <AppButton
          type="submit"
          loading={form.formState.isSubmitting}
        >
          Save new schedule
        </AppButton>
      </form>
    </section>
  )
}