import LoadingSpinner from './LoadingSpinner'

function PageLoader({ message = 'Loading page' }) {
  return (
    <div
      className="flex min-h-64 flex-col items-center justify-center gap-4"
      aria-live="polite"
    >
      <LoadingSpinner size="large" label={message} />
      <p className="text-sm font-medium text-slate-600">{message}</p>
    </div>
  )
}

export default PageLoader