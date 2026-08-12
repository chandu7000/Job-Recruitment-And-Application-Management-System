import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import PageHeader from '../../../components/common/PageHeader'
import EmptyState from '../../../components/feedback/EmptyState'
import ErrorState from '../../../components/feedback/ErrorState'
import PageLoader from '../../../components/feedback/PageLoader'
import AppInput from '../../../components/forms/AppInput'
import AppSelect from '../../../components/forms/AppSelect'
import Pagination from '../../publicJobs/components/Pagination'
import { getApiErrorMessage } from '../../../api/errorMapper'
import { formatDate } from '../../../utils/date'
import AdminStatusBadge from '../components/AdminStatusBadge'
import {
  JOB_STATUSES,
  humanize,
} from '../constants/adminModerationConstants'
import { adminApi } from '../services/adminApi'

function AdminJobsPage() {
  const [params, setParams] = useSearchParams()

  const page = Number(params.get('page') || 1)
  const search = params.get('search') || ''
  const status = params.get('status') || ''
  const location = params.get('location') || ''
  const sort = params.get('sort') || ''

  const query = useMemo(
    () => ({
      page,
      search,
      status,
      location,
      sort,
    }),
    [page, search, status, location, sort],
  )

  const [draft, setDraft] = useState({
    search,
    status,
    location,
  })

  const [state, setState] = useState({
    jobs: [],
    pagination: null,
    loading: true,
    error: null,
  })

  useEffect(() => {
    const controller = new AbortController()
    let active = true

    adminApi
      .listJobs(query, controller.signal)
      .then((result) => {
        if (!active) return

        setState({
          ...result,
          loading: false,
          error: null,
        })
      })
      .catch((error) => {
        if (
          !active ||
          error?.name === 'CanceledError' ||
          error?.code === 'ERR_CANCELED'
        ) {
          return
        }

        setState({
          jobs: [],
          pagination: null,
          loading: false,
          error,
        })
      })

    return () => {
      active = false
      controller.abort()
    }
  }, [query])

  const reload = useCallback(async () => {
    setState((current) => ({
      ...current,
      loading: true,
      error: null,
    }))

    try {
      const result = await adminApi.listJobs(query)

      setState({
        ...result,
        loading: false,
        error: null,
      })
    } catch (error) {
      setState({
        jobs: [],
        pagination: null,
        loading: false,
        error,
      })
    }
  }, [query])

  const apply = (event) => {
    event.preventDefault()

    const next = new URLSearchParams()

    Object.entries(draft).forEach(([key, value]) => {
      if (value.trim()) {
        next.set(key, value.trim())
      }
    })

    next.set('page', '1')
    setParams(next)
  }

  const clearFilters = () => {
    setDraft({
      search: '',
      status: '',
      location: '',
    })

    setParams({ page: '1' })
  }

  const changePage = (nextPage) => {
    const next = new URLSearchParams(params)
    next.set('page', String(nextPage))
    setParams(next)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Job moderation"
        description="Search and moderate platform-wide jobs using the admin job API."
      />

      <form
        onSubmit={apply}
        className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 md:grid-cols-4"
      >
        <div>
          <label
            className="mb-1 block text-sm font-semibold"
            htmlFor="admin-job-search"
          >
            Title search
          </label>

          <AppInput
            id="admin-job-search"
            value={draft.search}
            onChange={(event) =>
              setDraft((current) => ({
                ...current,
                search: event.target.value,
              }))
            }
          />
        </div>

        <div>
          <label
            className="mb-1 block text-sm font-semibold"
            htmlFor="admin-job-status"
          >
            Status
          </label>

          <AppSelect
            id="admin-job-status"
            value={draft.status}
            onChange={(event) =>
              setDraft((current) => ({
                ...current,
                status: event.target.value,
              }))
            }
          >
            <option value="">All statuses</option>

            {JOB_STATUSES.map((jobStatus) => (
              <option key={jobStatus} value={jobStatus}>
                {humanize(jobStatus)}
              </option>
            ))}
          </AppSelect>
        </div>

        <div>
          <label
            className="mb-1 block text-sm font-semibold"
            htmlFor="admin-job-location"
          >
            Location
          </label>

          <AppInput
            id="admin-job-location"
            value={draft.location}
            onChange={(event) =>
              setDraft((current) => ({
                ...current,
                location: event.target.value,
              }))
            }
          />
        </div>

        <div className="flex items-end gap-2">
          <button
            type="submit"
            className="rounded-lg bg-brand-700 px-4 py-2.5 text-sm font-semibold text-white"
          >
            Search
          </button>

          <button
            type="button"
            onClick={clearFilters}
            className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold"
          >
            Clear
          </button>
        </div>
      </form>

      {state.loading ? (
        <PageLoader label="Loading jobs" />
      ) : state.error ? (
        <ErrorState
          message={getApiErrorMessage(state.error)}
          onRetry={reload}
        />
      ) : state.jobs.length === 0 ? (
        <EmptyState
          title="No jobs found"
          description="No jobs match the current backend filters."
        />
      ) : (
        <>
          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50 text-left text-slate-600">
                <tr>
                  <th className="px-4 py-3">Job</th>
                  <th className="px-4 py-3">Company</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Created</th>
                  <th className="px-4 py-3">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {state.jobs.map((job) => (
                  <tr key={job.id}>
                    <td className="px-4 py-3">
                      <p className="font-semibold">
                        {job.title || 'Untitled job'}
                      </p>
                      <p className="text-slate-500">
                        {job.location || '—'}
                      </p>
                    </td>

                    <td className="px-4 py-3">
                      {job.company?.companyName || '—'}
                    </td>

                    <td className="px-4 py-3">
                      <AdminStatusBadge status={job.status} />
                    </td>

                    <td className="px-4 py-3">
                      {formatDate(job.createdAt)}
                    </td>

                    <td className="px-4 py-3">
                      <Link
                        className="font-semibold text-brand-700 hover:underline"
                        to={`/admin/jobs/${job.id}`}
                      >
                        View details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pagination
            pagination={state.pagination}
            onPageChange={changePage}
          />
        </>
      )}
    </div>
  )
}

export default AdminJobsPage