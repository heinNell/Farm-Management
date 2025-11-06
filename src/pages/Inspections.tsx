
import React, { useState } from 'react'
import {Search, Plus, Calendar, FileText, CheckCircle, AlertTriangle, Download} from 'lucide-react'
import { motion } from 'framer-motion'

const mockInspections = [
  {
    id: '1',
    title: 'Monthly Safety Inspection',
    equipmentId: 'TRC-001',
    equipmentName: 'John Deere 8370R Tractor',
    templateId: 'safety-monthly',
    scheduledDate: '2024-01-20T09:00:00Z',
    completedDate: null,
    inspector: 'Sarah Wilson',
    status: 'scheduled',
    score: null,
    checklist: [
      { id: '1', item: 'Check hydraulic fluid levels', completed: false, notes: '' },
      { id: '2', item: 'Inspect tire condition and pressure', completed: false, notes: '' },
      { id: '3', item: 'Test all lights and signals', completed: false, notes: '' },
      { id: '4', item: 'Check emergency stop functionality', completed: false, notes: '' },
      { id: '5', item: 'Verify fire extinguisher presence', completed: false, notes: '' }
    ]
  },
  {
    id: '2',
    title: 'Pre-Season Equipment Check',
    equipmentId: 'HRV-003',
    equipmentName: 'Case IH 8250 Combine',
    templateId: 'pre-season',
    scheduledDate: '2024-01-18T14:00:00Z',
    completedDate: '2024-01-18T16:30:00Z',
    inspector: 'Mike Johnson',
    status: 'completed',
    score: 87,
    checklist: [
      { id: '1', item: 'Engine oil and filter check', completed: true, notes: 'Oil changed' },
      { id: '2', item: 'Belt tension inspection', completed: true, notes: 'All belts good' },
      { id: '3', item: 'Cutting blade sharpness', completed: true, notes: 'Blades sharpened' },
      { id: '4', item: 'Grain tank cleanliness', completed: false, notes: 'Minor debris found' },
      { id: '5', item: 'Electrical system check', completed: true, notes: 'All systems operational' }
    ]
  },
  {
    id: '3',
    title: 'Annual Compliance Audit',
    equipmentId: 'SPR-005',
    equipmentName: 'Apache AS1240 Sprayer',
    templateId: 'compliance-annual',
    scheduledDate: '2024-01-15T10:00:00Z',
    completedDate: '2024-01-15T12:45:00Z',
    inspector: 'David Brown',
    status: 'completed',
    score: 95,
    checklist: [
      { id: '1', item: 'Calibration certificate validity', completed: true, notes: 'Valid until Dec 2024' },
      { id: '2', item: 'Spray pattern uniformity', completed: true, notes: 'Within tolerance' },
      { id: '3', item: 'Tank and hose integrity', completed: true, notes: 'No leaks detected' },
      { id: '4', item: 'Safety equipment present', completed: true, notes: 'All items accounted for' },
      { id: '5', item: 'Documentation complete', completed: true, notes: 'All records up to date' }
    ]
  }
]

const inspectionTemplates = [
  { id: 'safety-monthly', name: 'Monthly Safety Inspection', frequency: 'Monthly' },
  { id: 'pre-season', name: 'Pre-Season Equipment Check', frequency: 'Seasonal' },
  { id: 'compliance-annual', name: 'Annual Compliance Audit', frequency: 'Annual' },
  { id: 'maintenance-weekly', name: 'Weekly Maintenance Check', frequency: 'Weekly' }
]

export default function Inspections() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedInspection, setSelectedInspection] = useState<string | null>(null)

  const filteredInspections = mockInspections.filter(inspection => {
    const matchesSearch = inspection.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         inspection.equipmentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         inspection.inspector.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || inspection.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'text-blue-600 bg-blue-100'
      case 'in_progress': return 'text-yellow-600 bg-yellow-100'
      case 'completed': return 'text-green-600 bg-green-100'
      case 'overdue': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getScoreColor = (score: number | null) => {
    if (!score) return 'text-gray-500'
    if (score >= 90) return 'text-green-600'
    if (score >= 70) return 'text-yellow-600'
    return 'text-red-600'
  }

  const completedItems = (checklist: any[]) => checklist.filter(item => item.completed).length

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex-1 max-w-lg">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search inspections..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
        </div>
        
        <button className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
          <Plus className="h-5 w-5 mr-2" />
          Schedule Inspection
        </button>
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
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="overdue">Overdue</option>
        </select>
      </div>

      {/* Inspections List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredInspections.map((inspection, index) => (
          <motion.div
            key={inspection.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">{inspection.title}</h3>
                <p className="text-sm text-gray-600">{inspection.equipmentName}</p>
              </div>
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(inspection.status)}`}>
                {inspection.status === 'in_progress' ? 'In Progress' : inspection.status.charAt(0).toUpperCase() + inspection.status.slice(1)}
              </div>
            </div>

            <div className="space-y-3 mb-4">
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Inspector:</span>
                <span className="text-sm font-medium">{inspection.inspector}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Scheduled:</span>
                <span className="text-sm font-medium">
                  {new Date(inspection.scheduledDate).toLocaleDateString()} at {new Date(inspection.scheduledDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              {inspection.completedDate && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Completed:</span>
                  <span className="text-sm font-medium">
                    {new Date(inspection.completedDate).toLocaleDateString()}
                  </span>
                </div>
              )}

              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Progress:</span>
                <span className="text-sm font-medium">
                  {completedItems(inspection.checklist)}/{inspection.checklist.length} items
                </span>
              </div>

              {inspection.score && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Score:</span>
                  <span className={`text-sm font-bold ${getScoreColor(inspection.score)}`}>
                    {inspection.score}%
                  </span>
                </div>
              )}
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${
                  inspection.status === 'completed' ? 'bg-green-500' : 'bg-blue-500'
                }`}
                style={{ 
                  width: `${(completedItems(inspection.checklist) / inspection.checklist.length) * 100}%` 
                }}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              {inspection.status === 'completed' ? (
                <>
                  <button className="flex items-center px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    <Download className="h-4 w-4 mr-1" />
                    Download PDF
                  </button>
                  <button className="flex items-center px-3 py-2 text-sm text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors">
                    <FileText className="h-4 w-4 mr-1" />
                    View Report
                  </button>
                </>
              ) : (
                <>
                  <button className="flex items-center px-3 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Start Inspection
                  </button>
                  <button className="flex items-center px-3 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                    <Calendar className="h-4 w-4 mr-1" />
                    Reschedule
                  </button>
                </>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Templates Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Inspection Templates</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {inspectionTemplates.map(template => (
            <div key={template.id} className="border border-gray-200 rounded-lg p-4 hover:border-green-300 transition-colors cursor-pointer">
              <h4 className="font-medium text-gray-900 mb-2">{template.name}</h4>
              <p className="text-sm text-gray-500">{template.frequency}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
