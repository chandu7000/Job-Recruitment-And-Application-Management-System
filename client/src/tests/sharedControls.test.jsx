import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import AppButton from '../components/common/AppButton'
import AppInput from '../components/forms/AppInput'
import PasswordInput from '../components/forms/PasswordInput'
import ConfirmationModal from '../components/modals/ConfirmationModal'

describe('shared controls', () => {
  it('handles button interaction', async () => {
    const user = userEvent.setup()
    const handleClick = vi.fn()

    render(<AppButton onClick={handleClick}>Save</AppButton>)

    await user.click(screen.getByRole('button', { name: 'Save' }))

    expect(handleClick).toHaveBeenCalledOnce()
  })

  it('renders an accessible input', () => {
    render(<AppInput aria-label="Email address" type="email" />)

    expect(
      screen.getByRole('textbox', { name: 'Email address' }),
    ).toBeInTheDocument()
  })

  it('toggles password visibility', async () => {
    const user = userEvent.setup()

    render(<PasswordInput aria-label="Password" />)

    const passwordInput = screen.getByLabelText('Password')

    expect(passwordInput).toHaveAttribute('type', 'password')

    await user.click(screen.getByRole('button', { name: 'Show password' }))

    expect(passwordInput).toHaveAttribute('type', 'text')
  })

  it('confirms an action through the confirmation modal', async () => {
    const user = userEvent.setup()
    const handleConfirm = vi.fn()

    render(
      <ConfirmationModal
        isOpen
        title="Delete item"
        message="This action cannot be undone."
        onConfirm={handleConfirm}
        onCancel={() => {}}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Confirm' }))

    expect(handleConfirm).toHaveBeenCalledOnce()
  })
})