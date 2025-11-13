import { motion } from 'framer-motion'
import { Bell, Database, MapPin, Save, Settings as SettingsIcon, Shield, Users } from 'lucide-react'
import { useState } from 'react'
import { FarmsManagement } from '../components/FarmsManagement'

// Define proper types for settings
interface GeneralSettings {
  farmName: string
  timezone: string
  language: string
  theme: string
  autoSave: boolean
}

interface NotificationSettings {
  emailNotifications: boolean
  pushNotifications: boolean
  maintenanceAlerts: boolean
  inventoryAlerts: boolean
  jobReminders: boolean
  inspectionReminders: boolean
}

interface SecuritySettings {
  twoFactorAuth: boolean
  sessionTimeout: number
  passwordExpiry: number
  loginAttempts: number
}

interface DataSettings {
  autoBackup: boolean
  backupFrequency: string
  offlineSync: boolean
  dataRetention: number
}

interface AppSettings {
  general: GeneralSettings
  notifications: NotificationSettings
  security: SecuritySettings
  data: DataSettings
}

const settingsSections = [
  {
    id: 'general',
    title: 'General Settings',
    icon: SettingsIcon,
    description: 'Basic application settings and preferences'
  },
  {
    id: 'farms',
    title: 'Farms',
    icon: MapPin,
    description: 'Manage farm locations and assignments'
  },
  {
    id: 'notifications',
    title: 'Notifications',
    icon: Bell,
    description: 'Configure alerts and notification preferences'
  },
  {
    id: 'security',
    title: 'Security',
    icon: Shield,
    description: 'Security settings and access controls'
  },
  {
    id: 'data',
    title: 'Data Management',
    icon: Database,
    description: 'Data backup and synchronization settings'
  },
  {
    id: 'users',
    title: 'User Management',
    icon: Users,
    description: 'Manage users and permissions'
  }
]

export default function Settings() {
  const [activeSection, setActiveSection] = useState('general')
  const [settings, setSettings] = useState<AppSettings>({
    general: {
      farmName: 'Green Valley Farm',
      timezone: 'America/New_York',
      language: 'en',
      theme: 'light',
      autoSave: true
    },
    notifications: {
      emailNotifications: true,
      pushNotifications: true,
      maintenanceAlerts: true,
      inventoryAlerts: true,
      jobReminders: true,
      inspectionReminders: true
    },
    security: {
      twoFactorAuth: false,
      sessionTimeout: 30,
      passwordExpiry: 90,
      loginAttempts: 5
    },
    data: {
      autoBackup: true,
      backupFrequency: 'daily',
      offlineSync: true,
      dataRetention: 365
    }
  })

  const handleSettingChange = <T extends keyof AppSettings>(
    section: T,
    key: keyof AppSettings[T],
    value: AppSettings[T][keyof AppSettings[T]]
  ) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }))
  }

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Farm Name
        </label>
        <input
          type="text"
          value={settings.general.farmName}
          onChange={(e) => handleSettingChange('general', 'farmName', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Timezone
        </label>
        <select
          value={settings.general.timezone}
          onChange={(e) => handleSettingChange('general', 'timezone', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
        >
          <option value="America/New_York">Eastern Time</option>
          <option value="America/Chicago">Central Time</option>
          <option value="America/Denver">Mountain Time</option>
          <option value="America/Los_Angeles">Pacific Time</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Language
        </label>
        <select
          value={settings.general.language}
          onChange={(e) => handleSettingChange('general', 'language', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
        >
          <option value="en">English</option>
          <option value="es">Spanish</option>
          <option value="fr">French</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Theme
        </label>
        <select
          value={settings.general.theme}
          onChange={(e) => handleSettingChange('general', 'theme', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
        >
          <option value="light">Light</option>
          <option value="dark">Dark</option>
          <option value="auto">Auto</option>
        </select>
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          id="autoSave"
          checked={settings.general.autoSave}
          onChange={(e) => handleSettingChange('general', 'autoSave', e.target.checked)}
          className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
        />
        <label htmlFor="autoSave" className="ml-2 block text-sm text-gray-700">
          Enable auto-save
        </label>
      </div>
    </div>
  )

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      {Object.entries(settings.notifications).map(([key, value]) => (
        <div key={key} className="flex items-center justify-between">
          <div>
            <label className="text-sm font-medium text-gray-700">
              {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
            </label>
            <p className="text-sm text-gray-500">
              {key === 'emailNotifications' && 'Receive notifications via email'}
              {key === 'pushNotifications' && 'Receive push notifications in browser'}
              {key === 'maintenanceAlerts' && 'Get alerts for upcoming maintenance'}
              {key === 'inventoryAlerts' && 'Get alerts for low stock items'}
              {key === 'jobReminders' && 'Receive reminders for scheduled jobs'}
              {key === 'inspectionReminders' && 'Receive inspection reminders'}
            </p>
          </div>
          <input
            type="checkbox"
            checked={value as boolean}
            onChange={(e) => handleSettingChange('notifications', key as keyof NotificationSettings, e.target.checked)}
            className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
          />
        </div>
      ))}
    </div>
  )

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <label className="text-sm font-medium text-gray-700">
            Two-Factor Authentication
          </label>
          <p className="text-sm text-gray-500">
            Add an extra layer of security to your account
          </p>
        </div>
        <input
          type="checkbox"
          checked={settings.security.twoFactorAuth}
          onChange={(e) => handleSettingChange('security', 'twoFactorAuth', e.target.checked)}
          className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Session Timeout (minutes)
        </label>
        <input
          type="number"
          value={settings.security.sessionTimeout}
          onChange={(e) => handleSettingChange('security', 'sessionTimeout', parseInt(e.target.value))}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          min="5"
          max="480"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Password Expiry (days)
        </label>
        <input
          type="number"
          value={settings.security.passwordExpiry}
          onChange={(e) => handleSettingChange('security', 'passwordExpiry', parseInt(e.target.value))}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          min="30"
          max="365"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Max Login Attempts
        </label>
        <input
          type="number"
          value={settings.security.loginAttempts}
          onChange={(e) => handleSettingChange('security', 'loginAttempts', parseInt(e.target.value))}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          min="3"
          max="10"
        />
      </div>
    </div>
  )

  const renderDataSettings = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <label className="text-sm font-medium text-gray-700">
            Automatic Backup
          </label>
          <p className="text-sm text-gray-500">
            Automatically backup your data to cloud storage
          </p>
        </div>
        <input
          type="checkbox"
          checked={settings.data.autoBackup}
          onChange={(e) => handleSettingChange('data', 'autoBackup', e.target.checked)}
          className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Backup Frequency
        </label>
        <select
          value={settings.data.backupFrequency}
          onChange={(e) => handleSettingChange('data', 'backupFrequency', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          disabled={!settings.data.autoBackup}
        >
          <option value="hourly">Hourly</option>
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
        </select>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <label className="text-sm font-medium text-gray-700">
            Offline Sync
          </label>
          <p className="text-sm text-gray-500">
            Sync data when connection is restored
          </p>
        </div>
        <input
          type="checkbox"
          checked={settings.data.offlineSync}
          onChange={(e) => handleSettingChange('data', 'offlineSync', e.target.checked)}
          className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Data Retention (days)
        </label>
        <input
          type="number"
          value={settings.data.dataRetention}
          onChange={(e) => handleSettingChange('data', 'dataRetention', parseInt(e.target.value))}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          min="30"
          max="3650"
        />
      </div>
    </div>
  )

  const renderUserManagement = () => (
    <div className="space-y-6">
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Current User</h4>
        <div className="space-y-2">
          <p className="text-sm text-gray-600">Name: Farm Manager</p>
          <p className="text-sm text-gray-600">Role: Administrator</p>
          <p className="text-sm text-gray-600">Email: manager@greenvaleyfarm.com</p>
        </div>
      </div>

      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-4">User Roles</h4>
        <div className="space-y-3">
          <div className="flex justify-between items-center p-3 border border-gray-200 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">Administrator</p>
              <p className="text-sm text-gray-500">Full system access</p>
            </div>
            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Active</span>
          </div>
          <div className="flex justify-between items-center p-3 border border-gray-200 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">Supervisor</p>
              <p className="text-sm text-gray-500">Can manage jobs and inspections</p>
            </div>
            <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">Available</span>
          </div>
          <div className="flex justify-between items-center p-3 border border-gray-200 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">Operator</p>
              <p className="text-sm text-gray-500">Can view and update assigned tasks</p>
            </div>
            <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">Available</span>
          </div>
        </div>
      </div>
    </div>
  )

  const renderSectionContent = () => {
    switch (activeSection) {
      case 'general':
        return renderGeneralSettings()
      case 'farms':
        return <FarmsManagement />
      case 'notifications':
        return renderNotificationSettings()
      case 'security':
        return renderSecuritySettings()
      case 'data':
        return renderDataSettings()
      case 'users':
        return renderUserManagement()
      default:
        return renderGeneralSettings()
    }
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Settings Navigation */}
      <div className="lg:w-1/3">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Settings</h3>
          <nav className="space-y-2">
            {settingsSections.map((section, index) => {
              const Icon = section.icon
              return (
                <motion.button
                  key={section.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    activeSection === section.id
                      ? 'bg-green-100 text-green-900'
                      : 'hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <div className="flex items-center">
                    <Icon className={`h-5 w-5 mr-3 ${
                      activeSection === section.id ? 'text-green-600' : 'text-gray-400'
                    }`} />
                    <div>
                      <p className="font-medium">{section.title}</p>
                      <p className="text-sm opacity-75">{section.description}</p>
                    </div>
                  </div>
                </motion.button>
              )
            })}
          </nav>
        </div>
      </div>

      {/* Settings Content */}
      <div className="lg:w-2/3">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              {settingsSections.find(s => s.id === activeSection)?.title}
            </h3>
            <button className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </button>
          </div>

          <motion.div
            key={activeSection}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {renderSectionContent()}
          </motion.div>
        </div>
      </div>
    </div>
  )
}
