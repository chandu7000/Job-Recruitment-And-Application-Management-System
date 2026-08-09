function SectionCard({ title, action, children }) {
  return <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
    <div className="flex items-center justify-between gap-4"><h2 className="text-lg font-bold text-slate-950">{title}</h2>{action}</div>
    <div className="mt-4">{children}</div>
  </section>
}
export default SectionCard
