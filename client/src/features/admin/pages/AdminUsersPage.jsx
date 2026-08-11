import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import PageHeader from '../../../components/common/PageHeader'
import EmptyState from '../../../components/feedback/EmptyState'
import ErrorState from '../../../components/feedback/ErrorState'
import PageLoader from '../../../components/feedback/PageLoader'
import Pagination from '../../publicJobs/components/Pagination'
import { getApiErrorMessage } from '../../../api/errorMapper'
import { formatDate } from '../../../utils/date'
import UserFilters from '../components/UserFilters'
import UserStatusBadge from '../components/UserStatusBadge'
import { roleLabel } from '../constants/adminConstants'
import { adminApi } from '../services/adminApi'

const readQuery = (params) => ({
  page: Math.max(Number(params.get('page')) || 1, 1),
  search: params.get('search') || '',
  role: params.get('role') || '',
  status: params.get('status') || '',
  verified: params.get('verified') || '',
  sort: params.get('sort') || '',
})

function AdminUsersPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const paramsString = searchParams.toString()

  const query = useMemo(
    () => readQuery(new URLSearchParams(paramsString)),
    [paramsString],
  )

  const [state, setState] = useState({
    users: [],
    pagination: null,
    loading: true,
    error: null,
  })

  const setQuery = useCallback(
    (next) => {
      const value = typeof next === 'function' ? next(query) : next
      const params = new URLSearchParams()

      for (const [key, entry] of Object.entries(value)) {
        if (
          entry !== '' &&
          entry !== null &&
          entry !== undefined &&
          !(key === 'page' && Number(entry) === 1)
        ) {
          params.set(key, String(entry))
        }
      }

      setState((current) => ({
        ...current,
        loading: true,
        error: null,
      }))

      setSearchParams(params, { replace: true })
    },
    [query, setSearchParams],
  )

  const load = useCallback(async () => {
    setState((current) => ({
      ...current,
      loading: true,
      error: null,
    }))

    try {
      const result = await adminApi.listUsers(query)

      setState({
        ...result,
        loading: false,
        error: null,
      })
    } catch (error) {
      if (error?.name !== 'CanceledError' && error?.code !== 'ERR_CANCELED') {
        setState({
          users: [],
          pagination: null,
          loading: false,
          error,
        })
      }
    }
  }, [query])

  useEffect(() => {
    const controller = new AbortController()

    adminApi
      .listUsers(query, controller.signal)
      .then((result) => {
        setState({
          ...result,
          loading: false,
          error: null,
        })
      })
      .catch((error) => {
        if (error?.name !== 'CanceledError' && error?.code !== 'ERR_CANCELED') {
          setState({
            users: [],
            pagination: null,
            loading: false,
            error,
          })
        }
      })

    return () => controller.abort()
  }, [query])

  const hasFilters = Boolean(
    query.search ||
    query.role ||
    query.status ||
    query.verified,
  )

  return (
    <div className="space-y-6">
      <PageHeader
        title="User management"
        description="Search, filter and inspect registered CareerForge accounts."
      />

      <UserFilters
        query={query}
        onChange={setQuery}
        onClear={() =>
          setQuery({
            page: 1,
            search: '',
            role: '',
            status: '',
            verified: '',
            sort: '',
          })
        }
      />

      {state.loading ? (
        <PageLoader label="Loading users" />
      ) : state.error ? (
        <ErrorState
          message={getApiErrorMessage(state.error)}
          onRetry={load}
        />
      ) : state.users.length === 0 ? (
        <EmptyState
          title="No users found"
          description={
            hasFilters
              ? 'No users match the current search or filters.'
              : 'No registered users are available.'
          }
        />
      ) : (
        <>
          <p
            className="text-sm text-slate-600"
            aria-live="polite"
          >
            {state.pagination?.totalRecords ?? state.users.length}{' '}
            user
            {(state.pagination?.totalRecords ?? state.users.length) === 1
              ? ''
              : 's'}
          </p>

          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50 text-left text-slate-600">
                <tr>
                  <th className="px-4 py-3 font-semibold">Email</th>
                  <th className="px-4 py-3 font-semibold">Role</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Verified</th>
                  <th className="px-4 py-3 font-semibold">Created</th>
                  <th className="px-4 py-3 font-semibold">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {state.users.map((user) => (
                  <tr key={user.id}>
                    <td className="px-4 py-3 font-medium text-slate-950">
                      {user.email}
                    </td>

                    <td className="px-4 py-3 text-slate-700">
                      {roleLabel(user.role)}
                    </td>

                    <td className="px-4 py-3">
                      <UserStatusBadge status={user.status} />
                    </td>

                    <td className="px-4 py-3 text-slate-700">
                      {user.emailVerifiedAt
                        ? 'Verified'
                        : 'Not verified'}
                    </td>

                    <td className="px-4 py-3 text-slate-700">
                      {formatDate(user.createdAt)}
                    </td>

                    <td className="px-4 py-3">
                      <Link
                        className="font-semibold text-brand-700 hover:underline"
                        to={`/admin/users/${user.id}`}
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
            onPageChange={(page) =>
              setQuery((current) => ({
                ...current,
                page,
              }))
            }
          />
        </>
      )}
    </div>
  )
}

export default AdminUsersPage