import { Navigate, Outlet } from 'react-router-dom'
import PageLoader from '../../components/feedback/PageLoader'
import { useAuth } from '../../features/auth/hooks/useAuth'
import { getRoleHomePath } from '../../features/auth/utils'

function GuestOnlyRoute() {
  const { isAuthenticated, isInitializing, role } = useAuth()

  if (isInitializing) {
    return <PageLoader label="Checking your session" />
  }

  return isAuthenticated ? <Navigate to={getRoleHomePath(role)} replace /> : <Outlet />
}

export default GuestOnlyRoute
