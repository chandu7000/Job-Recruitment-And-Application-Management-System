import { LoaderCircle } from 'lucide-react'

const variantClasses = {
  primary:
    'bg-brand-600 text-white hover:bg-brand-700 focus-visible:outline-brand-300',
  secondary:
    'border border-slate-300 bg-white text-slate-700 hover:bg-slate-100',
  danger: 'bg-red-600 text-white hover:bg-red-700',
  ghost: 'bg-transparent text-slate-700 hover:bg-slate-100',
}

const sizeClasses = {
  small: 'px-3 py-2 text-sm',
  medium: 'px-4 py-2.5 text-sm',
  large: 'px-5 py-3 text-base',
}

function AppButton({
  children,
  type = 'button',
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  className = '',
  ...props
}) {
  const classes = [
    'inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition',
    'disabled:cursor-not-allowed disabled:opacity-60',
    variantClasses[variant] ?? variantClasses.primary,
    sizeClasses[size] ?? sizeClasses.medium,
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <button
      type={type}
      className={classes}
      disabled={disabled || loading}
      aria-busy={loading}
      {...props}
    >
      {loading && <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />}
      {children}
    </button>
  )
}

export default AppButton