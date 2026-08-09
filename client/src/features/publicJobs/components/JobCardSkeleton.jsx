function JobCardSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl border border-slate-200 bg-white p-5" aria-hidden="true">
      <div className="flex gap-4"><div className="size-12 rounded-xl bg-slate-200" /><div className="flex-1"><div className="h-5 w-2/3 rounded bg-slate-200" /><div className="mt-2 h-4 w-1/3 rounded bg-slate-100" /></div></div>
      <div className="mt-6 grid grid-cols-2 gap-3"><div className="h-4 rounded bg-slate-100" /><div className="h-4 rounded bg-slate-100" /><div className="h-4 rounded bg-slate-100" /><div className="h-4 rounded bg-slate-100" /></div>
      <div className="mt-5 h-8 rounded bg-slate-100" />
    </div>
  )
}

export function JobCardSkeletonList({ count = 3 }) {
  return <div className="grid gap-5 lg:grid-cols-2">{Array.from({ length: count }, (_, index) => <JobCardSkeleton key={index} />)}</div>
}

export default JobCardSkeleton
