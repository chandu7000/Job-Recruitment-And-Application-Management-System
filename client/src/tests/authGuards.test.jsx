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
          <Route path="recruiter/dashboard" element={<h1>Recruiter home</h1>} />
          <Route path="admin/dashboard" element={<h1>Admin home</h1>} />
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

  it('shows session restoration loading before deciding protected access', () => {
    renderGuard({ value: { isInitializing: true }, guard: <ProtectedRoute /> })
    expect(screen.getByRole('status')).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Login page' })).not.toBeInTheDocument()
  })

  it('redirects authenticated users away from guest routes', () => {
    renderGuard({
      value: { isAuthenticated: true, role: 'JOB_SEEKER' },
      guard: <GuestOnlyRoute />,
    })
    expect(screen.getByRole('heading', { name: 'Job seeker home' })).toBeInTheDocument()
  })

  it.each([
    ['JOB_SEEKER', ['JOB_SEEKER']],
    ['RECRUITER', ['RECRUITER']],
    ['ADMIN', ['ADMIN']],
  ])('allows %s through its own role guard', (role, allowedRoles) => {
    renderGuard({ value: { role }, guard: <RoleRoute allowedRoles={allowedRoles} /> })
    expect(screen.getByRole('heading', { name: 'Protected content' })).toBeInTheDocument()
  })

  it.each([
    ['JOB_SEEKER', ['RECRUITER']],
    ['JOB_SEEKER', ['ADMIN']],
    ['RECRUITER', ['JOB_SEEKER']],
    ['RECRUITER', ['ADMIN']],
    ['ADMIN', ['JOB_SEEKER']],
    ['ADMIN', ['RECRUITER']],
  ])('blocks %s from a different role area', (role, allowedRoles) => {
    renderGuard({ value: { role }, guard: <RoleRoute allowedRoles={allowedRoles} /> })
    expect(screen.getByRole('heading', { name: 'Unauthorized page' })).toBeInTheDocument()
  })

  it('allows ACTIVE accounts through the account-status guard', () => {
    renderGuard({ value: { status: 'ACTIVE' }, guard: <AccountStatusGuard /> })
    expect(screen.getByRole('heading', { name: 'Protected content' })).toBeInTheDocument()
  })

  it.each(['PENDING_VERIFICATION', 'DISABLED', 'SUSPENDED'])(
    'redirects %s accounts to restricted handling',
    (status) => {
      renderGuard({ value: { status }, guard: <AccountStatusGuard /> })
      expect(screen.getByRole('heading', { name: 'Restricted page' })).toBeInTheDocument()
    },
  )
})
