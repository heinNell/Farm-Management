import { motion } from 'framer-motion'
import { AlertTriangle, Calendar, CheckCircle, Clock, Wrench } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { supabase, TABLES } from '../lib/supabase'
import type { MaintenanceSchedule } from '../types/database'
import RealtimeStatus from './RealtimeStatus'

interface MaintenanceStats {
  totalScheduled: number
  scheduled: number
  inProgress: number
  completed: number
  overdue: number
}

export default function RealtimeMaintenanceDashboard() {
  const [maintenanceItems, setMaintenanceItems] = useState<MaintenanceSchedule[]>([])
  const [stats, setStats] = useState<MaintenanceStats>({
    totalScheduled: 0,
    scheduled: 0,
    inProgress: 0,
    completed: 0,
    overdue: 0
  })
  const [loading, setLoading] = useState(true)

  const fetchMaintenance = useCallback(async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from(TABLES.MAINTENANCE_SCHEDULES)
        .select('*')
        .order('next_due_date', { ascending: true })

      if (error) throw error

      const maintenanceData = (data ?? []) as MaintenanceSchedule[]
      setMaintenanceItems(maintenanceData)

      // Calculate overdue items
      const now = new Date()
      const overdueItems = maintenanceData.filter(m => 
        m.status === 'scheduled' && new Date(m.next_due_date) < now
      ).length

      // Calculate stats
      setStats({
        totalScheduled: maintenanceData.length,
        scheduled: maintenanceData.filter(m => m.status === 'scheduled').length,
        inProgress: maintenanceData.filter(m => m.status === 'in_progress').length,
        completed: maintenanceData.filter(m => m.status === 'completed').length,
        overdue: overdueItems
      })
    } catch (error) {
      console.error('Error fetching maintenance:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void fetchMaintenance()

    // Set up real-time subscription
    const channel = supabase
      .channel('maintenance_realtime')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: TABLES.MAINTENANCE_SCHEDULES
      }, () => {
        void fetchMaintenance()
      })
      .subscribe()

    return () => {
      void supabase.removeChannel(channel)
    }
  }, [fetchMaintenance])

  const getStatusColor = (status: MaintenanceSchedule['status']) => {
    switch (status) {
      case 'scheduled': return 'text-blue-600 bg-blue-100'
      case 'in_progress': return 'text-yellow-600 bg-yellow-100'
      case 'completed': return 'text-green-600 bg-green-100'
      case 'overdue': return 'text-red-600 bg-red-100'
      case 'skipped': return 'text-gray-600 bg-gray-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getDaysUntilDue = (dueDate: string): number => {
    const now = new Date()
    const due = new Date(dueDate)
    const diffMs = due.getTime() - now.getTime()
    return Math.ceil(diffMs / (1000 * 60 * 60 * 24))
  }

  const getDueLabel = (daysUntil: number): { text: string; color: string } => {
    if (daysUntil < 0) return { text: `${Math.abs(daysUntil)} days overdue`, color: 'text-red-600' }
    if (daysUntil === 0) return { text: 'Due today', color: 'text-orange-600' }
    if (daysUntil === 1) return { text: 'Due tomorrow', color: 'text-yellow-600' }
    if (daysUntil <= 7) return { text: `Due in ${daysUntil} days`, color: 'text-yellow-600' }
    return { text: `Due in ${daysUntil} days`, color: 'text-gray-600' }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading maintenance schedules...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Live Maintenance</h1>
          <p className="text-gray-600 mt-1">Real-time maintenance scheduling and tracking</p>
        </div>
        <RealtimeStatus />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-lg shadow-md"
        >
          <div className="flex items-center">
            <Calendar className="h-8 w-8 text-gray-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalScheduled}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-6 rounded-lg shadow-md"
        >
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Scheduled</p>
              <p className="text-2xl font-semibold text-blue-600">{stats.scheduled}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-6 rounded-lg shadow-md"
        >
          <div className="flex items-center">
            <Wrench className="h-8 w-8 text-yellow-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">In Progress</p>
              <p className="text-2xl font-semibold text-yellow-600">{stats.inProgress}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white p-6 rounded-lg shadow-md"
        >
          <div className="flex items-center">
            <CheckCircle className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Completed</p>
              <p className="text-2xl font-semibold text-green-600">{stats.completed}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white p-6 rounded-lg shadow-md"
        >
          <div className="flex items-center">
            <AlertTriangle className="h-8 w-8 text-red-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Overdue</p>
              <p className="text-2xl font-semibold text-red-600">{stats.overdue}</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Upcoming Maintenance */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Maintenance</h2>
        <div className="space-y-4">
          {maintenanceItems.slice(0, 10).map((item, index) => {
            const daysUntil = getDaysUntilDue(item.next_due_date)
            const dueInfo = getDueLabel(daysUntil)

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-gray-900">{item.equipment_name}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                      {item.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">{item.maintenance_type}</p>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>Interval: {item.interval_value} {item.interval_type === 'hours' ? 'hours' : 'days'}</span>
                    {item.estimated_cost && <span>Est. Cost: ${item.estimated_cost.toFixed(2)}</span>}
                    {item.assigned_technician && <span>Technician: {item.assigned_technician}</span>}
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-medium ${dueInfo.color}`}>
                    {dueInfo.text}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(item.next_due_date).toLocaleDateString()}
                  </p>
                </div>
              </motion.div>
            )
          })}
        </div>

        {maintenanceItems.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Calendar className="h-12 w-12 mx-auto mb-3 text-gray-400" />
            <p>No maintenance schedules found</p>
          </div>
        )}
      </div>
    </div>
  )
}
