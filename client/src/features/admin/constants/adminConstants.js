export const ADMIN_USER_ROLES = Object.freeze([
  'ADMIN',
  'RECRUITER',
  'JOB_SEEKER',
])

export const ADMIN_USER_STATUSES = Object.freeze([
  'PENDING_VERIFICATION',
  'ACTIVE',
  'DISABLED',
  'SUSPENDED',
])

export const ADMIN_VERIFICATION_FILTERS = Object.freeze([
  { value: 'true', label: 'Verified' },
  { value: 'false', label: 'Not verified' },
])

export const ADMIN_USER_PAGE_LIMIT = 20

export const roleLabel = (role) => ({
  ADMIN: 'Admin',
  RECRUITER: 'Recruiter',
  JOB_SEEKER: 'Job Seeker',
}[role] ?? role ?? '—')

export const statusLabel = (status) => ({
  PENDING_VERIFICATION: 'Pending verification',
  ACTIVE: 'Active',
  DISABLED: 'Disabled',
  SUSPENDED: 'Suspended',
}[status] ?? status ?? '—')
