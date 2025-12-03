import { GripVertical, Plus, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import type { ChecklistItemTemplate, InspectionTemplate } from '../../types/database'
import Modal from '../ui/Modal'

interface InspectionTemplateModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: Omit<InspectionTemplate, 'id' | 'created_at' | 'updated_at'>) => Promise<void>
  template?: InspectionTemplate | null
}

export default function InspectionTemplateModal({
  isOpen,
  onClose,
  onSave,
  template
}: InspectionTemplateModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'safety' as InspectionTemplate['type'],
    frequency: 'monthly' as InspectionTemplate['frequency'],
    is_active: true
  })
  const [checklistItems, setChecklistItems] = useState<ChecklistItemTemplate[]>([])
  const [newItemText, setNewItemText] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (template) {
      setFormData({
        name: template.name,
        description: template.description || '',
        type: template.type,
        frequency: template.frequency,
        is_active: template.is_active
      })
      setChecklistItems(template.checklist_items || [])
    } else {
      setFormData({
        name: '',
        description: '',
        type: 'safety',
        frequency: 'monthly',
        is_active: true
      })
      setChecklistItems([])
    }
    setNewItemText('')
    setError('')
  }, [template, isOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    void submitForm()
  }

  const submitForm = async () => {
    setError('')
    setLoading(true)

    try {
      if (!formData.name.trim()) {
        setError('Please provide a template name')
        setLoading(false)
        return
      }

      if (checklistItems.length === 0) {
        setError('Please add at least one checklist item')
        setLoading(false)
        return
      }

      const templateData: Omit<InspectionTemplate, 'id' | 'created_at' | 'updated_at'> = {
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        type: formData.type,
        frequency: formData.frequency,
        is_active: formData.is_active,
        checklist_items: checklistItems.map((item, index) => ({
          ...item,
          order: index + 1
        }))
      }

      await onSave(templateData)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save template')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked
      setFormData(prev => ({ ...prev, [name]: checked }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
  }

  const addChecklistItem = () => {
    if (!newItemText.trim()) return
    
    const newItem: ChecklistItemTemplate = {
      id: crypto.randomUUID(),
      description: newItemText.trim(),
      order: checklistItems.length + 1
    }
    
    setChecklistItems(prev => [...prev, newItem])
    setNewItemText('')
  }

  const removeChecklistItem = (id: string) => {
    setChecklistItems(prev => prev.filter(item => item.id !== id))
  }

  const updateChecklistItem = (id: string, description: string) => {
    setChecklistItems(prev => 
      prev.map(item => item.id === id ? { ...item, description } : item)
    )
  }

  const moveChecklistItem = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) || 
      (direction === 'down' && index === checklistItems.length - 1)
    ) return
    
    const newItems = [...checklistItems]
    const swapIndex = direction === 'up' ? index - 1 : index + 1
    const temp = newItems[index]
    newItems[index] = newItems[swapIndex]!
    newItems[swapIndex] = temp!
    setChecklistItems(newItems)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addChecklistItem()
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={template ? 'Edit Inspection Template' : 'Create Inspection Template'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Template Name */}
          <div className="md:col-span-2">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Template Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="e.g., Tractor Pre-Start Checklist"
              required
            />
          </div>

          {/* Type */}
          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
              Inspection Type <span className="text-red-500">*</span>
            </label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
            >
              <option value="safety">Safety</option>
              <option value="pre_season">Pre-Season</option>
              <option value="compliance">Compliance</option>
              <option value="maintenance">Maintenance</option>
            </select>
          </div>

          {/* Frequency */}
          <div>
            <label htmlFor="frequency" className="block text-sm font-medium text-gray-700 mb-1">
              Recommended Frequency
            </label>
            <select
              id="frequency"
              name="frequency"
              value={formData.frequency}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="annual">Annual</option>
              <option value="as_needed">As Needed</option>
            </select>
          </div>

          {/* Description */}
          <div className="md:col-span-2">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Brief description of what this template covers..."
            />
          </div>

          {/* Active Status */}
          <div className="md:col-span-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="is_active"
                checked={formData.is_active}
                onChange={handleChange}
                className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
              />
              <span className="text-sm font-medium text-gray-700">Template is active</span>
            </label>
          </div>
        </div>

        {/* Checklist Items */}
        <div className="border-t pt-4">
          <h4 className="text-sm font-medium text-gray-900 mb-3">
            Checklist Items <span className="text-red-500">*</span>
          </h4>
          
          {/* Add new item */}
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={newItemText}
              onChange={(e) => setNewItemText(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Add a checklist item and press Enter..."
            />
            <button
              type="button"
              onClick={addChecklistItem}
              className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Plus className="h-5 w-5" />
            </button>
          </div>

          {/* Checklist items list */}
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {checklistItems.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">
                No checklist items yet. Add items above.
              </p>
            ) : (
              checklistItems.map((item, index) => (
                <div
                  key={item.id}
                  className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg group"
                >
                  <div className="flex flex-col gap-0.5">
                    <button
                      type="button"
                      onClick={() => moveChecklistItem(index, 'up')}
                      disabled={index === 0}
                      className="p-0.5 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                    >
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => moveChecklistItem(index, 'down')}
                      disabled={index === checklistItems.length - 1}
                      className="p-0.5 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                    >
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </div>
                  <GripVertical className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-500 w-6">{index + 1}.</span>
                  <input
                    type="text"
                    value={item.description}
                    onChange={(e) => updateChecklistItem(item.id, e.target.value)}
                    className="flex-1 px-2 py-1 border border-transparent bg-transparent rounded focus:border-gray-300 focus:bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => removeChecklistItem(item.id)}
                    className="p-1 text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))
            )}
          </div>
          
          {checklistItems.length > 0 && (
            <p className="text-xs text-gray-500 mt-2">
              {checklistItems.length} item{checklistItems.length !== 1 ? 's' : ''} • Drag or use arrows to reorder
            </p>
          )}
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
            type="submit"
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? 'Saving...' : template ? 'Update Template' : 'Create Template'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
