import { z } from 'zod'

const emailSchema = z
  .string()
  .trim()
  .min(1, 'Email is required.')
  .email('Enter a valid email address.')

const passwordSchema = z
  .string()
  .min(1, 'Password is required.')
  .min(8, 'Password must contain at least 8 characters.')
  .max(72, 'Password must not exceed 72 characters.')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter.')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter.')
  .regex(/\d/, 'Password must contain at least one number.')
  .regex(
    /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/,
    'Password must contain at least one special character.',
  )

const tokenSchema = z
  .string()
  .trim()
  .length(64, 'Token must contain exactly 64 characters.')
  .regex(/^[a-fA-F0-9]+$/, 'Token must contain only hexadecimal characters.')

const addPasswordConfirmation = (schema, passwordField, confirmationField) =>
  schema.refine((values) => values[passwordField] === values[confirmationField], {
    path: [confirmationField],
    message: 'Passwords do not match.',
  })

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required.'),
})

export const registrationSchema = addPasswordConfirmation(
  z.object({
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Confirm your password.'),
  }),
  'password',
  'confirmPassword',
)

export const jobSeekerRegistrationSchema = registrationSchema
export const recruiterRegistrationSchema = registrationSchema

export const forgotPasswordSchema = z.object({ email: emailSchema })

export const resetPasswordSchema = addPasswordConfirmation(
  z.object({
    token: tokenSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Confirm your password.'),
  }),
  'password',
  'confirmPassword',
)

export const changePasswordSchema = addPasswordConfirmation(
  z
    .object({
      currentPassword: z.string().min(1, 'Current password is required.'),
      newPassword: passwordSchema,
      confirmNewPassword: z.string().min(1, 'Confirm your new password.'),
    })
    .refine((values) => values.currentPassword !== values.newPassword, {
      path: ['newPassword'],
      message: 'New password must be different from the current password.',
    }),
  'newPassword',
  'confirmNewPassword',
)

export const changeEmailSchema = z.object({
  newEmail: emailSchema,
  currentPassword: z.string().min(1, 'Current password is required.'),
})

export const resendVerificationSchema = z.object({ email: emailSchema })
export const verificationTokenSchema = z.object({ token: tokenSchema })

export { emailSchema, passwordSchema, tokenSchema }
