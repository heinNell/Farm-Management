
import { Package } from 'lucide-react'
import type { FormEvent } from 'react'
import { useEffect, useState } from 'react'
import { InventoryFormData, InventoryItem } from '../../types/database'
import { inventorySchema, validateForm } from '../../utils/validation'
import FormField from '../ui/FormField'
import FormSelect from '../ui/FormSelect'
import LoadingSpinner from '../ui/LoadingSpinner'
import Modal from '../ui/Modal'

interface InventoryModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: InventoryFormData) => Promise<void>
  item?: InventoryItem | null
  loading?: boolean
}

const CATEGORIES = [
  { value: 'Fluids', label: 'Fluids' },
  { value: 'Filters', label: 'Filters' },
  { value: 'Engine Parts', label: 'Engine Parts' },
  { value: 'Tires', label: 'Tires' },
  { value: 'Tools', label: 'Tools' },
  { value: 'Safety Equipment', label: 'Safety Equipment' },
  { value: 'Electrical', label: 'Electrical' },
  { value: 'Hardware', label: 'Hardware' }
]

const UNITS = [
  { value: 'Units', label: 'Units' },
  { value: 'Liters', label: 'Liters' },
  { value: 'Sets', label: 'Sets' },
  { value: 'Boxes', label: 'Boxes' },
  { value: 'Meters', label: 'Meters' },
  { value: 'Kilograms', label: 'Kilograms' }
]

export default function InventoryModal({
  isOpen,
  onClose,
  onSubmit,
  item,
  loading = false
}: InventoryModalProps) {
  const createInitialFormState = (): InventoryFormData => ({
    sku: '',
    name: '',
    category: '',
    current_stock: 0,
    min_stock: 0,
    max_stock: 100,
    unit: '',
    location: ''
  })

  const [formData, setFormData] = useState<InventoryFormData>(() => createInitialFormState())
  const [errors, setErrors] = useState<Partial<Record<keyof InventoryFormData, string>>>({})

  useEffect(() => {
    if (item) {
      setFormData({
        sku: item.sku,
        name: item.name,
        category: item.category,
        current_stock: item.current_stock,
        min_stock: item.min_stock,
        max_stock: item.max_stock,
        unit: item.unit,
        location: item.location
      })
    } else {
      setFormData(createInitialFormState())
    }
    setErrors({})
  }, [item, isOpen])

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    const validation = validateForm<InventoryFormData>(inventorySchema, formData)
    if (!validation.success || !validation.data) {
      setErrors(validation.errors ?? {})
      return
    }

    const validatedData = validation.data

    // Additional validation
    if (validatedData.min_stock >= validatedData.max_stock) {
      setErrors({ min_stock: 'Min stock must be less than max stock' })
      return
    }

    void (async () => {
      try {
        await onSubmit(validatedData)
        onClose()
      } catch (error) {
        console.error('Failed to submit form:', error)
      }
    })()
  }

  const updateField = <K extends keyof InventoryFormData>(field: K, value: InventoryFormData[K] | string | number) => {
    const nextValue = value as InventoryFormData[K]
    setFormData(prev => ({ ...prev, [field]: nextValue }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center">
          <Package className="h-6 w-6 text-green-600 mr-2" />
          {item ? 'Edit Inventory Item' : 'Add New Inventory Item'}
        </div>
      }
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            label="SKU"
            name="sku"
            value={formData.sku}
            onChange={(value) => updateField('sku', value)}
            placeholder="e.g., HYD-001"
            required
            error={errors.sku}
          />

          <FormField
            label="Item Name"
            name="name"
            value={formData.name}
            onChange={(value) => updateField('name', value)}
            placeholder="e.g., Hydraulic Fluid - Premium Grade"
            required
            error={errors.name}
          />

          <FormSelect
            label="Category"
            name="category"
            value={formData.category}
            onChange={(value) => updateField('category', value)}
            options={CATEGORIES}
            required
            error={errors.category}
          />

          <FormSelect
            label="Unit"
            name="unit"
            value={formData.unit}
            onChange={(value) => updateField('unit', value)}
            options={UNITS}
            required
            error={errors.unit}
          />

          <FormField
            label="Current Stock"
            name="current_stock"
            type="number"
            value={formData.current_stock}
            onChange={(value) => updateField('current_stock', value)}
            required
            error={errors.current_stock}
          />

          <FormField
            label="Location"
            name="location"
            value={formData.location}
            onChange={(value) => updateField('location', value)}
            placeholder="e.g., Warehouse A-1"
            required
            error={errors.location}
          />

          <FormField
            label="Minimum Stock"
            name="min_stock"
            type="number"
            value={formData.min_stock}
            onChange={(value) => updateField('min_stock', value)}
            required
            error={errors.min_stock}
          />

          <FormField
            label="Maximum Stock"
            name="max_stock"
            type="number"
            value={formData.max_stock}
            onChange={(value) => updateField('max_stock', value)}
            required
            error={errors.max_stock}
          />
        </div>

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
            {item ? 'Update Item' : 'Create Item'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
