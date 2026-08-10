import { afterEach, describe, expect, it } from 'vitest'
import axiosClient from '../api/axiosClient'
import { API_ENDPOINTS } from '../api/endpoints'
import { recruiterJobApi } from '../features/recruiterJobs/services/recruiterJobApi'

const originalAdapter = axiosClient.defaults.adapter
const response = (config, data, meta) => ({
  data: { success: true, data, ...(meta ? { meta } : {}) },
  status: 200,
  statusText: 'OK',
  headers: {},
  config,
})

describe('recruiter job API service', () => {
  afterEach(() => {
    axiosClient.defaults.adapter = originalAdapter
  })

  it('uses the verified recruiter job endpoints', () => {
    expect(API_ENDPOINTS.RECRUITER.JOBS).toBe('/jobs')
    expect(API_ENDPOINTS.RECRUITER.MY_JOBS).toBe('/jobs/me')
    expect(API_ENDPOINTS.RECRUITER.JOB_BY_ID('abc')).toBe('/jobs/abc')
    expect(API_ENDPOINTS.RECRUITER.PUBLISH_JOB('abc')).toBe('/jobs/abc/publish')
    expect(API_ENDPOINTS.RECRUITER.CLOSE_JOB('abc')).toBe('/jobs/abc/close')
  })

  it('serializes supported list filters and normalizes pagination', async () => {
    let request
    axiosClient.defaults.adapter = async (config) => {
      request = config
      return response(
        config,
        [{ id: 'job-1', title: 'Backend Engineer' }],
        {
          page: 2,
          limit: 10,
          totalRecords: 11,
          totalPages: 2,
          hasNextPage: false,
          hasPreviousPage: true,
        },
      )
    }

    const result = await recruiterJobApi.list({
      page: 2,
      search: 'backend',
      status: 'DRAFT',
      sort: 'newest',
    })

    expect(API_ENDPOINTS.RECRUITER.MY_JOBS).toBe('/jobs/me')
    expect(request.params.get('search')).toBe('backend')
    expect(request.params.get('status')).toBe('DRAFT')
    expect(result.jobs).toHaveLength(1)
    expect(result.pagination.totalRecords).toBe(11)
    expect(result.pagination.hasPreviousPage).toBe(true)
  })

  it('connects create, update, publish, close and delete actions', async () => {
    const requests = []
    axiosClient.defaults.adapter = async (config) => {
      requests.push([config.method, config.url])
      return response(config, { id: 'job-1' })
    }

    await recruiterJobApi.createDraft({ companyId: 'company-1' })
    await recruiterJobApi.update('job-1', { description: 'Updated' })
    await recruiterJobApi.publish('job-1')
    await recruiterJobApi.close('job-1', 'Hiring complete')
    await recruiterJobApi.deleteDraft('job-1')

    expect(requests).toEqual([
      ['post', '/jobs'],
      ['put', '/jobs/job-1'],
      ['patch', '/jobs/job-1/publish'],
      ['patch', '/jobs/job-1/close'],
      ['delete', '/jobs/job-1'],
    ])
  })
})
