import { describe, expect, it } from 'vitest'
import {
  serializePublicJobQuery,
  serializeSimilarJobsQuery,
} from '../features/publicJobs/utils/publicQuery'

describe('Public job query serialization', () => {
  it('serializes supported filters and comma-separated skills', () => {
    const params = serializePublicJobQuery({
      page: 2,
      limit: 10,
      search: '  Java developer  ',
      skills: ['Java', 'Spring Boot'],
      workMode: 'REMOTE',
      minimumSalary: 500000,
    })

    expect(params.toString()).toBe(
      'page=2&limit=10&search=Java+developer&workMode=REMOTE&skills=Java%2CSpring+Boot&minimumSalary=500000',
    )
  })

  it('omits empty and unsupported values', () => {
    const params = serializePublicJobQuery({
      search: ' ',
      location: null,
      unsupported: 'value',
    })

    expect(params.toString()).toBe('')
  })

  it('serializes the optional similar-job limit', () => {
    expect(serializeSimilarJobsQuery(5).toString()).toBe('limit=5')
    expect(serializeSimilarJobsQuery().toString()).toBe('')
  })
})
