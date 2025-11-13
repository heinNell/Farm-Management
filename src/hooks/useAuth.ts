// /workspaces/Farm-Management/src/hooks/useAuth.ts

import type { User } from '@supabase/supabase-js';
import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

type UserRole = 'ADMIN' | 'USER' | null;

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  userRole: UserRole;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

// Move fetchUserRole outside component to make it stable
async function fetchUserRole(userId: string): Promise<UserRole> {
  try {
    console.log(`Fetching role for user: ${userId}`);
    const startTime = Date.now();
    
    // Fetch role with additional error handling
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .maybeSingle();
    
    const elapsed = Date.now() - startTime;
    console.log(`Role query completed in ${elapsed}ms`);

    if (error) {
      console.error('Role Fetch Error:', error);
      // Don't throw - just return default role
      return 'USER';
    }

    const role = data?.role as UserRole;
    console.log(`Role fetched: ${role || 'USER (default)'}`);
    
    // If no role found, create default USER role entry
    if (!data) {
      console.log('No role found - creating default USER role');
      const { error: insertError } = await supabase
        .from('user_roles')
        .insert({ user_id: userId, role: 'USER' });
      
      if (insertError) {
        console.error('Error creating default role:', insertError);
      }
      return 'USER';
    }
    
    return role ?? 'USER';
  } catch (fetchRoleError) {
    console.error('Role Fetch Error:', fetchRoleError);
    
    // More detailed error logging
    if (fetchRoleError instanceof Error) {
      console.error('Error details:', fetchRoleError.message);
    }

    // Return default role instead of setting error state
    return 'USER';
  }
}

export function useAuth(): AuthState {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    let timeoutId: NodeJS.Timeout;

    const fetchInitialSession = async () => {
      try {
        console.log('Fetching initial session...');
        console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
        
        // Try to get session with a reasonable timeout
        const timeoutPromise = new Promise<{ data: { session: null }, error: null }>((resolve) => {
          timeoutId = setTimeout(() => {
            console.warn('Session fetch taking longer than expected - proceeding as logged out');
            resolve({ data: { session: null }, error: null });
          }, 8000); // 8 second timeout - increased slightly for slower connections
        });

        const sessionPromise = supabase.auth.getSession();
        
        const { data: { session }, error: sessionError } = await Promise.race([
          sessionPromise,
          timeoutPromise
        ]);
        
        clearTimeout(timeoutId);

        if (sessionError) {
          console.error('Session Fetch Error:', sessionError);
          // Don't throw - just proceed as logged out
          if (mounted) {
            setUser(null);
            setUserRole(null);
          }
          return;
        }

        if (!mounted) return;

        console.log('Initial Session:', session ? 'Found' : 'Not Found');
        
        if (session?.user) {
          console.log('User authenticated, fetching role...');
          setUser(session.user);
          const role = await fetchUserRole(session.user.id);
          if (mounted) {
            setUserRole(role);
            console.log('Authentication complete');
          }
        } else {
          console.log('No active session');
          setUser(null);
          setUserRole(null);
        }
      } catch (fetchError) {
        clearTimeout(timeoutId);
        console.error('Initial Session Fetch Error:', fetchError);
        if (mounted) {
          setUser(null);
          setUserRole(null);
        }
      } finally {
        if (mounted) {
          console.log('Setting loading to false');
          setLoading(false);
        }
      }
    };

    void fetchInitialSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        console.log('Auth State Change Event:', _event);
        
        if (!mounted) return;

        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Fetch role with timeout to prevent hanging
          try {
            const rolePromise = fetchUserRole(session.user.id);
            const timeoutPromise = new Promise<UserRole>((resolve) => {
              setTimeout(() => {
                console.log('Auth state change: Role fetch timeout - using default');
                resolve('USER');
              }, 5000);
            });
            
            const role = await Promise.race([rolePromise, timeoutPromise]);
            if (mounted) {
              setUserRole(role);
            }
          } catch (roleError) {
            console.error('Auth state change: Role fetch failed:', roleError);
            if (mounted) {
              setUserRole('USER');
            }
          }
        } else {
          setUserRole(null);
        }
      }
    );

    return () => {
      mounted = false;
      clearTimeout(timeoutId);
      subscription.unsubscribe();
    };
  }, []); // Empty deps now safe since fetchUserRole is stable

  const signIn = useCallback(async (email: string, password: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Starting sign-in process...');
      
      // Sign in without timeout - let it complete
      const { data, error: signInError } = await supabase.auth.signInWithPassword({ 
        email, 
        password 
      });

      if (signInError) {
        console.error('Sign-in error:', signInError);
        throw signInError;
      }

      console.log('Sign-in successful, setting user...');
      setUser(data.user);
      
      // Fetch role with timeout but don't block on it
      if (data.user) {
        console.log('Fetching user role...');
        try {
          const rolePromise = fetchUserRole(data.user.id);
          const timeoutPromise = new Promise<UserRole>((resolve) => {
            setTimeout(() => {
              console.log('Role fetch timeout - using default');
              resolve('USER');
            }, 5000);
          });
          
          const role = await Promise.race([rolePromise, timeoutPromise]);
          setUserRole(role);
          console.log('Sign-in process complete');
        } catch (roleError) {
          console.error('Role fetch failed, using default:', roleError);
          setUserRole('USER');
        }
      }
    } catch (signInError) {
      console.error('Sign-in Error:', signInError);
      const errorMessage = (signInError as Error).message || 'Sign-in failed';
      setError(errorMessage);
      setUser(null);
      setUserRole(null);
      throw signInError; // Re-throw so AuthProvider can handle it
    } finally {
      setLoading(false);
    }
  }, []);

  const signOut = useCallback(async (): Promise<void> => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setUserRole(null);
    } catch (signOutError) {
      console.error('Sign-out Error:', signOutError);
      setError((signOutError as Error).message || 'Sign-out failed');
    }
  }, []);

  return {
    user,
    isAuthenticated: !!user,
    userRole,
    loading,
    error,
    signIn,
    signOut,
  };
}