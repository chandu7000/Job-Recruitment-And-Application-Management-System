import { describe, expect, it } from 'vitest'
import {
  REPORT_CATEGORIES,
  REPORT_DESCRIPTION_LIMITS,
  REPORT_TARGET_TYPES,
} from '../features/reporting/constants/reportConstants'
import { validateReport } from '../features/reporting/validation/reportValidation'

describe('report validation', () => {
  it('mirrors backend targets, categories, and description limits', () => {
    expect(Object.values(REPORT_TARGET_TYPES)).toEqual(['JOB', 'COMPANY'])
    expect(REPORT_CATEGORIES.map(({ value }) => value)).toEqual([
      'FRAUD_OR_SCAM',
      'MISLEADING_INFORMATION',
      'DISCRIMINATION',
      'INAPPROPRIATE_CONTENT',
      'DUPLICATE_OR_SPAM',
      'IMPERSONATION',
      'OTHER',
    ])
    expect(REPORT_DESCRIPTION_LIMITS).toEqual({ MIN: 10, MAX: 2000 })
  })

  it('rejects missing category and invalid descriptions', () => {
    const result = validateReport({
      targetType: 'JOB',
      targetResourceId: 'job-1',
      category: '',
      description: '   short   ',
    })

    expect(result.valid).toBe(false)
    expect(result.errors.category).toMatch(/select a reason/i)
    expect(result.errors.description).toMatch(/at least 10/i)
  })

  it('trims and accepts valid report input', () => {
    const result = validateReport({
      targetType: 'COMPANY',
      targetResourceId: 'company-1',
      category: 'OTHER',
      description: '  This company information needs review.  ',
    })

    expect(result.valid).toBe(true)
    expect(result.values.description).toBe('This company information needs review.')
  })
})
