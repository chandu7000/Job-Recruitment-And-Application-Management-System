import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useLocation, useParams, useSearchParams } from 'react-router-dom'
import AppButton from '../../../components/common/AppButton'
import AppInput from '../../../components/forms/AppInput'
import { authApi } from '../services/authApi'
import { clearAccessToken } from '../services/tokenStore'
import { resendVerificationSchema, verificationTokenSchema } from '../validation/authSchemas'
import ApiFormError from '../components/ApiFormError'
import AuthField from '../components/AuthField'
import AuthFormHeader from '../components/AuthFormHeader'

const verificationRequests = new Map()

function verifyEmailOnce(token) {
  if (!verificationRequests.has(token)) {
    const request = authApi
      .verifyEmail({ token })
      .finally(() => {
        verificationRequests.delete(token)
      })

    verificationRequests.set(token, request)
  }

  return verificationRequests.get(token)
}

function VerifyEmailPage() {
  const [searchParams] = useSearchParams()
  const { token: routeToken } = useParams()
  const location = useLocation()
  const token = routeToken ?? searchParams.get('token') ?? ''
  const tokenValidation = verificationTokenSchema.safeParse({ token })
  const [status, setStatus] = useState(
    token ? (tokenValidation.success ? 'verifying' : 'failed') : 'awaiting',
  )
  const [apiError, setApiError] = useState(
    token && !tokenValidation.success
      ? { message: tokenValidation.error.issues[0].message }
      : null,
  )
  const [resendMessage, setResendMessage] = useState('')
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(resendVerificationSchema),
    defaultValues: { email: location.state?.email ?? '' },
  })

  useEffect(() => {
    if (!token || !tokenValidation.success) return undefined

    let active = true

    verifyEmailOnce(token)
      .then(() => {
        if (active) {
          clearAccessToken()
          setApiError(null)
          setStatus('verified')
        }
      })
      .catch((error) => {
        if (!active) return

        const apiError = error.apiError ?? {
          message: 'Unable to verify your email.',
        }

        if (apiError.code === 'VERIFICATION_TOKEN_EXPIRED') {
          apiError.message = 'This verification link has expired. Request a new verification email.'
        } else if (apiError.code === 'INVALID_VERIFICATION_TOKEN') {
          apiError.message = 'This verification link is invalid or has already been used. If you still need verification, request a new email.'
        }

        setApiError(apiError)
        setStatus('failed')
      })

    return () => {
      active = false
    }
  }, [token, tokenValidation.success])

  const resend = async (values) => {
    setApiError(null)
    setResendMessage('')

    try {
      await authApi.resendVerification(values)
      setResendMessage(
        'If this account requires verification, a new email has been sent.',
      )
    } catch (error) {
      setApiError(
        error.apiError ?? { message: 'Unable to resend verification.' },
      )
    }
  }

  if (status === 'verifying') {
    return (
      <AuthFormHeader
        title="Verifying your email"
        description="Please wait while we validate your secure link."
      />
    )
  }

  if (status === 'verified') {
    return (
      <>
        <AuthFormHeader
          title="Email verified successfully"
          description="Your CareerForge account is now active. For security, please log in to start a new session."
        />
        <Link
          className="block rounded-lg bg-brand-600 px-4 py-2.5 text-center font-semibold text-white"
          to="/login"
        >
          Continue to login
        </Link>
      </>
    )
  }

  const registrationDescription =
    location.state?.verificationEmailSent === false
      ? 'Your account was created, but the verification email could not be delivered. Use the form below to request a new one.'
      : 'Your account was created. We sent a verification link to your email address.'

  return (
    <>
      <AuthFormHeader
        title="Verify your email"
        description={
          location.state?.registrationComplete
            ? registrationDescription
            : 'Use the secure link sent to your email, or request a new one.'
        }
      />
      <form className="space-y-4" onSubmit={handleSubmit(resend)} noValidate>
        <ApiFormError error={apiError} />
        {resendMessage && (
          <p
            role="status"
            className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700"
          >
            {resendMessage}
          </p>
        )}
        <AuthField id="email" label="Email address" error={errors.email}>
          <AppInput
            id="email"
            type="email"
            autoComplete="email"
            error={Boolean(errors.email)}
            {...register('email')}
          />
        </AuthField>
        <AppButton
          type="submit"
          variant="secondary"
          loading={isSubmitting}
          className="w-full"
        >
          Resend verification email
        </AppButton>
      </form>
      <Link
        className="mt-6 block text-center text-sm font-semibold text-brand-700 hover:underline"
        to="/login"
      >
        Return to login
      </Link>
    </>
  )
}

export default VerifyEmailPage
