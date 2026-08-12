import {
  fireEvent,
  render,
  screen,
  within,
} from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { AuthContext } from '../features/auth/context/AuthContextDefinition'
import DashboardLayout from '../layouts/DashboardLayout'

vi.mock('../features/notifications/components/NotificationBell', () => ({
  default: () => (
    <button type="button" aria-label="Notifications">
      Notifications
    </button>
  ),
}))

const authValue = {
  user: { email: 'user@example.com' },
  logout: vi.fn(),
}

function renderLayout() {
  return render(
    <AuthContext.Provider value={authValue}>
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route
            element={
              <DashboardLayout
                roleLabel="Job Seeker"
                navigationItems={[
                  { to: '/dashboard', label: 'Dashboard' },
                  { to: '/profile', label: 'Profile' },
                ]}
              />
            }
          >
            <Route path="/dashboard" element={<p>Dashboard content</p>} />
            <Route path="/profile" element={<p>Profile content</p>} />
          </Route>
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>,
  )
}

describe('responsive dashboard navigation', () => {
  it('opens the mobile navigation as an overlay and closes after navigation', () => {
    renderLayout()

    const toggle = screen.getByRole('button', {
      name: 'Open navigation menu',
    })

    expect(toggle).toHaveAttribute('aria-expanded', 'false')
    expect(toggle).toHaveAttribute(
      'aria-controls',
      'dashboard-navigation',
    )

    fireEvent.click(toggle)

    expect(
      screen.getByRole('button', {
        name: 'Close navigation menu',
      }),
    ).toHaveAttribute('aria-expanded', 'true')

    expect(
      screen.getByRole('button', {
        name: 'Close navigation menu backdrop',
      }),
    ).toBeInTheDocument()

    const navigation = screen.getByRole('navigation', {
      name: 'Job Seeker navigation',
    })

    fireEvent.click(
      within(navigation).getByRole('link', {
        name: 'Profile',
      }),
    )

    expect(
      screen.getByRole('button', {
        name: 'Open navigation menu',
      }),
    ).toHaveAttribute('aria-expanded', 'false')

    expect(
      screen.queryByRole('button', {
        name: 'Close navigation menu backdrop',
      }),
    ).not.toBeInTheDocument()

    expect(screen.getByText('Profile content')).toBeInTheDocument()
  })

  it('closes the mobile navigation with Escape', () => {
    renderLayout()

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Open navigation menu',
      }),
    )

    expect(
      screen.getByRole('button', {
        name: 'Close navigation menu',
      }),
    ).toBeInTheDocument()

    fireEvent.keyDown(document, {
      key: 'Escape',
    })

    expect(
      screen.getByRole('button', {
        name: 'Open navigation menu',
      }),
    ).toHaveAttribute('aria-expanded', 'false')

    expect(
      screen.queryByRole('button', {
        name: 'Close navigation menu backdrop',
      }),
    ).not.toBeInTheDocument()
  })

  it('closes the mobile navigation when the backdrop is clicked', () => {
    renderLayout()

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Open navigation menu',
      }),
    )

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Close navigation menu backdrop',
      }),
    )

    expect(
      screen.getByRole('button', {
        name: 'Open navigation menu',
      }),
    ).toHaveAttribute('aria-expanded', 'false')
  })

  it('places the mobile menu before the brand and keeps logout compact on very small screens', () => {
    renderLayout()

    const toggle = screen.getByRole('button', {
      name: 'Open navigation menu',
    })

    const brand = screen.getByRole('link', {
      name: 'CareerForge',
    })

    const logout = screen.getByRole('button', {
      name: 'Log out',
    })

    const logoutText = screen.getByText('Log out')

    expect(
      toggle.compareDocumentPosition(brand) &
      Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy()

    expect(logout).toHaveClass('px-2', 'min-[380px]:px-3')

    expect(logoutText).toHaveClass(
      'hidden',
      'min-[380px]:inline',
    )
  })

  it('uses a fixed independently scrollable mobile drawer', () => {
    renderLayout()

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Open navigation menu',
      }),
    )

    const navigation = screen.getByRole('navigation', {
      name: 'Job Seeker navigation',
    })

    const drawer = navigation.closest('aside')

    expect(drawer).toHaveClass(
      'fixed',
      'bottom-0',
      'top-16',
      'overflow-y-auto',
    )

    expect(drawer).toHaveClass(
      'md:sticky',
      'md:top-16',
      'md:h-[calc(100vh-4rem)]',
      'md:overflow-y-auto',
      'md:w-64',
    )
  })
})