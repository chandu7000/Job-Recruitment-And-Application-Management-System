import { LogOut, Menu, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import {
  Link,
  NavLink,
  Outlet,
  useNavigate,
} from 'react-router-dom'
import AppButton from '../components/common/AppButton'
import { useAuth } from '../features/auth/hooks/useAuth'
import NotificationBell from '../features/notifications/components/NotificationBell'

function DashboardLayout({
  roleLabel,
  navigationItems,
}) {
  const { logout, user } = useAuth()
  const navigate = useNavigate()

  const [
    mobileNavigationOpen,
    setMobileNavigationOpen,
  ] = useState(false)

  useEffect(() => {
    if (!mobileNavigationOpen) {
      return undefined
    }

    const previousOverflow =
      document.body.style.overflow

    document.body.style.overflow =
      'hidden'

    const handleKeyDown = (
      event,
    ) => {
      if (event.key === 'Escape') {
        setMobileNavigationOpen(
          false,
        )
      }
    }

    document.addEventListener(
      'keydown',
      handleKeyDown,
    )

    return () => {
      document.body.style.overflow =
        previousOverflow

      document.removeEventListener(
        'keydown',
        handleKeyDown,
      )
    }
  }, [mobileNavigationOpen])

  const handleLogout = async () => {
    try {
      await logout()
    } finally {
      navigate(
        '/login',
        {
          replace: true,
        },
      )
    }
  }

  const closeMobileNavigation =
    () => {
      setMobileNavigationOpen(
        false,
      )
    }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-60 border-b border-slate-200 bg-white">
        <div className="flex h-16 items-center justify-between px-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-1 sm:gap-2">
            <button
              type="button"
              className="shrink-0 rounded-lg p-2 text-slate-600 transition hover:bg-slate-100 hover:text-slate-950 md:hidden"
              aria-label={
                mobileNavigationOpen
                  ? 'Close navigation menu'
                  : 'Open navigation menu'
              }
              aria-controls="dashboard-navigation"
              aria-expanded={
                mobileNavigationOpen
              }
              onClick={() =>
                setMobileNavigationOpen(
                  (open) => !open,
                )
              }
            >
              {mobileNavigationOpen ? (
                <X
                  className="size-5"
                  aria-hidden="true"
                />
              ) : (
                <Menu
                  className="size-5"
                  aria-hidden="true"
                />
              )}
            </button>

            <Link
              to="/"
              className="truncate text-xl font-bold tracking-tight text-brand-700"
            >
              CareerForge
            </Link>
          </div>

          <div className="flex shrink-0 items-center gap-1 min-[380px]:gap-2 sm:gap-3">
            <NotificationBell />

            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold text-slate-800">
                {user?.email}
              </p>

              <p className="text-xs text-slate-500">
                {roleLabel}
              </p>
            </div>

            <AppButton
              variant="ghost"
              size="small"
              className="px-2 min-[380px]:px-3"
              aria-label="Log out"
              onClick={handleLogout}
            >
              <LogOut
                className="size-4"
                aria-hidden="true"
              />

              <span className="hidden min-[380px]:inline">
                Log out
              </span>
            </AppButton>
          </div>
        </div>
      </header>

      {mobileNavigationOpen ? (
        <button
          type="button"
          aria-label="Close navigation menu backdrop"
          className="fixed inset-x-0 bottom-0 top-16 z-40 bg-slate-950/40 md:hidden"
          onClick={
            closeMobileNavigation
          }
        />
      ) : null}

      <div className="flex w-full md:flex-row">
        <aside
          className={[
            'fixed bottom-0 left-0 top-16 z-50 w-[min(18rem,calc(100vw-2rem))] overflow-y-auto border-r border-slate-200 bg-white p-4 shadow-xl',
            'md:sticky md:top-16 md:z-auto md:block md:h-[calc(100vh-4rem)] md:w-64 md:shrink-0 md:self-start md:overflow-y-auto md:border-r md:shadow-none',
            mobileNavigationOpen
              ? 'block'
              : 'hidden md:block',
          ].join(' ')}
        >
          <nav
            id="dashboard-navigation"
            aria-label={`${roleLabel} navigation`}
            className="flex flex-col gap-2"
          >
            {navigationItems.map(
              (item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({
                    isActive,
                  }) =>
                    [
                      'rounded-lg px-4 py-2.5 text-sm font-medium transition',
                      'whitespace-normal break-words',
                      isActive
                        ? 'bg-brand-50 text-brand-700'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950',
                    ].join(' ')
                  }
                  onClick={
                    closeMobileNavigation
                  }
                >
                  {item.label}
                </NavLink>
              ),
            )}
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