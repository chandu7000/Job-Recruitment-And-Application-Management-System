import { describe, expect, it } from 'vitest'
import { canWithdrawApplication, normalizeApplication, normalizeCandidateInterview, parseApplicationSort } from '../features/applications/utils/applicationTracking'
import { withdrawalSchema } from '../features/applications/validation/withdrawalSchema'

describe('application tracking business rules', () => {
  it('follows backend withdrawal eligibility', () => {
    expect(canWithdrawApplication('APPLIED')).toBe(true)
    expect(canWithdrawApplication('OFFERED')).toBe(true)
    expect(canWithdrawApplication('HIRED')).toBe(false)
    expect(canWithdrawApplication('REJECTED')).toBe(false)
    expect(canWithdrawApplication('WITHDRAWN')).toBe(false)
  })

  it('removes recruiter-private fields from candidate application data', () => {
    const result = normalizeApplication({ id: 'a1', recruiterNotes: 'private', candidateSnapshot: { email: 'hidden@example.com' }, status: 'APPLIED' })
    expect(result.recruiterNotes).toBeUndefined()
    expect(result.candidateSnapshot).toBeUndefined()
    expect(result.status).toBe('APPLIED')
  })

  it('keeps only candidate summary interview fields', () => {
    const result = normalizeCandidateInterview({ id: 'i1', applicationId: 'a1', status: 'SCHEDULED', scheduledStartAt: '2026-08-10', feedback: 'private', rating: 4 })
    expect(result.applicationId).toBe('a1')
    expect(result.feedback).toBeUndefined()
    expect(result.rating).toBeUndefined()
  })

  it('normalizes sort values and validates optional withdrawal reason', () => {
    expect(parseApplicationSort('updatedAt:ASC')).toEqual({ sort: 'updatedAt', order: 'ASC' })
    expect(parseApplicationSort('invalid:ASC')).toEqual({ sort: 'createdAt', order: 'ASC' })
    expect(withdrawalSchema.safeParse({ reason: '' }).success).toBe(true)
    expect(withdrawalSchema.safeParse({ reason: 'x'.repeat(1001) }).success).toBe(false)
  })
})
