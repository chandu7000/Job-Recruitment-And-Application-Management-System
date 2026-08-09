import { Link, Outlet } from 'react-router-dom'

function AuthLayout() {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <main className="flex w-full items-center justify-center px-4 py-12 sm:px-6">
        <div className="w-full max-w-md">
          <Link
            to="/"
            className="mx-auto mb-8 block w-fit text-2xl font-bold tracking-tight text-brand-700"
          >
            CareerForge
          </Link>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <Outlet />
          </section>
        </div>
      </main>
    </div>
  )
}

export default AuthLayout