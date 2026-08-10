import { z } from 'zod'
import {
  EMPLOYMENT_TYPES,
  EXPERIENCE_LEVELS,
  JOB_FIELD_LIMITS,
  WORK_MODES,
} from '../constants/recruiterJobConstants'

const optionalText = (maximum, label) =>
  z
    .string()
    .trim()
    .max(maximum, `${label} must not exceed ${maximum} characters.`)
    .optional()
    .or(z.literal(''))

const optionalNumber = (maximum, label) =>
  z
    .union([z.literal(''), z.number(), z.string()])
    .refine((value) => value === '' || Number.isFinite(Number(value)), {
      message: `${label} must be a number.`,
    })
    .refine(
      (value) =>
        value === '' ||
        (Number(value) >= 0 &&
          (maximum === undefined || Number(value) <= maximum)),
      {
        message:
          maximum === undefined
            ? `${label} cannot be negative.`
            : `${label} must be between 0 and ${maximum}.`,
      },
    )

const jobSchemaBase = z
  .object({
    title: z
      .string()
      .trim()
      .max(
        JOB_FIELD_LIMITS.titleMax,
        `Job title must not exceed ${JOB_FIELD_LIMITS.titleMax} characters.`,
      )
      .refine(
        (value) => !value || value.length >= JOB_FIELD_LIMITS.titleMin,
        `Job title must be at least ${JOB_FIELD_LIMITS.titleMin} characters.`,
      )
      .optional()
      .or(z.literal('')),
    description: optionalText(JOB_FIELD_LIMITS.descriptionMax, 'Description'),
    responsibilities: optionalText(
      JOB_FIELD_LIMITS.responsibilitiesMax,
      'Responsibilities',
    ),
    requirements: optionalText(
      JOB_FIELD_LIMITS.requirementsMax,
      'Requirements',
    ),
    skills: z
      .array(
        z
          .string()
          .trim()
          .min(1, 'Skills cannot be empty.')
          .max(
            JOB_FIELD_LIMITS.skillMax,
            `Each skill must not exceed ${JOB_FIELD_LIMITS.skillMax} characters.`,
          ),
      )
      .max(
        JOB_FIELD_LIMITS.skillsMax,
        `Add no more than ${JOB_FIELD_LIMITS.skillsMax} skills.`,
      )
      .refine(
        (skills) =>
          new Set(skills.map((skill) => skill.toLowerCase())).size ===
          skills.length,
        'Duplicate skills are not allowed.',
      ),
    location: optionalText(JOB_FIELD_LIMITS.locationMax, 'Location'),
    workMode: z.union([z.literal(''), z.enum(WORK_MODES)]).optional(),
    employmentType: z
      .union([z.literal(''), z.enum(EMPLOYMENT_TYPES)])
      .optional(),
    experienceLevel: z
      .union([z.literal(''), z.enum(EXPERIENCE_LEVELS)])
      .optional(),
    minimumExperience: optionalNumber(
      JOB_FIELD_LIMITS.experienceMax,
      'Minimum experience',
    ),
    maximumExperience: optionalNumber(
      JOB_FIELD_LIMITS.experienceMax,
      'Maximum experience',
    ),
    minimumSalary: optionalNumber(undefined, 'Minimum salary'),
    maximumSalary: optionalNumber(undefined, 'Maximum salary'),
    salaryCurrency: z
      .string()
      .trim()
      .toUpperCase()
      .regex(/^[A-Z]{3}$/, 'Use a three-letter currency code.'),
    vacancies: z
      .union([z.number(), z.string()])
      .refine((value) => Number.isInteger(Number(value)), {
        message: 'Vacancies must be a whole number.',
      })
      .refine(
        (value) =>
          Number(value) >= 1 &&
          Number(value) <= JOB_FIELD_LIMITS.vacanciesMax,
        {
          message: `Vacancies must be between 1 and ${JOB_FIELD_LIMITS.vacanciesMax}.`,
        },
      ),
    applicationDeadline: z.string().optional().or(z.literal('')),
  })
  .superRefine((values, context) => {
    const minimumExperience = Number(values.minimumExperience)
    const maximumExperience = Number(values.maximumExperience)
    if (
      values.minimumExperience !== '' &&
      values.maximumExperience !== '' &&
      minimumExperience > maximumExperience
    ) {
      context.addIssue({
        code: 'custom',
        path: ['minimumExperience'],
        message: 'Minimum experience cannot exceed maximum experience.',
      })
    }

    const minimumSalary = Number(values.minimumSalary)
    const maximumSalary = Number(values.maximumSalary)
    if (
      values.minimumSalary !== '' &&
      values.maximumSalary !== '' &&
      minimumSalary > maximumSalary
    ) {
      context.addIssue({
        code: 'custom',
        path: ['minimumSalary'],
        message: 'Minimum salary cannot exceed maximum salary.',
      })
    }

    if (values.applicationDeadline) {
      const deadline = new Date(values.applicationDeadline)
      if (
        Number.isNaN(deadline.getTime()) ||
        deadline.getTime() <= Date.now()
      ) {
        context.addIssue({
          code: 'custom',
          path: ['applicationDeadline'],
          message: 'Application deadline must be in the future.',
        })
      }
    }
  })

export const recruiterJobDraftSchema = jobSchemaBase

export function buildRecruiterJobPayload(values, allowedFields = null) {
  const payload = {}

  Object.entries(values).forEach(([key, value]) => {
    if (allowedFields && !allowedFields.includes(key)) return
    if (key === 'skills') {
      payload.skills = Array.isArray(value)
        ? value.map((skill) => skill.trim()).filter(Boolean)
        : []
      return
    }

    if (
      [
        'minimumExperience',
        'maximumExperience',
        'minimumSalary',
        'maximumSalary',
      ].includes(key)
    ) {
      payload[key] = value === '' || value === null ? null : Number(value)
      return
    }

    if (key === 'vacancies') {
      payload.vacancies = Number(value)
      return
    }

    if (key === 'applicationDeadline') {
      payload.applicationDeadline = value
        ? new Date(value).toISOString()
        : null
      return
    }

    payload[key] =
      typeof value === 'string' ? value.trim() || null : value
  })

  return payload
}

export function validatePublicationReadiness(job) {
  const issues = []
  const required = [
    ['title', 'Job title'],
    ['description', 'Description'],
    ['requirements', 'Requirements'],
    ['workMode', 'Work mode'],
    ['employmentType', 'Employment type'],
    ['experienceLevel', 'Experience level'],
    ['vacancies', 'Vacancies'],
    ['applicationDeadline', 'Application deadline'],
  ]

  required.forEach(([field, label]) => {
    if (
      job?.[field] === null ||
      job?.[field] === undefined ||
      job?.[field] === ''
    ) {
      issues.push(`${label} is required.`)
    }
  })

  if (job?.workMode !== 'REMOTE' && !job?.location) {
    issues.push('Location is required unless the work mode is Remote.')
  }

  if (
    job?.applicationDeadline &&
    new Date(job.applicationDeadline).getTime() <= Date.now()
  ) {
    issues.push('Application deadline must be in the future.')
  }

  if (
    job?.minimumSalary != null &&
    job?.maximumSalary != null &&
    Number(job.minimumSalary) > Number(job.maximumSalary)
  ) {
    issues.push('Minimum salary cannot exceed maximum salary.')
  }

  if (
    job?.minimumExperience != null &&
    job?.maximumExperience != null &&
    Number(job.minimumExperience) > Number(job.maximumExperience)
  ) {
    issues.push('Minimum experience cannot exceed maximum experience.')
  }

  return issues
}
