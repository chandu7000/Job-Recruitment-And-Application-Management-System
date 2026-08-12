import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import AppButton from '../../../components/common/AppButton'
import PageHeader from '../../../components/common/PageHeader'
import EmptyState from '../../../components/feedback/EmptyState'
import ErrorState from '../../../components/feedback/ErrorState'
import PageLoader from '../../../components/feedback/PageLoader'
import AppTextarea from '../../../components/forms/AppTextarea'
import ConfirmationModal from '../../../components/modals/ConfirmationModal'
import Pagination from '../../publicJobs/components/Pagination'
import { getApiErrorMessage } from '../../../api/errorMapper'
import { formatDateTime } from '../../../utils/date'
import AdminStatusBadge from '../components/AdminStatusBadge'
import { validateCompanyRejectionReason } from '../utils/adminModerationUtils'
import { adminApi } from '../services/adminApi'

function AdminCompaniesPage() {
  const [page, setPage] = useState(1)

  const [state, setState] = useState({
    companies: [],
    pagination: null,
    loading: true,
    error: null,
  })

  const [action, setAction] = useState(null)
  const [reason, setReason] = useState('')
  const [reasonError, setReasonError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const controller = new AbortController()
    let active = true

    adminApi
      .listPendingCompanies({ page }, controller.signal)
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
          companies: [],
          pagination: null,
          loading: false,
          error,
        })
      })

    return () => {
      active = false
      controller.abort()
    }
  }, [page])

  const reload = useCallback(async () => {
    setState((current) => ({
      ...current,
      loading: true,
      error: null,
    }))

    try {
      const result = await adminApi.listPendingCompanies({ page })

      setState({
        ...result,
        loading: false,
        error: null,
      })
    } catch (error) {
      setState({
        companies: [],
        pagination: null,
        loading: false,
        error,
      })
    }
  }, [page])

  const closeAction = () => {
    if (saving) return

    setAction(null)
    setReason('')
    setReasonError('')
  }

  const confirm = async () => {
    if (!action) return

    if (action.type === 'reject') {
      const validation = validateCompanyRejectionReason(reason)

      if (validation) {
        setReasonError(validation)
        return
      }
    }

    setSaving(true)

    try {
      if (action.type === 'verify') {
        await adminApi.verifyCompany(action.company.id)
      } else {
        await adminApi.rejectCompany(action.company.id, reason.trim())
      }

      toast.success(
        action.type === 'verify'
          ? 'Company verified successfully.'
          : 'Company rejected successfully.',
      )

      setAction(null)
      setReason('')
      setReasonError('')

      await reload()
    } catch (error) {
      toast.error(getApiErrorMessage(error))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Company verification"
        description="Review companies currently pending backend verification."
      />

      {state.loading ? (
        <PageLoader label="Loading pending companies" />
      ) : state.error ? (
        <ErrorState
          message={getApiErrorMessage(state.error)}
          onRetry={reload}
        />
      ) : state.companies.length === 0 ? (
        <EmptyState
          title="No pending companies"
          description="There are no companies waiting for verification."
        />
      ) : (
        <>
          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50 text-left text-slate-600">
                <tr>
                  <th className="px-4 py-3">Company</th>
                  <th className="px-4 py-3">Location</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Submitted</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {state.companies.map((company) => (
                  <tr key={company.id}>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-slate-950">
                        {company.companyName}
                      </p>

                      <p className="text-slate-500">
                        {company.companyEmail ||
                          company.website ||
                          '—'}
                      </p>
                    </td>

                    <td className="px-4 py-3 text-slate-700">
                      {company.location ||
                        [company.city, company.state, company.country]
                          .filter(Boolean)
                          .join(', ') ||
                        '—'}
                    </td>

                    <td className="px-4 py-3">
                      <AdminStatusBadge status={company.status} />
                    </td>

                    <td className="px-4 py-3 text-slate-700">
                      {formatDateTime(
                        company.updatedAt || company.createdAt,
                      )}
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        <AppButton
                          onClick={() =>
                            setAction({
                              type: 'verify',
                              company,
                            })
                          }
                        >
                          Verify
                        </AppButton>

                        <AppButton
                          variant="danger"
                          onClick={() =>
                            setAction({
                              type: 'reject',
                              company,
                            })
                          }
                        >
                          Reject
                        </AppButton>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pagination
            pagination={state.pagination}
            onPageChange={setPage}
          />
        </>
      )}

      {action?.type === 'reject' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
          <section
            role="dialog"
            aria-modal="true"
            className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl"
          >
            <h2 className="text-xl font-bold">Reject company?</h2>

            <p className="mt-2 text-slate-600">
              Provide the required rejection reason for{' '}
              {action.company.companyName}.
            </p>

            <div className="mt-4">
              <label
                className="mb-2 block text-sm font-semibold"
                htmlFor="company-rejection-reason"
              >
                Rejection reason
              </label>

              <AppTextarea
                id="company-rejection-reason"
                value={reason}
                onChange={(event) => {
                  setReason(event.target.value)
                  setReasonError('')
                }}
                maxLength={2000}
                rows={5}
              />

              {reasonError && (
                <p className="mt-2 text-sm text-rose-600">
                  {reasonError}
                </p>
              )}
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <AppButton
                variant="secondary"
                disabled={saving}
                onClick={closeAction}
              >
                Cancel
              </AppButton>

              <AppButton
                variant="danger"
                loading={saving}
                onClick={confirm}
              >
                Reject company
              </AppButton>
            </div>
          </section>
        </div>
      )}

      <ConfirmationModal
        isOpen={action?.type === 'verify'}
        title="Verify company?"
        message={`Verify ${
          action?.company?.companyName || 'this company'
        }? The status will be refreshed from the backend after success.`}
        confirmLabel="Verify company"
        confirmVariant="primary"
        loading={saving}
        onConfirm={confirm}
        onCancel={closeAction}
      />
    </div>
  )
}

export default AdminCompaniesPage