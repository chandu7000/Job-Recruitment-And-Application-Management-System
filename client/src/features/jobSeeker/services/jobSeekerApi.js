import axiosClient from '../../../api/axiosClient'
import { API_ENDPOINTS } from '../../../api/endpoints'

const unwrap = (response) => response.data?.data ?? response.data
const collection = (data, key) => Array.isArray(data) ? data : (data?.[key] ?? [])

export const jobSeekerApi = {
  dashboard: (signal) => axiosClient.get(API_ENDPOINTS.JOB_SEEKER.DASHBOARD, { signal }).then(unwrap),
  profile: (signal) => axiosClient.get(API_ENDPOINTS.JOB_SEEKER.PROFILE, { signal }).then(unwrap),
  completion: (signal) => axiosClient.get(API_ENDPOINTS.JOB_SEEKER.COMPLETION, { signal }).then(unwrap),
  updateProfile: (payload) => axiosClient.put(API_ENDPOINTS.JOB_SEEKER.PROFILE, payload).then(unwrap),
  updateProfessional: (payload) => axiosClient.put(API_ENDPOINTS.JOB_SEEKER.HEADLINE_BIOGRAPHY, payload).then(unwrap),
  list: (endpoint, key, signal) => axiosClient.get(endpoint, { signal }).then(unwrap).then((data) => collection(data, key)),
  create: (endpoint, payload) => axiosClient.post(endpoint, payload).then(unwrap),
  update: (endpoint, id, payload, method = 'put') => axiosClient[method](`${endpoint}/${encodeURIComponent(id)}`, payload).then(unwrap),
  remove: (endpoint, id) => axiosClient.delete(`${endpoint}/${encodeURIComponent(id)}`).then(unwrap),
  preferences: (signal) => axiosClient.get(API_ENDPOINTS.JOB_SEEKER.JOB_PREFERENCES, { signal }).then(unwrap).then((data) => data?.jobPreference ?? data),
  updatePreferences: (payload) => axiosClient.patch(API_ENDPOINTS.JOB_SEEKER.JOB_PREFERENCES, payload).then(unwrap),
  resetPreferences: () => axiosClient.delete(API_ENDPOINTS.JOB_SEEKER.JOB_PREFERENCES),
  upload: (endpoint, field, file, onUploadProgress) => {
    const formData = new FormData()
    formData.append(field, file)
    return axiosClient.post(endpoint, formData, { onUploadProgress }).then(unwrap)
  },
  deleteUpload: (endpoint) => axiosClient.delete(endpoint).then(unwrap),
}
