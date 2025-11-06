
import React from 'react'
import { useAuthContext } from './AuthProvider'

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

// Utility hook for permission checking
export function usePermissions() {
  const { isAuthenticated, userRole } = useAuthContext()

  const hasRole = (role: 'ADMIN' | 'USER') => {
    return isAuthenticated && userRole === role
  }

  const hasAnyRole = (roles: ('ADMIN' | 'USER')[]) => {
    return isAuthenticated && userRole && roles.includes(userRole)
  }

  const isAdmin = () => hasRole('ADMIN')
  const isUser = () => hasRole('USER')

  return {
    isAuthenticated,
    userRole,
    hasRole,
    hasAnyRole,
    isAdmin,
    isUser,
    canDelete: isAdmin(),
    canModifyUsers: isAdmin(),
    canAccessReports: isAdmin() || isUser(),
    canModifySettings: isAdmin(),
    canViewAuditLog: isAdmin()
  }
}
