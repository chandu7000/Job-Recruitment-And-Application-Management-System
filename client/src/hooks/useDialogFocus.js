import { useEffect, useRef } from 'react'

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

function useDialogFocus({ isOpen, initialFocusRef, onEscape, canClose = true }) {
  const dialogRef = useRef(null)
  const onEscapeRef = useRef(onEscape)
  const canCloseRef = useRef(canClose)

  useEffect(() => {
    onEscapeRef.current = onEscape
    canCloseRef.current = canClose
  }, [onEscape, canClose])

  useEffect(() => {
    if (!isOpen) return undefined

    const previouslyFocused = document.activeElement
    const dialog = dialogRef.current

    const focusTimer = window.setTimeout(() => {
      const firstFocusable = dialog?.querySelector(FOCUSABLE_SELECTOR)
      ;(initialFocusRef?.current || firstFocusable || dialog)?.focus()
    }, 0)

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        if (canCloseRef.current) {
          onEscapeRef.current?.()
        }
        return
      }

      if (event.key !== 'Tab' || !dialog) return

      const focusable = Array.from(
        dialog.querySelectorAll(FOCUSABLE_SELECTOR),
      )

      if (focusable.length === 0) {
        event.preventDefault()
        dialog.focus()
        return
      }

      const first = focusable[0]
      const last = focusable[focusable.length - 1]

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      window.clearTimeout(focusTimer)
      document.removeEventListener('keydown', handleKeyDown)

      if (previouslyFocused instanceof HTMLElement) {
        previouslyFocused.focus()
      }
    }
  }, [initialFocusRef, isOpen])

  return dialogRef
}

export default useDialogFocus