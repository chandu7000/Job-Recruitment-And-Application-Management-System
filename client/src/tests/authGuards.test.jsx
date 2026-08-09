import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { AuthContext } from '../features/auth/context/AuthContextDefinition'
import AccountStatusGuard from '../routes/guards/AccountStatusGuard'
import GuestOnlyRoute from '../routes/guards/GuestOnlyRoute'
import ProtectedRoute from '../routes/guards/ProtectedRoute'
import RoleRoute from '../routes/guards/RoleRoute'

const baseValue = {
  user: null,
  role: null,
  status: null,
  permissions: [],
  isAuthenticated: false,
  isInitializing: false,
  login: vi.fn(), logout: vi.fn(), logoutAll: vi.fn(), forceLogout: vi.fn(),
}

function renderGuard({ value, initialPath = '/protected', guard }) {
  return render(
    <AuthContext.Provider value={{ ...baseValue, ...value }}>
      <MemoryRouter initialEntries={[initialPath]}>
        <Routes>
          <Route element={guard}><Route path="protected" element={<h1>Protected content</h1>} /></Route>
          <Route path="login" element={<h1>Login page</h1>} />
          <Route path="unauthorized" element={<h1>Unauthorized page</h1>} />
          <Route path="account-restricted" element={<h1>Restricted page</h1>} />
          <Route path="job-seeker/dashboard" element={<h1>Job seeker home</h1>} />
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>,
  )
}

describe('authentication route guards', () => {
  it('redirects guests to login', () => {
    renderGuard({ guard: <ProtectedRoute /> })
    expect(screen.getByRole('heading', { name: 'Login page' })).toBeInTheDocument()
  })

  it('allows authenticated users through the protected guard', () => {
    renderGuard({ value: { isAuthenticated: true }, guard: <ProtectedRoute /> })
    expect(screen.getByRole('heading', { name: 'Protected content' })).toBeInTheDocument()
  })

  it('redirects authenticated users away from guest routes', () => {
    renderGuard({
      value: { isAuthenticated: true, role: 'JOB_SEEKER' },
      initialPath: '/protected',
      guard: <GuestOnlyRoute />,
    })
    expect(screen.getByRole('heading', { name: 'Job seeker home' })).toBeInTheDocument()
  })

  it('blocks cross-role access', () => {
    renderGuard({ value: { role: 'JOB_SEEKER' }, guard: <RoleRoute allowedRoles={['ADMIN']} /> })
    expect(screen.getByRole('heading', { name: 'Unauthorized page' })).toBeInTheDocument()
  })

  it('redirects a restricted account', () => {
    renderGuard({ value: { status: 'SUSPENDED' }, guard: <AccountStatusGuard /> })
    expect(screen.getByRole('heading', { name: 'Restricted page' })).toBeInTheDocument()
  })
})
