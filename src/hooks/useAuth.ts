import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import type { User } from '@supabase/supabase-js'

type UserRole = 'ADMIN' | 'USER' | null

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  userRole: UserRole
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

export function useAuth(): AuthState {
  const [user, setUser] = useState<User | null>(null)
  const [userRole, setUserRole] = useState<UserRole>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        void fetchUserRole(session.user.id)
      } else {
        setLoading(false)
      }
    }).catch((error) => {
      console.error('Error getting session:', error)
      setUser(null)
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        void fetchUserRole(session.user.id)
      } else {
        setUserRole(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const fetchUserRole = async (userId: string): Promise<void> => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .single()

      if (error) throw error
      setUserRole((data?.role as UserRole) ?? 'USER')
    } catch (error) {
      console.error('Error fetching user role:', error)
      setUserRole('USER')
    } finally {
      setLoading(false)
    }
  }

  const signIn = async (email: string, password: string): Promise<void> => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) throw error
    
    setUser(data.user)
    if (data.user) {
      await fetchUserRole(data.user.id)
    }
  }

  const signOut = async (): Promise<void> => {
    await supabase.auth.signOut()
    setUser(null)
    setUserRole(null)
  }

  return {
    user,
    isAuthenticated: !!user,
    userRole,
    loading,
    signIn,
    signOut,
  }
}
