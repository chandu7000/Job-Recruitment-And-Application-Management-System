import InlineError from '../feedback/InlineError'

function FormField({
  id,
  label,
  required = false,
  hint,
  error,
  children,
  className = '',
}) {
  return (
    <div className={className}>
      {label && (
        <label
          htmlFor={id}
          className="mb-1.5 block text-sm font-semibold text-slate-700"
        >
          {label}

          {required && (
            <span className="ml-1 text-red-600" aria-hidden="true">
              *
            </span>
          )}
        </label>
      )}

      {children}

      {hint && !error && (
        <p className="mt-1.5 text-sm text-slate-500">{hint}</p>
      )}

      <InlineError id={id ? `${id}-error` : undefined} message={error} />
    </div>
  )
}

export default FormField