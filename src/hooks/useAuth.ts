
import { useState, useEffect } from 'react'
import { lumi } from '../lib/lumi'

interface User {
  projectId: string
  userId: string
  email: string
  userName: string
  userRole: 'ADMIN' | 'USER'
  createdTime: string
  accessToken: string
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  userRole: 'ADMIN' | 'USER' | null
  loading: boolean
  signIn: () => Promise<void>
  signOut: () => Promise<void>
}

export function useAuth(): AuthState {
  const [user, setUser] = useState<User | null>(lumi.auth.user)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check existing session on mount
    const checkExistingSession = () => {
      try {
        if (lumi.auth.isAuthenticated && lumi.auth.user) {
          setUser(lumi.auth.user)
        }
      } catch (error) {
        console.error('Session check failed:', error)
      } finally {
        setLoading(false)
      }
    }

    checkExistingSession()

    // Monitor authentication state changes
    const unsubscribe = lumi.auth.onAuthChange((authUser: User | null) => {
      setUser(authUser)
      setLoading(false)
    })

    return unsubscribe
  }, [])

  const signIn = async () => {
    try {
      setLoading(true)
      await lumi.auth.signIn()
      // User state will be updated via onAuthChange
    } catch (error) {
      console.error('Login failed:', error)
      setLoading(false)
      throw error
    }
  }

  const signOut = async () => {
    try {
      setLoading(true)
      await lumi.auth.signOut()
      // User state will be updated via onAuthChange
    } catch (error) {
      console.error('Logout failed:', error)
      setLoading(false)
      throw error
    }
  }

  return {
    user,
    isAuthenticated: !!user && lumi.auth.isAuthenticated,
    userRole: user?.userRole || null,
    loading,
    signIn,
    signOut
  }
}
