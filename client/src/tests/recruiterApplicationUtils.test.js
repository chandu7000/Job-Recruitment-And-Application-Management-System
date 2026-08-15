import { describe, expect, it } from 'vitest'
import {
  getRecruiterProcessingActions,
  normalizeRecruiterApplication,
} from '../features/applications/utils/recruiterApplicationProcessing'

describe('recruiter applicant processing rules', () => {
  it('shows only recruiter application processing actions', () => {
    expect(getRecruiterProcessingActions('APPLIED').map((action) => action.value)).toEqual([
      'UNDER_REVIEW',
      'SHORTLISTED',
      'REJECTED',
    ])
    expect(getRecruiterProcessingActions('UNDER_REVIEW').map((action) => action.value)).toEqual([
      'SHORTLISTED',
      'REJECTED',
    ])
    expect(getRecruiterProcessingActions('SHORTLISTED').map((action) => action.value)).toEqual(['REJECTED'])
  })

  it('never exposes interview actions in recruiter application controls', () => {
    const values = getRecruiterProcessingActions('UNDER_REVIEW').map((action) => action.value)
    expect(values).not.toContain('INTERVIEW')
    expect(values).not.toContain('INTERVIEW_SCHEDULED')
  })

  it('treats finalized and withdrawn applications as non-actionable', () => {
    expect(getRecruiterProcessingActions('REJECTED')).toEqual([])
    expect(getRecruiterProcessingActions('WITHDRAWN')).toEqual([])
    expect(getRecruiterProcessingActions('HIRED')).toEqual([])
  })

  it('normalizes optional recruiter application sections', () => {
    expect(normalizeRecruiterApplication({ id: 'a1' })).toEqual(expect.objectContaining({
      candidateSnapshot: null,
      candidateProfile: null,
      statusHistory: [],
    }))
  })
})
