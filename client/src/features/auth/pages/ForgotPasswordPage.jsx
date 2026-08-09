import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import AppButton from '../../../components/common/AppButton'
import AppInput from '../../../components/forms/AppInput'
import { authApi } from '../services/authApi'
import { forgotPasswordSchema } from '../validation/authSchemas'
import ApiFormError from '../components/ApiFormError'
import AuthField from '../components/AuthField'
import AuthFormHeader from '../components/AuthFormHeader'

function ForgotPasswordPage() {
  const [apiError, setApiError] = useState(null)
  const [sent, setSent] = useState(false)
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(forgotPasswordSchema), defaultValues: { email: '' },
  })

  const submit = async (values) => {
    setApiError(null)
    try { await authApi.forgotPassword(values); setSent(true) }
    catch (error) { setApiError(error.apiError ?? { message: 'Unable to request a reset link.' }) }
  }

  if (sent) return <><AuthFormHeader title="Check your email" description="If an active account exists for that email, a password-reset link has been sent." /><Link className="block text-center font-semibold text-brand-700 hover:underline" to="/login">Return to login</Link></>

  return (
    <>
      <AuthFormHeader title="Forgot your password?" description="Enter your account email to request a secure reset link." />
      <form className="space-y-4" onSubmit={handleSubmit(submit)} noValidate>
        <ApiFormError error={apiError} />
        <AuthField id="email" label="Email address" error={errors.email}><AppInput id="email" type="email" autoComplete="email" error={Boolean(errors.email)} {...register('email')} /></AuthField>
        <AppButton type="submit" loading={isSubmitting} className="w-full">Send reset link</AppButton>
      </form>
      <Link className="mt-6 block text-center text-sm font-semibold text-brand-700 hover:underline" to="/login">Back to login</Link>
    </>
  )
}

export default ForgotPasswordPage
