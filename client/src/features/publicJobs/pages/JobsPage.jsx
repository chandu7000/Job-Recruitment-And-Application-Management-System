import { SlidersHorizontal, X } from 'lucide-react'
import { useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import EmptyState from '../../../components/feedback/EmptyState'
import ErrorState from '../../../components/feedback/ErrorState'
import ActiveFilterChips from '../components/ActiveFilterChips'
import JobCard from '../components/JobCard'
import { JobCardSkeletonList } from '../components/JobCardSkeleton'
import JobFilters from '../components/JobFilters'
import Pagination from '../components/Pagination'
import ResultsCount from '../components/ResultsCount'
import { PUBLIC_JOB_SORTS } from '../constants/publicJobConstants'
import { usePublicJobs } from '../hooks/usePublicJobs'
import { EMPTY_FILTERS, filtersFromSearchParams, filtersToSearchParams } from '../utils/urlFilters'
import useDialogFocus from '../../../hooks/useDialogFocus'

function JobsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)
  const closeFiltersRef = useRef(null)
  const filters = useMemo(() => filtersFromSearchParams(searchParams), [searchParams])
  const query = useMemo(() => ({ ...filters, limit: 10 }), [filters])
  const { jobs, pagination, loading, error, retry } = usePublicJobs(query)

  const commit = (next) => setSearchParams(filtersToSearchParams({ ...next, page: next.page || '1' }))
  const applyFilters = (next) => { commit({ ...next, page: '1' }); setMobileFiltersOpen(false) }
  const clearAll = () => commit(EMPTY_FILTERS)
  const removeFilter = (key) => commit({ ...filters, [key]: '', page: '1' })
  const submitSearch = (event) => { event.preventDefault(); commit({ ...filters, page: '1' }) }
  const mobileFiltersDialogRef = useDialogFocus({
    isOpen: mobileFiltersOpen,
    initialFocusRef: closeFiltersRef,
    onEscape: () => setMobileFiltersOpen(false),
  })

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <header><p className="text-sm font-semibold uppercase tracking-wider text-brand-700">Discover opportunities</p><h1 className="mt-2 text-3xl font-bold text-slate-950 sm:text-4xl">Find your next job</h1></header>
      <form onSubmit={submitSearch} className="mt-7 grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-[1fr_1fr_auto]">
        <label className="sr-only" htmlFor="job-search">Keyword</label><input id="job-search" value={filters.search} onChange={(e) => commit({ ...filters, search: e.target.value, page: '1' })} maxLength="200" placeholder="Job title or keyword" className="rounded-lg border border-slate-300 px-4 py-3" />
        <label className="sr-only" htmlFor="location-search">Location</label><input id="location-search" value={filters.location} onChange={(e) => commit({ ...filters, location: e.target.value, page: '1' })} maxLength="255" placeholder="City or location" className="rounded-lg border border-slate-300 px-4 py-3" />
        <button className="rounded-lg bg-brand-600 px-6 py-3 font-semibold text-white hover:bg-brand-700">Search jobs</button>
      </form>

      <div className="mt-6 flex items-center justify-between gap-3"><ResultsCount pagination={pagination} /><button type="button" onClick={() => setMobileFiltersOpen(true)} className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold lg:hidden"><SlidersHorizontal className="size-4" />Filters</button></div>
      <div className="mt-4"><ActiveFilterChips filters={filters} onRemove={removeFilter} onClearAll={clearAll} /></div>

      <div className="mt-6 grid gap-8 lg:grid-cols-[280px_1fr]">
        <aside className="hidden h-fit rounded-2xl border border-slate-200 bg-white p-5 lg:block"><h2 className="mb-5 text-lg font-bold">Filters</h2><JobFilters key={searchParams.toString()} filters={filters} onApply={applyFilters} onClear={clearAll} /></aside>
        <section aria-busy={loading}>
          <div className="mb-5 flex justify-end"><label className="text-sm font-medium text-slate-700">Sort by <select aria-label="Sort jobs" value={filters.sort} onChange={(e) => commit({ ...filters, sort: e.target.value, page: '1' })} className="ml-2 rounded-lg border border-slate-300 bg-white px-3 py-2">{PUBLIC_JOB_SORTS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label></div>
          {loading ? <><span className="sr-only" role="status">Loading jobs</span><JobCardSkeletonList count={4} /></> : error ? <ErrorState message={error} onRetry={retry} /> : !jobs.length ? <EmptyState title="No jobs match your search" description="Try removing a filter or using a broader keyword." /> : <div className="grid gap-5 xl:grid-cols-2">{jobs.map((job) => <JobCard key={job.id} job={job} />)}</div>}
          {!loading && !error && <div className="mt-8"><Pagination pagination={pagination} onPageChange={(page) => { commit({ ...filters, page: String(page) }); window.scrollTo({ top: 0, behavior: 'smooth' }) }} /></div>}
        </section>
      </div>

      {mobileFiltersOpen && <div className="fixed inset-0 z-50 bg-slate-950/40 lg:hidden"><section ref={mobileFiltersDialogRef} tabIndex={-1} className="ml-auto h-full w-full max-w-sm overflow-y-auto bg-white p-5 shadow-xl" role="dialog" aria-modal="true" aria-labelledby="mobile-job-filters-title"><div className="mb-5 flex items-center justify-between"><h2 id="mobile-job-filters-title" className="text-xl font-bold">Filters</h2><button ref={closeFiltersRef} type="button" className="rounded-lg p-2 text-slate-600 hover:bg-slate-100" aria-label="Close filters" onClick={() => setMobileFiltersOpen(false)}><X aria-hidden="true" className="size-5" /></button></div><JobFilters key={searchParams.toString()} filters={filters} onApply={applyFilters} onClear={clearAll} /></section></div>}
    </div>
  )
}

export default JobsPage
