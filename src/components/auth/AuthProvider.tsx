
import React, { createContext, useContext } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { motion } from 'framer-motion'
import {Shield, User, LogIn, LogOut, Loader} from 'lucide-react'

interface AuthContextType {
  user: any
  isAuthenticated: boolean
  userRole: 'ADMIN' | 'USER' | null
  loading: boolean
  signIn: () => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function useAuthContext() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuthContext must be used within AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: React.ReactNode
}

export default function AuthProvider({ children }: AuthProviderProps) {
  const authState = useAuth()
  const { user, isAuthenticated, userRole, loading, signIn, signOut } = authState

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <Loader className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Initializing secure session...</p>
        </motion.div>
      </div>
    )
  }

  // Authentication required
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8"
        >
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <Shield className="h-8 w-8 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Farm Management System
            </h1>
            <p className="text-gray-600">
              Secure access required to continue
            </p>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={signIn}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
          >
            <LogIn className="h-5 w-5" />
            <span>Sign In to Continue</span>
          </motion.button>

          <div className="mt-6 text-center text-sm text-gray-500">
            <p>Secure authentication powered by Lumi Platform</p>
          </div>
        </motion.div>
      </div>
    )
  }

  // Authenticated - render app with header
  return (
    <AuthContext.Provider value={authState}>
      <div className="min-h-screen bg-gray-50">
        {/* Authentication Header */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-3">
                <Shield className="h-6 w-6 text-blue-600" />
                <span className="text-sm font-medium text-gray-900">
                  Farm Management System
                </span>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 text-sm">
                  <User className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-700">{user?.userName}</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    userRole === 'ADMIN' 
                      ? 'bg-red-100 text-red-800' 
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {userRole}
                  </span>
                </div>
                
                <button
                  onClick={signOut}
                  className="text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Application */}
        <div className="pt-0">
          {children}
        </div>
      </div>
    </AuthContext.Provider>
  )
}
