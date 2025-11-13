
import { motion } from 'framer-motion'
import { Plus, Search, TrendingUp } from 'lucide-react'
import { useEffect, useState } from 'react'
import MaintenanceCalendar from '../components/MaintenanceCalendar'
import MaintenanceModal from '../components/modals/MaintenanceModal'
import { useSupabaseCRUD } from '../hooks/useSupabaseCRUD'
import type { MaintenanceSchedule } from '../types/database'

export default function Maintenance() {
  const { items: maintenanceItems, loading, create, update, delete: deleteItem, refresh } = useSupabaseCRUD<MaintenanceSchedule>('maintenance_schedules')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list')
  const [showModal, setShowModal] = useState(false)
  const [editingItem, setEditingItem] = useState<MaintenanceSchedule | null>(null)

  useEffect(() => {
    void refresh()
  }, [refresh])

  const filteredMaintenance = maintenanceItems.filter(item => {
    const matchesSearch = item.equipment_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.maintenance_type.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter
    return matchesSearch && matchesStatus
  })

  // Get predictive maintenance items (high failure probability)
  const predictiveData = maintenanceItems
    .filter(item => item.failure_probability && item.failure_probability >= 40)
    .map(item => ({
      equipmentId: item.id,
      equipmentName: item.equipment_name,
      component: item.maintenance_type,
      failureProbability: item.failure_probability / 100,
      predictedFailureDate: item.next_due_date,
      recommendedAction: item.failure_probability >= 70 ? 'Schedule preventive maintenance' : 'Monitor closely',
      confidenceLevel: 0.85
    }))

  // CRUD handlers
  const handleCreateOrUpdateMaintenance = async (data: Partial<MaintenanceSchedule>) => {
    if (editingItem) {
      await update(editingItem.id, data)
    } else {
      await create({
        ...data,
        status: 'scheduled',
        failure_probability: 0
      } as Omit<MaintenanceSchedule, 'id' | 'created_at' | 'updated_at'>)
    }
    await refresh()
  }

  const handleMaintenanceFormSubmit = async (formData: { 
    equipment_name: string
    maintenance_type: string
    interval_type: 'hours' | 'calendar'
    interval_value: number
    current_hours: number | undefined
    next_due_date: string
    priority: 'low' | 'medium' | 'high'
    assigned_technician: string
    estimated_cost: number | undefined
    notes: string | undefined
  }) => {
    await handleCreateOrUpdateMaintenance({
      ...formData,
      current_hours: formData.current_hours !== undefined ? formData.current_hours : null,
      estimated_cost: formData.estimated_cost !== undefined ? formData.estimated_cost : null,
      notes: formData.notes !== undefined ? formData.notes : null
    })
  }

  const handleEditItem = (item: MaintenanceSchedule) => {
    setEditingItem(item)
    setShowModal(true)
  }

  const handleDeleteItem = async (id: string) => {
    if (confirm('Are you sure you want to delete this maintenance schedule?')) {
      await deleteItem(id)
    }
  }

  const handleMarkComplete = async (item: MaintenanceSchedule) => {
    await update(item.id, { status: 'completed' })
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingItem(null)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'text-blue-600 bg-blue-100'
      case 'upcoming': return 'text-orange-600 bg-orange-100'
      case 'in_progress': return 'text-yellow-600 bg-yellow-100'
      case 'completed': return 'text-green-600 bg-green-100'
      case 'overdue': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'text-green-600 bg-green-100'
      case 'medium': return 'text-yellow-600 bg-yellow-100'
      case 'high': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getRiskColor = (probability: number) => {
    if (probability >= 0.7) return 'text-red-600 bg-red-100'
    if (probability >= 0.4) return 'text-yellow-600 bg-yellow-100'
    return 'text-green-600 bg-green-100'
  }

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col lg:flex-row gap-4 justify-between">
        <div className="flex-1 max-w-lg">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search maintenance..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
        </div>
        
        <div className="flex gap-2">
          <div className="flex rounded-lg border border-gray-300 overflow-hidden">
            <button
              onClick={() => setViewMode('list')}
              className={`px-4 py-2 text-sm font-medium ${
                viewMode === 'list' 
                  ? 'bg-green-600 text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              List
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-4 py-2 text-sm font-medium ${
                viewMode === 'calendar' 
                  ? 'bg-green-600 text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Calendar
            </button>
          </div>
          <button 
            onClick={() => setShowModal(true)}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Plus className="h-5 w-5 mr-2" />
            Schedule Maintenance
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
        >
          <option value="all">All Statuses</option>
          <option value="scheduled">Scheduled</option>
          <option value="upcoming">Upcoming</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="overdue">Overdue</option>
        </select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading maintenance schedules...</p>
          </div>
        </div>
      ) : filteredMaintenance.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-md">
          <p className="text-gray-500 text-lg">No maintenance schedules found</p>
          <p className="text-gray-400 text-sm mt-2">
            {searchTerm || statusFilter !== 'all'
              ? 'Try adjusting your filters'
              : 'Schedule your first maintenance to get started'}
          </p>
        </div>
      ) : viewMode === 'calendar' ? (
        <MaintenanceCalendar 
          maintenanceItems={filteredMaintenance.map(item => ({
            id: item.id,
            equipmentName: item.equipment_name,
            maintenanceType: item.maintenance_type,
            scheduledDate: item.next_due_date,
            priority: item.priority,
            status: item.status
          }))} 
        />
      ) : (
        <div className="space-y-6">
          {/* Predictive Maintenance Alerts */}
          {predictiveData.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-blue-600" />
                Predictive Maintenance Alerts
              </h3>
              <div className="space-y-4">
              {predictiveData.map((prediction, index) => (
                <motion.div
                  key={prediction.equipmentId}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                >
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{prediction.equipmentName}</h4>
                    <p className="text-sm text-gray-600">{prediction.component}</p>
                    <p className="text-sm text-gray-500">{prediction.recommendedAction}</p>
                  </div>
                  <div className="text-right">
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${getRiskColor(prediction.failureProbability)}`}>
                      {Math.round(prediction.failureProbability * 100)}% Risk
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Predicted: {new Date(prediction.predictedFailureDate).toLocaleDateString()}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
          )}

          {/* Maintenance List */}
          <div className="space-y-4">
            {filteredMaintenance.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{item.maintenance_type}</h3>
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                        {item.status.replace('_', ' ').charAt(0).toUpperCase() + item.status.replace('_', ' ').slice(1)}
                      </div>
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(item.priority)}`}>
                        {item.priority}
                      </div>
                    </div>
                    <p className="text-gray-600">{item.equipment_name}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <span className="text-sm text-gray-500">Next Due:</span>
                    <p className="font-medium">
                      {new Date(item.next_due_date).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Assigned To:</span>
                    <p className="font-medium">{item.assigned_technician}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Interval:</span>
                    <p className="font-medium">{item.interval_value} {item.interval_type}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">
                      {item.interval_type === 'hours' ? 'Current Hours:' : 'Type:'}
                    </span>
                    <p className="font-medium">
                      {item.interval_type === 'hours' 
                        ? item.current_hours || 0
                        : item.interval_type
                      }
                    </p>
                  </div>
                </div>

                {item.interval_type === 'hours' && item.current_hours !== undefined && (
                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Progress to next service</span>
                      <span>{item.current_hours ?? 0}/{item.interval_value} hours</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${
                          ((item.current_hours ?? 0) / item.interval_value) >= 0.9 ? 'bg-red-500' :
                          ((item.current_hours ?? 0) / item.interval_value) >= 0.7 ? 'bg-yellow-500' : 'bg-green-500'
                        }`}
                        style={{ 
                          width: `${Math.min(((item.current_hours ?? 0) / item.interval_value) * 100, 100)}%` 
                        }}
                      />
                    </div>
                  </div>
                )}

                <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                  <div className="text-sm text-gray-500">
                    Status: {item.status.replace('_', ' ')}
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleEditItem(item)}
                      className="px-3 py-1 text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Edit
                    </button>
                    {item.status !== 'completed' && (
                      <button 
                        onClick={() => { void handleMarkComplete(item) }}
                        className="px-3 py-1 text-sm text-green-600 hover:text-green-700 font-medium"
                      >
                        Mark Complete
                      </button>
                    )}
                    <button 
                      onClick={() => { void handleDeleteItem(item.id) }}
                      className="px-3 py-1 text-sm text-red-600 hover:text-red-700 font-medium"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Maintenance Modal */}
      <MaintenanceModal
        isOpen={showModal}
        onClose={handleCloseModal}
        onSubmit={handleMaintenanceFormSubmit}
        item={editingItem}
        loading={loading}
      />
    </div>
  )
}
