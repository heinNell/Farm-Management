
import { motion } from 'framer-motion'
import { Activity, AlertTriangle, BarChart3, Calendar, CheckCircle, ClipboardCheck, Package, TrendingDown, TrendingUp, Wrench } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useSupabaseCRUD } from '../hooks/useSupabaseCRUD'
import type { Inspection, InventoryItem, JobCard, MaintenanceSchedule, RepairItem } from '../types/database'

export default function Dashboard() {
  const { items: inventoryItems, loading: inventoryLoading } = useSupabaseCRUD<InventoryItem>('inventory_items')
  const { items: repairItems, loading: repairsLoading } = useSupabaseCRUD<RepairItem>('repair_items')
  const { items: jobCards, loading: jobsLoading } = useSupabaseCRUD<JobCard>('job_cards')
  const { items: maintenanceSchedules, loading: maintenanceLoading } = useSupabaseCRUD<MaintenanceSchedule>('maintenance_schedules')
  const { items: inspections, loading: inspectionsLoading } = useSupabaseCRUD<Inspection>('inspections')
  
  const [stats, setStats] = useState([
    { name: 'Total Inventory Items', value: '0', change: '+0%', changeType: 'increase' as const, icon: Package },
    { name: 'Active Repairs', value: '0', change: '+0%', changeType: 'increase' as const, icon: Wrench },
    { name: 'Pending Jobs', value: '0', change: '+0%', changeType: 'increase' as const, icon: Calendar },
    { name: 'Scheduled Maintenance', value: '0', change: '+0%', changeType: 'increase' as const, icon: Activity },
  ])

  const [recentActivities, setRecentActivities] = useState<Array<{
    id: string
    type: string
    message: string
    time: string
    status: 'warning' | 'success' | 'info'
  }>>([])

  const [upcomingInspections, setUpcomingInspections] = useState<Inspection[]>([])

  const loading = inventoryLoading || repairsLoading || jobsLoading || maintenanceLoading || inspectionsLoading

  useEffect(() => {
    if (!loading) {
      // Calculate stats from real data
      const totalInventory = inventoryItems.length
      const activeRepairs = repairItems.filter(r => r.status === 'in_progress' || r.status === 'pending').length
      const pendingJobs = jobCards.filter(j => j.status === 'todo' || j.status === 'in_progress').length
      const scheduledMaintenance = maintenanceSchedules.filter(m => m.status === 'scheduled' || m.status === 'in_progress').length

      setStats([
        { name: 'Total Inventory Items', value: totalInventory.toString(), change: '+0%', changeType: 'increase', icon: Package },
        { name: 'Active Repairs', value: activeRepairs.toString(), change: '+0%', changeType: 'increase', icon: Wrench },
        { name: 'Pending Jobs', value: pendingJobs.toString(), change: '+0%', changeType: 'increase', icon: Calendar },
        { name: 'Scheduled Maintenance', value: scheduledMaintenance.toString(), change: '+0%', changeType: 'increase', icon: Activity },
      ])

      // Get upcoming inspections (within 7 days)
      const now = new Date()
      const weekFromNow = new Date()
      weekFromNow.setDate(weekFromNow.getDate() + 7)
      
      const upcoming = inspections
        .filter(i => {
          const scheduledDate = new Date(i.scheduled_date)
          return (i.status === 'scheduled' || i.status === 'in_progress') && 
                 (scheduledDate <= weekFromNow || scheduledDate < now) // Include overdue
        })
        .sort((a, b) => new Date(a.scheduled_date).getTime() - new Date(b.scheduled_date).getTime())
        .slice(0, 5)
      
      setUpcomingInspections(upcoming)

      // Generate recent activities from real data
      const activities: Array<{
        id: string
        type: string
        message: string
        time: string
        status: 'warning' | 'success' | 'info'
      }> = []

      // Low stock alerts
      const lowStockItems = inventoryItems.filter(item => item.status === 'low_stock' || item.status === 'out_of_stock')
      lowStockItems.slice(0, 2).forEach(item => {
        activities.push({
          id: `inv-${item.id}`,
          type: 'inventory',
          message: `${item.status === 'out_of_stock' ? 'Out of stock' : 'Low stock'}: ${item.name}`,
          time: getRelativeTime(item.updated_at),
          status: item.status === 'out_of_stock' ? 'warning' : 'warning'
        })
      })

      // Overdue inspections
      const overdueInspections = inspections
        .filter(i => (i.status === 'scheduled' || i.status === 'in_progress') && new Date(i.scheduled_date) < now)
        .slice(0, 2)
      overdueInspections.forEach(inspection => {
        const daysOverdue = Math.floor((now.getTime() - new Date(inspection.scheduled_date).getTime()) / (1000 * 60 * 60 * 24))
        activities.push({
          id: `insp-${inspection.id}`,
          type: 'inspection',
          message: `OVERDUE: ${inspection.title} (${daysOverdue} day${daysOverdue !== 1 ? 's' : ''} overdue)`,
          time: `Inspector: ${inspection.inspector}`,
          status: 'warning'
        })
      })

      // Recent completed repairs
      const completedRepairs = repairItems
        .filter(r => r.status === 'completed')
        .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
        .slice(0, 2)
      completedRepairs.forEach(repair => {
        activities.push({
          id: `rep-${repair.id}`,
          type: 'repair',
          message: `Repair completed: ${repair.equipment_name}`,
          time: getRelativeTime(repair.updated_at),
          status: 'success'
        })
      })

      // Upcoming maintenance
      const upcomingMaintenance = maintenanceSchedules
        .filter(m => m.status === 'scheduled')
        .sort((a, b) => new Date(a.next_due_date).getTime() - new Date(b.next_due_date).getTime())
        .slice(0, 2)
      upcomingMaintenance.forEach(maintenance => {
        const daysUntil = Math.ceil((new Date(maintenance.next_due_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
        activities.push({
          id: `mnt-${maintenance.id}`,
          type: 'maintenance',
          message: `${maintenance.maintenance_type} scheduled for ${maintenance.equipment_name} in ${daysUntil} days`,
          time: getRelativeTime(maintenance.updated_at),
          status: 'info'
        })
      })

      setRecentActivities(activities.slice(0, 6))
    }
  }, [inventoryItems, repairItems, jobCards, maintenanceSchedules, inspections, loading])

  const getRelativeTime = (dateString: string): string => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMs = now.getTime() - date.getTime()
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60))
    const diffInDays = Math.floor(diffInHours / 24)

    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`
    if (diffInDays === 1) return '1 day ago'
    if (diffInDays < 7) return `${diffInDays} days ago`
    return date.toLocaleDateString()
  }
  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">Welcome to Farm Management</h1>
        <p className="text-green-100">
          Monitor your farm operations, track equipment, and manage resources efficiently.
        </p>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading dashboard data...</p>
          </div>
        </div>
      ) : (
        <>
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
            {recentActivities.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No recent activities</p>
                <p className="text-sm mt-2">Activity will appear here as you use the system</p>
              </div>
            ) : (
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
            )}
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

      {/* Upcoming Inspections Section */}
      {upcomingInspections.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-lg shadow"
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <ClipboardCheck className="h-5 w-5 text-purple-600 mr-2" />
                Upcoming Inspections
              </h3>
              <a href="/inspections" className="text-sm text-green-600 hover:text-green-700 font-medium">
                View All →
              </a>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Inspection</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Inspector</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Scheduled</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {upcomingInspections.map((inspection) => {
                    const now = new Date()
                    const scheduledDate = new Date(inspection.scheduled_date)
                    const isOverdue = scheduledDate < now
                    const isToday = scheduledDate.toDateString() === now.toDateString()
                    
                    return (
                      <tr key={inspection.id} className={isOverdue ? 'bg-red-50' : isToday ? 'bg-yellow-50' : ''}>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{inspection.title}</div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded-full capitalize">
                            {inspection.type.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                          {inspection.inspector}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                          {scheduledDate.toLocaleDateString()} at {scheduledDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          {isOverdue ? (
                            <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full flex items-center w-fit">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              Overdue
                            </span>
                          ) : isToday ? (
                            <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                              Today
                            </span>
                          ) : (
                            <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full capitalize">
                              {inspection.status.replace('_', ' ')}
                            </span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      )}
      </>
      )}
    </div>
  )
}
