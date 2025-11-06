
import React from 'react'
import { useAuthContext } from './AuthProvider'
import { motion } from 'framer-motion'
import {Shield, AlertTriangle, Lock} from 'lucide-react'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: 'ADMIN' | 'USER'
  fallback?: React.ReactNode
}

export default function ProtectedRoute({ 
  children, 
  requiredRole = 'USER',
  fallback 
}: ProtectedRouteProps) {
  const { isAuthenticated, userRole, loading } = useAuthContext()

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <Shield className="h-8 w-8 animate-pulse text-blue-600 mx-auto mb-2" />
          <p className="text-gray-600">Verifying permissions...</p>
        </div>
      </div>
    )
  }

  // Not authenticated (should not happen due to AuthProvider, but safety check)
  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center p-6 bg-white rounded-lg shadow-md"
        >
          <Lock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Authentication Required
          </h3>
          <p className="text-gray-600">
            Please sign in to access this content.
          </p>
        </motion.div>
      </div>
    )
  }

  // Role-based access control
  if (requiredRole === 'ADMIN' && userRole !== 'ADMIN') {
    if (fallback) {
      return <>{fallback}</>
    }

    return (
      <div className="flex items-center justify-center min-h-64">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center p-6 bg-white rounded-lg shadow-md border border-red-200"
        >
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Access Restricted
          </h3>
          <p className="text-gray-600 mb-4">
            Administrator privileges required to access this feature.
          </p>
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <p className="text-sm text-red-800">
              Current Role: <span className="font-medium">{userRole}</span>
            </p>
            <p className="text-sm text-red-800">
              Required Role: <span className="font-medium">ADMIN</span>
            </p>
          </div>
        </motion.div>
      </div>
    )
  }

  // Access granted - render protected content
  return <>{children}</>
}
