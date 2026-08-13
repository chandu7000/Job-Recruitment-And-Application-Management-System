import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import AppButton from '../components/common/AppButton'
import AppCheckbox from '../components/forms/AppCheckbox'
import AppInput from '../components/forms/AppInput'
import AppSelect from '../components/forms/AppSelect'
import AppTextarea from '../components/forms/AppTextarea'
import FormField from '../components/forms/FormField'
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

  it('disables a button while loading and exposes busy state', async () => {
    const user = userEvent.setup()
    const handleClick = vi.fn()

    render(<AppButton loading onClick={handleClick}>Save changes</AppButton>)

    const button = screen.getByRole('button', { name: 'Save changes' })
    expect(button).toBeDisabled()
    expect(button).toHaveAttribute('aria-busy', 'true')

    await user.click(button)
    expect(handleClick).not.toHaveBeenCalled()
  })

  it('renders accessible input, select, textarea and checkbox controls', () => {
    render(
      <div>
        <AppInput aria-label="Email address" type="email" />
        <AppSelect aria-label="Employment type" defaultValue="FULL_TIME">
          <option value="FULL_TIME">Full time</option>
        </AppSelect>
        <AppTextarea aria-label="Biography" />
        <AppCheckbox id="relocate" label="Willing to relocate" />
      </div>,
    )

    expect(screen.getByRole('textbox', { name: 'Email address' })).toBeInTheDocument()
    expect(screen.getByRole('combobox', { name: 'Employment type' })).toHaveValue('FULL_TIME')
    expect(screen.getByRole('textbox', { name: 'Biography' })).toBeInTheDocument()
    expect(screen.getByRole('checkbox', { name: 'Willing to relocate' })).toBeInTheDocument()
  })

  it('associates form labels and validation errors with their controls', () => {
    render(
      <FormField id="headline" label="Headline" required error="Headline is required.">
        <AppInput id="headline" error aria-describedby="headline-error" />
      </FormField>,
    )

    const input = screen.getByRole('textbox', { name: 'Headline' })
    expect(input).toHaveAttribute('aria-invalid', 'true')
    expect(input).toHaveAttribute('aria-describedby', 'headline-error')
    expect(screen.getByText('Headline is required.')).toBeInTheDocument()
  })

  it('respects disabled form control states', () => {
    render(
      <div>
        <AppInput aria-label="Disabled input" disabled />
        <AppSelect aria-label="Disabled select" disabled><option>One</option></AppSelect>
        <AppTextarea aria-label="Disabled textarea" disabled />
        <AppCheckbox id="disabled-checkbox" label="Disabled checkbox" disabled />
      </div>,
    )

    expect(screen.getByRole('textbox', { name: 'Disabled input' })).toBeDisabled()
    expect(screen.getByRole('combobox', { name: 'Disabled select' })).toBeDisabled()
    expect(screen.getByRole('textbox', { name: 'Disabled textarea' })).toBeDisabled()
    expect(screen.getByRole('checkbox', { name: 'Disabled checkbox' })).toBeDisabled()
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
