import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { authApi } from '../services/authApi'
import { useAuth } from '../hooks/useAuth'
import { verificationTokenSchema } from '../validation/authSchemas'
import ApiFormError from '../components/ApiFormError'
import AuthFormHeader from '../components/AuthFormHeader'

function VerifyEmailChangePage() {
  const [searchParams] = useSearchParams()
  const { forceLogout } = useAuth()
  const token = searchParams.get('token') ?? ''
  const tokenValidation = verificationTokenSchema.safeParse({ token })
  const [status, setStatus] = useState(tokenValidation.success ? 'verifying' : 'failed')
  const [apiError, setApiError] = useState(tokenValidation.success ? null : { message: tokenValidation.error.issues[0].message })

  useEffect(() => {
    if (!tokenValidation.success) return
    let active = true
    authApi.verifyEmailChange({ token }).then(() => {
      forceLogout()
      if (active) setStatus('complete')
    }).catch((error) => {
      if (active) { setApiError(error.apiError ?? { message: 'Unable to verify the email change.' }); setStatus('failed') }
    })
    return () => { active = false }
  }, [forceLogout, token, tokenValidation.success])

  if (status === 'verifying') return <AuthFormHeader title="Updating your email" description="Please wait while we verify your new email address." />
  if (status === 'complete') return <><AuthFormHeader title="Email changed" description="Every session has been signed out. Log in again using your new email address." /><Link className="block rounded-lg bg-brand-600 px-4 py-2.5 text-center font-semibold text-white" to="/login">Continue to login</Link></>
  return <><AuthFormHeader title="Email change failed" description="The verification link could not be completed." /><ApiFormError error={apiError} /><Link className="mt-5 block text-center font-semibold text-brand-700 hover:underline" to="/login">Return to login</Link></>
}

export default VerifyEmailChangePage
