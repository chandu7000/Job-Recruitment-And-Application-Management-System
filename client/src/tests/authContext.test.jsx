import { act, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AuthProvider } from '../features/auth/context/AuthContext'
import { useAuth } from '../features/auth/hooks/useAuth'
import { authApi } from '../features/auth/services/authApi'
import { clearAccessToken, getAccessToken } from '../features/auth/services/tokenStore'

vi.mock('../features/auth/services/authApi', () => ({
  authApi: {
    refresh: vi.fn(), getCurrentUser: vi.fn(), login: vi.fn(), logout: vi.fn(), logoutAll: vi.fn(),
  },
}))

function Probe() {
  const auth = useAuth()
  return (
    <div>
      <span data-testid="initializing">{String(auth.isInitializing)}</span>
      <span data-testid="authenticated">{String(auth.isAuthenticated)}</span>
      <span data-testid="email">{auth.user?.email ?? ''}</span>
      <button onClick={() => auth.login({ email: 'user@example.com', password: 'Password@1' })}>login</button>
      <button onClick={auth.logout}>logout</button>
    </div>
  )
}

describe('AuthProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks(); clearAccessToken()
  })

  it('restores a valid cookie session and current user', async () => {
    authApi.refresh.mockResolvedValue({ accessToken: 'restored-token' })
    authApi.getCurrentUser.mockResolvedValue({ email: 'user@example.com', role: 'JOB_SEEKER', status: 'ACTIVE' })
    render(<AuthProvider><Probe /></AuthProvider>)
    await waitFor(() => expect(screen.getByTestId('initializing')).toHaveTextContent('false'))
    expect(screen.getByTestId('authenticated')).toHaveTextContent('true')
    expect(screen.getByTestId('email')).toHaveTextContent('user@example.com')
    expect(getAccessToken()).toBe('restored-token')
  })

  it('finishes unauthenticated when restoration fails', async () => {
    authApi.refresh.mockRejectedValue(new Error('No session'))
    render(<AuthProvider><Probe /></AuthProvider>)
    await waitFor(() => expect(screen.getByTestId('initializing')).toHaveTextContent('false'))
    expect(screen.getByTestId('authenticated')).toHaveTextContent('false')
    expect(getAccessToken()).toBeNull()
  })

  it('stores login state and clears it on logout', async () => {
    authApi.refresh.mockRejectedValue(new Error('No session'))
    authApi.login.mockResolvedValue({ accessToken: 'login-token', user: { email: 'user@example.com', role: 'JOB_SEEKER', status: 'ACTIVE' } })
    authApi.logout.mockResolvedValue({})
    render(<AuthProvider><Probe /></AuthProvider>)
    await waitFor(() => expect(screen.getByTestId('initializing')).toHaveTextContent('false'))
    await act(async () => { screen.getByRole('button', { name: 'login' }).click() })
    expect(screen.getByTestId('authenticated')).toHaveTextContent('true')
    expect(getAccessToken()).toBe('login-token')
    await act(async () => { screen.getByRole('button', { name: 'logout' }).click() })
    expect(screen.getByTestId('authenticated')).toHaveTextContent('false')
    expect(getAccessToken()).toBeNull()
  })
})
