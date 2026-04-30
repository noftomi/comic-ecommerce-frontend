import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) return (
    <div className="flex-1 flex items-center justify-center min-h-[60vh]">
      <span className="font-headline font-black uppercase tracking-widest text-on-surface-variant animate-pulse">
        Cargando...
      </span>
    </div>
  )

  if (!user) return <Navigate to="/" replace />
  return children
}
