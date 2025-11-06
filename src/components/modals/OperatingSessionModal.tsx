
import React, { useState } from 'react'
import {X, Plus, Edit, Clock} from 'lucide-react'
import { OperatingSession, Asset } from '../../types/fuel'

interface OperatingSessionModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (sessionData: Omit<OperatingSession, '_id'>) => Promise<void>
  assets: Asset[]
  session?: OperatingSession | null
}

const OperatingSessionModal: React.FC<OperatingSessionModalProps> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  assets,
  session 
}) => {
  const [formData, setFormData] = useState({
    asset_id: session?.asset_id || '',
    start_time: session?.start_time ? session.start_time.slice(0, 16) : '',
    end_time: session?.end_time ? session.end_time.slice(0, 16) : '',
    operating_hours: session?.operating_hours || 0,
    task_type: session?.task_type || 'plowing',
    operator: session?.operator || '',
    fuel_consumed: session?.fuel_consumed || 0,
    location: session?.location || '',
    efficiency_rating: session?.efficiency_rating || 3,
    notes: session?.notes || ''
  })
  
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      await onSave({
        ...formData,
        start_time: new Date(formData.start_time).toISOString(),
        end_time: new Date(formData.end_time).toISOString(),
        created_at: session?.created_at || new Date().toISOString()
      })
      onClose()
    } catch (error) {
      console.error('Failed to save operating session:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    let newValue: string | number = value
    
    if (['operating_hours', 'fuel_consumed', 'efficiency_rating'].includes(name)) {
      newValue = Number(value) || 0
    }
    
    setFormData(prev => {
      const updated = { ...prev, [name]: newValue }
      
      // Auto-calculate operating hours when start/end time changes
      if ((name === 'start_time' || name === 'end_time') && updated.start_time && updated.end_time) {
        const start = new Date(updated.start_time)
        const end = new Date(updated.end_time)
        if (end > start) {
          updated.operating_hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60) // Convert to hours
        }
      }
      
      return updated
    })
  }

  const selectedAsset = assets.find(asset => asset.asset_id === formData.asset_id)

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose} />

        <div className="inline-block w-full max-w-lg p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              {session ? <Edit className="h-6 w-6 text-blue-600 mr-2" /> : <Plus className="h-6 w-6 text-green-600 mr-2" />}
              <h3 className="text-lg font-medium text-gray-900">
                {session ? 'Edit Operating Session' : 'Add Operating Session'}
              </h3>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Asset *
              </label>
              <select
                name="asset_id"
                value={formData.asset_id}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">Select Asset</option>
                {assets.map(asset => (
                  <option key={asset.asset_id} value={asset.asset_id}>
                    {asset.name} ({asset.asset_id})
                  </option>
                ))}
              </select>
              {selectedAsset && (
                <p className="text-sm text-gray-500 mt-1">
                  {selectedAsset.type} • {selectedAsset.fuel_type}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Time *
                </label>
                <input
                  type="datetime-local"
                  name="start_time"
                  value={formData.start_time}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Time *
                </label>
                <input
                  type="datetime-local"
                  name="end_time"
                  value={formData.end_time}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Operating Hours *
              </label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="number"
                  name="operating_hours"
                  value={formData.operating_hours}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.1"
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="8.0"
                />
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Auto-calculated from start/end times
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Task Type *
                </label>
                <select
                  name="task_type"
                  value={formData.task_type}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="plowing">Plowing</option>
                  <option value="harvesting">Harvesting</option>
                  <option value="transport">Transport</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Operator *
                </label>
                <input
                  type="text"
                  name="operator"
                  value={formData.operator}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="John Smith"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fuel Consumed (L) *
                </label>
                <input
                  type="number"
                  name="fuel_consumed"
                  value={formData.fuel_consumed}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="45.2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Efficiency Rating (1-5) *
                </label>
                <select
                  name="efficiency_rating"
                  value={formData.efficiency_rating}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value={1}>1 - Poor</option>
                  <option value={2}>2 - Below Average</option>
                  <option value={3}>3 - Average</option>
                  <option value={4}>4 - Good</option>
                  <option value={5}>5 - Excellent</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Field A"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Session notes..."
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Saving...' : session ? 'Update Session' : 'Create Session'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default OperatingSessionModal
