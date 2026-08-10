import { z } from 'zod'

export const COVER_LETTER_MAX_LENGTH = 5000

export const applicationSchema = z.object({
  coverLetter: z.string().max(
    COVER_LETTER_MAX_LENGTH,
    `Cover letter must not exceed ${COVER_LETTER_MAX_LENGTH} characters.`,
  ),
})
