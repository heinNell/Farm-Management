
import { Clipboard, X } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { JobCard, JobFormData } from '../../types/database'
import { jobSchema, validateForm } from '../../utils/validation'
import FormField from '../ui/FormField'
import FormSelect from '../ui/FormSelect'
import FormTextarea from '../ui/FormTextarea'
import LoadingSpinner from '../ui/LoadingSpinner'
import Modal from '../ui/Modal'

interface JobModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: JobFormData) => Promise<void>
  item?: JobCard | null
  loading?: boolean
}

const PRIORITIES = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' }
]

export default function JobModal({
  isOpen,
  onClose,
  onSubmit,
  item,
  loading = false
}: JobModalProps) {
  const [formData, setFormData] = useState<JobFormData>({
    title: '',
    description: '',
    priority: 'medium',
    assigned_to: '',
    location: '',
    estimated_hours: 1,
    due_date: '',
    tags: []
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [newTag, setNewTag] = useState('')

  useEffect(() => {
    if (item) {
      setFormData({
        title: item.title,
        description: item.description,
        priority: item.priority,
        assigned_to: item.assigned_to,
        location: item.location,
        estimated_hours: item.estimated_hours,
        due_date: item.due_date?.split('T')[0] || '', // Convert to date format
        tags: item.tags || []
      })
    } else {
      setFormData({
        title: '',
        description: '',
        priority: 'medium',
        assigned_to: '',
        location: '',
        estimated_hours: 1,
        due_date: '',
        tags: []
      })
    }
    setErrors({})
    setNewTag('')
  }, [item, isOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const validation = validateForm(jobSchema, {
      ...formData,
      due_date: formData.due_date + 'T23:59:59Z'
    })
    
    if (!validation.success) {
      setErrors(validation.errors || {})
      return
    }

    void onSubmit(validation.data!)
      .then(() => onClose())
      .catch((error) => {
        console.error('Failed to submit form:', error)
      })
  }

  const updateField = (field: keyof JobFormData, value: string | number | string[]) => {
    setFormData((prev: JobFormData) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev: Record<string, string>) => ({ ...prev, [field]: '' }))
    }
  }

  const addTag = () => {
    if (newTag.trim() && !formData.tags?.includes(newTag.trim())) {
      updateField('tags', [...(formData.tags || []), newTag.trim()])
      setNewTag('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    updateField('tags', formData.tags?.filter((tag: string) => tag !== tagToRemove) || [])
  }

  const handleTagKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addTag()
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center">
          <Clipboard className="h-6 w-6 text-blue-600 mr-2" />
          {item ? 'Edit Job Card' : 'Add New Job Card'}
        </div>
      }
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <FormField
              label="Job Title"
              name="title"
              value={formData.title}
              onChange={(value) => updateField('title', value)}
              placeholder="e.g., Replace hydraulic pump"
              required
              error={errors.title}
            />
          </div>

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
            label="Assigned To"
            name="assigned_to"
            value={formData.assigned_to}
            onChange={(value) => updateField('assigned_to', value)}
            placeholder="e.g., John Smith"
            required
            error={errors.assigned_to}
          />

          <FormField
            label="Location"
            name="location"
            value={formData.location}
            onChange={(value) => updateField('location', value)}
            placeholder="e.g., Field A, Workshop"
            required
            error={errors.location}
          />

          <FormField
            label="Estimated Hours"
            name="estimated_hours"
            type="number"
            value={formData.estimated_hours}
            onChange={(value) => updateField('estimated_hours', value)}
            required
            error={errors.estimated_hours}
          />

          <div className="md:col-span-2">
            <FormField
              label="Due Date"
              name="due_date"
              type="date"
              value={formData.due_date}
              onChange={(value) => updateField('due_date', value)}
              required
              error={errors.due_date}
            />
          </div>
        </div>

        <FormTextarea
          label="Description"
          name="description"
          value={formData.description}
          onChange={(value) => updateField('description', value)}
          placeholder="Describe the job requirements and steps..."
          required
          rows={4}
          maxLength={1000}
          error={errors.description || undefined}
        />

        {/* Tags Section */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">
            Tags (Optional)
          </label>
          
          <div className="flex gap-2">
            <input
              type="text"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyPress={handleTagKeyPress}
              placeholder="Add a tag..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              type="button"
              onClick={addTag}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Add
            </button>
          </div>

          {formData.tags && formData.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {formData.tags.map((tag: string, index: number) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="ml-1 text-blue-600 hover:text-blue-800"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
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
            className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading && <LoadingSpinner size="sm" color="white" className="mr-2" />}
            {item ? 'Update Job' : 'Create Job'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
