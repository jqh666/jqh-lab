import { Navigate } from 'react-router-dom'
import useAuthStore from '../../stores/authStore.js'

export default function ProtectedRoute({ children }) {
  const user = useAuthStore((s) => s.user)
  if (!user || user.role !== 'admin') {
    return <Navigate to="/" replace />
  }
  return children
}
