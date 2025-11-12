
import { motion } from 'framer-motion'
import { Clock, Crown, LogOut, Mail, Settings, Shield, User, UserCheck } from 'lucide-react'
import { useAuthContext } from './AuthContext'

export default function UserProfile() {
  const { user, userRole, signOut } = useAuthContext()

  if (!user) return null

  const roleConfig = {
    ADMIN: {
      icon: Crown,
      color: 'red',
      label: 'Administrator',
      description: 'Full system access and management'
    },
    USER: {
      icon: UserCheck,
      color: 'blue',
      label: 'User',
      description: 'Standard operational access'
    }
  }

  const currentRole = roleConfig[userRole as keyof typeof roleConfig]
  const RoleIcon = currentRole?.icon || User

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-md p-6"
    >
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0">
          <div className={`w-16 h-16 bg-${currentRole?.color}-100 rounded-full flex items-center justify-center`}>
            <RoleIcon className={`h-8 w-8 text-${currentRole?.color}-600`} />
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-3 mb-2">
            <h2 className="text-xl font-bold text-gray-900 truncate">
              {user.email?.split('@')[0] || 'User'}
            </h2>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${currentRole?.color}-100 text-${currentRole?.color}-800`}>
              {currentRole?.label}
            </span>
          </div>

          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <Mail className="h-4 w-4" />
              <span>{user.email}</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4" />
              <span>Member since {new Date(user.created_at || Date.now()).toLocaleDateString()}</span>
            </div>

            <div className="flex items-center space-x-2">
              <Shield className="h-4 w-4" />
              <span>{currentRole?.description}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="flex space-x-3">
          <button
            className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2"
            disabled
          >
            <Settings className="h-4 w-4" />
            <span>Settings</span>
          </button>
          
          <button
            onClick={() => { void signOut() }}
            className="flex-1 bg-red-50 text-red-700 px-4 py-2 rounded-lg hover:bg-red-100 transition-colors flex items-center justify-center space-x-2"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </motion.div>
  )
}
