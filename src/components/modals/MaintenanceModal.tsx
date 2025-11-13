import { Calendar } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { Asset, MaintenanceSchedule } from '../../types/database'
import FormField from '../ui/FormField'
import FormSelect from '../ui/FormSelect'
import FormTextarea from '../ui/FormTextarea'
import LoadingSpinner from '../ui/LoadingSpinner'
import Modal from '../ui/Modal'

interface MaintenanceFormData {
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
}

interface MaintenanceModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: MaintenanceFormData) => Promise<void>
  item?: MaintenanceSchedule | null
  loading?: boolean
}

const MAINTENANCE_TYPES = [
  { value: 'preventive', label: 'Preventive' },
  { value: 'predictive', label: 'Predictive' },
  { value: 'corrective', label: 'Corrective' },
  { value: 'routine', label: 'Routine' },
  { value: 'emergency', label: 'Emergency' }
]

const INTERVAL_TYPES = [
  { value: 'hours', label: 'Hours' },
  { value: 'calendar', label: 'Calendar' }
]

const PRIORITIES = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' }
]

export default function MaintenanceModal({
  isOpen,
  onClose,
  onSubmit,
  item,
  loading = false
}: MaintenanceModalProps) {
  const [formData, setFormData] = useState<MaintenanceFormData>({
    equipment_name: '',
    maintenance_type: 'preventive',
    interval_type: 'hours',
    interval_value: 100,
    current_hours: undefined,
    next_due_date: '',
    priority: 'medium',
    assigned_technician: '',
    estimated_cost: undefined,
    notes: undefined
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [assets, setAssets] = useState<Asset[]>([])
  const [loadingAssets, setLoadingAssets] = useState(true)

  useEffect(() => {
    if (isOpen) {
      void (async () => {
        setLoadingAssets(true)
        const { data, error } = await supabase
          .from('assets')
          .select('*')
          .order('name')
        
        if (!error && data) {
          setAssets(data as Asset[])
          console.log('MaintenanceModal: Loaded assets:', data.length)
        } else if (error) {
          console.error('MaintenanceModal: Failed to load assets:', error)
        }
        setLoadingAssets(false)
      })()
    }
  }, [isOpen])

  useEffect(() => {
    if (item) {
      setFormData({
        equipment_name: item.equipment_name,
        maintenance_type: item.maintenance_type,
        interval_type: item.interval_type,
        interval_value: item.interval_value,
        current_hours: item.current_hours !== null ? item.current_hours : undefined,
        next_due_date: item.next_due_date?.split('T')[0] || '',
        priority: item.priority,
        assigned_technician: item.assigned_technician,
        estimated_cost: item.estimated_cost !== null ? item.estimated_cost : undefined,
        notes: item.notes !== null ? item.notes : undefined
      })
    } else {
      setFormData({
        equipment_name: '',
        maintenance_type: 'preventive',
        interval_type: 'hours',
        interval_value: 100,
        current_hours: undefined,
        next_due_date: '',
        priority: 'medium',
        assigned_technician: '',
        estimated_cost: undefined,
        notes: undefined
      })
    }
    setErrors({})
  }, [item, isOpen])

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault()
    
    void (async () => {
      // Basic validation
      const newErrors: Record<string, string> = {}
      
      if (!formData.equipment_name.trim()) {
        newErrors.equipment_name = 'Equipment name is required'
      }
      if (!formData.assigned_technician.trim()) {
        newErrors.assigned_technician = 'Assigned technician is required'
      }
      if (!formData.next_due_date) {
        newErrors.next_due_date = 'Next due date is required'
      }
      if (formData.interval_value <= 0) {
        newErrors.interval_value = 'Interval value must be greater than 0'
      }

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors)
        return
      }

      try {
        await onSubmit({
          ...formData,
          next_due_date: formData.next_due_date + 'T00:00:00Z'
        })
        onClose()
      } catch (error) {
        console.error('Failed to submit form:', error)
      }
    })()
  }

  const updateField = (field: keyof MaintenanceFormData, value: string | number) => {
    setFormData((prev: MaintenanceFormData) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev: Record<string, string>) => ({ ...prev, [field]: '' }))
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center">
          <Calendar className="h-6 w-6 text-green-600 mr-2" />
          {item ? 'Edit Maintenance Schedule' : 'Schedule New Maintenance'}
        </div>
      }
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <FormSelect
              label="Equipment/Asset"
              name="equipment_name"
              value={formData.equipment_name}
              onChange={(value) => {
                updateField('equipment_name', value)
                // Update current_hours when asset is selected
                const selectedAsset = assets.find(a => a.id === value)
                if (selectedAsset && selectedAsset.current_hours) {
                  updateField('current_hours', selectedAsset.current_hours)
                }
              }}
              options={[
                { value: '', label: 'Select Equipment...' },
                ...assets.map((asset) => ({
                  value: asset.id,
                  label: asset.name
                }))
              ]}
              required
              error={errors.equipment_name}
              disabled={loadingAssets}
            />
            {loadingAssets && (
              <p className="mt-1 text-sm text-gray-500">Loading equipment list...</p>
            )}
            {formData.equipment_name && (
              <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded">
                <p className="text-sm text-green-700">
                  Selected: {assets.find(a => a.id === formData.equipment_name)?.name || 'Unknown'}
                </p>
              </div>
            )}
          </div>

          <FormSelect
            label="Maintenance Type"
            name="maintenance_type"
            value={formData.maintenance_type}
            onChange={(value) => updateField('maintenance_type', value)}
            options={MAINTENANCE_TYPES}
            required
            error={errors.maintenance_type}
          />

          <FormSelect
            label="Priority"
            name="priority"
            value={formData.priority}
            onChange={(value) => updateField('priority', value)}
            options={PRIORITIES}
            required
            error={errors.priority}
          />

          <FormSelect
            label="Interval Type"
            name="interval_type"
            value={formData.interval_type}
            onChange={(value) => updateField('interval_type', value as 'hours' | 'calendar')}
            options={INTERVAL_TYPES}
            required
            error={errors.interval_type}
          />

          <FormField
            label="Interval Value"
            name="interval_value"
            type="number"
            value={formData.interval_value}
            onChange={(value) => updateField('interval_value', value)}
            placeholder="e.g., 250"
            required
            error={errors.interval_value}
          />

          {formData.interval_type === 'hours' && (
            <FormField
              label="Current Hours"
              name="current_hours"
              type="number"
              value={formData.current_hours || 0}
              onChange={(value) => updateField('current_hours', value)}
              placeholder="e.g., 240"
              error={errors.current_hours}
            />
          )}

          <FormField
            label="Next Due Date"
            name="next_due_date"
            type="date"
            value={formData.next_due_date}
            onChange={(value) => updateField('next_due_date', value)}
            required
            error={errors.next_due_date}
          />

          <FormField
            label="Assigned Technician"
            name="assigned_technician"
            value={formData.assigned_technician}
            onChange={(value) => updateField('assigned_technician', value)}
            placeholder="e.g., Mike Johnson"
            required
            error={errors.assigned_technician}
          />

          <FormField
            label="Estimated Cost"
            name="estimated_cost"
            type="number"
            value={formData.estimated_cost || 0}
            onChange={(value) => updateField('estimated_cost', value)}
            placeholder="e.g., 500"
            error={errors.estimated_cost}
          />
        </div>

        <FormTextarea
          label="Notes (Optional)"
          name="notes"
          value={formData.notes || ''}
          onChange={(value) => updateField('notes', value)}
          placeholder="Additional maintenance notes..."
          rows={3}
          error={errors.notes}
        />

        <div className="flex justify-end space-x-3 pt-6 border-t">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            {loading && <LoadingSpinner size="sm" color="white" className="mr-2" />}
            {item ? 'Update Schedule' : 'Create Schedule'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
