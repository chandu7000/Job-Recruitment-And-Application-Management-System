import { z } from 'zod'

const optionalText = (max) => z.string().trim().max(max)
const baseSchedule = z.object({
  date: z.string().min(1, 'Select an interview date.'),
  startTime: z.string().min(1, 'Select a start time.'),
  endTime: z.string().min(1, 'Select an end time.'),
  timezone: z.string().trim().min(1, 'Timezone is required.').max(100),
  meetingType: z.enum(['ONLINE', 'IN_PERSON', 'PHONE']),
  meetingLink: optionalText(2048), physicalLocation: optionalText(500), phoneInstructions: optionalText(500), interviewInstructions: optionalText(5000),
}).superRefine((data, ctx) => {
  const start = new Date(`${data.date}T${data.startTime}`)
  const end = new Date(`${data.date}T${data.endTime}`)
  if (!Number.isFinite(start.getTime()) || start <= new Date()) ctx.addIssue({ code: 'custom', path: ['startTime'], message: 'Interview start must be in the future.' })
  const minutes = (end - start) / 60000
  if (minutes < 15 || minutes > 480) ctx.addIssue({ code: 'custom', path: ['endTime'], message: 'Interview duration must be between 15 minutes and 8 hours.' })
  if (data.meetingType === 'ONLINE' && !/^https:\/\//i.test(data.meetingLink)) ctx.addIssue({ code: 'custom', path: ['meetingLink'], message: 'A valid HTTPS meeting link is required.' })
  if (data.meetingType === 'IN_PERSON' && !data.physicalLocation) ctx.addIssue({ code: 'custom', path: ['physicalLocation'], message: 'Physical location is required.' })
  if (data.meetingType === 'PHONE' && !data.phoneInstructions) ctx.addIssue({ code: 'custom', path: ['phoneInstructions'], message: 'Phone instructions are required.' })
})
export const scheduleInterviewSchema = baseSchedule
export const rescheduleInterviewSchema = baseSchedule.and(z.object({ reason: z.string().trim().min(1, 'Reason is required.').max(1000) }))
export const interviewReasonSchema = z.object({ reason: z.string().trim().min(1, 'Reason is required.').max(1000) })
export const interviewFeedbackSchema = z.object({
  feedback: optionalText(5000), rating: z.coerce.number().int().min(1).max(5), strengths: optionalText(3000), concerns: optionalText(3000), recommendation: optionalText(1000), feedbackVisibleToCandidate: z.boolean(),
})
