import { Inbox } from 'lucide-react'

function EmptyState({
  title = 'No results found',
  description,
  action,
  icon: Icon = Inbox,
  className = '',
}) {
  return (
    <section
      className={[
        'flex flex-col items-center rounded-2xl border border-dashed border-slate-300',
        'bg-white px-6 py-12 text-center',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="flex size-12 items-center justify-center rounded-full bg-slate-100">
        <Icon aria-hidden="true" className="size-6 text-slate-500" />
      </div>

      <h2 className="mt-4 text-lg font-semibold text-slate-950">{title}</h2>

      {description && (
        <p className="mt-2 max-w-md text-sm leading-6 text-slate-600">
          {description}
        </p>
      )}

      {action && <div className="mt-6">{action}</div>}
    </section>
  )
}

export default EmptyState