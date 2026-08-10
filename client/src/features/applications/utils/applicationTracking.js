export const APPLICATION_STATUSES = Object.freeze([
  'APPLIED',
  'UNDER_REVIEW',
  'SHORTLISTED',
  'INTERVIEW',
  'INTERVIEW_SCHEDULED',
  'INTERVIEW_COMPLETED',
  'OFFERED',
  'HIRED',
  'REJECTED',
  'WITHDRAWN',
])

export const WITHDRAWABLE_APPLICATION_STATUSES = Object.freeze([
  'APPLIED',
  'UNDER_REVIEW',
  'SHORTLISTED',
  'INTERVIEW',
  'INTERVIEW_SCHEDULED',
  'INTERVIEW_COMPLETED',
  'OFFERED',
])

export const APPLICATION_SORT_OPTIONS = Object.freeze([
  { value: 'createdAt:DESC', label: 'Newest applications' },
  { value: 'createdAt:ASC', label: 'Oldest applications' },
  { value: 'updatedAt:DESC', label: 'Recently updated' },
  { value: 'status:ASC', label: 'Status A–Z' },
])

export function canWithdrawApplication(status) {
  return WITHDRAWABLE_APPLICATION_STATUSES.includes(status)
}

export function formatApplicationStatus(status) {
  if (!status) return 'Unknown'
  return status.toLowerCase().split('_').map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
}

export function parseApplicationSort(value) {
  const [sort, order] = String(value || 'createdAt:DESC').split(':')
  const allowedSort = ['createdAt', 'updatedAt', 'status'].includes(sort) ? sort : 'createdAt'
  return { sort: allowedSort, order: order === 'ASC' ? 'ASC' : 'DESC' }
}

export function normalizeApplication(application) {
  if (!application || typeof application !== 'object') return null

  const candidateSafe = { ...application }

  delete candidateSafe.recruiterNotes
  delete candidateSafe.candidateSnapshot

  return {
    ...candidateSafe,
    jobSnapshot: application.jobSnapshot ?? null,
    companySnapshot: application.companySnapshot ?? null,
    resumeSnapshot: application.resumeSnapshot ?? null,
    statusHistory: Array.isArray(application.statusHistory)
      ? application.statusHistory
      : [],
  }
}

export function normalizeCandidateInterview(interview) {
  if (!interview || typeof interview !== 'object') return null
  return {
    id: interview.id,
    applicationId: interview.applicationId,
    status: interview.status,
    scheduledStartAt: interview.scheduledStartAt,
    scheduledEndAt: interview.scheduledEndAt,
    timezone: interview.timezone,
    meetingType: interview.meetingType,
    meetingLink: interview.meetingLink ?? null,
    physicalLocation: interview.physicalLocation ?? null,
    phoneInstructions: interview.phoneInstructions ?? null,
    interviewInstructions: interview.interviewInstructions ?? null,
    cancellationReason: interview.cancellationReason ?? null,
    declinedAt: interview.declinedAt ?? null,
    cancelledAt: interview.cancelledAt ?? null,
    confirmedAt: interview.confirmedAt ?? null,
    completedAt: interview.completedAt ?? null,
  }
}
