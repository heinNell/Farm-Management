
import {TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Package, Wrench, Calendar, BarChart3, Activity} from 'lucide-react'
import { motion } from 'framer-motion'

const stats = [
  {
    name: 'Total Inventory Items',
    value: '2,847',
    change: '+12%',
    changeType: 'increase',
    icon: Package,
  },
  {
    name: 'Active Repairs',
    value: '23',
    change: '-8%',
    changeType: 'decrease',
    icon: Wrench,
  },
  {
    name: 'Pending Jobs',
    value: '156',
    change: '+3%',
    changeType: 'increase',
    icon: Calendar,
  },
  {
    name: 'Equipment Uptime',
    value: '94.2%',
    change: '+1.2%',
    changeType: 'increase',
    icon: Activity,
  },
]

const recentActivities = [
  {
    id: 1,
    type: 'inventory',
    message: 'Low stock alert: Hydraulic fluid below minimum threshold',
    time: '2 hours ago',
    status: 'warning',
  },
  {
    id: 2,
    type: 'repair',
    message: 'Repair completed for Tractor #TRC-001',
    time: '4 hours ago',
    status: 'success',
  },
  {
    id: 3,
    type: 'inspection',
    message: 'Monthly safety inspection scheduled for tomorrow',
    time: '6 hours ago',
    status: 'info',
  },
  {
    id: 4,
    type: 'maintenance',
    message: 'Preventive maintenance due for Harvester #HRV-003',
    time: '1 day ago',
    status: 'warning',
  },
]

export default function Dashboard() {
  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">Welcome to Farm Management</h1>
        <p className="text-green-100">
          Monitor your farm operations, track equipment, and manage resources efficiently.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <motion.div
              key={stat.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-lg shadow p-6"
            >
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Icon className="h-8 w-8 text-green-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {stat.name}
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {stat.value}
                      </div>
                      <div className={`
                        ml-2 flex items-baseline text-sm font-semibold
                        ${stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'}
                      `}>
                        {stat.changeType === 'increase' ? (
                          <TrendingUp className="h-4 w-4 flex-shrink-0" />
                        ) : (
                          <TrendingDown className="h-4 w-4 flex-shrink-0" />
                        )}
                        <span className="ml-1">{stat.change}</span>
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activities */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg shadow"
        >
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activities</h3>
            <div className="flow-root">
              <ul className="-mb-8">
                {recentActivities.map((activity, activityIdx) => (
                  <li key={activity.id}>
                    <div className="relative pb-8">
                      {activityIdx !== recentActivities.length - 1 ? (
                        <span
                          className="absolute top-5 left-5 -ml-px h-full w-0.5 bg-gray-200"
                          aria-hidden="true"
                        />
                      ) : null}
                      <div className="relative flex items-start space-x-3">
                        <div>
                          <div className={`
                            relative px-1 py-1 rounded-full flex items-center justify-center
                            ${activity.status === 'success' ? 'bg-green-500' : 
                              activity.status === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'}
                          `}>
                            {activity.status === 'success' ? (
                              <CheckCircle className="h-5 w-5 text-white" />
                            ) : activity.status === 'warning' ? (
                              <AlertTriangle className="h-5 w-5 text-white" />
                            ) : (
                              <BarChart3 className="h-5 w-5 text-white" />
                            )}
                          </div>
                        </div>
                        <div className="min-w-0 flex-1">
                          <div>
                            <p className="text-sm text-gray-900">{activity.message}</p>
                            <p className="mt-0.5 text-sm text-gray-500">{activity.time}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-lg shadow"
        >
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-4">
              <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <Package className="h-8 w-8 text-green-600 mb-2" />
                <span className="text-sm font-medium text-gray-900">Add Inventory</span>
              </button>
              <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <Wrench className="h-8 w-8 text-blue-600 mb-2" />
                <span className="text-sm font-medium text-gray-900">Create Repair</span>
              </button>
              <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <Calendar className="h-8 w-8 text-purple-600 mb-2" />
                <span className="text-sm font-medium text-gray-900">Schedule Job</span>
              </button>
              <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <BarChart3 className="h-8 w-8 text-orange-600 mb-2" />
                <span className="text-sm font-medium text-gray-900">View Reports</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
