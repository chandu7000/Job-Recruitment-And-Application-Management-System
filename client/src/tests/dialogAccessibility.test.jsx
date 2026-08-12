import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import ConfirmationModal from '../components/modals/ConfirmationModal'

function ConfirmationHarness({ onConfirm = vi.fn() }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        Open dialog
      </button>
      <ConfirmationModal
        isOpen={open}
        title="Delete record?"
        message="This action requires confirmation."
        confirmLabel="Delete"
        onConfirm={onConfirm}
        onCancel={() => setOpen(false)}
      />
    </>
  )
}

describe('dialog accessibility', () => {
  it('moves focus into a confirmation dialog and restores it after Escape', async () => {
    render(<ConfirmationHarness />)

    const trigger = screen.getByRole('button', { name: 'Open dialog' })
    trigger.focus()
    fireEvent.click(trigger)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Cancel' })).toHaveFocus()
    })

    fireEvent.keyDown(document, { key: 'Escape' })

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
      expect(trigger).toHaveFocus()
    })
  })

  it('keeps Tab navigation inside an open confirmation dialog', async () => {
    render(<ConfirmationHarness />)
    fireEvent.click(screen.getByRole('button', { name: 'Open dialog' }))

    const confirm = await screen.findByRole('button', { name: 'Delete' })
    const close = screen.getByRole('button', { name: 'Close confirmation dialog' })

    confirm.focus()
    fireEvent.keyDown(document, { key: 'Tab' })
    expect(close).toHaveFocus()

    close.focus()
    fireEvent.keyDown(document, { key: 'Tab', shiftKey: true })
    expect(confirm).toHaveFocus()
  })

  it('does not close a processing confirmation dialog with Escape', async () => {
    render(
      <ConfirmationModal
        isOpen
        title="Processing"
        message="Please wait."
        loading
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />,
    )

    fireEvent.keyDown(document, { key: 'Escape' })
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })
})
