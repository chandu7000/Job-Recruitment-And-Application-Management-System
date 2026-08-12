import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import PageHeader from '../../../components/common/PageHeader'
import EmptyState from '../../../components/feedback/EmptyState'
import ErrorState from '../../../components/feedback/ErrorState'
import PageLoader from '../../../components/feedback/PageLoader'
import AppSelect from '../../../components/forms/AppSelect'
import Pagination from '../../publicJobs/components/Pagination'
import { getApiErrorMessage } from '../../../api/errorMapper'
import { formatDateTime } from '../../../utils/date'
import AdminStatusBadge from '../components/AdminStatusBadge'
import {
  REPORT_CATEGORIES,
  REPORT_STATUSES,
  REPORT_TARGET_TYPES,
  humanize,
} from '../constants/adminModerationConstants'
import { adminApi } from '../services/adminApi'

function AdminReportsPage() {
  const [params, setParams] = useSearchParams()

  const page = Number(params.get('page') || 1)
  const status = params.get('status') || ''
  const targetType = params.get('targetType') || ''
  const category = params.get('category') || ''

  const query = useMemo(
    () => ({
      page,
      status,
      targetType,
      category,
    }),
    [page, status, targetType, category],
  )

  const [state, setState] = useState({
    reports: [],
    pagination: null,
    loading: true,
    error: null,
  })

  useEffect(() => {
    const controller = new AbortController()
    let active = true

    adminApi
      .listReports(query, controller.signal)
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
          reports: [],
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
      const result = await adminApi.listReports(query)

      setState({
        ...result,
        loading: false,
        error: null,
      })
    } catch (error) {
      setState({
        reports: [],
        pagination: null,
        loading: false,
        error,
      })
    }
  }, [query])

  const changeFilter = (key, value) => {
    const next = new URLSearchParams(params)

    if (value) {
      next.set(key, value)
    } else {
      next.delete(key)
    }

    next.set('page', '1')
    setParams(next)
  }

  const changePage = (nextPage) => {
    const next = new URLSearchParams(params)
    next.set('page', String(nextPage))
    setParams(next)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Report management"
        description="Review and process job and company reports using supported statuses and target types."
      />

      <div className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 md:grid-cols-3">
        <div>
          <label
            className="mb-1 block text-sm font-semibold"
            htmlFor="report-status"
          >
            Status
          </label>

          <AppSelect
            id="report-status"
            value={status}
            onChange={(event) =>
              changeFilter('status', event.target.value)
            }
          >
            <option value="">All statuses</option>

            {REPORT_STATUSES.map((value) => (
              <option key={value} value={value}>
                {humanize(value)}
              </option>
            ))}
          </AppSelect>
        </div>

        <div>
          <label
            className="mb-1 block text-sm font-semibold"
            htmlFor="report-target"
          >
            Target type
          </label>

          <AppSelect
            id="report-target"
            value={targetType}
            onChange={(event) =>
              changeFilter('targetType', event.target.value)
            }
          >
            <option value="">All target types</option>

            {REPORT_TARGET_TYPES.map((value) => (
              <option key={value} value={value}>
                {humanize(value)}
              </option>
            ))}
          </AppSelect>
        </div>

        <div>
          <label
            className="mb-1 block text-sm font-semibold"
            htmlFor="report-category"
          >
            Category
          </label>

          <AppSelect
            id="report-category"
            value={category}
            onChange={(event) =>
              changeFilter('category', event.target.value)
            }
          >
            <option value="">All categories</option>

            {REPORT_CATEGORIES.map((value) => (
              <option key={value} value={value}>
                {humanize(value)}
              </option>
            ))}
          </AppSelect>
        </div>
      </div>

      {state.loading ? (
        <PageLoader label="Loading reports" />
      ) : state.error ? (
        <ErrorState
          message={getApiErrorMessage(state.error)}
          onRetry={reload}
        />
      ) : state.reports.length === 0 ? (
        <EmptyState
          title="No reports found"
          description="No reports match the selected backend filters."
        />
      ) : (
        <>
          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
            <table className="responsive-data-table min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50 text-left text-slate-600">
                <tr>
                  <th className="px-4 py-3">Report</th>
                  <th className="px-4 py-3">Target</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Created</th>
                  <th className="px-4 py-3">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {state.reports.map((report) => (
                  <tr key={report.id}>
                    <td className="px-4 py-3" data-label="Report">
                      <p className="font-semibold">{report.id}</p>
                      <p className="text-slate-500">
                        {report.reporter?.email ||
                          'Reporter unavailable'}
                      </p>
                    </td>

                    <td className="px-4 py-3" data-label="Target">
                      {humanize(report.targetType)}
                      <p className="text-xs text-slate-500">
                        {report.targetResourceId}
                      </p>
                    </td>

                    <td className="px-4 py-3" data-label="Category">
                      {humanize(report.category)}
                    </td>

                    <td className="px-4 py-3" data-label="Status">
                      <AdminStatusBadge status={report.status} />
                    </td>

                    <td className="px-4 py-3" data-label="Created">
                      {formatDateTime(report.createdAt)}
                    </td>

                    <td className="px-4 py-3" data-label="Action">
                      <Link
                        className="font-semibold text-brand-700 hover:underline"
                        to={`/admin/reports/${report.id}`}
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

export default AdminReportsPage