import { CircleAlert } from 'lucide-react'
import AppButton from '../common/AppButton'

function ErrorState({
  title = 'Something went wrong',
  message = 'We could not complete your request.',
  onRetry,
  className = '',
}) {
  return (
    <section
      role="alert"
      className={[
        'flex flex-col items-center rounded-2xl border border-red-200',
        'bg-red-50 px-6 py-12 text-center',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="flex size-12 items-center justify-center rounded-full bg-red-100">
        <CircleAlert aria-hidden="true" className="size-6 text-red-700" />
      </div>

      <h2 className="mt-4 text-lg font-semibold text-slate-950">{title}</h2>

      <p className="mt-2 max-w-md text-sm leading-6 text-slate-600">
        {message}
      </p>

      {onRetry && (
        <AppButton className="mt-6" onClick={onRetry}>
          Try again
        </AppButton>
      )}
    </section>
  )
}

export default ErrorState