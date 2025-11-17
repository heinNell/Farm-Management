import { motion } from 'framer-motion'
import { AlertCircle, AlertTriangle, CheckCircle, Clock, Wrench } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { supabase, TABLES } from '../lib/supabase'
import type { RepairItem } from '../types/database'
import RealtimeStatus from './RealtimeStatus'

interface RepairStats {
  totalRepairs: number
  pending: number
  inProgress: number
  completed: number
  highPriority: number
}

export default function RealtimeRepairsDashboard() {
  const [repairs, setRepairs] = useState<RepairItem[]>([])
  const [stats, setStats] = useState<RepairStats>({
    totalRepairs: 0,
    pending: 0,
    inProgress: 0,
    completed: 0,
    highPriority: 0
  })
  const [loading, setLoading] = useState(true)

  const fetchRepairs = useCallback(async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from(TABLES.REPAIR_ITEMS)
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      const repairData = (data ?? []) as RepairItem[]
      setRepairs(repairData)

      // Calculate stats
      setStats({
        totalRepairs: repairData.length,
        pending: repairData.filter(r => r.status === 'pending').length,
        inProgress: repairData.filter(r => r.status === 'in_progress').length,
        completed: repairData.filter(r => r.status === 'completed').length,
        highPriority: repairData.filter(r => r.priority === 'high' && r.status !== 'completed').length
      })
    } catch (error) {
      console.error('Error fetching repairs:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void fetchRepairs()

    // Set up real-time subscription
    const channel = supabase
      .channel('repairs_realtime')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: TABLES.REPAIR_ITEMS
      }, () => {
        void fetchRepairs()
      })
      .subscribe()

    return () => {
      void supabase.removeChannel(channel)
    }
  }, [fetchRepairs])

  const getStatusColor = (status: RepairItem['status']) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-100'
      case 'in_progress': return 'text-blue-600 bg-blue-100'
      case 'completed': return 'text-green-600 bg-green-100'
      case 'cancelled': return 'text-gray-600 bg-gray-100'
      case 'on_hold': return 'text-orange-600 bg-orange-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getPriorityColor = (priority: RepairItem['priority']) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100'
      case 'medium': return 'text-yellow-600 bg-yellow-100'
      case 'low': return 'text-green-600 bg-green-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getRelativeTime = (dateString: string): string => {
    const now = new Date()
    const past = new Date(dateString)
    const diffMs = now.getTime() - past.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    return `${diffDays}d ago`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading repairs...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Live Repairs</h1>
          <p className="text-gray-600 mt-1">Real-time repair tracking and management</p>
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
            <Wrench className="h-8 w-8 text-gray-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalRepairs}</p>
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
            <Clock className="h-8 w-8 text-yellow-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Pending</p>
              <p className="text-2xl font-semibold text-yellow-600">{stats.pending}</p>
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
            <AlertCircle className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">In Progress</p>
              <p className="text-2xl font-semibold text-blue-600">{stats.inProgress}</p>
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
              <p className="text-sm font-medium text-gray-500">High Priority</p>
              <p className="text-2xl font-semibold text-red-600">{stats.highPriority}</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Recent Repairs */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Repairs</h2>
        <div className="space-y-4">
          {repairs.slice(0, 10).map((repair, index) => (
            <motion.div
              key={repair.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-semibold text-gray-900">{repair.equipment_name}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(repair.priority)}`}>
                    {repair.priority.toUpperCase()}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(repair.status)}`}>
                    {repair.status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-1">{repair.description}</p>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span>Tag: #{repair.defect_tag}</span>
                  <span>Technician: {repair.assigned_technician}</span>
                  <span>Est. Cost: ${repair.estimated_cost.toFixed(2)}</span>
                </div>
              </div>
              <div className="text-right text-sm text-gray-500">
                {getRelativeTime(repair.updated_at)}
              </div>
            </motion.div>
          ))}
        </div>

        {repairs.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Wrench className="h-12 w-12 mx-auto mb-3 text-gray-400" />
            <p>No repairs found</p>
          </div>
        )}
      </div>
    </div>
  )
}
