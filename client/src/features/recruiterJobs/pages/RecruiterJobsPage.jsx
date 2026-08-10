import { useCallback, useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import PageHeader from '../../../components/common/PageHeader'
import EmptyState from '../../../components/feedback/EmptyState'
import ErrorState from '../../../components/feedback/ErrorState'
import PageLoader from '../../../components/feedback/PageLoader'
import Pagination from '../../publicJobs/components/Pagination'
import RecruiterJobCard from '../components/RecruiterJobCard'
import RecruiterJobFilters from '../components/RecruiterJobFilters'
import { DEFAULT_JOB_QUERY } from '../constants/recruiterJobConstants'
import { useRecruiterJobs } from '../hooks/useRecruiterJobs'
import {
  buildRecruiterJobSearchParams,
  readRecruiterJobQuery,
} from '../utils/recruiterJobQuery'

function RecruiterJobsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const searchParamsString = searchParams.toString()

  const query = useMemo(
    () => readRecruiterJobQuery(new URLSearchParams(searchParamsString)),
    [searchParamsString],
  )

  const setQuery = useCallback(
    (nextValue) => {
      const nextQuery =
        typeof nextValue === 'function' ? nextValue(query) : nextValue

      const nextParams = buildRecruiterJobSearchParams(nextQuery)
      setSearchParams(nextParams, { replace: true })
    },
    [query, setSearchParams],
  )

  const resource = useRecruiterJobs(query)

  const clearFilters = useCallback(() => {
    setQuery({ ...DEFAULT_JOB_QUERY })
  }, [setQuery])

  return (
    <div className="space-y-6">
      <PageHeader
        title="Recruiter jobs"
        description="Create, review and manage jobs owned by your recruiter account."
        actions={
          <Link
            className="rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white"
            to="/recruiter/jobs/create"
          >
            Create job
          </Link>
        }
      />

      <RecruiterJobFilters
        query={query}
        onChange={setQuery}
        onClear={clearFilters}
      />

      {resource.loading ? (
        <PageLoader label="Loading recruiter jobs" />
      ) : resource.error ? (
        <ErrorState message={resource.error} onRetry={resource.retry} />
      ) : resource.jobs.length === 0 ? (
        <EmptyState
          title="No jobs found"
          description={
            searchParamsString
              ? 'No owned jobs match the current filters.'
              : 'Create your first job draft to begin recruiting.'
          }
          action={
            searchParamsString ? (
              <button
                type="button"
                className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold"
                onClick={clearFilters}
              >
                Clear filters
              </button>
            ) : (
              <Link
                className="rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white"
                to="/recruiter/jobs/create"
              >
                Create job
              </Link>
            )
          }
        />
      ) : (
        <>
          <p className="text-sm text-slate-600" aria-live="polite">
            {resource.pagination.totalRecords} owned job
            {resource.pagination.totalRecords === 1 ? '' : 's'}
          </p>

          <div className="space-y-4">
            {resource.jobs.map((job) => (
              <RecruiterJobCard key={job.id} job={job} />
            ))}
          </div>

          <Pagination
            pagination={resource.pagination}
            onPageChange={(page) =>
              setQuery((current) => ({ ...current, page }))
            }
          />
        </>
      )}
    </div>
  )
}

export default RecruiterJobsPage