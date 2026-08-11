import axiosClient from '../../../api/axiosClient'
import { API_ENDPOINTS } from '../../../api/endpoints'
import { normalizeRecruiterApplication } from '../utils/recruiterApplicationProcessing'

const unwrap = (response) => response?.data ?? {}

export const recruiterApplicationApi = Object.freeze({
  listByJob: (jobId, query = {}, { signal } = {}) => axiosClient
    .get(API_ENDPOINTS.RECRUITER.APPLICATIONS, {
      params: { ...query, jobId },
      signal,
    })
    .then((response) => {
      const envelope = unwrap(response)
      const items = envelope?.data?.applications
      return {
        applications: Array.isArray(items)
          ? items.map(normalizeRecruiterApplication).filter(Boolean)
          : [],
        pagination: envelope?.meta ?? {},
      }
    }),

  details: (applicationId, { signal } = {}) => axiosClient
    .get(API_ENDPOINTS.RECRUITER.APPLICATION_BY_ID(applicationId), { signal })
    .then((response) => normalizeRecruiterApplication(unwrap(response)?.data?.application)),

  saveNotes: (applicationId, notes) => axiosClient
    .put(API_ENDPOINTS.RECRUITER.APPLICATION_NOTES(applicationId), { notes })
    .then((response) => normalizeRecruiterApplication(unwrap(response)?.data?.application)),

  updateStatus: (applicationId, status, reason) => axiosClient
    .patch(API_ENDPOINTS.RECRUITER.APPLICATION_STATUS(applicationId), {
      status,
      ...(reason?.trim() ? { reason: reason.trim() } : {}),
    })
    .then((response) => normalizeRecruiterApplication(unwrap(response)?.data?.application)),
})
