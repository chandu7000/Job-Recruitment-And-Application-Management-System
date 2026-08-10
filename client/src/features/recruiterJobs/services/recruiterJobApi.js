import axiosClient from '../../../api/axiosClient'
import { API_ENDPOINTS } from '../../../api/endpoints'
import { serializeRecruiterJobQuery } from '../utils/recruiterJobQuery'
import {
  normalizeRecruiterJob,
  normalizeRecruiterJobList,
} from '../utils/recruiterJobResponse'

export const recruiterJobApi = {
  list: (query = {}, config = {}) =>
    axiosClient
      .get(API_ENDPOINTS.RECRUITER.MY_JOBS, {
        ...config,
        params: serializeRecruiterJobQuery(query),
      })
      .then(normalizeRecruiterJobList),

  getById: (jobId, signal) =>
    axiosClient
      .get(API_ENDPOINTS.RECRUITER.JOB_BY_ID(jobId), { signal })
      .then(normalizeRecruiterJob),

  createDraft: (payload) =>
    axiosClient
      .post(API_ENDPOINTS.RECRUITER.JOBS, payload)
      .then(normalizeRecruiterJob),

  update: (jobId, payload) =>
    axiosClient
      .put(API_ENDPOINTS.RECRUITER.JOB_BY_ID(jobId), payload)
      .then(normalizeRecruiterJob),

  publish: (jobId) =>
    axiosClient
      .patch(API_ENDPOINTS.RECRUITER.PUBLISH_JOB(jobId))
      .then(normalizeRecruiterJob),

  close: (jobId, closureReason) =>
    axiosClient
      .patch(API_ENDPOINTS.RECRUITER.CLOSE_JOB(jobId), {
        ...(closureReason?.trim()
          ? { closureReason: closureReason.trim() }
          : {}),
      })
      .then(normalizeRecruiterJob),

  deleteDraft: (jobId) =>
    axiosClient
      .delete(API_ENDPOINTS.RECRUITER.JOB_BY_ID(jobId))
      .then((response) => response.data?.data ?? response.data),
}
