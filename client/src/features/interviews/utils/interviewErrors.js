import { getApiErrorMessage } from '../../../api/errorMapper'
const messages = Object.freeze({
  INTERVIEW_SCHEDULE_CONFLICT: 'This time overlaps another interview for the recruiter or candidate. Choose a different time.',
  ACTIVE_INTERVIEW_EXISTS: 'An active interview already exists for this application.',
  APPLICATION_NOT_SHORTLISTED: 'Only shortlisted applications can be scheduled for interview.',
  CANDIDATE_NOT_ACTIVE: 'The candidate account is not active, so an interview cannot be scheduled.',
  INTERVIEW_ALREADY_STARTED: 'This interview has already started and the requested response is no longer available.',
  INTERVIEW_NOT_STARTED: 'The interview cannot be completed before its scheduled start time.',
  INTERVIEW_NOT_COMPLETED: 'Feedback can only be saved after the interview is completed.',
  INTERVIEW_OWNERSHIP_REQUIRED: 'You do not have permission to access this interview.',
  INTERVIEW_NOT_FOUND: 'The requested interview could not be found.',
  INVALID_INTERVIEW_DURATION: 'Interview duration must be between 15 minutes and 8 hours.',
  INTERVIEW_MUST_BE_FUTURE: 'Interview start time must be in the future.',
  INVALID_TIMEZONE: 'Enter a valid IANA timezone such as Asia/Kolkata.',
})
export function getInterviewErrorMessage(error) {
  const code = error?.apiError?.code ?? error?.response?.data?.code
  return messages[code] || getApiErrorMessage(error)
}
