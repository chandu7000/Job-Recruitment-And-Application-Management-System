import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import AppButton from '../../../components/common/AppButton'
import PageHeader from '../../../components/common/PageHeader'
import ErrorState from '../../../components/feedback/ErrorState'
import PageLoader from '../../../components/feedback/PageLoader'
import ConfirmationModal from '../../../components/modals/ConfirmationModal'
import { getApiErrorMessage } from '../../../api/errorMapper'
import { formatDateTime } from '../../../utils/date'
import UserStatusBadge from '../components/UserStatusBadge'
import { roleLabel } from '../constants/adminConstants'
import { adminApi } from '../services/adminApi'

const actionConfig = {
  activate: {
    label: 'Activate user',
    title: 'Activate this user?',
    message: 'This account will be allowed to use CareerForge again.',
    success: 'User activated successfully.',
    method: 'activateUser',
    variant: 'primary',
  },
  disable: {
    label: 'Disable user',
    title: 'Disable this user?',
    message: 'This user may no longer be able to access CareerForge.',
    success: 'User disabled successfully.',
    method: 'disableUser',
    variant: 'danger',
  },
  suspend: {
    label: 'Suspend user',
    title: 'Suspend this user?',
    message:
      'This user may no longer be able to access CareerForge while suspended.',
    success: 'User suspended successfully.',
    method: 'suspendUser',
    variant: 'danger',
  },
}

function AdminUserDetailsPage() {
  const { userId } = useParams()

  const [state, setState] = useState({
    user: null,
    loading: true,
    error: null,
  })

  const [action, setAction] = useState('')
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    setState((current) => ({
      ...current,
      loading: true,
      error: null,
    }))

    try {
      const user = await adminApi.getUser(userId)

      setState({
        user,
        loading: false,
        error: null,
      })
    } catch (error) {
      if (error?.name !== 'CanceledError' && error?.code !== 'ERR_CANCELED') {
        setState({
          user: null,
          loading: false,
          error,
        })
      }
    }
  }, [userId])

  useEffect(() => {
    const controller = new AbortController()

    adminApi
      .getUser(userId, controller.signal)
      .then((user) => {
        setState({
          user,
          loading: false,
          error: null,
        })
      })
      .catch((error) => {
        if (error?.name !== 'CanceledError' && error?.code !== 'ERR_CANCELED') {
          setState({
            user: null,
            loading: false,
            error,
          })
        }
      })

    return () => controller.abort()
  }, [userId])

  const confirm = async () => {
    const config = actionConfig[action]

    if (!config) return

    setSaving(true)

    try {
      await adminApi[config.method](userId)

      toast.success(config.success)
      setAction('')

      const refreshed = await adminApi.getUser(userId)

      setState({
        user: refreshed,
        loading: false,
        error: null,
      })
    } catch (error) {
      toast.error(getApiErrorMessage(error))
    } finally {
      setSaving(false)
    }
  }

  if (state.loading) {
    return <PageLoader label="Loading user details" />
  }

  if (state.error) {
    return (
      <ErrorState
        message={getApiErrorMessage(state.error)}
        onRetry={load}
      />
    )
  }

  const user = state.user

  const fields = [
    ['Email', user?.email ?? '—'],
    ['Role', roleLabel(user?.role)],
    [
      'Email verification',
      user?.emailVerifiedAt
        ? `Verified ${formatDateTime(user.emailVerifiedAt)}`
        : 'Not verified',
    ],
    ['Created', formatDateTime(user?.createdAt)],
    ['Last updated', formatDateTime(user?.updatedAt)],
    ['Last login', formatDateTime(user?.lastLoginAt)],
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="User details"
        description="Review the backend-authorized account fields before taking an administrative action."
        actions={
          <Link
            className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700"
            to="/admin/users"
          >
            Back to users
          </Link>
        }
      />

      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm text-slate-500">Account status</p>
            <div className="mt-2">
              <UserStatusBadge status={user?.status} />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {user?.status !== 'ACTIVE' && (
              <AppButton onClick={() => setAction('activate')}>
                Activate user
              </AppButton>
            )}

            {user?.status !== 'DISABLED' && (
              <AppButton
                variant="danger"
                onClick={() => setAction('disable')}
              >
                Disable user
              </AppButton>
            )}

            {user?.status !== 'SUSPENDED' && (
              <AppButton
                variant="secondary"
                onClick={() => setAction('suspend')}
              >
                Suspend user
              </AppButton>
            )}
          </div>
        </div>

        <dl className="mt-6 grid gap-4 sm:grid-cols-2">
          {fields.map(([label, value]) => (
            <div
              key={label}
              className="rounded-xl bg-slate-50 p-4"
            >
              <dt className="text-sm font-medium text-slate-500">
                {label}
              </dt>
              <dd className="mt-1 break-words font-semibold text-slate-950">
                {value}
              </dd>
            </div>
          ))}
        </dl>

        <p className="mt-5 text-sm text-slate-500">
          Role is read-only because the current backend exposes no secure
          role-change endpoint.
        </p>
      </section>

      <ConfirmationModal
        isOpen={Boolean(action)}
        title={actionConfig[action]?.title}
        message={actionConfig[action]?.message}
        confirmLabel={actionConfig[action]?.label}
        confirmVariant={actionConfig[action]?.variant}
        loading={saving}
        onConfirm={confirm}
        onCancel={() => setAction('')}
      />
    </div>
  )
}

export default AdminUserDetailsPage