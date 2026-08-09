import { forwardRef } from 'react'

const AppInput = forwardRef(function AppInput(
  { id, type = 'text', error = false, className = '', ...props },
  ref,
) {
  const classes = [
    'block w-full rounded-lg border bg-white px-3.5 py-2.5 text-slate-950',
    'placeholder:text-slate-400 disabled:cursor-not-allowed disabled:bg-slate-100',
    'focus:border-brand-500 focus:ring-2 focus:ring-brand-200 focus:outline-none',
    error ? 'border-red-500' : 'border-slate-300',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <input
      ref={ref}
      id={id}
      type={type}
      className={classes}
      aria-invalid={error || undefined}
      {...props}
    />
  )
})

export default AppInput