import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import AppButton from '../../../components/common/AppButton'
import PasswordInput from '../../../components/forms/PasswordInput'
import { useAuth } from '../hooks/useAuth'
import { authApi } from '../services/authApi'
import { applyServerFieldErrors } from '../services/applyServerErrors'
import { changePasswordSchema } from '../validation/authSchemas'
import ApiFormError from './ApiFormError'
import AuthField from './AuthField'
import PasswordRules from './PasswordRules'

function ChangePasswordForm() {
  const [apiError, setApiError] = useState(null)
  const { forceLogout } = useAuth()
  const navigate = useNavigate()
  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { currentPassword: '', newPassword: '', confirmNewPassword: '' },
  })

  const submit = async ({ currentPassword, newPassword }) => {
    setApiError(null)
    try {
      await authApi.changePassword({ currentPassword, newPassword })
      forceLogout()
      toast.success('Password changed. Please log in again.')
      navigate('/login', { replace: true })
    } catch (error) {
      setApiError(error.apiError ?? { message: 'Unable to change your password.' })
      applyServerFieldErrors(error, setError)
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit(submit)} noValidate>
      <ApiFormError error={apiError} />
      <AuthField id="currentPassword" label="Current password" error={errors.currentPassword}><PasswordInput id="currentPassword" autoComplete="current-password" error={Boolean(errors.currentPassword)} {...register('currentPassword')} /></AuthField>
      <AuthField id="newPassword" label="New password" error={errors.newPassword} hint={<PasswordRules />}><PasswordInput id="newPassword" autoComplete="new-password" error={Boolean(errors.newPassword)} {...register('newPassword')} /></AuthField>
      <AuthField id="confirmNewPassword" label="Confirm new password" error={errors.confirmNewPassword}><PasswordInput id="confirmNewPassword" autoComplete="new-password" error={Boolean(errors.confirmNewPassword)} {...register('confirmNewPassword')} /></AuthField>
      <AppButton type="submit" loading={isSubmitting}>Change password</AppButton>
    </form>
  )
}

export default ChangePasswordForm
