import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import AppButton from '../../../components/common/AppButton'
import AppInput from '../../../components/forms/AppInput'
import AppSelect from '../../../components/forms/AppSelect'
import AppTextarea from '../../../components/forms/AppTextarea'
import FormField from '../../../components/forms/FormField'
import { applyServerFieldErrors } from '../../auth/services/applyServerErrors'
import {
  DEFAULT_JOB_VALUES,
  EMPLOYMENT_TYPES,
  EXPERIENCE_LEVELS,
  JOB_FIELD_LIMITS,
  PUBLISHED_EDITABLE_FIELDS,
  WORK_MODES,
} from '../constants/recruiterJobConstants'
import { useUnsavedJobChanges } from '../hooks/useUnsavedJobChanges'
import {
  buildRecruiterJobPayload,
  recruiterJobDraftSchema,
} from '../validation/recruiterJobSchemas'
import SkillEditor from './SkillEditor'

const optionLabel = (value) =>
  value
    .toLowerCase()
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')

const asFormValues = (job) => {
  if (!job) return DEFAULT_JOB_VALUES

  return {
    title: job.title ?? '',
    description: job.description ?? '',
    responsibilities: job.responsibilities ?? '',
    requirements: job.requirements ?? '',
    skills: Array.isArray(job.skills) ? job.skills : [],
    location: job.location ?? '',
    workMode: job.workMode ?? '',
    employmentType: job.employmentType ?? '',
    experienceLevel: job.experienceLevel ?? '',
    minimumExperience: job.minimumExperience ?? '',
    maximumExperience: job.maximumExperience ?? '',
    minimumSalary: job.minimumSalary ?? '',
    maximumSalary: job.maximumSalary ?? '',
    salaryCurrency: job.salaryCurrency ?? 'INR',
    vacancies: job.vacancies ?? 1,
    applicationDeadline: job.applicationDeadline
      ? new Date(job.applicationDeadline).toISOString().slice(0, 16)
      : '',
  }
}

function RecruiterJobForm({
  job,
  saving = false,
  serverError,
  onSubmit,
  onCancel,
}) {
  const isPublished = job?.status === 'PUBLISHED'
  const {
    control,
    register,
    handleSubmit,
    setError,
    formState: { errors, isDirty },
    reset,
  } = useForm({
    resolver: zodResolver(recruiterJobDraftSchema),
    defaultValues: asFormValues(job),
  })
  const confirmNavigation = useUnsavedJobChanges(isDirty && !saving)

  useEffect(() => {
    reset(asFormValues(job))
  }, [job, reset])

  useEffect(() => {
    if (serverError) applyServerFieldErrors(serverError, setError)
  }, [serverError, setError])

  const fieldDisabled = (field) =>
    saving ||
    (isPublished && !PUBLISHED_EDITABLE_FIELDS.includes(field))

  const submit = (values) =>
    onSubmit(
      buildRecruiterJobPayload(
        values,
        isPublished ? PUBLISHED_EDITABLE_FIELDS : null,
      ),
    )

  return (
    <form className="space-y-8" onSubmit={handleSubmit(submit)} noValidate>
      {isPublished && (
        <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
          Published jobs have restricted editing. Title, employment type,
          experience settings and salary settings are locked by the backend.
        </div>
      )}

      <section className="grid gap-5 sm:grid-cols-2">
        <FormField
          id="job-title"
          label="Job title"
          error={errors.title?.message}
          className="sm:col-span-2"
        >
          <AppInput
            id="job-title"
            maxLength={JOB_FIELD_LIMITS.titleMax}
            disabled={fieldDisabled('title')}
            error={Boolean(errors.title)}
            {...register('title')}
          />
        </FormField>

        <FormField
          id="job-description"
          label="Description"
          error={errors.description?.message}
          className="sm:col-span-2"
        >
          <AppTextarea
            id="job-description"
            rows={7}
            maxLength={JOB_FIELD_LIMITS.descriptionMax}
            disabled={fieldDisabled('description')}
            error={Boolean(errors.description)}
            {...register('description')}
          />
        </FormField>

        <FormField
          id="job-responsibilities"
          label="Responsibilities"
          error={errors.responsibilities?.message}
          className="sm:col-span-2"
        >
          <AppTextarea
            id="job-responsibilities"
            rows={6}
            maxLength={JOB_FIELD_LIMITS.responsibilitiesMax}
            disabled={fieldDisabled('responsibilities')}
            error={Boolean(errors.responsibilities)}
            {...register('responsibilities')}
          />
        </FormField>

        <FormField
          id="job-requirements"
          label="Requirements"
          error={errors.requirements?.message}
          className="sm:col-span-2"
        >
          <AppTextarea
            id="job-requirements"
            rows={6}
            maxLength={JOB_FIELD_LIMITS.requirementsMax}
            disabled={fieldDisabled('requirements')}
            error={Boolean(errors.requirements)}
            {...register('requirements')}
          />
        </FormField>

        <Controller
          control={control}
          name="skills"
          render={({ field, fieldState }) => (
            <div className="sm:col-span-2">
              <SkillEditor
                value={field.value}
                onChange={field.onChange}
                error={fieldState.error?.message}
                disabled={fieldDisabled('skills')}
              />
            </div>
          )}
        />

        <FormField
          id="job-work-mode"
          label="Work mode"
          error={errors.workMode?.message}
        >
          <AppSelect
            id="job-work-mode"
            disabled={fieldDisabled('workMode')}
            error={Boolean(errors.workMode)}
            {...register('workMode')}
          >
            <option value="">Select work mode</option>
            {WORK_MODES.map((value) => (
              <option key={value} value={value}>
                {optionLabel(value)}
              </option>
            ))}
          </AppSelect>
        </FormField>

        <FormField
          id="job-location"
          label="Location"
          hint="Location can be omitted for Remote jobs."
          error={errors.location?.message}
        >
          <AppInput
            id="job-location"
            maxLength={JOB_FIELD_LIMITS.locationMax}
            disabled={fieldDisabled('location')}
            error={Boolean(errors.location)}
            {...register('location')}
          />
        </FormField>

        <FormField
          id="job-employment-type"
          label="Employment type"
          error={errors.employmentType?.message}
        >
          <AppSelect
            id="job-employment-type"
            disabled={fieldDisabled('employmentType')}
            error={Boolean(errors.employmentType)}
            {...register('employmentType')}
          >
            <option value="">Select employment type</option>
            {EMPLOYMENT_TYPES.map((value) => (
              <option key={value} value={value}>
                {optionLabel(value)}
              </option>
            ))}
          </AppSelect>
        </FormField>

        <FormField
          id="job-experience-level"
          label="Experience level"
          error={errors.experienceLevel?.message}
        >
          <AppSelect
            id="job-experience-level"
            disabled={fieldDisabled('experienceLevel')}
            error={Boolean(errors.experienceLevel)}
            {...register('experienceLevel')}
          >
            <option value="">Select experience level</option>
            {EXPERIENCE_LEVELS.map((value) => (
              <option key={value} value={value}>
                {optionLabel(value)}
              </option>
            ))}
          </AppSelect>
        </FormField>

        <FormField
          id="job-min-experience"
          label="Minimum experience (years)"
          error={errors.minimumExperience?.message}
        >
          <AppInput
            id="job-min-experience"
            type="number"
            min="0"
            max={JOB_FIELD_LIMITS.experienceMax}
            step="0.5"
            disabled={fieldDisabled('minimumExperience')}
            error={Boolean(errors.minimumExperience)}
            {...register('minimumExperience')}
          />
        </FormField>

        <FormField
          id="job-max-experience"
          label="Maximum experience (years)"
          error={errors.maximumExperience?.message}
        >
          <AppInput
            id="job-max-experience"
            type="number"
            min="0"
            max={JOB_FIELD_LIMITS.experienceMax}
            step="0.5"
            disabled={fieldDisabled('maximumExperience')}
            error={Boolean(errors.maximumExperience)}
            {...register('maximumExperience')}
          />
        </FormField>

        <FormField
          id="job-min-salary"
          label="Minimum salary"
          error={errors.minimumSalary?.message}
        >
          <AppInput
            id="job-min-salary"
            type="number"
            min="0"
            step="0.01"
            disabled={fieldDisabled('minimumSalary')}
            error={Boolean(errors.minimumSalary)}
            {...register('minimumSalary')}
          />
        </FormField>

        <FormField
          id="job-max-salary"
          label="Maximum salary"
          error={errors.maximumSalary?.message}
        >
          <AppInput
            id="job-max-salary"
            type="number"
            min="0"
            step="0.01"
            disabled={fieldDisabled('maximumSalary')}
            error={Boolean(errors.maximumSalary)}
            {...register('maximumSalary')}
          />
        </FormField>

        <FormField
          id="job-currency"
          label="Salary currency"
          error={errors.salaryCurrency?.message}
        >
          <AppInput
            id="job-currency"
            maxLength={3}
            disabled={fieldDisabled('salaryCurrency')}
            error={Boolean(errors.salaryCurrency)}
            {...register('salaryCurrency')}
          />
        </FormField>

        <FormField
          id="job-vacancies"
          label="Openings"
          error={errors.vacancies?.message}
        >
          <AppInput
            id="job-vacancies"
            type="number"
            min="1"
            max={JOB_FIELD_LIMITS.vacanciesMax}
            disabled={fieldDisabled('vacancies')}
            error={Boolean(errors.vacancies)}
            {...register('vacancies')}
          />
        </FormField>

        <FormField
          id="job-deadline"
          label="Application deadline"
          error={errors.applicationDeadline?.message}
        >
          <AppInput
            id="job-deadline"
            type="datetime-local"
            disabled={fieldDisabled('applicationDeadline')}
            error={Boolean(errors.applicationDeadline)}
            {...register('applicationDeadline')}
          />
        </FormField>
      </section>

      <div className="flex flex-wrap justify-end gap-3 border-t border-slate-200 pt-6">
        <AppButton
          variant="secondary"
          disabled={saving}
          onClick={() => {
            if (confirmNavigation()) onCancel?.()
          }}
        >
          Cancel
        </AppButton>
        <AppButton type="submit" loading={saving}>
          {job ? 'Save changes' : 'Save draft'}
        </AppButton>
      </div>
    </form>
  )
}

export default RecruiterJobForm
