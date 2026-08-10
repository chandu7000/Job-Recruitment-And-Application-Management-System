import axiosClient from '../../../api/axiosClient'
import { API_ENDPOINTS } from '../../../api/endpoints'
import { normalizeApplication, normalizeCandidateInterview } from '../utils/applicationTracking'

const unwrap = (response) => response?.data ?? {}

export const normalizeSavedJob = (savedJob) => ({
  ...savedJob,
  job: savedJob?.job ?? null,
})

export const savedJobsApi = Object.freeze({
  list: (query = {}, { signal } = {}) => axiosClient
    .get(API_ENDPOINTS.JOB_SEEKER.SAVED_JOBS, { params: query, signal })
    .then((response) => {
      const envelope = unwrap(response)
      const items = envelope?.data?.savedJobs
      return {
        savedJobs: Array.isArray(items) ? items.map(normalizeSavedJob) : [],
        pagination: envelope?.meta ?? {},
      }
    }),
  save: (jobId) => axiosClient
    .post(API_ENDPOINTS.JOB_SEEKER.SAVED_JOB(jobId))
    .then((response) => unwrap(response)?.data?.savedJob ?? null),
  remove: (jobId) => axiosClient.delete(API_ENDPOINTS.JOB_SEEKER.SAVED_JOB(jobId)),
})

export const applicationsApi = Object.freeze({
  apply: (jobId, payload = {}) => axiosClient
    .post(API_ENDPOINTS.JOB_SEEKER.APPLY_TO_JOB(jobId), payload)
    .then((response) => normalizeApplication(unwrap(response)?.data?.application)),
  list: (query = {}, { signal } = {}) => axiosClient
    .get(API_ENDPOINTS.JOB_SEEKER.APPLICATIONS, { params: query, signal })
    .then((response) => {
      const envelope = unwrap(response)
      const items = envelope?.data?.applications
      return {
        applications: Array.isArray(items) ? items.map(normalizeApplication).filter(Boolean) : [],
        pagination: envelope?.meta ?? {},
      }
    }),
  details: (applicationId, { signal } = {}) => axiosClient
    .get(API_ENDPOINTS.JOB_SEEKER.APPLICATION_BY_ID(applicationId), { signal })
    .then((response) => normalizeApplication(unwrap(response)?.data?.application)),
  withdraw: (applicationId, payload = {}) => axiosClient
    .patch(API_ENDPOINTS.JOB_SEEKER.WITHDRAW_APPLICATION(applicationId), payload)
    .then((response) => normalizeApplication(unwrap(response)?.data?.application)),
})

export const candidateInterviewsApi = Object.freeze({
  list: (query = {}, { signal } = {}) => axiosClient
    .get(API_ENDPOINTS.JOB_SEEKER.INTERVIEWS, { params: query, signal })
    .then((response) => {
      const envelope = unwrap(response)
      const items = envelope?.data?.interviews
      return {
        interviews: Array.isArray(items) ? items.map(normalizeCandidateInterview).filter(Boolean) : [],
        pagination: envelope?.meta ?? {},
      }
    }),
  findForApplication: async (applicationId, options = {}) => {
    const result = await candidateInterviewsApi.list({ page: 1, limit: 100, order: 'DESC' }, options)
    return result.interviews.find((interview) => interview.applicationId === applicationId) ?? null
  },
})
