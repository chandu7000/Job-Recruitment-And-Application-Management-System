import { describe, expect, it } from 'vitest'
import { applicationSchema, COVER_LETTER_MAX_LENGTH } from '../features/applications/validation/applicationSchema'
import { getApplicationErrorGuidance } from '../features/applications/utils/applicationErrors'

describe('Application validation and error guidance', () => {
  it('accepts an empty optional cover letter and the backend maximum', () => {
    expect(applicationSchema.safeParse({ coverLetter: '' }).success).toBe(true)
    expect(applicationSchema.safeParse({ coverLetter: 'a'.repeat(COVER_LETTER_MAX_LENGTH) }).success).toBe(true)
  })

  it('rejects a cover letter longer than 5000 characters', () => {
    expect(applicationSchema.safeParse({ coverLetter: 'a'.repeat(COVER_LETTER_MAX_LENGTH + 1) }).success).toBe(false)
  })

  it('maps backend eligibility and duplicate errors to user guidance', () => {
    expect(getApplicationErrorGuidance({ response: { data: { code: 'APPLICANT_PROFILE_INCOMPLETE' } } })).toMatch(/first name/i)
    expect(getApplicationErrorGuidance({ response: { data: { code: 'APPLICATION_ALREADY_EXISTS' } } })).toMatch(/already applied/i)
    expect(getApplicationErrorGuidance({ response: { data: { code: 'PUBLIC_JOB_NOT_FOUND' } } })).toMatch(/no longer available/i)
  })
})
