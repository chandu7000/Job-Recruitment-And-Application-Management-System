import { formatApplicationStatus } from './applicationTracking'

export const RECRUITER_PROCESSING_STATUSES = Object.freeze([
  'APPLIED',
  'UNDER_REVIEW',
  'SHORTLISTED',
  'REJECTED',
  'WITHDRAWN',
])

export const RECRUITER_SORT_OPTIONS = Object.freeze([
  { value: 'createdAt:DESC', label: 'Newest applications' },
  { value: 'createdAt:ASC', label: 'Oldest applications' },
  { value: 'updatedAt:DESC', label: 'Recently updated' },
  { value: 'status:ASC', label: 'Status A–Z' },
])

const PHASE_TEN_TRANSITIONS = Object.freeze({
  APPLIED: ['UNDER_REVIEW', 'SHORTLISTED', 'REJECTED'],
  UNDER_REVIEW: ['SHORTLISTED', 'REJECTED'],
  SHORTLISTED: ['REJECTED'],
})

export function getRecruiterProcessingActions(status) {
  return (PHASE_TEN_TRANSITIONS[status] || []).map((value) => ({
    value,
    label: value === 'UNDER_REVIEW' ? 'Move to under review' : formatApplicationStatus(value),
    sensitive: value === 'REJECTED',
  }))
}

export function normalizeRecruiterApplication(application) {
  if (!application || typeof application !== 'object') return null
  return {
    ...application,
    candidateSnapshot: application.candidateSnapshot ?? null,
    candidateProfile: application.candidateProfile ?? null,
    jobSnapshot: application.jobSnapshot ?? null,
    companySnapshot: application.companySnapshot ?? null,
    resumeSnapshot: application.resumeSnapshot ?? null,
    statusHistory: Array.isArray(application.statusHistory) ? application.statusHistory : [],
  }
}
