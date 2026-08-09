import { Link, useLocation } from 'react-router-dom'

const statusMessages = {
  PENDING_VERIFICATION: 'Please verify your email before accessing your dashboard.',
  DISABLED: 'Your account has been disabled. Contact support for assistance.',
  SUSPENDED: 'Your account has been suspended. Contact support for assistance.',
}

function AccountRestrictedPage() {
  const { state } = useLocation()
  const message = statusMessages[state?.status] ?? 'Please review your account status or contact support for assistance.'
  return (
    <section className="mx-auto flex min-h-[70vh] max-w-xl flex-col items-center justify-center px-4 text-center">
      <p className="text-sm font-semibold uppercase tracking-wider text-warning">
        Account restricted
      </p>

      <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-950">
        Your account has restricted access
      </h1>

      <p className="mt-4 text-slate-600">
        {message}
      </p>

      <Link
        to="/"
        className="mt-8 rounded-lg bg-brand-600 px-5 py-3 font-semibold text-white transition hover:bg-brand-700"
      >
        Return home
      </Link>
    </section>
  )
}

export default AccountRestrictedPage
