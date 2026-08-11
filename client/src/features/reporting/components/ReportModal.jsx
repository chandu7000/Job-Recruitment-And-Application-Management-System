import { useCallback, useEffect, useRef, useState } from 'react'
import { X } from 'lucide-react'
import { toast } from 'sonner'
import AppButton from '../../../components/common/AppButton'
import AppSelect from '../../../components/forms/AppSelect'
import AppTextarea from '../../../components/forms/AppTextarea'
import InlineError from '../../../components/feedback/InlineError'
import { getApiErrorMessage } from '../../../api/errorMapper'
import {
  REPORT_CATEGORIES,
  REPORT_DESCRIPTION_LIMITS,
} from '../constants/reportConstants'
import { reportApi } from '../services/reportApi'
import { validateReport } from '../validation/reportValidation'

function ReportModal({ isOpen, targetType, targetResourceId, targetLabel, onClose }) {
  const [category, setCategory] = useState('')
  const [description, setDescription] = useState('')
  const [errors, setErrors] = useState({})
  const [submissionError, setSubmissionError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const submittingRef = useRef(false)
  const categoryRef = useRef(null)

  const reset = useCallback(() => {
    setCategory('')
    setDescription('')
    setErrors({})
    setSubmissionError('')
    setSubmitting(false)
    submittingRef.current = false
  }, [])

  const close = useCallback(() => {
    if (submittingRef.current) return
    reset()
    onClose()
  }, [onClose, reset])

  useEffect(() => {
    if (!isOpen) return undefined

    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && !submittingRef.current) close()
    }

    document.addEventListener('keydown', handleKeyDown)
    const focusTimer = window.setTimeout(() => categoryRef.current?.focus(), 0)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      window.clearTimeout(focusTimer)
    }
  }, [close, isOpen])

  if (!isOpen) return null

  const titleTarget = targetType === 'COMPANY' ? 'company' : 'job'

  const submit = async (event) => {
    event.preventDefault()
    if (submittingRef.current) return

    const validation = validateReport({
      targetType,
      targetResourceId,
      category,
      description,
    })

    setErrors(validation.errors)
    setSubmissionError('')
    if (!validation.valid) return

    submittingRef.current = true
    setSubmitting(true)

    try {
      await reportApi.submit(validation.values)
      toast.success('Report submitted successfully.')
      reset()
      onClose()
    } catch (error) {
      const status = error?.apiError?.status ?? error?.response?.status
      const code = error?.apiError?.code ?? error?.response?.data?.code
      const message = getApiErrorMessage(error, 'Unable to submit report.')

      if (status === 429 || code === 'REPORT_RATE_LIMIT_EXCEEDED') {
        setSubmissionError('Too many reports submitted. Please try again later.')
      } else {
        setSubmissionError(message)
      }
    } finally {
      submittingRef.current = false
      setSubmitting(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) close()
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="report-modal-title"
        className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="report-modal-title" className="text-xl font-bold text-slate-950">
              Report this {titleTarget}
            </h2>
            {targetLabel && <p className="mt-1 text-sm text-slate-500">{targetLabel}</p>}
          </div>
          <button
            type="button"
            onClick={close}
            disabled={submitting}
            aria-label="Close report dialog"
            className="rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X aria-hidden="true" className="size-5" />
          </button>
        </div>

        <form className="mt-6 space-y-5" onSubmit={submit} noValidate>
          <div>
            <label htmlFor="report-category" className="text-sm font-semibold text-slate-800">
              Category
            </label>
            <AppSelect
              ref={categoryRef}
              id="report-category"
              value={category}
              disabled={submitting}
              error={Boolean(errors.category)}
              aria-describedby={errors.category ? 'report-category-error' : undefined}
              onChange={(event) => {
                setCategory(event.target.value)
                setErrors((current) => ({ ...current, category: undefined }))
              }}
            >
              <option value="">Select a reason</option>
              {REPORT_CATEGORIES.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </AppSelect>
            {errors.category && <div id="report-category-error"><InlineError message={errors.category} /></div>}
          </div>

          <div>
            <div className="flex items-end justify-between gap-3">
              <label htmlFor="report-description" className="text-sm font-semibold text-slate-800">
                Description
              </label>
              <span className="text-xs text-slate-500">{description.length}/{REPORT_DESCRIPTION_LIMITS.MAX}</span>
            </div>
            <AppTextarea
              id="report-description"
              rows={6}
              value={description}
              maxLength={REPORT_DESCRIPTION_LIMITS.MAX}
              disabled={submitting}
              error={Boolean(errors.description)}
              aria-describedby={errors.description ? 'report-description-error' : 'report-description-help'}
              placeholder="Explain why you are reporting this..."
              onChange={(event) => {
                setDescription(event.target.value)
                setErrors((current) => ({ ...current, description: undefined }))
              }}
            />
            <p id="report-description-help" className="mt-1 text-xs text-slate-500">
              Use {REPORT_DESCRIPTION_LIMITS.MIN}–{REPORT_DESCRIPTION_LIMITS.MAX} characters.
            </p>
            {errors.description && <div id="report-description-error"><InlineError message={errors.description} /></div>}
          </div>

          {errors.target && <InlineError message={errors.target} />}
          {submissionError && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{submissionError}</p>}

          <div className="flex justify-end gap-3">
            <AppButton variant="secondary" onClick={close} disabled={submitting}>Cancel</AppButton>
            <AppButton type="submit" loading={submitting}>Submit report</AppButton>
          </div>
        </form>
      </section>
    </div>
  )
}

export default ReportModal
