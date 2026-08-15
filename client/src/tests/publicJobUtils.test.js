import { describe, expect, it } from 'vitest'
import { validateJobFilters } from '../features/publicJobs/utils/filterValidation'
import { formatExperienceRange, formatSalaryRange } from '../features/publicJobs/utils/jobFormatters'
import { filtersFromSearchParams, filtersToSearchParams } from '../features/publicJobs/utils/urlFilters'

describe('Public job utilities', () => {
  it('formats salary and experience ranges with fallbacks', () => {
    expect(formatSalaryRange({ minimumSalary: 500000, maximumSalary: 800000, salaryCurrency: 'INR' })).toContain('5,00,000')
    expect(formatSalaryRange({})).toBe('Salary not disclosed')
    expect(formatExperienceRange({ minimumExperience: 2, maximumExperience: 4 })).toBe('2–4 years')
  })

  it('validates salary and date ranges', () => {
    expect(validateJobFilters({ minimumSalary: '10', maximumSalary: '5', publishedFrom: '2026-08-02', publishedTo: '2026-08-01' })).toEqual({
      maximumSalary: 'Maximum salary must be greater than or equal to minimum salary.',
      publishedTo: 'Published-to date cannot be before published-from date.',
    })
  })

  it('restores filters from and writes filters to URL parameters', () => {
    const restored = filtersFromSearchParams(new URLSearchParams('search=java&workMode=REMOTE&page=2'))
    expect(restored).toMatchObject({ search: 'java', workMode: 'REMOTE', page: '2' })
    expect(filtersToSearchParams(restored).toString()).toContain('search=java')
  })
})
