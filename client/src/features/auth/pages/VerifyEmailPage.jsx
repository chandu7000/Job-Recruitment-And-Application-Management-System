import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useLocation, useSearchParams } from 'react-router-dom'
import AppButton from '../../../components/common/AppButton'
import AppInput from '../../../components/forms/AppInput'
import { authApi } from '../services/authApi'
import { clearAccessToken } from '../services/tokenStore'
import { resendVerificationSchema, verificationTokenSchema } from '../validation/authSchemas'
import ApiFormError from '../components/ApiFormError'
import AuthField from '../components/AuthField'
import AuthFormHeader from '../components/AuthFormHeader'

function VerifyEmailPage() {
  const [searchParams] = useSearchParams()
  const location = useLocation()
  const token = searchParams.get('token') ?? ''
  const tokenValidation = verificationTokenSchema.safeParse({ token })
  const [status, setStatus] = useState(token ? (tokenValidation.success ? 'verifying' : 'failed') : 'awaiting')
  const [apiError, setApiError] = useState(token && !tokenValidation.success ? { message: tokenValidation.error.issues[0].message } : null)
  const [resendMessage, setResendMessage] = useState('')
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(resendVerificationSchema),
    defaultValues: { email: location.state?.email ?? '' },
  })

  useEffect(() => {
    if (!token) return
    if (!tokenValidation.success) return

    let active = true
    authApi.verifyEmail({ token }).then(() => {
      if (active) { clearAccessToken(); setStatus('verified') }
    }).catch((error) => {
      if (active) { setApiError(error.apiError ?? { message: 'Unable to verify your email.' }); setStatus('failed') }
    })
    return () => { active = false }
  }, [token, tokenValidation.success])

  const resend = async (values) => {
    setApiError(null); setResendMessage('')
    try { await authApi.resendVerification(values); setResendMessage('If this account requires verification, a new email has been sent.') }
    catch (error) { setApiError(error.apiError ?? { message: 'Unable to resend verification.' }) }
  }

  if (status === 'verifying') return <AuthFormHeader title="Verifying your email" description="Please wait while we validate your secure link." />
  if (status === 'verified') return <><AuthFormHeader title="Email verified" description="Your account is active. For security, please log in to start a new session." /><Link className="block rounded-lg bg-brand-600 px-4 py-2.5 text-center font-semibold text-white" to="/login">Continue to login</Link></>

  return (
    <>
      <AuthFormHeader title="Verify your email" description={location.state?.registrationComplete ? 'Your account was created. Check your inbox for the verification link.' : 'Use the secure link sent to your email, or request a new one.'} />
      <form className="space-y-4" onSubmit={handleSubmit(resend)} noValidate>
        <ApiFormError error={apiError} />
        {resendMessage && <p role="status" className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">{resendMessage}</p>}
        <AuthField id="email" label="Email address" error={errors.email}><AppInput id="email" type="email" autoComplete="email" error={Boolean(errors.email)} {...register('email')} /></AuthField>
        <AppButton type="submit" variant="secondary" loading={isSubmitting} className="w-full">Resend verification email</AppButton>
      </form>
      <Link className="mt-6 block text-center text-sm font-semibold text-brand-700 hover:underline" to="/login">Return to login</Link>
    </>
  )
}

export default VerifyEmailPage
