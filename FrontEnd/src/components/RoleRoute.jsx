import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function RoleRoute({
  children,
  roles = [],
}) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="p-8">
        <p className="text-gray-500">
          Loading...
        </p>
      </div>
    )
  }

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
      />
    )
  }

  if (
    roles.length > 0 &&
    !roles.includes(user.role)
  ) {
    return (
      <Navigate
        to="/dashboard"
        replace
      />
    )
  }

  return children
}

export default RoleRoute