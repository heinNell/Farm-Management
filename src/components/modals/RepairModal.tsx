
import { Wrench } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { RepairFormData, RepairItem } from '../../types/database'
import { repairSchema, validateForm } from '../../utils/validation'
import FormField from '../ui/FormField'
import FormSelect from '../ui/FormSelect'
import FormTextarea from '../ui/FormTextarea'
import LoadingSpinner from '../ui/LoadingSpinner'
import Modal from '../ui/Modal'

interface RepairModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: RepairFormData) => Promise<void>
  item?: RepairItem | null
  loading?: boolean
}

const PRIORITIES = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' }
]

const WARRANTY_STATUS = [
  { value: 'in_warranty', label: 'In Warranty' },
  { value: 'out_of_warranty', label: 'Out of Warranty' },
  { value: 'extended', label: 'Extended Warranty' }
]

export default function RepairModal({
  isOpen,
  onClose,
  onSubmit,
  item,
  loading = false
}: RepairModalProps) {
  const [formData, setFormData] = useState<RepairFormData>({
    equipment_name: '',
    defect_tag: '',
    priority: 'medium',
    description: '',
    estimated_cost: 0,
    assigned_technician: '',
    warranty_status: 'out_of_warranty',
    estimated_completion: ''
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (item) {
      setFormData({
        equipment_name: item.equipment_name,
        defect_tag: item.defect_tag,
        priority: item.priority,
        description: item.description,
        estimated_cost: item.estimated_cost,
        assigned_technician: item.assigned_technician,
        warranty_status: item.warranty_status,
        estimated_completion: item.estimated_completion?.split('T')[0] ?? '' // Convert to date format
      })
    } else {
      setFormData({
        equipment_name: '',
        defect_tag: '',
        priority: 'medium',
        description: '',
        estimated_cost: 0,
        assigned_technician: '',
        warranty_status: 'out_of_warranty',
        estimated_completion: ''
      })
    }
    setErrors({})
  }, [item, isOpen])

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault()
    
    void (async () => {
      const validation = validateForm(repairSchema, {
        ...formData,
        estimated_completion: formData.estimated_completion + 'T00:00:00Z'
      })
      
      if (!validation.success) {
        setErrors(validation.errors || {})
        return
      }

      try {
        await onSubmit(validation.data!)
        onClose()
      } catch (error) {
        console.error('Failed to submit form:', error)
      }
    })()
  }

  const updateField = (field: keyof RepairFormData, value: string | number): void => {
    setFormData((prev: RepairFormData) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev: Record<string, string>) => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center">
          <Wrench className="h-6 w-6 text-orange-600 mr-2" />
          {item ? 'Edit Repair Item' : 'Add New Repair Item'}
        </div>
      }
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            label="Equipment Name"
            name="equipment_name"
            value={formData.equipment_name}
            onChange={(value) => updateField('equipment_name', value)}
            placeholder="e.g., John Deere 6120"
            required
            error={errors.equipment_name}
          />

          <FormField
            label="Defect Tag"
            name="defect_tag"
            value={formData.defect_tag}
            onChange={(value) => updateField('defect_tag', value)}
            placeholder="e.g., DEF-001"
            required
            error={errors.defect_tag}
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

          <FormField
            label="Assigned Technician"
            name="assigned_technician"
            value={formData.assigned_technician}
            onChange={(value) => updateField('assigned_technician', value)}
            placeholder="e.g., John Smith"
            required
            error={errors.assigned_technician}
          />

          <FormField
            label="Estimated Cost"
            name="estimated_cost"
            type="number"
            value={formData.estimated_cost}
            onChange={(value) => updateField('estimated_cost', value)}
            required
            error={errors.estimated_cost}
          />

          <FormSelect
            label="Warranty Status"
            name="warranty_status"
            value={formData.warranty_status}
            onChange={(value) => updateField('warranty_status', value)}
            options={WARRANTY_STATUS}
            required
            error={errors.warranty_status}
          />

          <div className="md:col-span-2">
            <FormField
              label="Estimated Completion"
              name="estimated_completion"
              type="date"
              value={formData.estimated_completion}
              onChange={(value) => updateField('estimated_completion', value)}
              required
              error={errors.estimated_completion}
            />
          </div>
        </div>

        <FormTextarea
          label="Description"
          name="description"
          value={formData.description}
          onChange={(value) => updateField('description', value)}
          placeholder="Describe the issue and required repairs..."
          required
          rows={4}
          maxLength={500}
          error={errors.description}
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
            className="flex items-center px-4 py-2 text-sm font-medium text-white bg-orange-600 rounded-lg hover:bg-orange-700 disabled:opacity-50"
          >
            {loading && <LoadingSpinner size="sm" color="white" className="mr-2" />}
            {item ? 'Update Repair' : 'Create Repair'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
