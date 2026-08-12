import { LogOut, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import AppButton from '../components/common/AppButton'
import { useAuth } from '../features/auth/hooks/useAuth'
import NotificationBell from '../features/notifications/components/NotificationBell'

function DashboardLayout({ roleLabel, navigationItems }) {
  const { logout, user } = useAuth()
  const navigate = useNavigate()
  const [mobileNavigationOpen, setMobileNavigationOpen] = useState(false)

  const handleLogout = async () => {
    try {
      await logout()
    } finally {
      navigate('/login', { replace: true })
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="flex h-16 items-center justify-between px-4 sm:px-6">
          <Link
            to="/"
            className="text-xl font-bold tracking-tight text-brand-700"
          >
            CareerForge
          </Link>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              className="rounded-lg p-2 text-slate-600 transition hover:bg-slate-100 hover:text-slate-950 md:hidden"
              aria-label={mobileNavigationOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-controls="dashboard-navigation"
              aria-expanded={mobileNavigationOpen}
              onClick={() => setMobileNavigationOpen((open) => !open)}
            >
              {mobileNavigationOpen ? (
                <X className="size-5" aria-hidden="true" />
              ) : (
                <Menu className="size-5" aria-hidden="true" />
              )}
            </button>
            <NotificationBell />
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold text-slate-800">{user?.email}</p>
              <p className="text-xs text-slate-500">{roleLabel}</p>
            </div>
            <AppButton variant="ghost" size="small" onClick={handleLogout}>
              <LogOut className="size-4" aria-hidden="true" />
              Log out
            </AppButton>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-screen-2xl flex-col md:flex-row">
        <aside
          className={[
            'border-b border-slate-200 bg-white p-4 md:block md:min-h-[calc(100vh-4rem)] md:w-64 md:border-r md:border-b-0',
            mobileNavigationOpen ? 'block' : 'hidden',
          ].join(' ')}
        >
          <nav
            id="dashboard-navigation"
            aria-label={`${roleLabel} navigation`}
            className="flex flex-col gap-2"
          >
            {navigationItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  [
                    'whitespace-nowrap rounded-lg px-4 py-2.5 text-sm font-medium transition',
                    isActive
                      ? 'bg-brand-50 text-brand-700'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950',
                  ].join(' ')
                }
                onClick={() => setMobileNavigationOpen(false)}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </aside>

        <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default DashboardLayout
