import { forwardRef } from 'react'

const AppSelect = forwardRef(function AppSelect(
  { id, children, error = false, className = '', ...props },
  ref,
) {
  const classes = [
    'block w-full rounded-lg border bg-white px-3.5 py-2.5 text-slate-950',
    'disabled:cursor-not-allowed disabled:bg-slate-100',
    'focus:border-brand-500 focus:ring-2 focus:ring-brand-200 focus:outline-none',
    error ? 'border-red-500' : 'border-slate-300',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <select
      ref={ref}
      id={id}
      className={classes}
      aria-invalid={error || undefined}
      {...props}
    >
      {children}
    </select>
  )
})

export default AppSelect