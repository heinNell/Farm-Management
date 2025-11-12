import { useContext } from 'react'
import type { AuthContextType } from '../components/auth/AuthContext'
import { AuthContext } from '../components/auth/AuthContext'

export function useAuthContext(): AuthContextType {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuthContext must be used within AuthProvider')
  }
  return context
}
