import { describe, expect, it } from 'vitest'
import {
  recruiterNoteSchema,
  recruiterTransitionSchema,
} from '../features/applications/validation/recruiterApplicationSchemas'

describe('recruiter applicant validation', () => {
  it('accepts empty or valid private notes and enforces backend length', () => {
    expect(recruiterNoteSchema.safeParse({ notes: '' }).success).toBe(true)
    expect(recruiterNoteSchema.safeParse({ notes: 'x'.repeat(5000) }).success).toBe(true)
    expect(recruiterNoteSchema.safeParse({ notes: 'x'.repeat(5001) }).success).toBe(false)
  })

  it('keeps transition reason optional and enforces 1000 characters', () => {
    expect(recruiterTransitionSchema.safeParse({ reason: '' }).success).toBe(true)
    expect(recruiterTransitionSchema.safeParse({ reason: 'x'.repeat(1001) }).success).toBe(false)
  })
})
