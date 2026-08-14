import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
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

function renderWithAuth(ui, initialEntries = ['/']) {
  return render(
    <AuthContext.Provider value={authValue}>
      <MemoryRouter initialEntries={initialEntries}>{ui}</MemoryRouter>
    </AuthContext.Provider>,
  )
}

async function fillRegistration(user, email = 'person@example.com') {
  await user.type(screen.getByLabelText(/First name/), 'Test')
  await user.type(screen.getByLabelText(/Last name/), 'Person')
  await user.type(screen.getByLabelText(/Phone number/), '+91 98765 43210')
  await user.type(screen.getByLabelText(/Email address/), email)
  await user.type(screen.getByLabelText(/^Password/), 'Career@123')
  await user.type(screen.getByLabelText(/Confirm password/), 'Career@123')
}

describe('authentication pages', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    authValue.login.mockReset()
  })

  it('shows client validation errors before login submission', async () => {
    const user = userEvent.setup()
    renderWithAuth(<LoginPage />)
    await user.click(screen.getByRole('button', { name: 'Log in' }))
    expect(await screen.findByText('Email is required.')).toBeInTheDocument()
    expect(screen.getByText('Password is required.')).toBeInTheDocument()
    expect(authValue.login).not.toHaveBeenCalled()
  })

  it('submits the backend-supported login payload and redirects by role', async () => {
    const user = userEvent.setup()
    authValue.login.mockResolvedValue({ role: 'JOB_SEEKER' })

    renderWithAuth(
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/job-seeker/dashboard" element={<h1>Job seeker dashboard</h1>} />
      </Routes>,
    )

    await user.type(screen.getByLabelText(/Email address/i), 'person@example.com')
    await user.type(screen.getByLabelText(/^Password/i), 'Career@123')
    await user.click(screen.getByRole('button', { name: 'Log in' }))

    expect(authValue.login).toHaveBeenCalledWith({
      email: 'person@example.com',
      password: 'Career@123',
    })
    expect(await screen.findByRole('heading', { name: 'Job seeker dashboard' })).toBeInTheDocument()
  })

  it('shows backend authentication and rate-limit feedback without losing entered email', async () => {
    const user = userEvent.setup()
    authValue.login.mockRejectedValue({
      apiError: {
        status: 429,
        code: 'RATE_LIMITED',
        message: 'Too many login attempts. Please try again later.',
      },
    })

    renderWithAuth(<LoginPage />)
    const email = screen.getByLabelText(/Email address/i)
    await user.type(email, 'person@example.com')
    await user.type(screen.getByLabelText(/^Password/i), 'Wrong@123')
    await user.click(screen.getByRole('button', { name: 'Log in' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Too many login attempts')
    expect(email).toHaveValue('person@example.com')
  })

  it('submits only backend-supported job-seeker registration fields', async () => {
    const user = userEvent.setup()
    authApi.registerJobSeeker.mockResolvedValue({ user: { status: 'PENDING_VERIFICATION' }, accessToken: 'temporary' })
    renderWithAuth(<RegistrationPage accountType="job-seeker" />)
    await fillRegistration(user)
    await user.click(screen.getByRole('button', { name: 'Create account' }))
    expect(authApi.registerJobSeeker).toHaveBeenCalledWith({ firstName: 'Test', lastName: 'Person', phoneNumber: '+91 98765 43210', email: 'person@example.com', password: 'Career@123' })
  })

  it('uses the dedicated recruiter registration endpoint', async () => {
    const user = userEvent.setup()
    authApi.registerRecruiter.mockResolvedValue({})
    renderWithAuth(<RegistrationPage accountType="recruiter" />)
    await fillRegistration(user, 'recruiter@example.com')
    await user.click(screen.getByRole('button', { name: 'Create account' }))
    expect(authApi.registerRecruiter).toHaveBeenCalledWith({ firstName: 'Test', lastName: 'Person', phoneNumber: '+91 98765 43210', email: 'recruiter@example.com', password: 'Career@123' })
  })

  it('keeps registration on the client when registration validation fails', async () => {
    const user = userEvent.setup()
    renderWithAuth(<RegistrationPage accountType="job-seeker" />)
    await user.type(screen.getByLabelText(/Email address/), 'invalid-email')
    await user.type(screen.getByLabelText(/^Password/), 'Career@123')
    await user.type(screen.getByLabelText(/Confirm password/), 'Different@123')
    await user.click(screen.getByRole('button', { name: 'Create account' }))

    expect(authApi.registerJobSeeker).not.toHaveBeenCalled()
    expect(await screen.findByText(/valid email/i)).toBeInTheDocument()
    expect(screen.getByText(/Passwords do not match/i)).toBeInTheDocument()
  })

  it('maps backend registration field errors separately from the general conflict error', async () => {
    const user = userEvent.setup()
    authApi.registerJobSeeker.mockRejectedValue({
      apiError: {
        status: 409,
        code: 'EMAIL_ALREADY_EXISTS',
        message: 'An account with this email already exists.',
        errors: [{ field: 'email', message: 'Email is already registered.' }],
      },
    })

    renderWithAuth(<RegistrationPage accountType="job-seeker" />)
    await fillRegistration(user)
    await user.click(screen.getByRole('button', { name: 'Create account' }))

    expect(await screen.findByText('An account with this email already exists.')).toBeInTheDocument()
    expect(await screen.findByText('Email is already registered.')).toBeInTheDocument()
    expect(screen.getByLabelText(/Email address/)).toHaveValue('person@example.com')
  })
})
