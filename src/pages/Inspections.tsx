

import { motion } from 'framer-motion'
import { Calendar, CheckCircle, Download, FileText, Plus, Search } from 'lucide-react'
import { useEffect, useState } from 'react'
import InspectionModal from '../components/modals/InspectionModal'
import { useSupabaseCRUD } from '../hooks/useSupabaseCRUD'
import type { Inspection } from '../types/database'

const inspectionTemplates = [
  { id: 'safety-monthly', name: 'Monthly Safety Inspection', frequency: 'Monthly' },
  { id: 'pre-season', name: 'Pre-Season Equipment Check', frequency: 'Seasonal' },
  { id: 'compliance-annual', name: 'Annual Compliance Audit', frequency: 'Annual' },
  { id: 'maintenance-weekly', name: 'Weekly Maintenance Check', frequency: 'Weekly' }
]

export default function Inspections() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'scheduled' | 'in_progress' | 'completed' | 'overdue'>('all')
  const [typeFilter, setTypeFilter] = useState<'all' | 'safety' | 'pre_season' | 'compliance' | 'maintenance'>('all')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingInspection, setEditingInspection] = useState<Inspection | null>(null)
  
  // Use Supabase CRUD hook
  const { items: inspections, loading, create, update, delete: deleteInspection, refresh } = useSupabaseCRUD<Inspection>('inspections')

  useEffect(() => {
    void refresh()
  }, [refresh])

  useEffect(() => {
    console.log('Inspections updated:', inspections.length, 'items')
    console.log('Inspections list:', inspections)
  }, [inspections])

  const filteredInspections = inspections.filter(inspection => {
    const matchesSearch = inspection.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         inspection.inspector.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || inspection.status === statusFilter
    const matchesType = typeFilter === 'all' || inspection.type === typeFilter
    return matchesSearch && matchesStatus && matchesType
  })

  // Handler functions for CRUD operations
  const handleCreateOrUpdateInspection = async (data: Partial<Inspection>) => {
    console.log('Creating/Updating inspection with data:', data)
    
    if (editingInspection) {
      await update(editingInspection.id, data)
    } else {
      // Ensure all required fields are present for create
      const newInspection = {
        title: data.title!,
        type: data.type!,
        inspector: data.inspector!,
        status: data.status || 'scheduled',
        progress: data.progress || 0,
        score: data.score || 0,
        scheduled_date: data.scheduled_date!,
        completed_date: data.completed_date || null,
        checklist_items: data.checklist_items || [],
        findings: data.findings || null,
        recommendations: data.recommendations || null,
        asset_id: data.asset_id || null
      } as Omit<Inspection, 'id' | 'created_at' | 'updated_at'>
      
      console.log('Creating new inspection:', newInspection)
      const result = await create(newInspection)
      console.log('Create result:', result)
    }
    
    console.log('Refreshing inspections list...')
    await refresh()
    console.log('Current inspections count:', inspections.length)
  }

  const handleDeleteInspection = async (id: string) => {
    if (confirm('Are you sure you want to delete this inspection?')) {
      await deleteInspection(id)
    }
  }

  const handleUpdateStatus = async (id: string, newStatus: Inspection['status']) => {
    await update(id, { status: newStatus })
  }

  const handleEditInspection = (inspection: Inspection) => {
    setEditingInspection(inspection)
    setShowCreateModal(true)
  }

  const handleCloseModal = () => {
    setShowCreateModal(false)
    setEditingInspection(null)
  }

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading inspections...</p>
        </div>
      </div>
    )
  }

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
        
        <button 
          onClick={() => setShowCreateModal(true)}
          className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Plus className="h-5 w-5 mr-2" />
          Schedule Inspection
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-4 flex-wrap">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
          className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
        >
          <option value="all">All Statuses</option>
          <option value="scheduled">Scheduled</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="overdue">Overdue</option>
        </select>

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as typeof typeFilter)}
          className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
        >
          <option value="all">All Types</option>
          <option value="safety">Safety</option>
          <option value="pre_season">Pre-Season</option>
          <option value="compliance">Compliance</option>
          <option value="maintenance">Maintenance</option>
        </select>
      </div>

      {/* Inspections List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredInspections.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <p className="text-gray-500 text-lg">No inspections found</p>
            <p className="text-gray-400 text-sm mt-2">
              {searchTerm || statusFilter !== 'all' 
                ? 'Try adjusting your filters' 
                : 'Schedule your first inspection to get started'}
            </p>
          </div>
        ) : (
          filteredInspections.map((inspection, index) => (
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
                <p className="text-sm text-gray-600">Type: {inspection.type}</p>
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
                  {new Date(inspection.scheduled_date).toLocaleDateString()} at {new Date(inspection.scheduled_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              {inspection.completed_date && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Completed:</span>
                  <span className="text-sm font-medium">
                    {new Date(inspection.completed_date).toLocaleDateString()}
                  </span>
                </div>
              )}

              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Progress:</span>
                <span className="text-sm font-medium">
                  {inspection.progress}%
                </span>
              </div>

              {inspection.score > 0 && (
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
                  width: `${inspection.progress}%` 
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
                  <button 
                    onClick={() => { void handleUpdateStatus(inspection.id, 'in_progress') }}
                    className="flex items-center px-3 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Start Inspection
                  </button>
                  <button 
                    onClick={() => handleEditInspection(inspection)}
                    className="flex items-center px-3 py-2 text-sm text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                  >
                    <Calendar className="h-4 w-4 mr-1" />
                    Edit
                  </button>
                  <button 
                    onClick={() => { void handleDeleteInspection(inspection.id) }}
                    className="flex items-center px-3 py-2 text-sm text-red-600 border border-red-600 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    Delete
                  </button>
                </>
              )}
            </div>
          </motion.div>
          ))
        )}
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

      {/* Inspection Modal */}
      <InspectionModal
        isOpen={showCreateModal}
        onClose={handleCloseModal}
        onSave={handleCreateOrUpdateInspection}
        inspection={editingInspection}
      />
    </div>
  )
}
