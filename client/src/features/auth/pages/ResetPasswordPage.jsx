import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useSearchParams } from 'react-router-dom'
import AppButton from '../../../components/common/AppButton'
import PasswordInput from '../../../components/forms/PasswordInput'
import { authApi } from '../services/authApi'
import { useAuth } from '../hooks/useAuth'
import { resetPasswordSchema } from '../validation/authSchemas'
import ApiFormError from '../components/ApiFormError'
import AuthField from '../components/AuthField'
import AuthFormHeader from '../components/AuthFormHeader'
import PasswordRules from '../components/PasswordRules'

function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const [apiError, setApiError] = useState(null)
  const [complete, setComplete] = useState(false)
  const { forceLogout } = useAuth()
  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { token: '', password: '', confirmPassword: '' },
  })

  useEffect(() => { setValue('token', searchParams.get('token') ?? '', { shouldValidate: true }) }, [searchParams, setValue])

  const submit = async ({ token, password }) => {
    setApiError(null)
    try { await authApi.resetPassword({ token, password }); forceLogout(); setComplete(true) }
    catch (error) { setApiError(error.apiError ?? { message: 'Unable to reset your password.' }) }
  }

  if (complete) return <><AuthFormHeader title="Password reset" description="Your password was changed and all existing sessions were signed out." /><Link className="block text-center font-semibold text-brand-700 hover:underline" to="/login">Log in with new password</Link></>

  return (
    <>
      <AuthFormHeader title="Set a new password" description="Choose a strong password for your account." />
      <form className="space-y-4" onSubmit={handleSubmit(submit)} noValidate>
        <ApiFormError error={apiError} />
        {errors.token && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{errors.token.message}</p>}
        <input type="hidden" {...register('token')} />
        <AuthField id="password" label="New password" error={errors.password} hint={<PasswordRules />}><PasswordInput id="password" autoComplete="new-password" error={Boolean(errors.password)} {...register('password')} /></AuthField>
        <AuthField id="confirmPassword" label="Confirm new password" error={errors.confirmPassword}><PasswordInput id="confirmPassword" autoComplete="new-password" error={Boolean(errors.confirmPassword)} {...register('confirmPassword')} /></AuthField>
        <AppButton type="submit" loading={isSubmitting} className="w-full">Reset password</AppButton>
      </form>
    </>
  )
}

export default ResetPasswordPage
