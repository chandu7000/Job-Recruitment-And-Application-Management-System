import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { AuthContext } from '../features/auth/context/AuthContextDefinition'
import DashboardLayout from '../layouts/DashboardLayout'

vi.mock('../features/notifications/components/NotificationBell', () => ({
  default: () => <button type="button" aria-label="Notifications">Notifications</button>,
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
            element={(
              <DashboardLayout
                roleLabel="Job Seeker"
                navigationItems={[
                  { to: '/dashboard', label: 'Dashboard' },
                  { to: '/profile', label: 'Profile' },
                ]}
              />
            )}
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
  it('exposes an accessible mobile menu toggle and closes after navigation', () => {
    renderLayout()

    const toggle = screen.getByRole('button', { name: 'Open navigation menu' })
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
    expect(toggle).toHaveAttribute('aria-controls', 'dashboard-navigation')

    fireEvent.click(toggle)
    expect(screen.getByRole('button', { name: 'Close navigation menu' })).toHaveAttribute('aria-expanded', 'true')

    fireEvent.click(screen.getByRole('link', { name: 'Profile' }))
    expect(screen.getByRole('button', { name: 'Open navigation menu' })).toHaveAttribute('aria-expanded', 'false')
    expect(screen.getByText('Profile content')).toBeInTheDocument()
  })
})
