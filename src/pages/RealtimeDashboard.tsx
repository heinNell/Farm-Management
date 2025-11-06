
import React, { useState } from 'react'
import { motion } from 'framer-motion'
import RealtimeInventoryDashboard from '../components/RealtimeInventoryDashboard'
import CollaborativeJobBoard from '../components/CollaborativeJobBoard'
import RealtimeStatus from '../components/RealtimeStatus'
import { 
  Package, 
  Wrench, 
  ClipboardCheck, 
  Calendar,
  TrendingUp,
  Users,
  Bell
} from 'lucide-react'

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
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-lg text-white"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100">Live Inventory Items</p>
                    <p className="text-3xl font-bold">1,247</p>
                  </div>
                  <Package className="h-10 w-10 text-blue-200" />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-gradient-to-r from-green-500 to-green-600 p-6 rounded-lg text-white"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100">Active Jobs</p>
                    <p className="text-3xl font-bold">23</p>
                  </div>
                  <ClipboardCheck className="h-10 w-10 text-green-200" />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-gradient-to-r from-purple-500 to-purple-600 p-6 rounded-lg text-white"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100">Team Members Online</p>
                    <p className="text-3xl font-bold">8</p>
                  </div>
                  <Users className="h-10 w-10 text-purple-200" />
                </div>
              </motion.div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Real-time Activity Feed</h2>
              <div className="space-y-4">
                <div className="flex items-center space-x-4 p-3 bg-blue-50 rounded-lg">
                  <Bell className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Low stock alert: Hydraulic Fluid</p>
                    <p className="text-xs text-gray-500">2 minutes ago</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4 p-3 bg-green-50 rounded-lg">
                  <ClipboardCheck className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Job completed: Irrigation System Maintenance</p>
                    <p className="text-xs text-gray-500">5 minutes ago</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4 p-3 bg-yellow-50 rounded-lg">
                  <Wrench className="h-5 w-5 text-yellow-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">New repair request: Tractor Engine Issue</p>
                    <p className="text-xs text-gray-500">8 minutes ago</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      case 'inventory':
        return <RealtimeInventoryDashboard />
      case 'jobs':
        return <CollaborativeJobBoard />
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
