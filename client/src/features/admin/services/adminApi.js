import axiosClient from '../../../api/axiosClient'
import { API_ENDPOINTS } from '../../../api/endpoints'
import { ADMIN_USER_PAGE_LIMIT } from '../constants/adminConstants'

const unwrap = (response) => response.data?.data

const buildUserParams = (query = {}) => {
  const params = new URLSearchParams()
  params.set('page', String(query.page || 1))
  params.set('limit', String(query.limit || ADMIN_USER_PAGE_LIMIT))

  for (const key of ['search', 'role', 'status', 'verified', 'sort']) {
    const value = query[key]
    if (value !== undefined && value !== null && String(value).trim() !== '') {
      params.set(key, String(value).trim())
    }
  }

  return params
}

const normalizePagination = (pagination = {}) => ({
  page: Number(pagination.page || 1),
  limit: Number(pagination.limit || ADMIN_USER_PAGE_LIMIT),
  totalRecords: Number(pagination.totalItems ?? pagination.total ?? 0),
  totalPages: Number(
    pagination.totalPages ??
      Math.max(1, Math.ceil(Number(pagination.total || 0) / Number(pagination.limit || ADMIN_USER_PAGE_LIMIT))),
  ),
  hasNextPage: Boolean(pagination.hasNext ?? false),
  hasPreviousPage: Boolean(pagination.hasPrevious ?? Number(pagination.page || 1) > 1),
})

export const adminApi = {
  async dashboard(signal) {
    const response = await axiosClient.get(API_ENDPOINTS.ADMIN.DASHBOARD, { signal })
    return unwrap(response)
  },

  async listUsers(query = {}, signal) {
    const response = await axiosClient.get(API_ENDPOINTS.ADMIN.USERS, {
      params: buildUserParams(query),
      signal,
    })
    const data = unwrap(response) ?? {}
    return {
      users: Array.isArray(data.users) ? data.users : [],
      pagination: normalizePagination(data.pagination),
    }
  },

  async getUser(userId, signal) {
    const response = await axiosClient.get(API_ENDPOINTS.ADMIN.USER_BY_ID(userId), { signal })
    return unwrap(response)
  },

  async activateUser(userId) {
    const response = await axiosClient.patch(API_ENDPOINTS.ADMIN.ACTIVATE_USER(userId))
    return unwrap(response)
  },

  async disableUser(userId) {
    const response = await axiosClient.patch(API_ENDPOINTS.ADMIN.DISABLE_USER(userId))
    return unwrap(response)
  },

  async suspendUser(userId) {
    const response = await axiosClient.patch(API_ENDPOINTS.ADMIN.SUSPEND_USER(userId))
    return unwrap(response)
  },
}

export { buildUserParams, normalizePagination }
