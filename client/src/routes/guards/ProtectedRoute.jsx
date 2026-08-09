import { Navigate, Outlet, useLocation } from 'react-router-dom'
import PageLoader from '../../components/feedback/PageLoader'
import { useAuth } from '../../features/auth/hooks/useAuth'

function ProtectedRoute() {
  const { isAuthenticated, isInitializing } = useAuth()
  const location = useLocation()

  if (isInitializing) {
    return <PageLoader label="Restoring your session" />
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return <Outlet />
}

export default ProtectedRoute
