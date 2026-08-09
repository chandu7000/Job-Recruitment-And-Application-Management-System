import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import AppButton from '../../../components/common/AppButton'
import AppInput from '../../../components/forms/AppInput'
import PasswordInput from '../../../components/forms/PasswordInput'
import { authApi } from '../services/authApi'
import { clearAccessToken } from '../services/tokenStore'
import { applyServerFieldErrors } from '../services/applyServerErrors'
import { registrationSchema } from '../validation/authSchemas'
import ApiFormError from '../components/ApiFormError'
import AuthField from '../components/AuthField'
import AuthFormHeader from '../components/AuthFormHeader'
import PasswordRules from '../components/PasswordRules'

function RegistrationPage({ accountType }) {
  const [apiError, setApiError] = useState(null)
  const navigate = useNavigate()
  const isRecruiter = accountType === 'recruiter'
  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(registrationSchema),
    defaultValues: { email: '', password: '', confirmPassword: '' },
  })

  const submit = async ({ email, password }) => {
    setApiError(null)
    try {
      const registerAccount = isRecruiter ? authApi.registerRecruiter : authApi.registerJobSeeker
      await registerAccount({ email, password })
      clearAccessToken()
      navigate('/verify-email', { replace: true, state: { email, registrationComplete: true } })
    } catch (error) {
      setApiError(error.apiError ?? { message: 'Unable to create your account.' })
      applyServerFieldErrors(error, setError)
    }
  }

  return (
    <>
      <AuthFormHeader title={isRecruiter ? 'Recruiter registration' : 'Job-seeker registration'} description="Create your secure CareerForge account." />
      <form className="space-y-4" onSubmit={handleSubmit(submit)} noValidate>
        <ApiFormError error={apiError} />
        <AuthField id="email" label="Email address" error={errors.email}>
          <AppInput id="email" type="email" autoComplete="email" error={Boolean(errors.email)} {...register('email')} />
        </AuthField>
        <AuthField id="password" label="Password" error={errors.password} hint={<PasswordRules />}>
          <PasswordInput id="password" autoComplete="new-password" error={Boolean(errors.password)} {...register('password')} />
        </AuthField>
        <AuthField id="confirmPassword" label="Confirm password" error={errors.confirmPassword}>
          <PasswordInput id="confirmPassword" autoComplete="new-password" error={Boolean(errors.confirmPassword)} {...register('confirmPassword')} />
        </AuthField>
        <AppButton type="submit" loading={isSubmitting} className="w-full">Create account</AppButton>
      </form>
      <p className="mt-6 text-center text-sm text-slate-600">Already registered? <Link className="font-semibold text-brand-700 hover:underline" to="/login">Log in</Link></p>
    </>
  )
}

export default RegistrationPage
