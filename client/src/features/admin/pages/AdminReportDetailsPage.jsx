import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import AppButton from '../../../components/common/AppButton'
import PageHeader from '../../../components/common/PageHeader'
import ErrorState from '../../../components/feedback/ErrorState'
import PageLoader from '../../../components/feedback/PageLoader'
import AppInput from '../../../components/forms/AppInput'
import AppTextarea from '../../../components/forms/AppTextarea'
import { getApiErrorMessage } from '../../../api/errorMapper'
import { formatDateTime } from '../../../utils/date'
import AdminStatusBadge from '../components/AdminStatusBadge'
import { humanize } from '../constants/adminModerationConstants'
import { reportTransitions } from '../utils/adminModerationUtils'
import { adminApi } from '../services/adminApi'

function AdminReportDetailsPage() {
  const { reportId } = useParams()

  const [state, setState] = useState({
    report: null,
    loading: true,
    error: null,
  })

  const [nextStatus, setNextStatus] = useState('')
  const [resolution, setResolution] = useState('')
  const [remarks, setRemarks] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const controller = new AbortController()
    let active = true

    adminApi
      .getReport(reportId, controller.signal)
      .then((report) => {
        if (!active) return

        setState({
          report,
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
          report: null,
          loading: false,
          error,
        })
      })

    return () => {
      active = false
      controller.abort()
    }
  }, [reportId])

  const reload = useCallback(async () => {
    setState((current) => ({
      ...current,
      loading: true,
      error: null,
    }))

    try {
      const report = await adminApi.getReport(reportId)

      setState({
        report,
        loading: false,
        error: null,
      })
    } catch (error) {
      setState({
        report: null,
        loading: false,
        error,
      })
    }
  }, [reportId])

  const processReport = async () => {
    if (!nextStatus) return

    setSaving(true)

    try {
      await adminApi.processReport(reportId, {
        status: nextStatus,
        ...(resolution.trim()
          ? { adminResolution: resolution.trim() }
          : {}),
        ...(remarks.trim()
          ? { adminRemarks: remarks.trim() }
          : {}),
      })

      toast.success(`Report moved to ${humanize(nextStatus)}.`)

      setNextStatus('')
      setResolution('')
      setRemarks('')

      await reload()
    } catch (error) {
      toast.error(getApiErrorMessage(error))
    } finally {
      setSaving(false)
    }
  }

  if (state.loading) {
    return <PageLoader label="Loading report details" />
  }

  if (state.error) {
    return (
      <ErrorState
        message={getApiErrorMessage(state.error)}
        onRetry={reload}
      />
    )
  }

  const report = state.report || {}
  const transitions = reportTransitions(report.status)

  const fields = [
    ['Report ID', report.id],
    ['Reporter', report.reporter?.email],
    ['Reporter role', humanize(report.reporter?.role)],
    ['Target type', humanize(report.targetType)],
    ['Target ID', report.targetResourceId],
    ['Category', humanize(report.category)],
    ['Reviewed by', report.reviewer?.email],
    ['Reviewed at', formatDateTime(report.reviewedAt)],
    ['Resolution', report.adminResolution],
    ['Remarks', report.adminRemarks],
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Report details"
        description="Inspect the report and apply supported status transitions."
        actions={
          <Link
            className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold"
            to="/admin/reports"
          >
            Back to reports
          </Link>
        }
      />

      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <div className="flex flex-wrap justify-between gap-3">
          <div>
            <p className="text-sm text-slate-500">Current status</p>
            <div className="mt-2">
              <AdminStatusBadge status={report.status} />
            </div>
          </div>

          <p className="text-sm text-slate-500">
            Created {formatDateTime(report.createdAt)}
          </p>
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
          <h2 className="font-bold">Description</h2>
          <p className="mt-2 whitespace-pre-wrap text-slate-700">
            {report.description}
          </p>
        </div>
      </section>

      {transitions.length > 0 && (
        <section className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-bold">Process report</h2>

          <p className="mt-1 text-sm text-slate-600">
            Choose a valid next status. Resolution and remarks are sent
            to the backend when provided.
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            {transitions.map((status) => (
              <AppButton
                key={status}
                variant={status === 'DISMISSED' ? 'danger' : 'secondary'}
                onClick={() => setNextStatus(status)}
              >
                {humanize(status)}
              </AppButton>
            ))}
          </div>

          {nextStatus && (
            <div className="mt-5 space-y-4 rounded-xl bg-slate-50 p-4">
              <p className="font-semibold">
                Selected: {humanize(nextStatus)}
              </p>

              <div>
                <label
                  className="mb-1 block text-sm font-semibold"
                  htmlFor="report-resolution"
                >
                  Admin resolution
                </label>

                <AppInput
                  id="report-resolution"
                  maxLength={500}
                  value={resolution}
                  onChange={(event) =>
                    setResolution(event.target.value)
                  }
                />
              </div>

              <div>
                <label
                  className="mb-1 block text-sm font-semibold"
                  htmlFor="report-remarks"
                >
                  Admin remarks
                </label>

                <AppTextarea
                  id="report-remarks"
                  rows={4}
                  value={remarks}
                  onChange={(event) =>
                    setRemarks(event.target.value)
                  }
                />
              </div>

              <div className="flex justify-end gap-2">
                <AppButton
                  variant="secondary"
                  disabled={saving}
                  onClick={() => setNextStatus('')}
                >
                  Cancel
                </AppButton>

                <AppButton
                  variant={
                    nextStatus === 'DISMISSED'
                      ? 'danger'
                      : 'primary'
                  }
                  loading={saving}
                  onClick={processReport}
                >
                  Confirm {humanize(nextStatus)}
                </AppButton>
              </div>
            </div>
          )}
        </section>
      )}
    </div>
  )
}

export default AdminReportDetailsPage