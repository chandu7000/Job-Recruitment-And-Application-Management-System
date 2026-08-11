import { useCallback, useEffect, useState } from 'react'
import PageHeader from '../../../components/common/PageHeader'
import ErrorState from '../../../components/feedback/ErrorState'
import PageLoader from '../../../components/feedback/PageLoader'
import { getApiErrorMessage } from '../../../api/errorMapper'
import { adminApi } from '../services/adminApi'

function AdminDashboardPage() {
  const [state, setState] = useState({
    data: null,
    loading: true,
    error: null,
  })

  const load = useCallback(async () => {
    setState((current) => ({
      ...current,
      loading: true,
      error: null,
    }))

    try {
      const data = await adminApi.dashboard()

      setState({
        data,
        loading: false,
        error: null,
      })
    } catch (error) {
      if (error?.name !== 'CanceledError' && error?.code !== 'ERR_CANCELED') {
        setState({
          data: null,
          loading: false,
          error,
        })
      }
    }
  }, [])

  useEffect(() => {
    const controller = new AbortController()

    adminApi
      .dashboard(controller.signal)
      .then((data) => {
        setState({
          data,
          loading: false,
          error: null,
        })
      })
      .catch((error) => {
        if (error?.name !== 'CanceledError' && error?.code !== 'ERR_CANCELED') {
          setState({
            data: null,
            loading: false,
            error,
          })
        }
      })

    return () => controller.abort()
  }, [])

  if (state.loading) {
    return <PageLoader label="Loading admin dashboard" />
  }

  if (state.error) {
    return (
      <ErrorState
        message={getApiErrorMessage(state.error)}
        onRetry={load}
      />
    )
  }

  const users = state.data?.users ?? {}

  const cards = [
    ['Total users', users.total ?? 0],
    ['Job Seekers', users.byRole?.JOB_SEEKER ?? 0],
    ['Recruiters', users.byRole?.RECRUITER ?? 0],
    ['Admins', users.byRole?.ADMIN ?? 0],
    ['Active users', users.byStatus?.ACTIVE ?? 0],
    ['Disabled users', users.byStatus?.DISABLED ?? 0],
    ['Suspended users', users.byStatus?.SUSPENDED ?? 0],
    [
      'Pending verification',
      users.byStatus?.PENDING_VERIFICATION ?? 0,
    ],
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Admin dashboard"
        description="Live user statistics from the CareerForge administration backend."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(([label, value]) => (
          <section
            key={label}
            className="rounded-2xl border border-slate-200 bg-white p-5"
          >
            <p className="text-sm text-slate-500">{label}</p>
            <p className="mt-2 text-3xl font-bold text-slate-950">
              {value}
            </p>
          </section>
        ))}
      </div>
    </div>
  )
}

export default AdminDashboardPage