import axiosClient from '../../../api/axiosClient'
import { API_ENDPOINTS } from '../../../api/endpoints'

const unwrap = (response) => response.data?.data ?? response.data

export const normalizeOwnedCompanies = (data) => {
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.companies)) return data.companies
  return data ? [data] : []
}

export const recruiterApi = {
  dashboard: (signal) => axiosClient.get(API_ENDPOINTS.RECRUITER.DASHBOARD, { signal }).then(unwrap),
  profile: (signal) => axiosClient.get(API_ENDPOINTS.RECRUITER.PROFILE, { signal }).then(unwrap),
  updateProfile: (payload) => axiosClient.put(API_ENDPOINTS.RECRUITER.PROFILE, payload).then(unwrap),
  companies: (signal) => axiosClient.get(API_ENDPOINTS.RECRUITER.MY_COMPANIES, { signal }).then(unwrap).then(normalizeOwnedCompanies),
  company: (companyId, signal) => axiosClient.get(`${API_ENDPOINTS.RECRUITER.COMPANIES}/${encodeURIComponent(companyId)}`, { signal }).then(unwrap),
  createCompany: (payload) => axiosClient.post(API_ENDPOINTS.RECRUITER.COMPANIES, payload).then(unwrap),
  updateCompany: (payload) => axiosClient.put(API_ENDPOINTS.RECRUITER.MY_COMPANIES, payload).then(unwrap),
  uploadLogo: (file, onUploadProgress) => {
    const formData = new FormData()
    formData.append('companyLogo', file)
    return axiosClient.post(API_ENDPOINTS.RECRUITER.COMPANY_LOGO, formData, { onUploadProgress }).then(unwrap)
  },
  deleteLogo: () => axiosClient.delete(API_ENDPOINTS.RECRUITER.COMPANY_LOGO).then(unwrap),
  submitVerification: () => axiosClient.post(API_ENDPOINTS.RECRUITER.SUBMIT_COMPANY_VERIFICATION).then(unwrap),
  resubmitVerification: () => axiosClient.post(API_ENDPOINTS.RECRUITER.RESUBMIT_COMPANY_VERIFICATION).then(unwrap),
  verificationHistory: (signal) => axiosClient.get(API_ENDPOINTS.RECRUITER.COMPANY_VERIFICATION_HISTORY, { signal }).then(unwrap).then((data) => Array.isArray(data) ? data : (data?.history ?? [])),
}
