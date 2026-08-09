import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../features/auth/hooks/useAuth'

function RoleRoute({ allowedRoles }) {
  const { role } = useAuth()
  return allowedRoles.includes(role) ? <Outlet /> : <Navigate to="/unauthorized" replace />
}

export default RoleRoute
