import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import AppButton from '../../../components/common/AppButton'
import ApiFormError from '../components/ApiFormError'
import AuthFormHeader from '../components/AuthFormHeader'
import { authApi } from '../services/authApi'
import { verificationTokenSchema } from '../validation/authSchemas'

function DeclineEmailVerificationPage() {
  const { token = '' } = useParams()
  const tokenValidation = verificationTokenSchema.safeParse({ token })
  const [status, setStatus] = useState('confirm')
  const [apiError, setApiError] = useState(
    tokenValidation.success
      ? null
      : { message: tokenValidation.error.issues[0].message },
  )

  const declineRegistration = async () => {
    if (!tokenValidation.success) return

    setApiError(null)
    setStatus('submitting')

    try {
      await authApi.declineEmailVerification({ token })
      setStatus('cancelled')
    } catch (error) {
      setApiError(
        error.apiError ?? {
          message: 'Unable to cancel this pending registration.',
        },
      )
      setStatus('confirm')
    }
  }

  if (status === 'cancelled') {
    return (
      <>
        <AuthFormHeader
          title="Registration cancelled"
          description="The pending CareerForge registration connected to this email verification link has been removed. No account was activated."
        />
        <Link
          className="block rounded-lg bg-brand-600 px-4 py-2.5 text-center font-semibold text-white"
          to="/"
        >
          Return home
        </Link>
      </>
    )
  }

  return (
    <>
      <AuthFormHeader
        title="Didn't create this account?"
        description="Only continue if you did not create the CareerForge account connected to this verification email."
      />
      <div className="space-y-4">
        <ApiFormError error={apiError} />
        <p className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
          Cancelling removes the pending, unverified registration. If you created the account yourself, return to your email and use Verify email instead.
        </p>
        <AppButton
          type="button"
          variant="danger"
          loading={status === 'submitting'}
          disabled={!tokenValidation.success}
          className="w-full"
          onClick={declineRegistration}
        >
          This wasn't me — cancel registration
        </AppButton>
        <Link
          className="block text-center text-sm font-semibold text-brand-700 hover:underline"
          to="/login"
        >
          Keep account and return to login
        </Link>
      </div>
    </>
  )
}

export default DeclineEmailVerificationPage
