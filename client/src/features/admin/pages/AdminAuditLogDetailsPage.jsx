import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import PageHeader from '../../../components/common/PageHeader'
import ErrorState from '../../../components/feedback/ErrorState'
import PageLoader from '../../../components/feedback/PageLoader'
import { getApiErrorMessage } from '../../../api/errorMapper'
import { formatDateTime } from '../../../utils/date'
import AdminStatusBadge from '../components/AdminStatusBadge'
import { humanize } from '../constants/adminModerationConstants'
import { sanitizeAuditMetadata } from '../utils/adminModerationUtils'
import { adminApi } from '../services/adminApi'

function AdminAuditLogDetailsPage() {
  const { auditId } = useParams()

  const [state, setState] = useState({
    audit: null,
    loading: true,
    error: null,
  })

  useEffect(() => {
    const controller = new AbortController()
    let active = true

    adminApi
      .getAuditLog(auditId, controller.signal)
      .then((audit) => {
        if (!active) return

        setState({
          audit,
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
          audit: null,
          loading: false,
          error,
        })
      })

    return () => {
      active = false
      controller.abort()
    }
  }, [auditId])

  const reload = useCallback(async () => {
    setState((current) => ({
      ...current,
      loading: true,
      error: null,
    }))

    try {
      const audit = await adminApi.getAuditLog(auditId)

      setState({
        audit,
        loading: false,
        error: null,
      })
    } catch (error) {
      setState({
        audit: null,
        loading: false,
        error,
      })
    }
  }, [auditId])

  const metadata = useMemo(
    () => sanitizeAuditMetadata(state.audit?.metadata),
    [state.audit?.metadata],
  )

  if (state.loading) {
    return <PageLoader label="Loading audit log" />
  }

  if (state.error) {
    return (
      <ErrorState
        message={getApiErrorMessage(state.error)}
        onRetry={reload}
      />
    )
  }

  const audit = state.audit || {}

  const fields = [
    ['Timestamp', formatDateTime(audit.createdAt)],
    ['Actor role', humanize(audit.actorRole)],
    ['Actor user ID', audit.actorUserId],
    ['Resource type', humanize(audit.resourceType)],
    ['Resource ID', audit.resourceId],
    ['Request ID', audit.requestId],
    ['IP address', audit.ipAddress],
    ['Reason', audit.reason],
    ['User agent', audit.userAgent],
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Audit log details"
        description="Read-only backend audit data with a defensive client-side sensitive-key filter."
        actions={
          <Link
            className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold"
            to="/admin/audit-logs"
          >
            Back to audit logs
          </Link>
        }
      />

      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <div className="flex justify-between gap-3">
          <div>
            <p className="text-sm text-slate-500">Action</p>
            <p className="mt-1 font-bold">{humanize(audit.action)}</p>
          </div>

          <AdminStatusBadge status={audit.result} />
        </div>

        <dl className="mt-6 grid gap-4 sm:grid-cols-2">
          {fields.map(([label, value]) => (
            <div key={label} className="rounded-xl bg-slate-50 p-4">
              <dt className="text-sm text-slate-500">{label}</dt>
              <dd className="mt-1 break-words font-semibold">
                {value || '—'}
              </dd>
            </div>
          ))}
        </dl>

        <div className="mt-5">
          <h2 className="font-bold">Safe metadata</h2>

          <pre className="mt-2 max-h-96 overflow-auto whitespace-pre-wrap break-words rounded-xl bg-slate-950 p-4 text-xs text-slate-100">
            {metadata === null || metadata === undefined
              ? 'No metadata'
              : JSON.stringify(metadata, null, 2)}
          </pre>
        </div>
      </section>
    </div>
  )
}

export default AdminAuditLogDetailsPage