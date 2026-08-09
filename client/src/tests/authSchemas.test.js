import { describe, expect, it } from 'vitest'
import {
  changeEmailSchema,
  changePasswordSchema,
  forgotPasswordSchema,
  loginSchema,
  registrationSchema,
  resetPasswordSchema,
  verificationTokenSchema,
} from '../features/auth/validation/authSchemas'

const strongPassword = 'Career@123'
const token = 'a'.repeat(64)

describe('authentication validation schemas', () => {
  it('accepts valid login and registration data', () => {
    expect(loginSchema.safeParse({ email: 'person@example.com', password: strongPassword }).success).toBe(true)
    expect(registrationSchema.safeParse({ email: 'person@example.com', password: strongPassword, confirmPassword: strongPassword }).success).toBe(true)
  })

  it('rejects invalid email and weak passwords', () => {
    const result = registrationSchema.safeParse({ email: 'invalid', password: 'weak', confirmPassword: 'weak' })
    expect(result.success).toBe(false)
    expect(result.error.issues.some((issue) => issue.path[0] === 'email')).toBe(true)
    expect(result.error.issues.some((issue) => issue.path[0] === 'password')).toBe(true)
  })

  it('requires matching registration passwords', () => {
    const result = registrationSchema.safeParse({ email: 'person@example.com', password: strongPassword, confirmPassword: 'Different@123' })
    expect(result.success).toBe(false)
    expect(result.error.issues[0].path).toEqual(['confirmPassword'])
  })

  it('validates reset tokens and matching reset passwords', () => {
    expect(resetPasswordSchema.safeParse({ token, password: strongPassword, confirmPassword: strongPassword }).success).toBe(true)
    expect(verificationTokenSchema.safeParse({ token: 'not-a-token' }).success).toBe(false)
  })

  it('prevents password reuse and requires confirmation', () => {
    const result = changePasswordSchema.safeParse({ currentPassword: strongPassword, newPassword: strongPassword, confirmNewPassword: strongPassword })
    expect(result.success).toBe(false)
    expect(result.error.issues.some((issue) => issue.path[0] === 'newPassword')).toBe(true)
  })

  it('validates forgot-password and email-change values', () => {
    expect(forgotPasswordSchema.safeParse({ email: 'person@example.com' }).success).toBe(true)
    expect(changeEmailSchema.safeParse({ newEmail: 'new@example.com', currentPassword: strongPassword }).success).toBe(true)
    expect(changeEmailSchema.safeParse({ newEmail: '', currentPassword: '' }).success).toBe(false)
  })
})
