import { z } from 'zod'

export const recruiterNoteSchema = z.object({
  notes: z.string().max(5000, 'Recruiter note must be 5000 characters or fewer.'),
})

export const recruiterTransitionSchema = z.object({
  reason: z.string().max(1000, 'Reason must be 1000 characters or fewer.'),
})
