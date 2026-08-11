export const INTERVIEW_STATUSES = Object.freeze({
  SCHEDULED: 'SCHEDULED', RESCHEDULED: 'RESCHEDULED', CONFIRMED: 'CONFIRMED',
  DECLINED: 'DECLINED', CANCELLED: 'CANCELLED', COMPLETED: 'COMPLETED',
})
export const INTERVIEW_STATUS_VALUES = Object.freeze(Object.values(INTERVIEW_STATUSES))
export const MEETING_TYPES = Object.freeze({ ONLINE: 'ONLINE', IN_PERSON: 'IN_PERSON', PHONE: 'PHONE' })
export const MEETING_TYPE_VALUES = Object.freeze(Object.values(MEETING_TYPES))

export const interviewStatusLabel = (value) => ({
  SCHEDULED: 'Scheduled', RESCHEDULED: 'Rescheduled', CONFIRMED: 'Confirmed', DECLINED: 'Declined', CANCELLED: 'Cancelled', COMPLETED: 'Completed',
}[value] || value || 'Unknown')

export const meetingTypeLabel = (value) => ({ ONLINE: 'Online', IN_PERSON: 'In person', PHONE: 'Phone' }[value] || value || '—')

export const getRecruiterInterviewActions = (interview) => {
  if (!interview) return []
  const status = interview.status
  return {
    SCHEDULED: ['reschedule', 'cancel'],
    RESCHEDULED: ['reschedule', 'cancel'],
    CONFIRMED: ['reschedule', 'cancel', 'complete'],
    DECLINED: ['reschedule', 'cancel'],
    CANCELLED: [], COMPLETED: ['feedback'],
  }[status] || []
}

export const getCandidateInterviewActions = (interview) => {
  if (!interview || new Date(interview.scheduledStartAt).getTime() <= Date.now()) return []
  return ['SCHEDULED', 'RESCHEDULED'].includes(interview.status) ? ['confirm', 'decline'] : []
}

export function normalizeInterview(value) {
  if (!value || typeof value !== 'object') return null
  return { ...value, history: Array.isArray(value.history) ? value.history : [] }
}

export function normalizePagination(meta = {}) {
  const page = Number(meta.page) || 1
  const limit = Number(meta.limit) || 10
  const total = Number(meta.totalRecords ?? meta.total ?? meta.totalItems ?? 0) || 0
  const totalPages = Number(meta.totalPages) || Math.max(1, Math.ceil(total / limit))
  return { page, limit, total, totalPages }
}

export function toIsoSchedule({ date, startTime, endTime }) {
  if (!date || !startTime || !endTime) return { scheduledStartAt: '', scheduledEndAt: '' }
  return {
    scheduledStartAt: new Date(`${date}T${startTime}`).toISOString(),
    scheduledEndAt: new Date(`${date}T${endTime}`).toISOString(),
  }
}

export function localScheduleDefaults(interview) {
  const start = interview?.scheduledStartAt ? new Date(interview.scheduledStartAt) : null
  const end = interview?.scheduledEndAt ? new Date(interview.scheduledEndAt) : null
  const pad = (n) => String(n).padStart(2, '0')
  const date = start ? `${start.getFullYear()}-${pad(start.getMonth()+1)}-${pad(start.getDate())}` : ''
  return {
    date,
    startTime: start ? `${pad(start.getHours())}:${pad(start.getMinutes())}` : '',
    endTime: end ? `${pad(end.getHours())}:${pad(end.getMinutes())}` : '',
    timezone: interview?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata',
    meetingType: interview?.meetingType || 'ONLINE',
    meetingLink: interview?.meetingLink || '', physicalLocation: interview?.physicalLocation || '',
    phoneInstructions: interview?.phoneInstructions || '', interviewInstructions: interview?.interviewInstructions || '',
    reason: '',
  }
}
