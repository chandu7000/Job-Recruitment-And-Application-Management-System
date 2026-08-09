function ResultsCount({ pagination }) {
  const total = Number(pagination?.totalRecords || 0)
  return <p aria-live="polite" className="text-sm text-slate-600"><strong className="text-slate-950">{total.toLocaleString('en-IN')}</strong> {total === 1 ? 'job' : 'jobs'} found</p>
}

export default ResultsCount
