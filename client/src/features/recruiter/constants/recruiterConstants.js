export const COMPANY_STATUSES = Object.freeze({
  DRAFT: 'DRAFT',
  PENDING_VERIFICATION: 'PENDING_VERIFICATION',
  VERIFIED: 'VERIFIED',
  REJECTED: 'REJECTED',
  RESUBMITTED: 'RESUBMITTED',
})

export const COMPANY_STATUS_CONTENT = Object.freeze({
  DRAFT: { label: 'Draft', tone: 'slate', description: 'Complete the company details and logo before submitting for verification.' },
  PENDING_VERIFICATION: { label: 'Pending verification', tone: 'amber', description: 'Your company is being reviewed. Duplicate submissions are disabled.' },
  VERIFIED: { label: 'Verified', tone: 'green', description: 'Your company has been verified.' },
  REJECTED: { label: 'Rejected', tone: 'red', description: 'Correct the highlighted company information before resubmission.' },
  RESUBMITTED: { label: 'Resubmitted', tone: 'blue', description: 'Your corrected company information has been resubmitted.' },
})

export const COMPANY_LOGO_RULES = Object.freeze({
  fieldName: 'companyLogo',
  maximumSize: 5 * 1024 * 1024,
  acceptedTypes: ['image/jpeg', 'image/png', 'image/webp'],
  accept: '.jpg,.jpeg,.png,.webp',
})

export const editableCompanyFields = ['description', 'website', 'industry', 'location', 'companySize']

export function getCompanyCapabilities(company) {
  const status = company?.status
  return {
    canCreate: !company,
    canEdit: Boolean(company) && ![COMPANY_STATUSES.PENDING_VERIFICATION, COMPANY_STATUSES.RESUBMITTED].includes(status),
    canManageLogo: Boolean(company) && ![COMPANY_STATUSES.PENDING_VERIFICATION, COMPANY_STATUSES.RESUBMITTED].includes(status),
    canSubmit: status === COMPANY_STATUSES.DRAFT,
    isRejected: status === COMPANY_STATUSES.REJECTED,
  }
}
