import { describe, expect, it } from 'vitest'
import {
  changePasswordSchema,
  forgotPasswordSchema,
  loginSchema,
  registrationSchema,
  resetPasswordSchema,
  verificationTokenSchema,
} from '../features/auth/validation/authSchemas'

describe('authentication validation schemas', () => {
  const strongPassword = 'StrongPass1!'

  const validRegistration = {
    firstName: 'FraudShield',
    lastName: 'User',
    phoneNumber: '9876543210',
    email: 'person@example.com',
    password: strongPassword,
    confirmPassword: strongPassword,
  }

  it('accepts valid login and registration data', () => {
    expect(
      loginSchema.safeParse({
        email: 'person@example.com',
        password: strongPassword,
      }).success,
    ).toBe(true)

    expect(
      registrationSchema.safeParse(validRegistration).success,
    ).toBe(true)
  })

  it('rejects invalid email and weak passwords', () => {
    expect(
      loginSchema.safeParse({
        email: 'invalid-email',
        password: 'weak',
      }).success,
    ).toBe(false)
  })

  it('requires matching registration passwords', () => {
    const result = registrationSchema.safeParse({
      ...validRegistration,
      confirmPassword: 'DifferentPass1!',
    })

    expect(result.success).toBe(false)
    expect(result.error.issues[0].path).toEqual(['confirmPassword'])
  })

  it('validates reset tokens and matching reset passwords', () => {
    expect(
      verificationTokenSchema.safeParse({
        token: 'a'.repeat(64),
      }).success,
    ).toBe(true)

    expect(
      resetPasswordSchema.safeParse({
        token: 'a'.repeat(64),
        password: strongPassword,
        confirmPassword: strongPassword,
      }).success,
    ).toBe(true)

    expect(
      resetPasswordSchema.safeParse({
        token: 'a'.repeat(64),
        password: strongPassword,
        confirmPassword: 'DifferentPass1!',
      }).success,
    ).toBe(false)
  })

  it('prevents password reuse and requires confirmation', () => {
    expect(
      changePasswordSchema.safeParse({
        currentPassword: strongPassword,
        newPassword: 'AnotherPass1!',
        confirmNewPassword: 'AnotherPass1!',
      }).success,
    ).toBe(true)

    expect(
      changePasswordSchema.safeParse({
        currentPassword: strongPassword,
        newPassword: strongPassword,
        confirmNewPassword: strongPassword,
      }).success,
    ).toBe(false)

    expect(
      changePasswordSchema.safeParse({
        currentPassword: strongPassword,
        newPassword: 'AnotherPass1!',
        confirmNewPassword: 'DifferentPass1!',
      }).success,
    ).toBe(false)
  })

  it('validates forgot-password and email-change values', () => {
    expect(
      forgotPasswordSchema.safeParse({
        email: 'person@example.com',
      }).success,
    ).toBe(true)

    expect(
      forgotPasswordSchema.safeParse({
        email: 'invalid-email',
      }).success,
    ).toBe(false)
  })
})