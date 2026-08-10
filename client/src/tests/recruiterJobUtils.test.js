import { describe, expect, it } from 'vitest'
import {
  DEFAULT_JOB_QUERY,
  PUBLISHED_EDITABLE_FIELDS,
} from '../features/recruiterJobs/constants/recruiterJobConstants'
import {
  getRecruiterJobCapabilities,
} from '../features/recruiterJobs/utils/recruiterJobCapabilities'
import {
  buildRecruiterJobSearchParams,
  readRecruiterJobQuery,
  serializeRecruiterJobQuery,
} from '../features/recruiterJobs/utils/recruiterJobQuery'

describe('recruiter job query and lifecycle helpers', () => {
  it('serializes only the supported recruiter query shape', () => {
    const params = serializeRecruiterJobQuery({
      page: 2,
      status: 'PUBLISHED',
      workMode: 'REMOTE',
      unknown: 'ignored',
    })

    expect(params.get('page')).toBe('2')
    expect(params.get('status')).toBe('PUBLISHED')
    expect(params.get('workMode')).toBe('REMOTE')
    expect(params.has('unknown')).toBe(false)
  })

  it('reads defaults and removes default URL values', () => {
    const query = readRecruiterJobQuery(new URLSearchParams('search=java'))
    expect(query.search).toBe('java')
    expect(query.page).toBe(DEFAULT_JOB_QUERY.page)

    const params = buildRecruiterJobSearchParams(DEFAULT_JOB_QUERY)
    expect(params.toString()).toBe('')
  })

  it('prevents unsupported reopen and delete actions', () => {
    const published = getRecruiterJobCapabilities({
      status: 'PUBLISHED',
      applicationCount: 3,
    })
    const closed = getRecruiterJobCapabilities({
      status: 'CLOSED',
      applicationCount: 0,
    })

    expect(published.canClose).toBe(true)
    expect(published.canDelete).toBe(false)
    expect(published.editableFields).toEqual(PUBLISHED_EDITABLE_FIELDS)
    expect(closed.canReopen).toBe(false)
    expect(closed.canEdit).toBe(false)
  })

  it('allows deletion only for an empty draft', () => {
    expect(
      getRecruiterJobCapabilities({
        status: 'DRAFT',
        applicationCount: 0,
      }).canDelete,
    ).toBe(true)
    expect(
      getRecruiterJobCapabilities({
        status: 'DRAFT',
        applicationCount: 1,
      }).canDelete,
    ).toBe(false)
  })
})
