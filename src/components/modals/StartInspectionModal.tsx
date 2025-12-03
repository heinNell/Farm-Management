import { AlertTriangle, Calendar, ClipboardList, FileText, Search, Wrench } from 'lucide-react'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import type { Asset, ChecklistItem, Inspection, InspectionTemplate, MaintenanceAlert, MaintenanceSchedule } from '../../types/database'
import Modal from '../ui/Modal'

interface StartInspectionModalProps {
  isOpen: boolean
  onClose: () => void
  onStartInspection: (data: Partial<Inspection>) => Promise<void>
  templates: InspectionTemplate[]
}

type SourceType = 'template' | 'maintenance' | 'alert' | 'blank'

interface MaintenanceWithAlert extends MaintenanceSchedule {
  alert?: MaintenanceAlert
}

export default function StartInspectionModal({
  isOpen,
  onClose,
  onStartInspection,
  templates
}: StartInspectionModalProps) {
  const [activeTab, setActiveTab] = useState<SourceType>('template')
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  // Data sources
  const [maintenanceSchedules, setMaintenanceSchedules] = useState<MaintenanceWithAlert[]>([])
  const [maintenanceAlerts, setMaintenanceAlerts] = useState<MaintenanceAlert[]>([])
  const [assets, setAssets] = useState<Asset[]>([])
  const [loadingData, setLoadingData] = useState(true)
  
  // Selected item for inspection
  const [selectedTemplate, setSelectedTemplate] = useState<InspectionTemplate | null>(null)
  const [selectedMaintenance, setSelectedMaintenance] = useState<MaintenanceWithAlert | null>(null)
  const [selectedAlert, setSelectedAlert] = useState<MaintenanceAlert | null>(null)
  
  // Form data for customization
  const [formData, setFormData] = useState({
    title: '',
    inspector: '',
    scheduled_date: new Date().toISOString().slice(0, 16),
    asset_id: ''
  })

  // Load maintenance schedules, alerts, and assets
  useEffect(() => {
    if (isOpen) {
      void loadData()
    }
  }, [isOpen])

  const loadData = async () => {
    setLoadingData(true)
    try {
      // Load maintenance schedules (due or overdue)
      const { data: schedules, error: schedulesError } = await supabase
        .from('maintenance_schedules')
        .select('*')
        .in('status', ['scheduled', 'overdue', 'in_progress'])
        .order('next_due_date', { ascending: true })
      
      if (schedulesError) {
        console.error('Failed to load maintenance schedules:', schedulesError)
      } else {
        setMaintenanceSchedules((schedules as MaintenanceSchedule[]) || [])
      }

      // Load unacknowledged maintenance alerts
      const { data: alerts, error: alertsError } = await supabase
        .from('maintenance_alerts')
        .select('*')
        .eq('acknowledged', false)
        .order('created_at', { ascending: false })
      
      if (alertsError) {
        console.error('Failed to load maintenance alerts:', alertsError)
      } else {
        setMaintenanceAlerts((alerts as MaintenanceAlert[]) || [])
      }

      // Load assets
      const { data: assetData, error: assetsError } = await supabase
        .from('assets')
        .select('*')
        .order('name')
      
      if (assetsError) {
        console.error('Failed to load assets:', assetsError)
      } else {
        setAssets((assetData as Asset[]) || [])
      }
    } catch (err) {
      console.error('Failed to load data:', err)
    } finally {
      setLoadingData(false)
    }
  }

  // Reset selection when changing tabs
  useEffect(() => {
    setSelectedTemplate(null)
    setSelectedMaintenance(null)
    setSelectedAlert(null)
    setSearchTerm('')
    setError('')
  }, [activeTab])

  // Update form data when selection changes
  useEffect(() => {
    if (selectedTemplate) {
      setFormData(prev => ({
        ...prev,
        title: selectedTemplate.name
      }))
    }
  }, [selectedTemplate])

  useEffect(() => {
    if (selectedMaintenance) {
      setFormData(prev => ({
        ...prev,
        title: `${selectedMaintenance.maintenance_type} Inspection - ${selectedMaintenance.equipment_name}`,
        scheduled_date: new Date().toISOString().slice(0, 16)
      }))
    }
  }, [selectedMaintenance])

  useEffect(() => {
    if (selectedAlert) {
      // Find associated maintenance schedule
      const schedule = maintenanceSchedules.find(s => s.id === selectedAlert.schedule_id)
      if (schedule) {
        setFormData(prev => ({
          ...prev,
          title: `${selectedAlert.alert_type.toUpperCase()} Inspection - ${schedule.equipment_name}`,
          scheduled_date: new Date().toISOString().slice(0, 16)
        }))
      }
    }
  }, [selectedAlert, maintenanceSchedules])

  const handleSubmit = async () => {
    setError('')
    setLoading(true)

    try {
      if (!formData.title || !formData.inspector || !formData.scheduled_date) {
        setError('Please fill in all required fields')
        setLoading(false)
        return
      }

      let checklistItems: ChecklistItem[] = []
      let inspectionType: Inspection['type'] = 'maintenance'

      // Build checklist based on source
      if (activeTab === 'template' && selectedTemplate) {
        inspectionType = selectedTemplate.type
        checklistItems = selectedTemplate.checklist_items.map(item => ({
          id: crypto.randomUUID(),
          description: item.description,
          completed: false,
          notes: ''
        }))
      } else if (activeTab === 'maintenance' && selectedMaintenance) {
        inspectionType = 'maintenance'
        // Create checklist from maintenance details
        checklistItems = [
          {
            id: crypto.randomUUID(),
            description: `Verify ${selectedMaintenance.maintenance_type} completed`,
            completed: false,
            notes: ''
          },
          {
            id: crypto.randomUUID(),
            description: `Check equipment: ${selectedMaintenance.equipment_name}`,
            completed: false,
            notes: ''
          },
          {
            id: crypto.randomUUID(),
            description: 'Document current hour meter reading',
            completed: false,
            notes: ''
          },
          {
            id: crypto.randomUUID(),
            description: 'Inspect for any visible damage or wear',
            completed: false,
            notes: ''
          },
          {
            id: crypto.randomUUID(),
            description: 'Verify all safety equipment functional',
            completed: false,
            notes: ''
          }
        ]
        if (selectedMaintenance.notes) {
          checklistItems.push({
            id: crypto.randomUUID(),
            description: `Notes: ${selectedMaintenance.notes}`,
            completed: false,
            notes: ''
          })
        }
      } else if (activeTab === 'alert' && selectedAlert) {
        const schedule = maintenanceSchedules.find(s => s.id === selectedAlert.schedule_id)
        inspectionType = 'maintenance'
        checklistItems = [
          {
            id: crypto.randomUUID(),
            description: `Alert: ${selectedAlert.message}`,
            completed: false,
            notes: ''
          },
          {
            id: crypto.randomUUID(),
            description: 'Assess current equipment condition',
            completed: false,
            notes: ''
          },
          {
            id: crypto.randomUUID(),
            description: 'Check for signs of wear or damage',
            completed: false,
            notes: ''
          },
          {
            id: crypto.randomUUID(),
            description: 'Verify safety systems operational',
            completed: false,
            notes: ''
          },
          {
            id: crypto.randomUUID(),
            description: 'Document findings and recommendations',
            completed: false,
            notes: ''
          }
        ]
        if (schedule) {
          checklistItems.unshift({
            id: crypto.randomUUID(),
            description: `Maintenance: ${schedule.maintenance_type} - ${schedule.equipment_name}`,
            completed: false,
            notes: ''
          })
        }
      } else if (activeTab === 'blank') {
        // Blank inspection - user will add items later
        checklistItems = []
      }

      const inspectionData: Partial<Inspection> = {
        title: formData.title,
        type: inspectionType,
        inspector: formData.inspector,
        creator: formData.inspector, // Use inspector as creator
        scheduled_date: new Date(formData.scheduled_date).toISOString(),
        status: 'scheduled',
        progress: 0,
        score: 0,
        asset_id: formData.asset_id || null,
        checklist_items: checklistItems,
        findings: null,
        recommendations: null
      }

      await onStartInspection(inspectionData)
      
      // If alert was used, acknowledge it
      if (activeTab === 'alert' && selectedAlert) {
        await supabase
          .from('maintenance_alerts')
          .update({
            acknowledged: true,
            acknowledged_by: formData.inspector,
            acknowledged_at: new Date().toISOString()
          })
          .eq('id', selectedAlert.id)
      }

      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create inspection')
    } finally {
      setLoading(false)
    }
  }

  // Filter functions
  const filteredTemplates = templates.filter(t => 
    t.is_active && 
    (t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
     t.type.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const filteredMaintenance = maintenanceSchedules.filter(m =>
    m.equipment_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.maintenance_type.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredAlerts = maintenanceAlerts.filter(a =>
    a.message.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getAlertTypeColor = (type: string) => {
    switch (type) {
      case 'critical': return 'bg-red-100 text-red-700 border-red-200'
      case 'overdue': return 'bg-orange-100 text-orange-700 border-orange-200'
      case 'upcoming': return 'bg-blue-100 text-blue-700 border-blue-200'
      default: return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const tabs = [
    { id: 'template' as SourceType, label: 'Templates', icon: FileText, count: filteredTemplates.length },
    { id: 'maintenance' as SourceType, label: 'Scheduled Maintenance', icon: Calendar, count: filteredMaintenance.length },
    { id: 'alert' as SourceType, label: 'Maintenance Alerts', icon: AlertTriangle, count: filteredAlerts.length },
    { id: 'blank' as SourceType, label: 'Blank Inspection', icon: ClipboardList, count: null }
  ]

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Start New Inspection"
      size="xl"
    >
      <div className="space-y-4">
        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <tab.icon className="h-4 w-4 mr-2" />
              {tab.label}
              {tab.count !== null && (
                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                  activeTab === tab.id ? 'bg-white/20' : 'bg-gray-300'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Search (not for blank) */}
        {activeTab !== 'blank' && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder={`Search ${activeTab === 'template' ? 'templates' : activeTab === 'maintenance' ? 'maintenance schedules' : 'alerts'}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
        )}

        {/* Content Area */}
        <div className="min-h-[300px] max-h-[400px] overflow-y-auto">
          {loadingData ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
                <p className="mt-2 text-sm text-gray-500">Loading...</p>
              </div>
            </div>
          ) : (
            <>
              {/* Templates Tab */}
              {activeTab === 'template' && (
                <div className="space-y-2">
                  {filteredTemplates.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <FileText className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                      <p>No templates found</p>
                      <p className="text-sm">Create templates in the Templates section</p>
                    </div>
                  ) : (
                    filteredTemplates.map(template => (
                      <div
                        key={template.id}
                        onClick={() => setSelectedTemplate(template)}
                        className={`p-4 border rounded-lg cursor-pointer transition-all ${
                          selectedTemplate?.id === template.id
                            ? 'border-green-500 bg-green-50 ring-2 ring-green-200'
                            : 'border-gray-200 hover:border-green-300 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium text-gray-900">{template.name}</h4>
                            {template.description && (
                              <p className="text-sm text-gray-500 mt-1">{template.description}</p>
                            )}
                          </div>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            template.type === 'safety' ? 'bg-red-100 text-red-700' :
                            template.type === 'maintenance' ? 'bg-blue-100 text-blue-700' :
                            template.type === 'compliance' ? 'bg-purple-100 text-purple-700' :
                            'bg-yellow-100 text-yellow-700'
                          }`}>
                            {template.type.replace('_', '-')}
                          </span>
                        </div>
                        <div className="mt-2 text-xs text-gray-400">
                          {template.checklist_items?.length || 0} checklist items
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Maintenance Schedules Tab */}
              {activeTab === 'maintenance' && (
                <div className="space-y-2">
                  {filteredMaintenance.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Wrench className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                      <p>No scheduled maintenance found</p>
                      <p className="text-sm">Create maintenance schedules in the Maintenance section</p>
                    </div>
                  ) : (
                    filteredMaintenance.map(schedule => {
                      const dueDate = new Date(schedule.next_due_date)
                      const isOverdue = dueDate < new Date()
                      const daysUntil = Math.ceil((dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
                      
                      return (
                        <div
                          key={schedule.id}
                          onClick={() => setSelectedMaintenance(schedule)}
                          className={`p-4 border rounded-lg cursor-pointer transition-all ${
                            selectedMaintenance?.id === schedule.id
                              ? 'border-green-500 bg-green-50 ring-2 ring-green-200'
                              : 'border-gray-200 hover:border-green-300 hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium text-gray-900">{schedule.maintenance_type}</h4>
                              <p className="text-sm text-gray-600">{schedule.equipment_name}</p>
                            </div>
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              isOverdue ? 'bg-red-100 text-red-700' :
                              daysUntil <= 7 ? 'bg-orange-100 text-orange-700' :
                              'bg-blue-100 text-blue-700'
                            }`}>
                              {isOverdue ? 'Overdue' : `Due in ${daysUntil} days`}
                            </span>
                          </div>
                          <div className="mt-2 flex items-center gap-4 text-xs text-gray-500">
                            <span>Priority: {schedule.priority}</span>
                            <span>Technician: {schedule.assigned_technician}</span>
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              )}

              {/* Maintenance Alerts Tab */}
              {activeTab === 'alert' && (
                <div className="space-y-2">
                  {filteredAlerts.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <AlertTriangle className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                      <p>No active maintenance alerts</p>
                      <p className="text-sm">Alerts will appear when maintenance is due</p>
                    </div>
                  ) : (
                    filteredAlerts.map(alert => (
                      <div
                        key={alert.id}
                        onClick={() => setSelectedAlert(alert)}
                        className={`p-4 border rounded-lg cursor-pointer transition-all ${
                          selectedAlert?.id === alert.id
                            ? 'border-green-500 bg-green-50 ring-2 ring-green-200'
                            : `border-gray-200 hover:border-green-300 ${getAlertTypeColor(alert.alert_type)}`
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{alert.message}</h4>
                            <div className="mt-2 flex items-center gap-4 text-xs text-gray-500">
                              {alert.days_until_due !== null && (
                                <span>
                                  {alert.days_until_due > 0 
                                    ? `Due in ${Math.round(alert.days_until_due)} days`
                                    : `${Math.abs(Math.round(alert.days_until_due))} days overdue`
                                  }
                                </span>
                              )}
                              <span>Created: {new Date(alert.created_at).toLocaleDateString()}</span>
                            </div>
                          </div>
                          <span className={`text-xs px-2 py-1 rounded-full uppercase font-medium ${
                            alert.alert_type === 'critical' ? 'bg-red-600 text-white' :
                            alert.alert_type === 'overdue' ? 'bg-orange-600 text-white' :
                            'bg-blue-600 text-white'
                          }`}>
                            {alert.alert_type}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Blank Inspection Tab */}
              {activeTab === 'blank' && (
                <div className="text-center py-8">
                  <ClipboardList className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <h4 className="text-lg font-medium text-gray-900 mb-2">Create Blank Inspection</h4>
                  <p className="text-gray-500 mb-4">
                    Start with a blank inspection and add checklist items as you go.
                  </p>
                  <div className="inline-block bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-sm text-green-700">
                      Fill in the form below to create your custom inspection
                    </p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Form Section */}
        <div className="border-t border-gray-200 pt-4 space-y-4">
          <h4 className="font-medium text-gray-900">Inspection Details</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Title */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Inspection Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Enter inspection title..."
              />
            </div>

            {/* Inspector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Inspector <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.inspector}
                onChange={(e) => setFormData(prev => ({ ...prev, inspector: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Enter inspector name..."
              />
            </div>

            {/* Scheduled Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Scheduled Date <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                value={formData.scheduled_date}
                onChange={(e) => setFormData(prev => ({ ...prev, scheduled_date: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            {/* Asset Selection */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Equipment/Asset
              </label>
              <select
                value={formData.asset_id}
                onChange={(e) => setFormData(prev => ({ ...prev, asset_id: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">Select equipment (optional)...</option>
                {assets.map(asset => (
                  <option key={asset.id} value={asset.id}>{asset.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={() => { void handleSubmit() }}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading || (activeTab !== 'blank' && !selectedTemplate && !selectedMaintenance && !selectedAlert)}
          >
            {loading ? 'Creating...' : 'Start Inspection'}
          </button>
        </div>
      </div>
    </Modal>
  )
}
