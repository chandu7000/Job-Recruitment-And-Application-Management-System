import axiosClient from '../../../api/axiosClient'
import { API_ENDPOINTS } from '../../../api/endpoints'

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
    .then((response) => unwrap(response)?.data?.application ?? null),
})
