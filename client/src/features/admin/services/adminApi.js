import axiosClient from '../../../api/axiosClient'
import { API_ENDPOINTS } from '../../../api/endpoints'
import { ADMIN_USER_PAGE_LIMIT } from '../constants/adminConstants'
import { ADMIN_PAGE_LIMIT } from '../constants/adminModerationConstants'

const unwrap = (response) => response.data?.data

const buildParams = (query = {}, keys = [], defaultLimit = ADMIN_PAGE_LIMIT) => {
  const params = new URLSearchParams()
  params.set('page', String(query.page || 1))
  params.set('limit', String(query.limit || defaultLimit))
  for (const key of keys) {
    const value = query[key]
    if (value !== undefined && value !== null && String(value).trim() !== '') params.set(key, String(value).trim())
  }
  return params
}

const buildUserParams = (query = {}) => buildParams(query, ['search', 'role', 'status', 'verified', 'sort'], ADMIN_USER_PAGE_LIMIT)
const buildJobParams = (query = {}) => buildParams(query, ['status', 'companyId', 'recruiterId', 'location', 'search', 'sort'])
const buildReportParams = (query = {}) => buildParams(query, ['status', 'targetType', 'category', 'reporterId', 'reviewedBy', 'sort'])
const buildAuditParams = (query = {}) => buildParams(query, ['actorId', 'actorRole', 'action', 'resourceType', 'resourceId', 'from', 'to', 'sort'])

const normalizePagination = (pagination = {}, defaultLimit = ADMIN_PAGE_LIMIT) => ({
  page: Number(pagination.page || 1),
  limit: Number(pagination.limit || defaultLimit),
  totalRecords: Number(pagination.totalItems ?? pagination.total ?? 0),
  totalPages: Number(pagination.totalPages ?? Math.max(1, Math.ceil(Number(pagination.total || 0) / Number(pagination.limit || defaultLimit)))),
  hasNextPage: Boolean(pagination.hasNext ?? (Number(pagination.page || 1) < Number(pagination.totalPages || 1))),
  hasPreviousPage: Boolean(pagination.hasPrevious ?? Number(pagination.page || 1) > 1),
})

export const adminApi = {
  async dashboard(signal) { return unwrap(await axiosClient.get(API_ENDPOINTS.ADMIN.DASHBOARD, { signal })) },
  async listUsers(query = {}, signal) {
    const data = unwrap(await axiosClient.get(API_ENDPOINTS.ADMIN.USERS, { params: buildUserParams(query), signal })) ?? {}
    return { users: Array.isArray(data.users) ? data.users : [], pagination: normalizePagination(data.pagination, ADMIN_USER_PAGE_LIMIT) }
  },
  async getUser(userId, signal) { return unwrap(await axiosClient.get(API_ENDPOINTS.ADMIN.USER_BY_ID(userId), { signal })) },
  async activateUser(userId) { return unwrap(await axiosClient.patch(API_ENDPOINTS.ADMIN.ACTIVATE_USER(userId))) },
  async disableUser(userId) { return unwrap(await axiosClient.patch(API_ENDPOINTS.ADMIN.DISABLE_USER(userId))) },
  async suspendUser(userId) { return unwrap(await axiosClient.patch(API_ENDPOINTS.ADMIN.SUSPEND_USER(userId))) },

  async listPendingCompanies(query = {}, signal) {
    const data = unwrap(await axiosClient.get(API_ENDPOINTS.ADMIN.PENDING_COMPANIES, { params: buildParams(query), signal })) ?? {}
    return { companies: Array.isArray(data.companies) ? data.companies : [], pagination: normalizePagination(data.pagination) }
  },
  async verifyCompany(companyId) { return unwrap(await axiosClient.patch(API_ENDPOINTS.ADMIN.VERIFY_COMPANY(companyId))) },
  async rejectCompany(companyId, reason) { return unwrap(await axiosClient.patch(API_ENDPOINTS.ADMIN.REJECT_COMPANY(companyId), { reason })) },

  async listJobs(query = {}, signal) {
    const data = unwrap(await axiosClient.get(API_ENDPOINTS.ADMIN.JOBS, { params: buildJobParams(query), signal })) ?? {}
    return { jobs: Array.isArray(data.jobs) ? data.jobs : [], pagination: normalizePagination(data.pagination) }
  },
  async getJob(jobId, signal) { return unwrap(await axiosClient.get(API_ENDPOINTS.ADMIN.JOB_BY_ID(jobId), { signal })) },
  async removeJob(jobId, reason) { return unwrap(await axiosClient.patch(API_ENDPOINTS.ADMIN.MODERATE_JOB(jobId), { operation: 'remove', reason })) },
  async restoreJob(jobId) { return unwrap(await axiosClient.patch(API_ENDPOINTS.ADMIN.MODERATE_JOB(jobId), { operation: 'restore' })) },

  async listReports(query = {}, signal) {
    const data = unwrap(await axiosClient.get(API_ENDPOINTS.ADMIN.REPORTS, { params: buildReportParams(query), signal })) ?? {}
    return { reports: Array.isArray(data.reports) ? data.reports : [], pagination: normalizePagination(data.pagination) }
  },
  async getReport(reportId, signal) { return unwrap(await axiosClient.get(API_ENDPOINTS.ADMIN.REPORT_BY_ID(reportId), { signal })) },
  async processReport(reportId, payload) { return unwrap(await axiosClient.patch(API_ENDPOINTS.ADMIN.PROCESS_REPORT(reportId), payload)) },

  async listAuditLogs(query = {}, signal) {
    const data = unwrap(await axiosClient.get(API_ENDPOINTS.ADMIN.AUDIT_LOGS, { params: buildAuditParams(query), signal })) ?? {}
    return { auditLogs: Array.isArray(data.auditLogs) ? data.auditLogs : [], pagination: normalizePagination(data.pagination) }
  },
  async getAuditLog(auditId, signal) { return unwrap(await axiosClient.get(API_ENDPOINTS.ADMIN.AUDIT_LOG_BY_ID(auditId), { signal })) },
}

export { buildUserParams, buildJobParams, buildReportParams, buildAuditParams, normalizePagination }
