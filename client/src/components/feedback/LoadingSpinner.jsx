import { LoaderCircle } from 'lucide-react'

const sizeClasses = {
  small: 'size-4',
  medium: 'size-6',
  large: 'size-10',
}

function LoadingSpinner({
  size = 'medium',
  label = 'Loading',
  className = '',
}) {
  return (
    <span
      role="status"
      className={['inline-flex items-center gap-2', className]
        .filter(Boolean)
        .join(' ')}
    >
      <LoaderCircle
        aria-hidden="true"
        className={[
          'animate-spin text-brand-600',
          sizeClasses[size] ?? sizeClasses.medium,
        ].join(' ')}
      />

      <span className="sr-only">{label}</span>
    </span>
  )
}

export default LoadingSpinner