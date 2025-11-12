import { useAuthContext } from '../components/auth/AuthContext'

/**
 * Custom hook for checking user permissions and roles
 * @returns Object with permission checking utilities
 */
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
