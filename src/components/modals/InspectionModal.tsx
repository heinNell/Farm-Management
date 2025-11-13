import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import type { Asset, Inspection } from '../../types/database'
import FormSelect from '../ui/FormSelect'
import Modal from '../ui/Modal'

interface InspectionModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: Partial<Inspection>) => Promise<void>
  inspection?: Inspection | null
}

export default function InspectionModal({
  isOpen,
  onClose,
  onSave,
  inspection
}: InspectionModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    type: 'safety' as Inspection['type'],
    inspector: '',
    scheduled_date: '',
    description: '',
    asset_id: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [assets, setAssets] = useState<Asset[]>([])
  const [loadingAssets, setLoadingAssets] = useState(true)

  useEffect(() => {
    if (inspection) {
      setFormData({
        title: inspection.title,
        type: inspection.type,
        inspector: inspection.inspector,
        scheduled_date: inspection.scheduled_date.slice(0, 16), // Format for datetime-local
        description: inspection.checklist_items?.[0]?.description || '',
        asset_id: inspection.asset_id || ''
      })
    } else {
      setFormData({
        title: '',
        type: 'safety',
        inspector: '',
        scheduled_date: '',
        description: '',
        asset_id: ''
      })
    }
    setError('')
  }, [inspection, isOpen])

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
          console.log('InspectionModal: Loaded assets:', data.length)
        } else if (error) {
          console.error('InspectionModal: Failed to load assets:', error)
        }
        setLoadingAssets(false)
      })()
    }
  }, [isOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    void submitForm()
  }

  const submitForm = async () => {
    setError('')
    setLoading(true)

    try {
      // Validate required fields
      if (!formData.title || !formData.inspector || !formData.scheduled_date || !formData.asset_id) {
        setError('Please fill in all required fields including equipment/asset')
        setLoading(false)
        return
      }

      const inspectionData: Partial<Inspection> = {
        title: formData.title,
        type: formData.type,
        inspector: formData.inspector,
        scheduled_date: new Date(formData.scheduled_date).toISOString(),
        status: inspection?.status || 'scheduled',
        progress: inspection?.progress || 0,
        score: inspection?.score || 0,
        asset_id: formData.asset_id || null,
        checklist_items: formData.description 
          ? [{
              id: '1',
              description: formData.description,
              completed: false
            }]
          : []
      }

      await onSave(inspectionData)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save inspection')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={inspection ? 'Edit Inspection' : 'Create New Inspection'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Title */}
          <div className="md:col-span-2">
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Inspection Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="e.g., Monthly Safety Check"
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

          {/* Asset/Equipment */}
          <div>
            <label htmlFor="asset_id" className="block text-sm font-medium text-gray-700 mb-1">
              Equipment/Asset <span className="text-red-500">*</span>
            </label>
            <FormSelect
              label=""
              name="asset_id"
              value={formData.asset_id}
              onChange={(value) => setFormData(prev => ({ ...prev, asset_id: value }))}
              options={[
                { value: '', label: 'Select Equipment...' },
                ...assets.map((asset) => ({
                  value: asset.id,
                  label: asset.name
                }))
              ]}
              required
            />
            {formData.asset_id && (
              <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded">
                <p className="text-sm text-green-700">
                  Selected: {assets.find(a => a.id === formData.asset_id)?.name || 'Unknown Asset'}
                </p>
              </div>
            )}
            {loadingAssets && (
              <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded">
                <p className="text-sm text-blue-700">⏳ Loading equipment list...</p>
              </div>
            )}
            {assets.length === 0 && !loadingAssets && (
              <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded">
                <p className="text-sm text-red-700">⚠️ No equipment found in database!</p>
              </div>
            )}
          </div>

          {/* Inspector */}
          <div>
            <label htmlFor="inspector" className="block text-sm font-medium text-gray-700 mb-1">
              Inspector <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="inspector"
              name="inspector"
              value={formData.inspector}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="e.g., John Doe"
              required
            />
          </div>

          {/* Scheduled Date */}
          <div className="md:col-span-2">
            <label htmlFor="scheduled_date" className="block text-sm font-medium text-gray-700 mb-1">
              Scheduled Date & Time <span className="text-red-500">*</span>
            </label>
            <input
              type="datetime-local"
              id="scheduled_date"
              name="scheduled_date"
              value={formData.scheduled_date}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
            />
          </div>

          {/* Description */}
          <div className="md:col-span-2">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description / Notes
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Add any additional notes or checklist items..."
            />
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
            type="submit"
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? 'Saving...' : inspection ? 'Update Inspection' : 'Create Inspection'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
