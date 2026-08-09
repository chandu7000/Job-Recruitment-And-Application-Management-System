import { Laptop, RefreshCw, ShieldX } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import AppButton from '../../../components/common/AppButton'
import ConfirmationModal from '../../../components/modals/ConfirmationModal'
import EmptyState from '../../../components/feedback/EmptyState'
import ErrorState from '../../../components/feedback/ErrorState'
import LoadingSpinner from '../../../components/feedback/LoadingSpinner'
import { formatDateTime, formatRelativeDate } from '../../../utils/date'
import { useAuth } from '../hooks/useAuth'
import { authApi } from '../services/authApi'

function SessionManager() {
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [confirmation, setConfirmation] = useState(null)
  const [actionLoading, setActionLoading] = useState(false)
  const { logoutAll } = useAuth()
  const navigate = useNavigate()

  const loadSessions = useCallback(async () => {
    setLoading(true); setError(null)
    try { setSessions(await authApi.getSessions()) }
    catch (requestError) { setError(requestError.apiError ?? { message: 'Unable to load active sessions.' }) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => {
    void Promise.resolve().then(loadSessions)
  }, [loadSessions])

  const confirmAction = async () => {
    setActionLoading(true)
    try {
      if (confirmation.type === 'all') {
        await logoutAll(); toast.success('All sessions were signed out.'); navigate('/login', { replace: true })
      } else {
        await authApi.revokeSession(confirmation.session.id)
        setSessions((current) => current.filter((session) => session.id !== confirmation.session.id))
        toast.success('Session revoked successfully.')
      }
      setConfirmation(null)
    } catch (requestError) { toast.error(requestError.apiError?.message ?? 'Unable to revoke the session.') }
    finally { setActionLoading(false) }
  }

  if (loading) return <div className="flex items-center gap-3 py-6 text-slate-600"><LoadingSpinner size="small" /> Loading sessions…</div>
  if (error) return <ErrorState title="Could not load sessions" message={error.message} onRetry={loadSessions} />

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-600">Review devices that still have an active refresh session.</p>
        <div className="flex gap-2"><AppButton variant="secondary" size="small" onClick={loadSessions}><RefreshCw className="size-4" />Refresh</AppButton>{sessions.length > 0 && <AppButton variant="danger" size="small" onClick={() => setConfirmation({ type: 'all' })}><ShieldX className="size-4" />Log out all</AppButton>}</div>
      </div>
      {sessions.length === 0 ? <EmptyState title="No active sessions" description="No active device sessions were found." /> : (
        <ul className="divide-y divide-slate-200 rounded-xl border border-slate-200">
          {sessions.map((session) => (
            <li key={session.id} className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 gap-3"><span className="mt-1 rounded-lg bg-slate-100 p-2 text-slate-600"><Laptop className="size-5" /></span><div className="min-w-0"><p className="font-semibold text-slate-950">{session.deviceName || 'Unknown device'}</p><p className="mt-1 text-sm text-slate-600">{[session.browser, session.operatingSystem].filter(Boolean).join(' · ') || 'Device details unavailable'}</p><p className="mt-1 text-xs text-slate-500">Last used {formatRelativeDate(session.lastUsedAt)} · Expires {formatDateTime(session.expiresAt)}</p></div></div>
              <AppButton variant="secondary" size="small" onClick={() => setConfirmation({ type: 'one', session })}>Revoke</AppButton>
            </li>
          ))}
        </ul>
      )}
      <p className="text-xs leading-5 text-slate-500">The backend does not identify which listed entry is this browser, so CareerForge does not guess or display an inaccurate “current session” marker.</p>
      <ConfirmationModal isOpen={Boolean(confirmation)} title={confirmation?.type === 'all' ? 'Log out every session?' : 'Revoke this session?'} message={confirmation?.type === 'all' ? 'You will be signed out on every device, including this one.' : 'That device will need to log in again after its access token expires.'} confirmLabel={confirmation?.type === 'all' ? 'Log out all' : 'Revoke session'} loading={actionLoading} onConfirm={confirmAction} onCancel={() => setConfirmation(null)} />
    </div>
  )
}

export default SessionManager
