import { ChevronLeft, ChevronRight } from 'lucide-react'

function Pagination({ pagination, onPageChange }) {
  const page = Number(pagination?.page || 1)
  const totalPages = Number(pagination?.totalPages || 1)
  if (totalPages <= 1) return null

  return (
    <nav aria-label="Job results pagination" className="flex items-center justify-center gap-3">
      <button type="button" onClick={() => onPageChange(page - 1)} disabled={!pagination.hasPreviousPage} className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold disabled:opacity-40"><ChevronLeft aria-hidden="true" className="size-4" />Previous</button>
      <span className="text-sm text-slate-600">Page <strong className="text-slate-950">{page}</strong> of {totalPages}</span>
      <button type="button" onClick={() => onPageChange(page + 1)} disabled={!pagination.hasNextPage} className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold disabled:opacity-40">Next<ChevronRight aria-hidden="true" className="size-4" /></button>
    </nav>
  )
}

export default Pagination
