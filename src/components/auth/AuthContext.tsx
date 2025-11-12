import { createContext, useContext } from 'react'
import type { User } from '@supabase/supabase-js'

type UserRole = 'ADMIN' | 'USER' | null

export interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  userRole: UserRole
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

export const AuthContext = createContext<AuthContextType | null>(null)

export function useAuthContext(): AuthContextType {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuthContext must be used within AuthProvider')
  }
  return context
}
