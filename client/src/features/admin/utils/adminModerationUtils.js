const SECRET_KEYS = new Set([
  'password', 'passwordhash', 'accesstoken', 'refreshtoken', 'resettoken',
  'verificationtoken', 'authorization', 'cookie', 'cookies', 'smtppassword',
  'privatenotes',
])

export const validateCompanyRejectionReason = (value) => {
  const reason = String(value || '').trim()
  if (reason.length < 5 || reason.length > 2000) {
    return 'Rejection reason must be between 5 and 2000 characters.'
  }
  return ''
}

export const validateJobRemovalReason = (value) => {
  const reason = String(value || '').trim()
  if (!reason) return 'Removal reason is required.'
  if (reason.length > 2000) return 'Removal reason must not exceed 2000 characters.'
  return ''
}

export const sanitizeAuditMetadata = (value) => {
  if (value === null || value === undefined) return value
  if (Array.isArray(value)) return value.map(sanitizeAuditMetadata)
  if (typeof value !== 'object') return value
  return Object.fromEntries(
    Object.entries(value)
      .filter(([key]) => !SECRET_KEYS.has(String(key).toLowerCase()))
      .map(([key, item]) => [key, sanitizeAuditMetadata(item)]),
  )
}

export const reportTransitions = (status) => ({
  OPEN: ['UNDER_REVIEW', 'RESOLVED', 'DISMISSED'],
  UNDER_REVIEW: ['RESOLVED', 'DISMISSED'],
  RESOLVED: [],
  DISMISSED: [],
}[status] ?? [])
