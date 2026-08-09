import { Link } from 'react-router-dom'

function UnauthorizedPage() {
  return (
    <section className="mx-auto flex min-h-[70vh] max-w-xl flex-col items-center justify-center px-4 text-center">
      <p className="text-sm font-semibold uppercase tracking-wider text-danger">
        Access denied
      </p>

      <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-950">
        You are not authorized
      </h1>

      <p className="mt-4 text-slate-600">
        Your account does not have permission to access this page.
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

export default UnauthorizedPage