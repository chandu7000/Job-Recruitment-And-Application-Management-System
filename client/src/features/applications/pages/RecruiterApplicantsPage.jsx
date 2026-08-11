import axios from 'axios'
import { Search } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { getApiErrorMessage } from '../../../api/errorMapper'
import EmptyState from '../../../components/feedback/EmptyState'
import ErrorState from '../../../components/feedback/ErrorState'
import PageLoader from '../../../components/feedback/PageLoader'
import { formatDate } from '../../../utils/date'
import Pagination from '../../publicJobs/components/Pagination'
import ApplicationStatusBadge from '../components/ApplicationStatusBadge'
import { recruiterApplicationApi } from '../services/recruiterApplicationApi'
import {
  RECRUITER_PROCESSING_STATUSES,
  RECRUITER_SORT_OPTIONS,
} from '../utils/recruiterApplicationProcessing'
import { formatApplicationStatus, parseApplicationSort } from '../utils/applicationTracking'

function RecruiterApplicantsPage() {
  const { jobId } = useParams()
  const [params, setParams] = useSearchParams()
  const page = Math.max(Number(params.get('page') || 1), 1)
  const status = params.get('status') || ''
  const search = params.get('search') || ''
  const sortValue = params.get('sort') || 'createdAt:DESC'
  const [searchInput, setSearchInput] = useState(search)
  const [retryKey, setRetryKey] = useState(0)
  const [state, setState] = useState({ key: '', items: [], pagination: {}, error: '' })
  const key = `${jobId}:${page}:${status}:${search}:${sortValue}:${retryKey}`

  useEffect(() => {
    const controller = new AbortController()
    const sort = parseApplicationSort(sortValue)

    recruiterApplicationApi
      .listByJob(
        jobId,
        {
          page,
          limit: 10,
          ...(status && { status }),
          ...(search && { search }),
          ...sort,
        },
        { signal: controller.signal },
      )
      .then((result) => {
        setState({
          key,
          items: result.applications,
          pagination: result.pagination,
          error: '',
        })
      })
      .catch((error) => {
        if (!axios.isCancel(error)) {
          setState({ key, items: [], pagination: {}, error: getApiErrorMessage(error) })
        }
      })

    return () => controller.abort()
  }, [jobId, key, page, search, sortValue, status])

  const updateParams = (updates) => {
    const next = new URLSearchParams(params)
    Object.entries(updates).forEach(([name, value]) => {
      if (value) next.set(name, value)
      else next.delete(name)
    })
    if (!Object.prototype.hasOwnProperty.call(updates, 'page')) next.set('page', '1')
    setParams(next)
  }

  if (state.key !== key) return <PageLoader label="Loading applicants" />
  if (state.error) {
    return (
      <ErrorState
        title="Unable to load applicants"
        message={state.error}
        onRetry={() => setRetryKey((value) => value + 1)}
      />
    )
  }

  return (
    <section className="space-y-6">
      <header>
        <Link to={`/recruiter/jobs/${jobId}`} className="text-sm font-semibold text-brand-700">
          ← Back to job
        </Link>
        <h1 className="mt-3 text-3xl font-bold text-slate-950">Applicants</h1>
        <p className="mt-2 text-slate-600">Review applications submitted for this recruiter-owned job.</p>
      </header>

      <div className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 md:grid-cols-[1fr_220px_220px]">
        <form
          className="flex gap-2"
          onSubmit={(event) => {
            event.preventDefault()
            updateParams({ search: searchInput.trim() })
          }}
        >
          <label className="sr-only" htmlFor="recruiter-applicant-search">Search applicants</label>
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 size-4 text-slate-400" />
            <input
              id="recruiter-applicant-search"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Search job or company snapshot"
              className="w-full rounded-lg border border-slate-300 py-2.5 pl-9 pr-3 text-sm"
            />
          </div>
          <button className="rounded-lg bg-brand-600 px-4 text-sm font-semibold text-white" type="submit">
            Search
          </button>
        </form>

        <select
          aria-label="Filter applicants by status"
          value={status}
          onChange={(event) => updateParams({ status: event.target.value })}
          className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm"
        >
          <option value="">All statuses</option>
          {RECRUITER_PROCESSING_STATUSES.map((value) => (
            <option key={value} value={value}>{formatApplicationStatus(value)}</option>
          ))}
        </select>

        <select
          aria-label="Sort applicants"
          value={sortValue}
          onChange={(event) => updateParams({ sort: event.target.value })}
          className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm"
        >
          {RECRUITER_SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
      </div>

      {state.items.length === 0 ? (
        <EmptyState title="No applicants found" description="No applications match the current filters for this job." />
      ) : (
        <>
          <div className="hidden overflow-hidden rounded-2xl border border-slate-200 bg-white md:block">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-5 py-3 font-semibold">Candidate</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 font-semibold">Applied</th>
                  <th className="px-5 py-3 font-semibold">Resume</th>
                  <th className="px-5 py-3 font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {state.items.map((application) => (
                  <tr key={application.id}>
                    <td className="px-5 py-4">
                      <p className="font-semibold text-slate-900">
                        {[application.candidateSnapshot?.firstName, application.candidateSnapshot?.lastName].filter(Boolean).join(' ') || 'Candidate'}
                      </p>
                      <p className="mt-1 text-slate-500">{application.candidateSnapshot?.headline || application.candidateSnapshot?.email || 'Profile summary unavailable'}</p>
                    </td>
                    <td className="px-5 py-4"><ApplicationStatusBadge status={application.status} /></td>
                    <td className="px-5 py-4 text-slate-600">{formatDate(application.createdAt)}</td>
                    <td className="px-5 py-4 text-slate-600">{application.resumeSnapshot?.url ? 'Available' : 'Unavailable'}</td>
                    <td className="px-5 py-4">
                      <Link className="font-semibold text-brand-700 hover:underline" to={`/recruiter/applications/${application.id}`}>
                        View details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid gap-4 md:hidden">
            {state.items.map((application) => (
              <article key={application.id} className="rounded-2xl border border-slate-200 bg-white p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="font-bold text-slate-950">
                      {[application.candidateSnapshot?.firstName, application.candidateSnapshot?.lastName].filter(Boolean).join(' ') || 'Candidate'}
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">Applied {formatDate(application.createdAt)}</p>
                  </div>
                  <ApplicationStatusBadge status={application.status} />
                </div>
                <p className="mt-3 text-sm text-slate-600">Resume: {application.resumeSnapshot?.url ? 'Available' : 'Unavailable'}</p>
                <Link className="mt-4 inline-block font-semibold text-brand-700" to={`/recruiter/applications/${application.id}`}>
                  View details
                </Link>
              </article>
            ))}
          </div>

          <Pagination
            pagination={state.pagination}
            onPageChange={(nextPage) => updateParams({ page: String(nextPage) })}
          />
        </>
      )}
    </section>
  )
}

export default RecruiterApplicantsPage
