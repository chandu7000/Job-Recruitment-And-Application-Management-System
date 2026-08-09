import { forwardRef } from 'react'

const AppCheckbox = forwardRef(function AppCheckbox(
  { id, label, error = false, className = '', ...props },
  ref,
) {
  return (
    <label
      htmlFor={id}
      className={[
        'inline-flex cursor-pointer items-start gap-3 text-sm text-slate-700',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <input
        ref={ref}
        id={id}
        type="checkbox"
        className="mt-0.5 size-4 rounded border-slate-300 text-brand-600 accent-brand-600 focus:ring-brand-500"
        aria-invalid={error || undefined}
        {...props}
      />

      <span>{label}</span>
    </label>
  )
})

export default AppCheckbox