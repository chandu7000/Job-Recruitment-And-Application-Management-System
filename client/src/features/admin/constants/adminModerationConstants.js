export const ADMIN_PAGE_LIMIT = 20

export const COMPANY_REJECTION_REASON_MIN = 5
export const COMPANY_REJECTION_REASON_MAX = 2000
export const JOB_REMOVAL_REASON_MAX = 2000

export const JOB_STATUSES = Object.freeze(['DRAFT', 'PUBLISHED', 'CLOSED', 'REMOVED'])
export const REPORT_STATUSES = Object.freeze(['OPEN', 'UNDER_REVIEW', 'RESOLVED', 'DISMISSED'])
export const REPORT_TARGET_TYPES = Object.freeze(['JOB', 'COMPANY'])
export const REPORT_CATEGORIES = Object.freeze([
  'FRAUD_OR_SCAM',
  'MISLEADING_INFORMATION',
  'DISCRIMINATION',
  'INAPPROPRIATE_CONTENT',
  'DUPLICATE_OR_SPAM',
  'IMPERSONATION',
  'OTHER',
])

export const AUDIT_ACTIONS = Object.freeze([
  'USER_ENABLED', 'USER_DISABLED', 'USER_SUSPENDED', 'USER_RESTORED',
  'COMPANY_VERIFIED', 'COMPANY_REJECTED', 'COMPANY_SUSPENDED', 'COMPANY_RESTORED',
  'JOB_REMOVED', 'JOB_RESTORED', 'REPORT_SUBMITTED', 'REPORT_UNDER_REVIEW',
  'REPORT_RESOLVED', 'REPORT_DISMISSED', 'AUTH_SECURITY_EVENT',
  'APPLICATION_ACTION', 'INTERVIEW_ACTION',
])
export const AUDIT_RESOURCE_TYPES = Object.freeze(['USER', 'COMPANY', 'JOB', 'REPORT', 'AUTH', 'APPLICATION', 'INTERVIEW'])
export const AUDIT_ACTOR_ROLES = Object.freeze(['ADMIN', 'RECRUITER', 'JOB_SEEKER'])

export const humanize = (value) =>
  value ? String(value).toLowerCase().split('_').map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(' ') : '—'
