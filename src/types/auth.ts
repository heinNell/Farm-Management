export interface User {
  projectId: string
  userId: string
  email: string
  userName: string
  userRole: 'ADMIN' | 'USER'
  createdTime: string
  accessToken: string
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  userRole: 'ADMIN' | 'USER' | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}
