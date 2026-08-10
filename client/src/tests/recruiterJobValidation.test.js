import { describe, expect, it } from 'vitest'
import {
  buildRecruiterJobPayload,
  recruiterJobDraftSchema,
  validatePublicationReadiness,
} from '../features/recruiterJobs/validation/recruiterJobSchemas'

const validDraft = {
  title: 'Backend Engineer',
  description: 'Build reliable backend services.',
  responsibilities: '',
  requirements: 'Strong Java fundamentals.',
  skills: ['Java', 'SQL'],
  location: 'Hyderabad',
  workMode: 'HYBRID',
  employmentType: 'FULL_TIME',
  experienceLevel: 'JUNIOR',
  minimumExperience: '1',
  maximumExperience: '3',
  minimumSalary: '500000',
  maximumSalary: '900000',
  salaryCurrency: 'INR',
  vacancies: '2',
  applicationDeadline: '2099-12-31T10:00',
}

describe('recruiter job validation', () => {
  it('accepts backend-supported draft values', () => {
    expect(recruiterJobDraftSchema.safeParse(validDraft).success).toBe(true)
  })

  it('rejects duplicate skills and invalid numeric ranges', () => {
    const duplicateSkills = recruiterJobDraftSchema.safeParse({
      ...validDraft,
      skills: ['Java', 'java'],
    })
    const invalidRange = recruiterJobDraftSchema.safeParse({
      ...validDraft,
      minimumSalary: '900000',
      maximumSalary: '500000',
    })

    expect(duplicateSkills.success).toBe(false)
    expect(invalidRange.success).toBe(false)
  })

  it('builds payload numbers and ISO deadline for the backend', () => {
    const payload = buildRecruiterJobPayload(validDraft)
    expect(payload.minimumExperience).toBe(1)
    expect(payload.maximumSalary).toBe(900000)
    expect(payload.vacancies).toBe(2)
    expect(payload.applicationDeadline).toMatch(/^2099-12-31T/)
  })

  it('requires publication fields and non-remote location', () => {
    expect(
      validatePublicationReadiness({
        ...validDraft,
        title: '',
        workMode: 'ONSITE',
        location: '',
      }),
    ).toEqual(
      expect.arrayContaining([
        'Job title is required.',
        'Location is required unless the work mode is Remote.',
      ]),
    )
  })
})
