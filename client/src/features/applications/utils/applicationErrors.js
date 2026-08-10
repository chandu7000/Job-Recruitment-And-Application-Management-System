export const APPLICATION_ERROR_GUIDANCE = Object.freeze({
  APPLICANT_ACCOUNT_NOT_ACTIVE: 'Your account must be active before you can apply.',
  APPLICANT_PROFILE_REQUIRED: 'Complete your job-seeker profile before applying.',
  APPLICANT_PROFILE_INCOMPLETE: 'Add your first name, last name, and resume before applying.',
  APPLICATION_ALREADY_EXISTS: 'You have already applied to this job.',
  PUBLIC_JOB_NOT_FOUND: 'This job is no longer available for applications.',
  JOB_NOT_FOUND: 'This job could not be found.',
})

export function getApplicationErrorGuidance(error) {
  const code = error?.apiError?.code ?? error?.response?.data?.code
  return APPLICATION_ERROR_GUIDANCE[code] ?? error?.apiError?.message ?? error?.response?.data?.message ?? 'Unable to complete this application request.'
}
