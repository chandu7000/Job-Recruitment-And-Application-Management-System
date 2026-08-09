function DashboardPlaceholderPage({
  title = 'Page foundation',
  description = 'This page will be implemented in its approved frontend phase.',
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-bold tracking-tight text-slate-950">
        {title}
      </h1>

      <p className="mt-2 text-slate-600">{description}</p>
    </section>
  )
}

export default DashboardPlaceholderPage