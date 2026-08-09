import { Link, NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../features/auth/hooks/useAuth'
import { getRoleHomePath } from '../features/auth/utils'

const navigationItems = [
  { label: 'Home', to: '/' },
  { label: 'Jobs', to: '/jobs' },
]

function PublicLayout() {
  const { isAuthenticated, role } = useAuth()
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex min-h-16 max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
          <Link
            to="/"
            className="text-xl font-bold tracking-tight text-brand-700"
          >
            CareerForge
          </Link>

          <nav aria-label="Public navigation" className="order-3 flex w-full items-center justify-center gap-6 border-t border-slate-100 pt-3 sm:order-none sm:w-auto sm:border-0 sm:pt-0">
            {navigationItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  isActive
                    ? 'font-semibold text-brand-700'
                    : 'text-slate-600 transition hover:text-slate-950'
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <Link to={getRoleHomePath(role)} className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700">Dashboard</Link>
            ) : (
              <>
                <Link to="/login" className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100">Log in</Link>
                <Link to="/register" className="rounded-lg bg-brand-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-brand-700">Register</Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-6 text-center text-sm text-slate-500 sm:px-6 lg:px-8">
          © {new Date().getFullYear()} CareerForge. All rights reserved.
        </div>
      </footer>
    </div>
  )
}

export default PublicLayout
