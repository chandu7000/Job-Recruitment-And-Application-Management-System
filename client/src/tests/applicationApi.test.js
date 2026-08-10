import { afterEach, describe, expect, it } from 'vitest'
import axiosClient from '../api/axiosClient'
import { API_ENDPOINTS } from '../api/endpoints'
import { applicationsApi, savedJobsApi } from '../features/applications/services/applicationApi'

const originalAdapter = axiosClient.defaults.adapter
const response = (config, data, meta = {}) => ({ data: { success: true, data, meta }, status: 200, statusText: 'OK', headers: {}, config })

describe('Saved jobs and applications API', () => {
  afterEach(() => { axiosClient.defaults.adapter = originalAdapter })

  it('builds saved-job and apply endpoints safely', () => {
    expect(API_ENDPOINTS.JOB_SEEKER.SAVED_JOB('job/id')).toBe('/job-seeker/saved-jobs/job%2Fid')
    expect(API_ENDPOINTS.JOB_SEEKER.APPLY_TO_JOB('job/id')).toBe('/job-seeker/applications/jobs/job%2Fid')
  })

  it('normalizes saved-job list and pagination', async () => {
    axiosClient.defaults.adapter = async (config) => response(config, { savedJobs: [{ id: 'saved-1', jobId: 'job-1', job: { id: 'job-1' } }] }, { page: 1, totalPages: 1 })
    await expect(savedJobsApi.list({ page: 1 })).resolves.toEqual({ savedJobs: [{ id: 'saved-1', jobId: 'job-1', job: { id: 'job-1' } }], pagination: { page: 1, totalPages: 1 } })
  })

  it('submits an application and unwraps the created record', async () => {
    axiosClient.defaults.adapter = async (config) => response(config, { application: { id: 'application-1', status: 'APPLIED' } })
    await expect(applicationsApi.apply('job-1', { coverLetter: 'Interested' })).resolves.toEqual({ id: 'application-1', status: 'APPLIED' })
  })
})
