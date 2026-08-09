export const STATUS_LABELS = Object.freeze({
  PENDING_VERIFICATION: 'Pending verification',
  ACTIVE: 'Active',
  DISABLED: 'Disabled',
  SUSPENDED: 'Suspended',

  DRAFT: 'Draft',
  VERIFIED: 'Verified',
  REJECTED: 'Rejected',

  PUBLISHED: 'Published',
  CLOSED: 'Closed',
  REMOVED: 'Removed',

  APPLIED: 'Applied',
  UNDER_REVIEW: 'Under review',
  SHORTLISTED: 'Shortlisted',
  INTERVIEW_SCHEDULED: 'Interview scheduled',
  INTERVIEW_COMPLETED: 'Interview completed',
  SELECTED: 'Selected',
  WITHDRAWN: 'Withdrawn',

  SCHEDULED: 'Scheduled',
  RESCHEDULED: 'Rescheduled',
  CONFIRMED: 'Confirmed',
  DECLINED: 'Declined',
  CANCELLED: 'Cancelled',
  COMPLETED: 'Completed',

  OPEN: 'Open',
  RESOLVED: 'Resolved',
  DISMISSED: 'Dismissed',
})

export function formatStatusLabel(status, fallback = 'Unknown') {
  if (!status || typeof status !== 'string') {
    return fallback
  }

  return (
    STATUS_LABELS[status] ??
    status
      .toLowerCase()
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  )
}