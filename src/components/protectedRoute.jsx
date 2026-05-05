import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Forbidden from '../pages/Forbidden'

const ProtectedRoute = ({ allowedRoles }) => {
  const { user, loading } = useAuth()

  if (loading) return null

  if (!user) return <Navigate to="/login" replace />

  if (!allowedRoles.includes(user.role)) return <Forbidden />

  return <Outlet />
}

export default ProtectedRoute