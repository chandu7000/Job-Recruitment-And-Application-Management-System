import { describe, expect, it } from 'vitest'
import {
  EMPLOYMENT_TYPES,
  EXPERIENCE_LEVELS,
  PUBLIC_JOB_SORTS,
  WORK_MODES,
} from '../features/publicJobs/constants/publicJobConstants'

describe('Public job constants', () => {
  it('matches every backend-supported sort value', () => {
    expect(PUBLIC_JOB_SORTS.map(({ value }) => value)).toEqual([
      'latest',
      'oldest',
      'relevance',
      'deadlineSoon',
      'salaryAscending',
      'salaryDescending',
      'titleAscending',
      'titleDescending',
    ])
  })

  it('matches the backend job filter enums', () => {
    expect(WORK_MODES.map(({ value }) => value)).toEqual([
      'ONSITE',
      'REMOTE',
      'HYBRID',
    ])
    expect(EMPLOYMENT_TYPES.map(({ value }) => value)).toEqual([
      'FULL_TIME',
      'PART_TIME',
      'INTERNSHIP',
      'CONTRACT',
      'FREELANCE',
    ])
    expect(EXPERIENCE_LEVELS.map(({ value }) => value)).toEqual([
      'FRESHER',
      'JUNIOR',
      'MID',
      'SENIOR',
      'LEAD',
    ])
  })
})
