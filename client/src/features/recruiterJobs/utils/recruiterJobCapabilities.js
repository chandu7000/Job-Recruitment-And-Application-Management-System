import {
  JOB_STATUSES,
  PUBLISHED_EDITABLE_FIELDS,
} from '../constants/recruiterJobConstants'

export function getRecruiterJobCapabilities(job) {
  const status = job?.status
  const applicationCount = Number(job?.applicationCount ?? 0)

  return {
    canEdit:
      status === JOB_STATUSES.DRAFT ||
      status === JOB_STATUSES.PUBLISHED,
    canPublish: status === JOB_STATUSES.DRAFT,
    canClose: status === JOB_STATUSES.PUBLISHED,
    canDelete:
      status === JOB_STATUSES.DRAFT &&
      applicationCount === 0,
    canReopen: false,
    editableFields:
      status === JOB_STATUSES.PUBLISHED
        ? PUBLISHED_EDITABLE_FIELDS
        : null,
  }
}

export function getJobActionRestriction(job, company) {
  if (!job) return 'Job information is unavailable.'

  if (job.status === JOB_STATUSES.REMOVED) {
    return 'This job was removed and cannot be managed by the recruiter.'
  }

  if (job.status === JOB_STATUSES.CLOSED) {
    return 'Closed jobs cannot be reopened by the current backend contract.'
  }

  if (
    job.status === JOB_STATUSES.DRAFT &&
    company &&
    company.status !== 'VERIFIED'
  ) {
    return 'The company must be verified before this draft can be published.'
  }

  return ''
}
