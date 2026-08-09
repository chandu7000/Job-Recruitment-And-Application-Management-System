import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import AppButton from '../../../components/common/AppButton'
import AppInput from '../../../components/forms/AppInput'
import PasswordInput from '../../../components/forms/PasswordInput'
import { authApi } from '../services/authApi'
import { applyServerFieldErrors } from '../services/applyServerErrors'
import { changeEmailSchema } from '../validation/authSchemas'
import ApiFormError from './ApiFormError'
import AuthField from './AuthField'

function ChangeEmailForm() {
  const [apiError, setApiError] = useState(null)
  const [requested, setRequested] = useState(false)
  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(changeEmailSchema), defaultValues: { newEmail: '', currentPassword: '' },
  })

  const submit = async (values) => {
    setApiError(null)
    try { await authApi.requestEmailChange(values); setRequested(true) }
    catch (error) { setApiError(error.apiError ?? { message: 'Unable to request the email change.' }); applyServerFieldErrors(error, setError) }
  }

  if (requested) return <p role="status" className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm leading-6 text-green-800">A verification link was sent to your new email. Your email changes only after you open that link. All sessions will then be signed out.</p>

  return (
    <form className="space-y-4" onSubmit={handleSubmit(submit)} noValidate>
      <ApiFormError error={apiError} />
      <AuthField id="newEmail" label="New email address" error={errors.newEmail}><AppInput id="newEmail" type="email" autoComplete="email" error={Boolean(errors.newEmail)} {...register('newEmail')} /></AuthField>
      <AuthField id="emailCurrentPassword" label="Current password" error={errors.currentPassword}><PasswordInput id="emailCurrentPassword" autoComplete="current-password" error={Boolean(errors.currentPassword)} {...register('currentPassword')} /></AuthField>
      <AppButton type="submit" loading={isSubmitting}>Send verification link</AppButton>
    </form>
  )
}

export default ChangeEmailForm
