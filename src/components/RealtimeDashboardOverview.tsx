import { Bell, ClipboardCheck, Package, TrendingUp, Users, Wrench } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { supabase, TABLES } from '../lib/supabase'
import type { InventoryItem, JobCard, MaintenanceAlert, RepairItem } from '../types/database'

interface DashboardStats {
  totalInventory: number
  activeJobs: number
  activeRepairs: number
  criticalAlerts: number
  lowStockItems: number
  overdueJobs: number
}

interface ActivityItem {
  id: string
  type: 'inventory' | 'job' | 'repair' | 'maintenance'
  message: string
  timestamp: string
  severity: 'info' | 'warning' | 'critical'
}

export default function RealtimeDashboardOverview() {
  const [stats, setStats] = useState<DashboardStats>({
    totalInventory: 0,
    activeJobs: 0,
    activeRepairs: 0,
    criticalAlerts: 0,
    lowStockItems: 0,
    overdueJobs: 0
  })
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [loading, setLoading] = useState(true)
  const [onlineUsers] = useState(1) // Could be enhanced with presence tracking

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true)

      // Fetch all data in parallel
      const [
        inventoryResult,
        jobsResult,
        repairsResult,
        alertsResult
      ] = await Promise.all([
        supabase.from(TABLES.INVENTORY_ITEMS).select('*'),
        supabase.from(TABLES.JOB_CARDS).select('*'),
        supabase.from(TABLES.REPAIR_ITEMS).select('*'),
        supabase.from(TABLES.MAINTENANCE_ALERTS).select('*').eq('acknowledged', false)
      ])

      const inventory = (inventoryResult.data ?? []) as InventoryItem[]
      const jobs = (jobsResult.data ?? []) as JobCard[]
      const repairs = (repairsResult.data ?? []) as RepairItem[]
      const alerts = (alertsResult.data ?? []) as MaintenanceAlert[]

      // Calculate stats
      const newStats: DashboardStats = {
        totalInventory: inventory.length,
        activeJobs: jobs.filter(j => j.status === 'in_progress' || j.status === 'todo').length,
        activeRepairs: repairs.filter(r => r.status === 'in_progress' || r.status === 'pending').length,
        criticalAlerts: alerts.filter(a => a.alert_type === 'critical' || a.alert_type === 'overdue').length,
        lowStockItems: inventory.filter(i => i.status === 'low_stock' || i.status === 'out_of_stock').length,
        overdueJobs: jobs.filter(j => {
          if (!j.due_date) return false
          return new Date(j.due_date) < new Date() && j.status !== 'completed'
        }).length
      }

      setStats(newStats)

      // Generate activity feed
      const newActivities: ActivityItem[] = []

      // Add critical maintenance alerts
      alerts
        .filter(a => a.alert_type === 'critical' || a.alert_type === 'overdue')
        .slice(0, 2)
        .forEach(alert => {
          newActivities.push({
            id: `alert-${alert.id}`,
            type: 'maintenance',
            message: alert.message,
            timestamp: getRelativeTime(alert.created_at),
            severity: alert.alert_type === 'overdue' ? 'critical' : 'warning'
          })
        })

      // Add low stock items
      inventory
        .filter(i => i.status === 'out_of_stock' || i.status === 'low_stock')
        .slice(0, 2)
        .forEach(item => {
          newActivities.push({
            id: `inv-${item.id}`,
            type: 'inventory',
            message: `${item.status === 'out_of_stock' ? 'Out of stock' : 'Low stock'}: ${item.name}`,
            timestamp: getRelativeTime(item.updated_at),
            severity: item.status === 'out_of_stock' ? 'critical' : 'warning'
          })
        })

      // Add recent job updates
      jobs
        .filter(j => j.status === 'completed')
        .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
        .slice(0, 2)
        .forEach(job => {
          newActivities.push({
            id: `job-${job.id}`,
            type: 'job',
            message: `Job completed: ${job.title}`,
            timestamp: getRelativeTime(job.updated_at),
            severity: 'info'
          })
        })

      // Add recent repairs
      repairs
        .filter(r => r.status === 'completed')
        .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
        .slice(0, 1)
        .forEach(repair => {
          newActivities.push({
            id: `repair-${repair.id}`,
            type: 'repair',
            message: `Repair completed: ${repair.equipment_name}`,
            timestamp: getRelativeTime(repair.updated_at),
            severity: 'info'
          })
        })

      // Sort by most recent
      newActivities.sort((a, b) => {
        const aPriority = a.severity === 'critical' ? 3 : a.severity === 'warning' ? 2 : 1
        const bPriority = b.severity === 'critical' ? 3 : b.severity === 'warning' ? 2 : 1
        return bPriority - aPriority
      })

      setActivities(newActivities.slice(0, 6))
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void fetchDashboardData()
    
    // Set up real-time subscriptions
    const inventoryChannel = supabase
      .channel('inventory_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: TABLES.INVENTORY_ITEMS
      }, () => {
        void fetchDashboardData()
      })
      .subscribe()

    const jobsChannel = supabase
      .channel('jobs_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: TABLES.JOB_CARDS
      }, () => {
        void fetchDashboardData()
      })
      .subscribe()

    const repairsChannel = supabase
      .channel('repairs_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: TABLES.REPAIR_ITEMS
      }, () => {
        void fetchDashboardData()
      })
      .subscribe()

    return () => {
      void supabase.removeChannel(inventoryChannel)
      void supabase.removeChannel(jobsChannel)
      void supabase.removeChannel(repairsChannel)
    }
  }, [fetchDashboardData])

  const getRelativeTime = (timestamp: string): string => {
    const now = new Date()
    const past = new Date(timestamp)
    const diffMs = now.getTime() - past.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`
    if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`
    return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`
  }

  const getSeverityColor = (severity: ActivityItem['severity']) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-50 border-red-200'
      case 'warning':
        return 'bg-yellow-50 border-yellow-200'
      case 'info':
        return 'bg-green-50 border-green-200'
    }
  }

  const getSeverityIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'inventory':
        return <Package className="h-5 w-5 text-blue-600" />
      case 'job':
        return <ClipboardCheck className="h-5 w-5 text-green-600" />
      case 'repair':
        return <Wrench className="h-5 w-5 text-orange-600" />
      case 'maintenance':
        return <Bell className="h-5 w-5 text-red-600" />
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-lg text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100">Total Inventory Items</p>
              <p className="text-3xl font-bold">{stats.totalInventory}</p>
              {stats.lowStockItems > 0 && (
                <p className="text-sm text-blue-100 mt-1">{stats.lowStockItems} low/out of stock</p>
              )}
            </div>
            <Package className="h-10 w-10 text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 rounded-lg text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100">Active Jobs</p>
              <p className="text-3xl font-bold">{stats.activeJobs}</p>
              {stats.overdueJobs > 0 && (
                <p className="text-sm text-green-100 mt-1">{stats.overdueJobs} overdue</p>
              )}
            </div>
            <ClipboardCheck className="h-10 w-10 text-green-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-6 rounded-lg text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100">Active Operations</p>
              <p className="text-3xl font-bold">{stats.activeRepairs + stats.activeJobs}</p>
              {stats.criticalAlerts > 0 && (
                <p className="text-sm text-purple-100 mt-1">{stats.criticalAlerts} critical alerts</p>
              )}
            </div>
            <TrendingUp className="h-10 w-10 text-purple-200" />
          </div>
        </div>
      </div>

      {/* Real-time Activity Feed */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Real-time Activity Feed</h2>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <Users className="h-4 w-4" />
            <span>{onlineUsers} user{onlineUsers !== 1 ? 's' : ''} online</span>
          </div>
        </div>

        {activities.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Bell className="h-12 w-12 mx-auto mb-2 text-gray-300" />
            <p>No recent activities</p>
          </div>
        ) : (
          <div className="space-y-3">
            {activities.map(activity => (
              <div
                key={activity.id}
                className={`flex items-start space-x-4 p-3 rounded-lg border ${getSeverityColor(activity.severity)}`}
              >
                {getSeverityIcon(activity.type)}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{activity.message}</p>
                  <p className="text-xs text-gray-500 mt-1">{activity.timestamp}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors">
            <Package className="h-6 w-6 text-blue-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-700">Add Inventory</p>
          </button>
          <button className="p-4 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors">
            <ClipboardCheck className="h-6 w-6 text-green-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-700">Create Job</p>
          </button>
          <button className="p-4 border-2 border-gray-200 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-colors">
            <Wrench className="h-6 w-6 text-orange-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-700">Report Repair</p>
          </button>
          <button className="p-4 border-2 border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors">
            <Bell className="h-6 w-6 text-purple-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-700">View Alerts</p>
          </button>
        </div>
      </div>
    </div>
  )
}
