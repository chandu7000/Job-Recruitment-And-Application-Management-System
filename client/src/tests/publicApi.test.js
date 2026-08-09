import { afterEach, describe, expect, it } from 'vitest'
import axiosClient from '../api/axiosClient'
import { API_ENDPOINTS } from '../api/endpoints'
import { publicCompanyApi } from '../features/publicJobs/services/publicCompanyApi'
import { publicJobApi } from '../features/publicJobs/services/publicJobApi'

const originalAdapter = axiosClient.defaults.adapter

const response = (config, data, meta = {}) => ({
  data: { success: true, data, meta },
  status: 200,
  statusText: 'OK',
  headers: {},
  config,
})

describe('Public API services', () => {
  afterEach(() => {
    axiosClient.defaults.adapter = originalAdapter
  })

  it('builds all dynamic public endpoints safely', () => {
    expect(API_ENDPOINTS.PUBLIC.JOB_BY_SLUG('java developer')).toBe(
      '/public/jobs/slug/java%20developer',
    )
    expect(API_ENDPOINTS.PUBLIC.SIMILAR_JOBS('job/id')).toBe(
      '/public/jobs/job%2Fid/similar',
    )
    expect(API_ENDPOINTS.PUBLIC.COMPANY_JOBS_BY_SLUG('open ai')).toBe(
      '/public/companies/slug/open%20ai/jobs',
    )
  })

  it('maps the public job list and pagination envelope', async () => {
    axiosClient.defaults.adapter = async (config) =>
      response(config, [{ id: 'job-1' }], { page: 1, totalRecords: 1 })

    const result = await publicJobApi.list({ sort: 'latest', limit: 6 })

    expect(result).toEqual({
      jobs: [{ id: 'job-1' }],
      pagination: { page: 1, totalRecords: 1 },
    })
  })

  it('maps job, similar-job, company, and company-job responses', async () => {
    axiosClient.defaults.adapter = async (config) => {
      if (config.url.endsWith('/similar')) {
        return response(config, [{ id: 'job-2' }], { limit: 5 })
      }
      if (config.url.endsWith('/jobs')) {
        return response(config, [{ id: 'job-3' }], { page: 1 })
      }
      if (config.url.includes('/companies/')) {
        return response(config, { id: 'company-1' })
      }
      return response(config, { id: 'job-1' })
    }

    await expect(publicJobApi.getById('job-1')).resolves.toEqual({ id: 'job-1' })
    await expect(publicJobApi.getSimilar('job-1', 5)).resolves.toEqual({
      jobs: [{ id: 'job-2' }],
      meta: { limit: 5 },
    })
    await expect(publicCompanyApi.getBySlug('company')).resolves.toEqual({
      id: 'company-1',
    })
    await expect(publicCompanyApi.listJobsById('company-1')).resolves.toEqual({
      jobs: [{ id: 'job-3' }],
      pagination: { page: 1 },
    })
  })
})
