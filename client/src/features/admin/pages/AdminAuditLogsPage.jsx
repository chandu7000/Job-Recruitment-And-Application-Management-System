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
import { formatDateTime } from '../../../utils/date'
import AdminStatusBadge from '../components/AdminStatusBadge'
import {
  AUDIT_ACTIONS,
  AUDIT_ACTOR_ROLES,
  AUDIT_RESOURCE_TYPES,
  humanize,
} from '../constants/adminModerationConstants'
import { adminApi } from '../services/adminApi'

function AdminAuditLogsPage() {
  const [params, setParams] = useSearchParams()

  const page = Number(params.get('page') || 1)
  const actorRole = params.get('actorRole') || ''
  const action = params.get('action') || ''
  const resourceType = params.get('resourceType') || ''
  const resourceId = params.get('resourceId') || ''
  const actorId = params.get('actorId') || ''
  const from = params.get('from') || ''
  const to = params.get('to') || ''

  const query = useMemo(
    () => ({
      page,
      actorRole,
      action,
      resourceType,
      resourceId,
      actorId,
      from,
      to,
    }),
    [
      page,
      actorRole,
      action,
      resourceType,
      resourceId,
      actorId,
      from,
      to,
    ],
  )

  const [draft, setDraft] = useState(query)

  const [state, setState] = useState({
    auditLogs: [],
    pagination: null,
    loading: true,
    error: null,
  })

  useEffect(() => {
    const controller = new AbortController()
    let active = true

    adminApi
      .listAuditLogs(query, controller.signal)
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
          auditLogs: [],
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
      const result = await adminApi.listAuditLogs(query)

      setState({
        ...result,
        loading: false,
        error: null,
      })
    } catch (error) {
      setState({
        auditLogs: [],
        pagination: null,
        loading: false,
        error,
      })
    }
  }, [query])

  const apply = (event) => {
    event.preventDefault()

    const next = new URLSearchParams()

    for (const [key, value] of Object.entries(draft)) {
      if (key !== 'page' && String(value || '').trim()) {
        next.set(key, String(value).trim())
      }
    }

    next.set('page', '1')
    setParams(next)
  }

  const clearFilters = () => {
    setDraft({
      page: 1,
      actorRole: '',
      action: '',
      resourceType: '',
      resourceId: '',
      actorId: '',
      from: '',
      to: '',
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
        title="Audit logs"
        description="Read-only investigation view using server-side actor, action, resource, date and pagination filters."
      />

      <form
        onSubmit={apply}
        className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 md:grid-cols-4"
      >
        <div>
          <label
            className="mb-1 block text-sm font-semibold"
            htmlFor="audit-action"
          >
            Action
          </label>

          <AppSelect
            id="audit-action"
            value={draft.action}
            onChange={(event) =>
              setDraft((current) => ({
                ...current,
                action: event.target.value,
              }))
            }
          >
            <option value="">All actions</option>
            {AUDIT_ACTIONS.map((value) => (
              <option key={value} value={value}>
                {humanize(value)}
              </option>
            ))}
          </AppSelect>
        </div>

        <div>
          <label
            className="mb-1 block text-sm font-semibold"
            htmlFor="audit-role"
          >
            Actor role
          </label>

          <AppSelect
            id="audit-role"
            value={draft.actorRole}
            onChange={(event) =>
              setDraft((current) => ({
                ...current,
                actorRole: event.target.value,
              }))
            }
          >
            <option value="">All roles</option>
            {AUDIT_ACTOR_ROLES.map((value) => (
              <option key={value} value={value}>
                {humanize(value)}
              </option>
            ))}
          </AppSelect>
        </div>

        <div>
          <label
            className="mb-1 block text-sm font-semibold"
            htmlFor="audit-resource"
          >
            Resource type
          </label>

          <AppSelect
            id="audit-resource"
            value={draft.resourceType}
            onChange={(event) =>
              setDraft((current) => ({
                ...current,
                resourceType: event.target.value,
              }))
            }
          >
            <option value="">All resources</option>
            {AUDIT_RESOURCE_TYPES.map((value) => (
              <option key={value} value={value}>
                {humanize(value)}
              </option>
            ))}
          </AppSelect>
        </div>

        <div>
          <label
            className="mb-1 block text-sm font-semibold"
            htmlFor="audit-resource-id"
          >
            Resource ID
          </label>

          <AppInput
            id="audit-resource-id"
            value={draft.resourceId}
            onChange={(event) =>
              setDraft((current) => ({
                ...current,
                resourceId: event.target.value,
              }))
            }
          />
        </div>

        <div>
          <label
            className="mb-1 block text-sm font-semibold"
            htmlFor="audit-actor-id"
          >
            Actor ID
          </label>

          <AppInput
            id="audit-actor-id"
            value={draft.actorId}
            onChange={(event) =>
              setDraft((current) => ({
                ...current,
                actorId: event.target.value,
              }))
            }
          />
        </div>

        <div>
          <label
            className="mb-1 block text-sm font-semibold"
            htmlFor="audit-from"
          >
            From
          </label>

          <AppInput
            id="audit-from"
            type="datetime-local"
            value={draft.from}
            onChange={(event) =>
              setDraft((current) => ({
                ...current,
                from: event.target.value,
              }))
            }
          />
        </div>

        <div>
          <label
            className="mb-1 block text-sm font-semibold"
            htmlFor="audit-to"
          >
            To
          </label>

          <AppInput
            id="audit-to"
            type="datetime-local"
            value={draft.to}
            onChange={(event) =>
              setDraft((current) => ({
                ...current,
                to: event.target.value,
              }))
            }
          />
        </div>

        <div className="flex items-end gap-2">
          <button
            className="rounded-lg bg-brand-700 px-4 py-2.5 text-sm font-semibold text-white"
            type="submit"
          >
            Apply
          </button>

          <button
            className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold"
            type="button"
            onClick={clearFilters}
          >
            Clear
          </button>
        </div>
      </form>

      {state.loading ? (
        <PageLoader label="Loading audit logs" />
      ) : state.error ? (
        <ErrorState
          message={getApiErrorMessage(state.error)}
          onRetry={reload}
        />
      ) : state.auditLogs.length === 0 ? (
        <EmptyState
          title="No audit logs found"
          description="No audit records match the selected backend filters."
        />
      ) : (
        <>
          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50 text-left text-slate-600">
                <tr>
                  <th className="px-4 py-3">Timestamp</th>
                  <th className="px-4 py-3">Action</th>
                  <th className="px-4 py-3">Actor</th>
                  <th className="px-4 py-3">Resource</th>
                  <th className="px-4 py-3">Result</th>
                  <th className="px-4 py-3">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {state.auditLogs.map((audit) => (
                  <tr key={audit.id}>
                    <td className="px-4 py-3">
                      {formatDateTime(audit.createdAt)}
                    </td>

                    <td className="px-4 py-3">
                      {humanize(audit.action)}
                    </td>

                    <td className="px-4 py-3">
                      {humanize(audit.actorRole)}
                      <p className="text-xs text-slate-500">
                        {audit.actorUserId || 'System'}
                      </p>
                    </td>

                    <td className="px-4 py-3">
                      {humanize(audit.resourceType)}
                      <p className="text-xs text-slate-500">
                        {audit.resourceId || '—'}
                      </p>
                    </td>

                    <td className="px-4 py-3">
                      <AdminStatusBadge status={audit.result} />
                    </td>

                    <td className="px-4 py-3">
                      <Link
                        className="font-semibold text-brand-700 hover:underline"
                        to={`/admin/audit-logs/${audit.id}`}
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

export default AdminAuditLogsPage