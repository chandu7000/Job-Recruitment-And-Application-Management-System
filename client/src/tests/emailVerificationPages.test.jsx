import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import VerifyEmailPage from '../features/auth/pages/VerifyEmailPage'
import DeclineEmailVerificationPage from '../features/auth/pages/DeclineEmailVerificationPage'
import { authApi } from '../features/auth/services/authApi'

vi.mock('../features/auth/services/authApi', () => ({
  authApi: {
    verifyEmail: vi.fn(),
    resendVerification: vi.fn(),
    declineEmailVerification: vi.fn(),
  },
}))

const token = 'a'.repeat(64)

function renderRoute(initialEntry, path, element) {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route path={path} element={element} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('email verification pages', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('verifies a path token and shows a clear success action', async () => {
    authApi.verifyEmail.mockResolvedValue({})

    renderRoute(
      `/verify-email/${token}`,
      '/verify-email/:token',
      <VerifyEmailPage />,
    )

    expect(
      await screen.findByRole('heading', { name: 'Email verified successfully' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Continue to login' })).toHaveAttribute(
      'href',
      '/login',
    )
    expect(authApi.verifyEmail).toHaveBeenCalledWith({ token })
  })

  it('shows professional guidance for a used or invalid verification token', async () => {
    authApi.verifyEmail.mockRejectedValue({
      apiError: {
        code: 'INVALID_VERIFICATION_TOKEN',
        message: 'Invalid verification token.',
      },
    })

    renderRoute(
      `/verify-email/${token}`,
      '/verify-email/:token',
      <VerifyEmailPage />,
    )

    expect(
      await screen.findByText(/invalid or has already been used/i),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Resend verification email' })).toBeInTheDocument()
  })

  it('requires confirmation before cancelling an unintended pending registration', async () => {
    const user = userEvent.setup()
    authApi.declineEmailVerification.mockResolvedValue({})

    renderRoute(
      `/decline-email-verification/${token}`,
      '/decline-email-verification/:token',
      <DeclineEmailVerificationPage />,
    )

    expect(screen.getByRole('heading', { name: "Didn't create this account?" })).toBeInTheDocument()
    expect(authApi.declineEmailVerification).not.toHaveBeenCalled()

    await user.click(
      screen.getByRole('button', { name: /cancel registration/i }),
    )

    expect(authApi.declineEmailVerification).toHaveBeenCalledWith({ token })
    expect(
      await screen.findByRole('heading', { name: 'Registration cancelled' }),
    ).toBeInTheDocument()
  })
})
