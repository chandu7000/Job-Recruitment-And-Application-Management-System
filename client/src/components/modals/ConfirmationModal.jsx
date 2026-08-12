import { useRef } from 'react'
import { X } from 'lucide-react'
import useDialogFocus from '../../hooks/useDialogFocus'
import AppButton from '../common/AppButton'

function ConfirmationModal({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  confirmVariant = 'danger',
  loading = false,
  onConfirm,
  onCancel,
}) {
  const cancelButtonRef = useRef(null)

  const dialogRef = useDialogFocus({
    isOpen,
    initialFocusRef: cancelButtonRef,
    onEscape: onCancel,
    canClose: !loading,
  })

  if (!isOpen) {
    return null
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !loading) {
          onCancel()
        }
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirmation-modal-title"
        aria-describedby="confirmation-modal-message"
        ref={dialogRef}
        tabIndex={-1}
        className="max-h-[calc(100vh-2rem)] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-5 shadow-xl sm:p-6"
      >
        <div className="flex items-start justify-between gap-4">
          <h2
            id="confirmation-modal-title"
            className="text-xl font-bold text-slate-950"
          >
            {title}
          </h2>

          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Close confirmation dialog"
          >
            <X aria-hidden="true" className="size-5" />
          </button>
        </div>

        <p
          id="confirmation-modal-message"
          className="mt-3 leading-6 text-slate-600"
        >
          {message}
        </p>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <AppButton
            ref={cancelButtonRef}
            variant="secondary"
            onClick={onCancel}
            disabled={loading}
          >
            {cancelLabel}
          </AppButton>

          <AppButton
            variant={confirmVariant}
            loading={loading}
            onClick={onConfirm}
          >
            {confirmLabel}
          </AppButton>
        </div>
      </section>
    </div>
  )
}

export default ConfirmationModal