import axiosClient from '../../../api/axiosClient'
import { API_ENDPOINTS } from '../../../api/endpoints'
import { normalizeInterview, normalizePagination } from '../utils/interview'
const unwrap = (response) => response?.data ?? {}
const readInterview = (response) => normalizeInterview(unwrap(response)?.data?.interview)
const readList = (response) => {
  const envelope = unwrap(response)
  const items = envelope?.data?.interviews
  return { interviews: Array.isArray(items) ? items.map(normalizeInterview).filter(Boolean) : [], pagination: normalizePagination(envelope?.meta) }
}
export const recruiterInterviewApi = Object.freeze({
  schedule: (applicationId, payload) => axiosClient.post(API_ENDPOINTS.RECRUITER.SCHEDULE_INTERVIEW(applicationId), payload).then(readInterview),
  list: (params = {}, { signal } = {}) => axiosClient.get(API_ENDPOINTS.RECRUITER.INTERVIEWS, { params, signal }).then(readList),
  details: (id, { signal } = {}) => axiosClient.get(API_ENDPOINTS.RECRUITER.INTERVIEW_BY_ID(id), { signal }).then(readInterview),
  history: (id, { signal } = {}) => axiosClient.get(API_ENDPOINTS.RECRUITER.INTERVIEW_HISTORY(id), { signal }).then((r) => unwrap(r)?.data?.history || []),
  reschedule: (id, payload) => axiosClient.patch(API_ENDPOINTS.RECRUITER.RESCHEDULE_INTERVIEW(id), payload).then(readInterview),
  cancel: (id, reason) => axiosClient.patch(API_ENDPOINTS.RECRUITER.CANCEL_INTERVIEW(id), { reason }).then(readInterview),
  complete: (id) => axiosClient.patch(API_ENDPOINTS.RECRUITER.COMPLETE_INTERVIEW(id)).then(readInterview),
  feedback: (id, payload) => axiosClient.put(API_ENDPOINTS.RECRUITER.INTERVIEW_FEEDBACK(id), payload).then(readInterview),
})
export const candidateInterviewApi = Object.freeze({
  list: (params = {}, { signal } = {}) => axiosClient.get(API_ENDPOINTS.JOB_SEEKER.INTERVIEWS, { params, signal }).then(readList),
  details: (id, { signal } = {}) => axiosClient.get(API_ENDPOINTS.JOB_SEEKER.INTERVIEW_BY_ID(id), { signal }).then(readInterview),
  history: (id, { signal } = {}) => axiosClient.get(API_ENDPOINTS.JOB_SEEKER.INTERVIEW_HISTORY(id), { signal }).then((r) => unwrap(r)?.data?.history || []),
  confirm: (id) => axiosClient.patch(API_ENDPOINTS.JOB_SEEKER.CONFIRM_INTERVIEW(id)).then(readInterview),
  decline: (id, reason) => axiosClient.patch(API_ENDPOINTS.JOB_SEEKER.DECLINE_INTERVIEW(id), { reason }).then(readInterview),
})
