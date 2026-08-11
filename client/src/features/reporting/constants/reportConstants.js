export const REPORT_TARGET_TYPES = Object.freeze({
  JOB: 'JOB',
  COMPANY: 'COMPANY',
})

export const REPORT_CATEGORIES = Object.freeze([
  { value: 'FRAUD_OR_SCAM', label: 'Fraud or scam' },
  { value: 'MISLEADING_INFORMATION', label: 'Misleading information' },
  { value: 'DISCRIMINATION', label: 'Discrimination' },
  { value: 'INAPPROPRIATE_CONTENT', label: 'Inappropriate content' },
  { value: 'DUPLICATE_OR_SPAM', label: 'Duplicate or spam' },
  { value: 'IMPERSONATION', label: 'Impersonation' },
  { value: 'OTHER', label: 'Other' },
])

export const REPORT_CATEGORY_VALUES = Object.freeze(
  REPORT_CATEGORIES.map(({ value }) => value),
)

export const REPORT_DESCRIPTION_LIMITS = Object.freeze({
  MIN: 10,
  MAX: 2000,
})

export const REPORTER_ROLES = Object.freeze(['JOB_SEEKER', 'RECRUITER'])
