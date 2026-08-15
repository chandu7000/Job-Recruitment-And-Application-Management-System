import axios from 'axios'
import { mapApiError } from './errorMapper'
import { API_ENDPOINTS } from './endpoints'
import {
  clearAccessToken,
  getAccessToken,
  setAccessToken,
} from '../features/auth/services/tokenStore'
import { getAuthTabId } from '../features/auth/services/authTabStore'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  timeout: 15000,
  headers: {
    Accept: 'application/json',
  },
})

let refreshPromise = null
let authenticationFailureHandler = null

const authenticationEndpoints = [
  API_ENDPOINTS.AUTH.LOGIN,
  API_ENDPOINTS.AUTH.REGISTER_JOB_SEEKER,
  API_ENDPOINTS.AUTH.REGISTER_RECRUITER,
  API_ENDPOINTS.AUTH.REFRESH,
  API_ENDPOINTS.AUTH.RESTORE_SESSION,
  API_ENDPOINTS.AUTH.FORGOT_PASSWORD,
  API_ENDPOINTS.AUTH.RESET_PASSWORD,
  API_ENDPOINTS.AUTH.VERIFY_EMAIL,
  API_ENDPOINTS.AUTH.VERIFY_EMAIL_CHANGE,
]

const isAuthenticationEndpoint = (url = '') =>
  authenticationEndpoints.some((endpoint) => url.endsWith(endpoint))

export function setAuthenticationFailureHandler(handler) {
  authenticationFailureHandler = typeof handler === 'function' ? handler : null
}

axiosClient.interceptors.request.use((config) => {
  const token = getAccessToken()
  config.headers['X-Auth-Tab-Id'] = getAuthTabId()

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    const shouldRefresh =
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !isAuthenticationEndpoint(originalRequest.url)

    if (!shouldRefresh) {
      return Promise.reject(mapApiError(error))
    }

    originalRequest._retry = true

    try {
      if (!refreshPromise) {
        refreshPromise = axios
          .post(
            `${API_BASE_URL}${API_ENDPOINTS.AUTH.REFRESH}`,
            {},
            {
              withCredentials: true,
              headers: {
                Accept: 'application/json',
                'X-Auth-Tab-Id': getAuthTabId(),
              },
            },
          )
          .then((response) => {
            const token = response.data?.data?.accessToken

            if (!token) {
              throw new Error('Refresh response did not include an access token.')
            }

            setAccessToken(token)
            return token
          })
          .finally(() => {
            refreshPromise = null
          })
      }

      const token = await refreshPromise
      originalRequest.headers.Authorization = `Bearer ${token}`
      return axiosClient(originalRequest)
    } catch (refreshError) {
      clearAccessToken()
      authenticationFailureHandler?.()
      return Promise.reject(mapApiError(refreshError))
    }
  },
)

export default axiosClient
