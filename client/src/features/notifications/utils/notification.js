import { formatDistanceToNow } from 'date-fns'

export const NOTIFICATION_TYPES = Object.freeze([
  'EMAIL_VERIFIED',
  'PASSWORD_RESET',
  'COMPANY_APPROVED',
  'COMPANY_REJECTED',
  'JOB_APPLICATION_SUBMITTED',
  'APPLICATION_STATUS_CHANGED',
  'CANDIDATE_SHORTLISTED',
  'INTERVIEW_SCHEDULED',
  'INTERVIEW_RESCHEDULED',
  'INTERVIEW_CANCELLED',
  'INTERVIEW_CONFIRMED',
  'INTERVIEW_DECLINED',
  'CANDIDATE_SELECTED',
  'CANDIDATE_REJECTED',
  'JOB_CLOSED',
  'APPLICATION_WITHDRAWN',
])

const labels = Object.freeze({
  EMAIL_VERIFIED: 'Email verified',
  PASSWORD_RESET: 'Password reset',
  COMPANY_APPROVED: 'Company approved',
  COMPANY_REJECTED: 'Company rejected',
  JOB_APPLICATION_SUBMITTED: 'Application submitted',
  APPLICATION_STATUS_CHANGED: 'Application updated',
  CANDIDATE_SHORTLISTED: 'Candidate shortlisted',
  INTERVIEW_SCHEDULED: 'Interview scheduled',
  INTERVIEW_RESCHEDULED: 'Interview rescheduled',
  INTERVIEW_CANCELLED: 'Interview cancelled',
  INTERVIEW_CONFIRMED: 'Interview confirmed',
  INTERVIEW_DECLINED: 'Interview declined',
  CANDIDATE_SELECTED: 'Candidate selected',
  CANDIDATE_REJECTED: 'Candidate rejected',
  JOB_CLOSED: 'Job closed',
  APPLICATION_WITHDRAWN: 'Application withdrawn',
})

export function normalizeNotification(notification) {
  if (!notification || typeof notification !== 'object') return null
  return {
    ...notification,
    isRead: Boolean(notification.isRead),
    readAt: notification.readAt ?? null,
    resourceType: notification.resourceType ?? null,
    resourceId: notification.resourceId ?? null,
  }
}

export function normalizeNotificationPagination(meta = {}) {
  return {
    page: Number(meta.page) || 1,
    limit: Number(meta.limit) || 10,
    totalItems: Number(meta.totalItems) || 0,
    totalPages: Number(meta.totalPages) || 1,
    hasNext: Boolean(meta.hasNext),
    hasPrevious: Boolean(meta.hasPrevious),
  }
}

export function getNotificationLabel(type) {
  return labels[type] || 'Notification'
}

export function formatNotificationTime(value) {
  if (!value) return 'Unknown time'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Unknown time'
  return formatDistanceToNow(date, { addSuffix: true })
}

export function resolveNotificationTarget(notification, role) {
  const { resourceType, resourceId } = notification || {}
  if (!resourceType || !resourceId) return null

  if (role === 'JOB_SEEKER') {
    if (resourceType === 'APPLICATION') return `/job-seeker/applications/${encodeURIComponent(resourceId)}`
    if (resourceType === 'INTERVIEW') return `/job-seeker/interviews/${encodeURIComponent(resourceId)}`
    return null
  }

  if (role === 'RECRUITER') {
    if (resourceType === 'APPLICATION') return `/recruiter/applications/${encodeURIComponent(resourceId)}`
    if (resourceType === 'INTERVIEW') return `/recruiter/interviews/${encodeURIComponent(resourceId)}`
    if (resourceType === 'JOB') return `/recruiter/jobs/${encodeURIComponent(resourceId)}`
    if (resourceType === 'COMPANY') return '/recruiter/company'
  }

  return null
}

export function notificationCenterPath(role) {
  if (role === 'JOB_SEEKER') return '/job-seeker/notifications'
  if (role === 'RECRUITER') return '/recruiter/notifications'
  if (role === 'ADMIN') return '/admin/notifications'
  return null
}
