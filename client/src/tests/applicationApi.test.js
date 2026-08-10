import { afterEach, describe, expect, it } from 'vitest'
import axiosClient from '../api/axiosClient'
import { API_ENDPOINTS } from '../api/endpoints'
import { applicationsApi, candidateInterviewsApi, savedJobsApi } from '../features/applications/services/applicationApi'

const originalAdapter = axiosClient.defaults.adapter
const response = (config, data, meta = {}) => ({ data: { success: true, data, meta }, status: 200, statusText: 'OK', headers: {}, config })

describe('Saved jobs and applications API', () => {
  afterEach(() => { axiosClient.defaults.adapter = originalAdapter })

  it('builds application endpoints safely', () => {
    expect(API_ENDPOINTS.JOB_SEEKER.SAVED_JOB('job/id')).toBe('/job-seeker/saved-jobs/job%2Fid')
    expect(API_ENDPOINTS.JOB_SEEKER.APPLY_TO_JOB('job/id')).toBe('/job-seeker/applications/jobs/job%2Fid')
    expect(API_ENDPOINTS.JOB_SEEKER.APPLICATION_BY_ID('app/id')).toBe('/job-seeker/applications/app%2Fid')
    expect(API_ENDPOINTS.JOB_SEEKER.WITHDRAW_APPLICATION('app/id')).toBe('/job-seeker/applications/app%2Fid/withdraw')
  })

  it('normalizes saved-job list and pagination', async () => {
    axiosClient.defaults.adapter = async (config) => response(config, { savedJobs: [{ id: 'saved-1', jobId: 'job-1', job: { id: 'job-1' } }] }, { page: 1, totalPages: 1 })
    await expect(savedJobsApi.list({ page: 1 })).resolves.toEqual({ savedJobs: [{ id: 'saved-1', jobId: 'job-1', job: { id: 'job-1' } }], pagination: { page: 1, totalPages: 1 } })
  })

  it('submits an application and unwraps the created record', async () => {
    axiosClient.defaults.adapter = async (config) => response(config, { application: { id: 'application-1', status: 'APPLIED' } })
    await expect(applicationsApi.apply('job-1', { coverLetter: 'Interested' })).resolves.toMatchObject({ id: 'application-1', status: 'APPLIED' })
  })

  it('lists and normalizes candidate applications without recruiter notes', async () => {
    axiosClient.defaults.adapter = async (config) => response(config, { applications: [{ id: 'application-1', status: 'APPLIED', recruiterNotes: 'private' }] }, { page: 1, totalPages: 2 })
    const result = await applicationsApi.list({ status: 'APPLIED' })
    expect(result.pagination.totalPages).toBe(2)
    expect(result.applications[0].recruiterNotes).toBeUndefined()
  })

  it('gets details and submits withdrawal', async () => {
    axiosClient.defaults.adapter = async (config) => response(config, { application: { id: 'application-1', status: config.method === 'patch' ? 'WITHDRAWN' : 'APPLIED', statusHistory: [] } })
    await expect(applicationsApi.details('application-1')).resolves.toMatchObject({ status: 'APPLIED' })
    await expect(applicationsApi.withdraw('application-1', { reason: 'Changed plans' })).resolves.toMatchObject({ status: 'WITHDRAWN' })
  })

  it('finds a candidate-safe interview summary for an application', async () => {
    axiosClient.defaults.adapter = async (config) => response(config, { interviews: [{ id: 'i1', applicationId: 'a1', status: 'SCHEDULED', feedback: 'private' }, { id: 'i2', applicationId: 'a2', status: 'CONFIRMED' }] })
    const interview = await candidateInterviewsApi.findForApplication('a1')
    expect(interview).toMatchObject({ id: 'i1', applicationId: 'a1', status: 'SCHEDULED' })
    expect(interview.feedback).toBeUndefined()
  })
})
