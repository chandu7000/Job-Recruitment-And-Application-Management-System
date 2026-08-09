import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AuthContext } from '../features/auth/context/AuthContextDefinition'
import LoginPage from '../features/auth/pages/LoginPage'
import RegistrationPage from '../features/auth/pages/RegistrationPage'
import { authApi } from '../features/auth/services/authApi'

vi.mock('../features/auth/services/authApi', () => ({
  authApi: { registerJobSeeker: vi.fn(), registerRecruiter: vi.fn() },
}))

const authValue = {
  user: null, role: null, status: null, permissions: [], isAuthenticated: false, isInitializing: false,
  login: vi.fn(), logout: vi.fn(), logoutAll: vi.fn(), forceLogout: vi.fn(),
}

function renderWithAuth(ui) {
  return render(<AuthContext.Provider value={authValue}><MemoryRouter>{ui}</MemoryRouter></AuthContext.Provider>)
}

describe('authentication pages', () => {
  beforeEach(() => vi.clearAllMocks())

  it('shows client validation errors before login submission', async () => {
    const user = userEvent.setup()
    renderWithAuth(<LoginPage />)
    await user.click(screen.getByRole('button', { name: 'Log in' }))
    expect(await screen.findByText('Email is required.')).toBeInTheDocument()
    expect(screen.getByText('Password is required.')).toBeInTheDocument()
    expect(authValue.login).not.toHaveBeenCalled()
  })

  it('submits only backend-supported job-seeker registration fields', async () => {
    const user = userEvent.setup()
    authApi.registerJobSeeker.mockResolvedValue({ user: { status: 'PENDING_VERIFICATION' }, accessToken: 'temporary' })
    renderWithAuth(<RegistrationPage accountType="job-seeker" />)
    await user.type(screen.getByLabelText(/Email address/), 'person@example.com')
    await user.type(screen.getByLabelText(/^Password/), 'Career@123')
    await user.type(screen.getByLabelText(/Confirm password/), 'Career@123')
    await user.click(screen.getByRole('button', { name: 'Create account' }))
    expect(authApi.registerJobSeeker).toHaveBeenCalledWith({ email: 'person@example.com', password: 'Career@123' })
  })

  it('uses the dedicated recruiter endpoint', async () => {
    const user = userEvent.setup()
    authApi.registerRecruiter.mockResolvedValue({})
    renderWithAuth(<RegistrationPage accountType="recruiter" />)
    await user.type(screen.getByLabelText(/Email address/), 'recruiter@example.com')
    await user.type(screen.getByLabelText(/^Password/), 'Career@123')
    await user.type(screen.getByLabelText(/Confirm password/), 'Career@123')
    await user.click(screen.getByRole('button', { name: 'Create account' }))
    expect(authApi.registerRecruiter).toHaveBeenCalledOnce()
  })
})
