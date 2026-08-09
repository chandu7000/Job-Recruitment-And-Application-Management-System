import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import AppButton from '../../../components/common/AppButton'
import AppInput from '../../../components/forms/AppInput'
import PasswordInput from '../../../components/forms/PasswordInput'
import { useAuth } from '../hooks/useAuth'
import { getRoleHomePath } from '../utils'
import { loginSchema } from '../validation/authSchemas'
import ApiFormError from '../components/ApiFormError'
import AuthField from '../components/AuthField'
import AuthFormHeader from '../components/AuthFormHeader'

function LoginPage() {
  const [apiError, setApiError] = useState(null)
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  const submit = async (values) => {
    setApiError(null)
    try {
      const user = await login(values)
      const requestedPath = location.state?.from?.pathname
      navigate(requestedPath || getRoleHomePath(user.role), { replace: true })
    } catch (error) {
      const mapped = error.apiError ?? { message: 'Unable to log in.' }
      setApiError(mapped)
      if (mapped.code === 'EMAIL_NOT_VERIFIED') {
        navigate('/verify-email', { state: { email: values.email }, replace: true })
      } else if (['ACCOUNT_DISABLED', 'ACCOUNT_SUSPENDED', 'ACCOUNT_NOT_ACTIVE'].includes(mapped.code)) {
        const statusByCode = {
          ACCOUNT_DISABLED: 'DISABLED',
          ACCOUNT_SUSPENDED: 'SUSPENDED',
        }
        navigate('/account-restricted', { state: { status: statusByCode[mapped.code] ?? 'RESTRICTED' }, replace: true })
      }
    }
  }

  return (
    <>
      <AuthFormHeader title="Welcome back" description="Log in to continue to CareerForge." />
      <form className="space-y-4" onSubmit={handleSubmit(submit)} noValidate>
        <ApiFormError error={apiError} />
        <AuthField id="email" label="Email address" error={errors.email}>
          <AppInput id="email" type="email" autoComplete="email" error={Boolean(errors.email)} {...register('email')} />
        </AuthField>
        <AuthField id="password" label="Password" error={errors.password}>
          <PasswordInput id="password" autoComplete="current-password" error={Boolean(errors.password)} {...register('password')} />
        </AuthField>
        <div className="text-right"><Link className="text-sm font-semibold text-brand-700 hover:underline" to="/forgot-password">Forgot password?</Link></div>
        <AppButton type="submit" loading={isSubmitting} className="w-full">Log in</AppButton>
      </form>
      <p className="mt-6 text-center text-sm text-slate-600">New to CareerForge? <Link className="font-semibold text-brand-700 hover:underline" to="/register">Create an account</Link></p>
    </>
  )
}

export default LoginPage
