import { describe, expect, it } from 'vitest'
import { reportTransitions, sanitizeAuditMetadata, validateCompanyRejectionReason, validateJobRemovalReason } from '../features/admin/utils/adminModerationUtils'

describe('Admin moderation utilities', () => {
  it('matches backend company rejection constraints', () => {
    expect(validateCompanyRejectionReason('bad')).toMatch(/between 5 and 2000/)
    expect(validateCompanyRejectionReason('Valid reason')).toBe('')
  })
  it('requires a job removal reason and enforces backend max length', () => {
    expect(validateJobRemovalReason('')).toBe('Removal reason is required.')
    expect(validateJobRemovalReason('Policy violation')).toBe('')
    expect(validateJobRemovalReason('x'.repeat(2001))).toMatch(/2000/)
  })
  it('matches real report transitions', () => {
    expect(reportTransitions('OPEN')).toEqual(['UNDER_REVIEW','RESOLVED','DISMISSED'])
    expect(reportTransitions('UNDER_REVIEW')).toEqual(['RESOLVED','DISMISSED'])
    expect(reportTransitions('RESOLVED')).toEqual([])
  })
  it('defensively removes sensitive audit metadata recursively', () => {
    expect(sanitizeAuditMetadata({ action: 'ok', password: 'secret', nested: { accessToken: 'x', safe: true } })).toEqual({ action: 'ok', nested: { safe: true } })
  })
})
