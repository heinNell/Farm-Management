

import { motion } from 'framer-motion'
import { Calendar, CheckCircle, ClipboardList, Copy, Download, Edit2, Eye, FileText, Play, Plus, Search, Settings, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import InspectionExecutionModal from '../components/modals/InspectionExecutionModal'
import InspectionModal from '../components/modals/InspectionModal'
import InspectionTemplateModal from '../components/modals/InspectionTemplateModal'
import StartInspectionModal from '../components/modals/StartInspectionModal'
import { useSupabaseCRUD } from '../hooks/useSupabaseCRUD'
import { useToast } from '../hooks/useToast'
import { supabase } from '../lib/supabase'
import type { Asset, ChecklistItemTemplate, Inspection, InspectionTemplate, JobCard, JobExtendedData, JobRepairItem } from '../types/database'
import { downloadInspectionPDF, viewInspectionReport } from '../utils/inspectionPDF'

const frequencyLabels: Record<InspectionTemplate['frequency'], string> = {
  daily: 'Daily',
  weekly: 'Weekly', 
  monthly: 'Monthly',
  quarterly: 'Quarterly',
  annual: 'Annual',
  as_needed: 'As Needed'
}

export default function Inspections() {
  const navigate = useNavigate()
  const toast = useToast()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'scheduled' | 'in_progress' | 'completed' | 'overdue'>('all')
  const [typeFilter, setTypeFilter] = useState<'all' | 'safety' | 'pre_season' | 'compliance' | 'maintenance'>('all')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingInspection, setEditingInspection] = useState<Inspection | null>(null)
  
  // Template state
  const [showTemplateModal, setShowTemplateModal] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<InspectionTemplate | null>(null)
  const [templates, setTemplates] = useState<InspectionTemplate[]>([])
  const [loadingTemplates, setLoadingTemplates] = useState(true)
  
  // Start Inspection modal state
  const [showStartModal, setShowStartModal] = useState(false)
  const [alertCount, setAlertCount] = useState(0)
  
  // Execution modal state
  const [showExecutionModal, setShowExecutionModal] = useState(false)
  const [executingInspection, setExecutingInspection] = useState<Inspection | null>(null)
  
  // Asset names cache for PDF generation
  const [assetCache, setAssetCache] = useState<Record<string, Asset>>({})
  
  // Use Supabase CRUD hook
  const { items: inspections, loading, create, update, delete: deleteInspection, refresh } = useSupabaseCRUD<Inspection>('inspections')

  // Load templates and alert count
  useEffect(() => {
    void loadTemplates()
    void loadAlertCount()
  }, [])

  const loadAlertCount = async () => {
    try {
      const { count, error } = await supabase
        .from('maintenance_alerts')
        .select('*', { count: 'exact', head: true })
        .eq('acknowledged', false)
      
      if (!error && count !== null) {
        setAlertCount(count)
      }
    } catch (err) {
      console.error('Failed to load alert count:', err)
    }
  }

  // Load asset for PDF generation
  const loadAssetForPDF = async (assetId: string): Promise<Asset | null> => {
    if (assetCache[assetId]) {
      return assetCache[assetId]
    }
    try {
      const response = await supabase
        .from('assets')
        .select('*')
        .eq('id', assetId)
        .single()
      
      if (!response.error && response.data) {
        const asset = response.data as Asset
        setAssetCache(prev => ({ ...prev, [assetId]: asset }))
        return asset
      }
    } catch (err) {
      console.error('Failed to load asset:', err)
    }
    return null
  }

  // Handle PDF download
  const handleDownloadPDF = async (inspection: Inspection) => {
    let asset: Asset | null = null
    if (inspection.asset_id) {
      asset = await loadAssetForPDF(inspection.asset_id)
    }
    downloadInspectionPDF({
      inspection,
      asset,
      assetName: asset?.name
    })
  }

  // Handle view report
  const handleViewReport = async (inspection: Inspection) => {
    let asset: Asset | null = null
    if (inspection.asset_id) {
      asset = await loadAssetForPDF(inspection.asset_id)
    }
    viewInspectionReport({
      inspection,
      asset,
      assetName: asset?.name
    })
  }

  const loadTemplates = async () => {
    setLoadingTemplates(true)
    try {
      const { data, error } = await supabase
        .from('inspection_templates')
        .select('*')
        .order('name')
      
      if (error) {
        // Table might not exist yet, use empty array
        console.log('Templates table not found or error:', error.message)
        setTemplates([])
      } else {
        setTemplates(data as InspectionTemplate[])
      }
    } catch (err) {
      console.error('Failed to load templates:', err)
      setTemplates([])
    } finally {
      setLoadingTemplates(false)
    }
  }

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
        creator: data.creator || data.inspector!, // Use creator if provided, otherwise use inspector
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

  const handleEditInspection = (inspection: Inspection) => {
    setEditingInspection(inspection)
    setShowCreateModal(true)
  }

  // Start executing an inspection
  const handleStartExecution = (inspection: Inspection) => {
    setExecutingInspection(inspection)
    setShowExecutionModal(true)
  }

  // Save execution progress
  const handleSaveExecution = async (data: Partial<Inspection>) => {
    if (!executingInspection) return
    
    await update(executingInspection.id, data)
    await refresh()
    toast.success(data.status === 'completed' ? 'Inspection completed!' : 'Progress saved!')
  }

  const handleCloseExecutionModal = () => {
    setShowExecutionModal(false)
    setExecutingInspection(null)
  }

  const handleCloseModal = () => {
    setShowCreateModal(false)
    setEditingInspection(null)
  }

  // Template handlers
  const handleSaveTemplate = async (data: Omit<InspectionTemplate, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      if (editingTemplate) {
        const { error } = await supabase
          .from('inspection_templates')
          .update(data)
          .eq('id', editingTemplate.id)
        
        if (error) throw error
        toast.success('Template updated successfully!')
      } else {
        const { error } = await supabase
          .from('inspection_templates')
          .insert([data])
        
        if (error) throw error
        toast.success('Template created successfully!')
      }
      
      await loadTemplates()
      setShowTemplateModal(false)
      setEditingTemplate(null)
    } catch (err) {
      console.error('Failed to save template:', err)
      toast.error('Failed to save template')
      throw err
    }
  }

  const handleEditTemplate = (template: InspectionTemplate) => {
    setEditingTemplate(template)
    setShowTemplateModal(true)
  }

  const handleDeleteTemplate = async (id: string) => {
    if (!confirm('Are you sure you want to delete this template?')) return
    
    try {
      const { error } = await supabase
        .from('inspection_templates')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      toast.success('Template deleted')
      await loadTemplates()
    } catch (err) {
      console.error('Failed to delete template:', err)
      toast.error('Failed to delete template')
    }
  }

  const handleUseTemplate = (template: InspectionTemplate) => {
    // Pre-fill inspection form with template data
    const checklistItems = template.checklist_items.map((item: ChecklistItemTemplate) => ({
      id: crypto.randomUUID(),
      description: item.description,
      completed: false,
      notes: ''
    }))
    
    setEditingInspection({
      id: '',
      title: template.name,
      type: template.type,
      inspector: '',
      status: 'scheduled',
      progress: 0,
      score: 0,
      scheduled_date: new Date().toISOString(),
      completed_date: null,
      checklist_items: checklistItems,
      findings: null,
      recommendations: null,
      asset_id: null,
      created_at: '',
      updated_at: ''
    } as Inspection)
    setShowCreateModal(true)
  }

  const handleCloseTemplateModal = () => {
    setShowTemplateModal(false)
    setEditingTemplate(null)
  }

  // Create a job card from inspection findings
  const handleCreateJobFromInspection = async (inspection: Inspection) => {
    try {
      // Get items marked for repair or replacement from the inspection
      const repairItems = inspection.checklist_items
        .filter(item => item.status === 'repair' || item.status === 'replace')
      
      // Build repair items for the job card extended data
      const jobRepairItems: JobRepairItem[] = repairItems.map(item => ({
        id: crypto.randomUUID(),
        description: item.description,
        type: item.status === 'replace' ? 'replace' : 'repair',
        status: 'pending',
        completed_date: null,
        completed_by: null,
        notes: item.notes || null,
        cost: 0
      }))

      // Build description from all faults
      const faultsFound = repairItems
        .map((item, index) => `${index + 1}. [${item.status?.toUpperCase()}] ${item.description}${item.notes ? ` - ${item.notes}` : ''}`)
      
      // Also include findings and recommendations
      const allIssues: string[] = [...faultsFound]
      if (inspection.findings) {
        allIssues.push(`\nFindings: ${inspection.findings}`)
      }
      if (inspection.recommendations) {
        allIssues.push(`\nRecommendations: ${inspection.recommendations}`)
      }

      const description = allIssues.length > 0 
        ? `Issues identified during ${inspection.type} inspection on ${new Date(inspection.scheduled_date).toLocaleDateString()}:\n\n${allIssues.join('\n')}`
        : `Follow-up required for ${inspection.type} inspection completed on ${new Date(inspection.scheduled_date).toLocaleDateString()}.`

      // Create the extended data with repair items from inspection
      const extendedData: JobExtendedData = {
        repair_items: jobRepairItems,
        spare_allocations: [],
        ir_requests: [],
        third_party_services: [],
        total_parts_cost: 0,
        total_service_cost: 0,
        total_labor_cost: 0
      }

      // Create the job card
      const jobData: Omit<JobCard, 'id' | 'created_at' | 'updated_at'> = {
        title: `Repair: ${inspection.title} - ${repairItems.length} Item${repairItems.length !== 1 ? 's' : ''} Found`,
        description,
        priority: inspection.score < 70 ? 'high' : inspection.score < 85 ? 'medium' : 'low',
        status: 'todo',
        assigned_to: inspection.inspector, // Default to inspector, can be changed
        location: 'See inspection report',
        estimated_hours: Math.max(repairItems.length * 2, 1), // Estimate 2 hours per fault
        actual_hours: null,
        due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week from now
        completed_date: null,
        tags: ['inspection-follow-up', inspection.type, `inspection-${String(inspection.id).substring(0, 8)}`],
        notes: `Generated from Inspection: ${inspection.title} (ID: ${String(inspection.id)})\n\nRepair Items: ${repairItems.length} | Replace Items: ${repairItems.filter(i => i.status === 'replace').length}`,
        asset_id: inspection.asset_id,
        hour_meter_reading: null,
        extended_data: extendedData
      }

      const { error } = await supabase
        .from('job_cards')
        .insert([jobData])
        .select()
        .single()

      if (error) throw error

      toast.success(`Job card created with ${repairItems.length} repair/replacement item${repairItems.length !== 1 ? 's' : ''}!`)
      
      // Navigate to jobs page
      navigate('/jobs')
    } catch (error) {
      console.error('Failed to create job card:', error)
      toast.error(`Failed to create job card: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
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
        
        <div className="flex gap-2">
          <button 
            onClick={() => setShowStartModal(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors relative"
          >
            <Play className="h-5 w-5 mr-2" />
            Start Inspection
            {alertCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {alertCount}
              </span>
            )}
          </button>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Plus className="h-5 w-5 mr-2" />
            Schedule
          </button>
        </div>
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
            <div className="flex flex-wrap gap-2">
              {inspection.status === 'completed' ? (
                <>
                  <button 
                    onClick={() => { void handleDownloadPDF(inspection) }}
                    className="flex items-center px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Download PDF
                  </button>
                  <button 
                    onClick={() => { void handleViewReport(inspection) }}
                    className="flex items-center px-3 py-2 text-sm text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                  >
                    <FileText className="h-4 w-4 mr-1" />
                    View Report
                  </button>
                  {(inspection.findings || inspection.recommendations || 
                    inspection.checklist_items?.some(item => !item.completed)) && (
                    <button 
                      onClick={() => { void handleCreateJobFromInspection(inspection) }}
                      className="flex items-center px-3 py-2 text-sm bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                    >
                      <ClipboardList className="h-4 w-4 mr-1" />
                      Create Job Card
                    </button>
                  )}
                </>
              ) : inspection.status === 'in_progress' ? (
                <>
                  <button 
                    onClick={() => handleStartExecution(inspection)}
                    className="flex items-center px-3 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Play className="h-4 w-4 mr-1" />
                    Continue Inspection
                  </button>
                  <button 
                    onClick={() => { void handleViewReport(inspection) }}
                    className="flex items-center px-3 py-2 text-sm text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View Report
                  </button>
                  <button 
                    onClick={() => handleEditInspection(inspection)}
                    className="flex items-center px-3 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Edit2 className="h-4 w-4 mr-1" />
                    Edit
                  </button>
                  <button 
                    onClick={() => { void handleDeleteInspection(inspection.id) }}
                    className="flex items-center px-3 py-2 text-sm text-red-600 border border-red-600 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </button>
                </>
              ) : (
                <>
                  <button 
                    onClick={() => handleStartExecution(inspection)}
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
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Inspection Templates</h3>
          <button 
            onClick={() => setShowTemplateModal(true)}
            className="flex items-center px-3 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Plus className="h-4 w-4 mr-1" />
            Create Template
          </button>
        </div>
        
        {loadingTemplates ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-2 text-sm text-gray-500">Loading templates...</p>
          </div>
        ) : templates.length === 0 ? (
          <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
            <Settings className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No templates created yet</p>
            <p className="text-sm text-gray-400 mt-1">Create your first template to streamline inspections</p>
            <button 
              onClick={() => setShowTemplateModal(true)}
              className="mt-4 text-green-600 hover:text-green-700 font-medium text-sm"
            >
              + Create your first template
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.filter(t => t.is_active).map(template => (
              <div 
                key={template.id} 
                className="border border-gray-200 rounded-lg p-4 hover:border-green-300 hover:shadow-md transition-all group"
              >
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium text-gray-900">{template.name}</h4>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    template.type === 'safety' ? 'bg-red-100 text-red-700' :
                    template.type === 'maintenance' ? 'bg-blue-100 text-blue-700' :
                    template.type === 'compliance' ? 'bg-purple-100 text-purple-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {template.type.replace('_', '-')}
                  </span>
                </div>
                
                {template.description && (
                  <p className="text-sm text-gray-500 mb-2 line-clamp-2">{template.description}</p>
                )}
                
                <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                  <span>{frequencyLabels[template.frequency]}</span>
                  <span>{template.checklist_items?.length || 0} items</span>
                </div>
                
                <div className="flex gap-2 pt-3 border-t border-gray-100">
                  <button
                    onClick={() => handleUseTemplate(template)}
                    className="flex-1 flex items-center justify-center px-3 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Copy className="h-4 w-4 mr-1" />
                    Use Template
                  </button>
                  <button
                    onClick={() => handleEditTemplate(template)}
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Edit template"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => { void handleDeleteTemplate(template.id) }}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete template"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Inspection Modal */}
      <InspectionModal
        isOpen={showCreateModal}
        onClose={handleCloseModal}
        onSave={handleCreateOrUpdateInspection}
        inspection={editingInspection}
      />

      {/* Template Modal */}
      <InspectionTemplateModal
        isOpen={showTemplateModal}
        onClose={handleCloseTemplateModal}
        onSave={handleSaveTemplate}
        template={editingTemplate}
      />

      {/* Start Inspection Modal */}
      <StartInspectionModal
        isOpen={showStartModal}
        onClose={() => {
          setShowStartModal(false)
          void loadAlertCount() // Refresh alert count after closing
        }}
        onStartInspection={async (data: Partial<Inspection>) => {
          await handleCreateOrUpdateInspection(data)
          toast.success('Inspection started successfully!')
        }}
        templates={templates}
      />

      {/* Inspection Execution Modal */}
      <InspectionExecutionModal
        isOpen={showExecutionModal}
        onClose={handleCloseExecutionModal}
        onSave={handleSaveExecution}
        inspection={executingInspection}
      />
    </div>
  )
}
