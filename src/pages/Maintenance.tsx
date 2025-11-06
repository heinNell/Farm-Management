
import React, { useState } from 'react'
import {Calendar, Plus, Search, AlertTriangle, Clock, Wrench, TrendingUp} from 'lucide-react'
import { motion } from 'framer-motion'
import MaintenanceCalendar from '../components/MaintenanceCalendar'

const mockMaintenanceItems = [
  {
    id: '1',
    equipmentId: 'TRC-001',
    equipmentName: 'John Deere 8370R Tractor',
    maintenanceType: 'Oil Change',
    scheduledDate: '2024-01-25T10:00:00Z',
    lastPerformed: '2024-01-01T10:00:00Z',
    intervalType: 'hours',
    intervalValue: 250,
    currentMeter: 240,
    nextDue: 250,
    priority: 'high',
    estimatedDuration: 2,
    assignedTo: 'Mike Johnson',
    status: 'upcoming'
  },
  {
    id: '2',
    equipmentId: 'HRV-003',
    equipmentName: 'Case IH 8250 Combine',
    maintenanceType: 'Belt Inspection',
    scheduledDate: '2024-01-22T14:00:00Z',
    lastPerformed: '2023-12-15T14:00:00Z',
    intervalType: 'calendar',
    intervalValue: 30,
    currentMeter: null,
    nextDue: null,
    priority: 'medium',
    estimatedDuration: 1,
    assignedTo: 'Sarah Wilson',
    status: 'in_progress'
  },
  {
    id: '3',
    equipmentId: 'SPR-005',
    equipmentName: 'Apache AS1240 Sprayer',
    maintenanceType: 'Filter Replacement',
    scheduledDate: '2024-01-30T09:00:00Z',
    lastPerformed: '2024-01-05T09:00:00Z',
    intervalType: 'hours',
    intervalValue: 100,
    currentMeter: 85,
    nextDue: 100,
    priority: 'medium',
    estimatedDuration: 1.5,
    assignedTo: 'David Brown',
    status: 'scheduled'
  },
  {
    id: '4',
    equipmentId: 'TLL-007',
    equipmentName: 'Kubota M7-172 Tiller',
    maintenanceType: 'Blade Sharpening',
    scheduledDate: '2024-01-18T08:00:00Z',
    lastPerformed: '2024-01-18T10:30:00Z',
    intervalType: 'calendar',
    intervalValue: 14,
    currentMeter: null,
    nextDue: null,
    priority: 'low',
    estimatedDuration: 3,
    assignedTo: 'Tom Anderson',
    status: 'completed'
  }
]

const predictiveData = [
  {
    equipmentId: 'TRC-001',
    equipmentName: 'John Deere 8370R Tractor',
    component: 'Hydraulic Pump',
    failureProbability: 0.75,
    predictedFailureDate: '2024-02-15T00:00:00Z',
    recommendedAction: 'Schedule preventive maintenance',
    confidenceLevel: 0.87
  },
  {
    equipmentId: 'HRV-003',
    equipmentName: 'Case IH 8250 Combine',
    component: 'Drive Belt',
    failureProbability: 0.45,
    predictedFailureDate: '2024-03-10T00:00:00Z',
    recommendedAction: 'Monitor closely',
    confidenceLevel: 0.72
  }
]

export default function Maintenance() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list')

  const filteredMaintenance = mockMaintenanceItems.filter(item => {
    const matchesSearch = item.equipmentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.maintenanceType.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter
    return matchesSearch && matchesStatus
  })

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
          <button className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
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

      {viewMode === 'calendar' ? (
        <MaintenanceCalendar maintenanceItems={filteredMaintenance} />
      ) : (
        <div className="space-y-6">
          {/* Predictive Maintenance Alerts */}
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
                      <h3 className="text-lg font-semibold text-gray-900">{item.maintenanceType}</h3>
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                        {item.status.replace('_', ' ').charAt(0).toUpperCase() + item.status.replace('_', ' ').slice(1)}
                      </div>
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(item.priority)}`}>
                        {item.priority}
                      </div>
                    </div>
                    <p className="text-gray-600">{item.equipmentName}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <span className="text-sm text-gray-500">Scheduled:</span>
                    <p className="font-medium">
                      {new Date(item.scheduledDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Assigned To:</span>
                    <p className="font-medium">{item.assignedTo}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Duration:</span>
                    <p className="font-medium">{item.estimatedDuration}h</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">
                      {item.intervalType === 'hours' ? 'Hours:' : 'Last Done:'}
                    </span>
                    <p className="font-medium">
                      {item.intervalType === 'hours' 
                        ? `${item.currentMeter}/${item.nextDue}`
                        : new Date(item.lastPerformed).toLocaleDateString()
                      }
                    </p>
                  </div>
                </div>

                {item.intervalType === 'hours' && (
                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Progress to next service</span>
                      <span>{item.currentMeter}/{item.nextDue} hours</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${
                          (item.currentMeter! / item.nextDue!) >= 0.9 ? 'bg-red-500' :
                          (item.currentMeter! / item.nextDue!) >= 0.7 ? 'bg-yellow-500' : 'bg-green-500'
                        }`}
                        style={{ 
                          width: `${Math.min((item.currentMeter! / item.nextDue!) * 100, 100)}%` 
                        }}
                      />
                    </div>
                  </div>
                )}

                <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                  <div className="text-sm text-gray-500">
                    Last performed: {new Date(item.lastPerformed).toLocaleDateString()}
                  </div>
                  <div className="flex gap-2">
                    <button className="px-3 py-1 text-sm text-blue-600 hover:text-blue-700 font-medium">
                      View Details
                    </button>
                    {item.status !== 'completed' && (
                      <button className="px-3 py-1 text-sm text-green-600 hover:text-green-700 font-medium">
                        Mark Complete
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
