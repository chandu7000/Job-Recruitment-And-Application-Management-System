import axiosClient from '../../../api/axiosClient'
import { API_ENDPOINTS } from '../../../api/endpoints'

const { AUTH } = API_ENDPOINTS

const responseData = (response) => response.data.data

let refreshPromise = null

const refreshSession = () => {
  if (!refreshPromise) {
    refreshPromise = axiosClient
      .post(AUTH.REFRESH)
      .then(responseData)
      .finally(() => {
        refreshPromise = null
      })
  }

  return refreshPromise
}

export const authApi = {
  registerJobSeeker: (payload) =>
    axiosClient
      .post(AUTH.REGISTER_JOB_SEEKER, payload)
      .then(responseData),

  registerRecruiter: (payload) =>
    axiosClient
      .post(AUTH.REGISTER_RECRUITER, payload)
      .then(responseData),

  login: (payload) =>
    axiosClient
      .post(AUTH.LOGIN, payload)
      .then(responseData),

  refresh: refreshSession,

  restoreSession: () =>
    axiosClient
      .post(AUTH.RESTORE_SESSION)
      .then(responseData),

  logout: () =>
    axiosClient
      .post(AUTH.LOGOUT)
      .then(responseData),

  logoutAll: () =>
    axiosClient
      .post(AUTH.LOGOUT_ALL)
      .then(responseData),

  getCurrentUser: () =>
    axiosClient
      .get(AUTH.ME)
      .then(responseData),

  getSessions: () =>
    axiosClient
      .get(AUTH.SESSIONS)
      .then(responseData),

  revokeSession: (sessionId) =>
    axiosClient
      .delete(`${AUTH.SESSIONS}/${sessionId}`)
      .then(responseData),

  forgotPassword: (payload) =>
    axiosClient
      .post(AUTH.FORGOT_PASSWORD, payload)
      .then(responseData),

  resetPassword: (payload) =>
    axiosClient
      .post(AUTH.RESET_PASSWORD, payload)
      .then(responseData),

  changePassword: (payload) =>
    axiosClient
      .post(AUTH.CHANGE_PASSWORD, payload)
      .then(responseData),

  requestEmailChange: (payload) =>
    axiosClient
      .post(AUTH.REQUEST_EMAIL_CHANGE, payload)
      .then(responseData),

  verifyEmailChange: (payload) =>
    axiosClient
      .post(AUTH.VERIFY_EMAIL_CHANGE, payload)
      .then(responseData),

  resendVerification: (payload) =>
    axiosClient
      .post(AUTH.RESEND_VERIFICATION, payload)
      .then(responseData),

  verifyEmail: (payload) =>
    axiosClient
      .post(AUTH.VERIFY_EMAIL, payload)
      .then(responseData),

  declineEmailVerification: (payload) =>
    axiosClient
      .post(AUTH.DECLINE_EMAIL_VERIFICATION, payload)
      .then(responseData),
}