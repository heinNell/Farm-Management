
import { useAuthContext } from './AuthContext'

interface RoleGuardProps {
  children: React.ReactNode
  allowedRoles?: ('ADMIN' | 'USER')[]
  requiredRole?: 'ADMIN' | 'USER'
  fallback?: React.ReactNode
  requireAuth?: boolean
}

export default function RoleGuard({
  children,
  allowedRoles,
  requiredRole,
  fallback = null,
  requireAuth = true
}: RoleGuardProps) {
  const { isAuthenticated, userRole } = useAuthContext()

  // Authentication check
  if (requireAuth && !isAuthenticated) {
    return <>{fallback}</>
  }

  // Role-based access control
  if (requiredRole && userRole !== requiredRole) {
    return <>{fallback}</>
  }

  if (allowedRoles && userRole && !allowedRoles.includes(userRole)) {
    return <>{fallback}</>
  }

  return <>{children}</>
}
