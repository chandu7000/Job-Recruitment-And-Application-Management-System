import { z } from 'zod'

export const withdrawalSchema = z.object({
  reason: z.string().trim().max(1000, 'Withdrawal reason must be 1000 characters or fewer.'),
})
