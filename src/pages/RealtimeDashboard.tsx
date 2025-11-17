import { motion } from 'framer-motion'
import
  {
    Calendar,
    ClipboardCheck,
    Package,
    TrendingUp,
    Wrench
  } from 'lucide-react'
import { useState } from 'react'
import CollaborativeJobBoard from '../components/CollaborativeJobBoard'
import RealtimeDashboardOverview from '../components/RealtimeDashboardOverview'
import RealtimeInventoryDashboard from '../components/RealtimeInventoryDashboard'
import RealtimeMaintenanceDashboard from '../components/RealtimeMaintenanceDashboard'
import RealtimeRepairsDashboard from '../components/RealtimeRepairsDashboard'
import RealtimeStatus from '../components/RealtimeStatus'

const dashboardTabs = [
  { id: 'overview', label: 'Overview', icon: TrendingUp },
  { id: 'inventory', label: 'Real-time Inventory', icon: Package },
  { id: 'jobs', label: 'Collaborative Jobs', icon: ClipboardCheck },
  { id: 'repairs', label: 'Live Repairs', icon: Wrench },
  { id: 'maintenance', label: 'Maintenance', icon: Calendar }
]

export default function RealtimeDashboard() {
  const [activeTab, setActiveTab] = useState('overview')

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <RealtimeDashboardOverview />
      case 'inventory':
        return <RealtimeInventoryDashboard />
      case 'jobs':
        return <CollaborativeJobBoard />
      case 'repairs':
        return <RealtimeRepairsDashboard />
      case 'maintenance':
        return <RealtimeMaintenanceDashboard />
      default:
        return (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Coming Soon</h3>
            <p className="text-gray-500">This section is under development with real-time features.</p>
          </div>
        )
    }
  }

  return (
    <div className="space-y-6">
      {/* Header with Real-time Status */}
      <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Real-time Farm Management</h1>
          <p className="text-gray-600 mt-2">Live collaboration and instant updates across all farm operations</p>
        </div>
        <RealtimeStatus />
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8 overflow-x-auto">
          {dashboardTabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-5 w-5 mr-2" />
                {tab.label}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        {renderTabContent()}
      </motion.div>
    </div>
  )
}
