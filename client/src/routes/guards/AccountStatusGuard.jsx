import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../features/auth/hooks/useAuth'

function AccountStatusGuard() {
  const { status } = useAuth()

  return status === 'ACTIVE' ? (
    <Outlet />
  ) : (
    <Navigate to="/account-restricted" replace state={{ status }} />
  )
}

export default AccountStatusGuard
