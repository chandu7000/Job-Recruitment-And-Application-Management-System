import { forwardRef, useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

const PasswordInput = forwardRef(function PasswordInput(
  { id, error = false, className = '', ...props },
  ref,
) {
  const [isVisible, setIsVisible] = useState(false)

  const classes = [
    'block w-full rounded-lg border bg-white py-2.5 pr-11 pl-3.5 text-slate-950',
    'placeholder:text-slate-400 disabled:cursor-not-allowed disabled:bg-slate-100',
    'focus:border-brand-500 focus:ring-2 focus:ring-brand-200 focus:outline-none',
    error ? 'border-red-500' : 'border-slate-300',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className="relative">
      <input
        ref={ref}
        id={id}
        type={isVisible ? 'text' : 'password'}
        className={classes}
        aria-invalid={error || undefined}
        {...props}
      />

      <button
        type="button"
        onClick={() => setIsVisible((currentValue) => !currentValue)}
        className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-slate-500 transition hover:text-slate-800"
        aria-label={isVisible ? 'Hide password' : 'Show password'}
        aria-pressed={isVisible}
      >
        {isVisible ? (
          <EyeOff aria-hidden="true" className="size-5" />
        ) : (
          <Eye aria-hidden="true" className="size-5" />
        )}
      </button>
    </div>
  )
})

export default PasswordInput