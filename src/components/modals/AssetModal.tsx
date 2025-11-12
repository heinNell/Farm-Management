
import { Edit, Plus, X } from 'lucide-react'
import React, { useState } from 'react'
import { Asset } from '../../types/fuel'

interface AssetModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (assetData: Omit<Asset, '_id'>) => Promise<void>
  asset?: Asset | null
}

const AssetModal: React.FC<AssetModalProps> = ({ isOpen, onClose, onSave, asset }) => {
  const [formData, setFormData] = useState({
    name: asset?.name || '',
    type: asset?.type || 'tractor',
    fuel_type: asset?.fuel_type || 'diesel',
    fuel_capacity: asset?.fuel_capacity || 0,
    model: asset?.model || '',
    serial_number: asset?.serial_number || '',
    purchase_date: asset?.purchase_date || '',
    status: asset?.status || 'active',
    location: asset?.location || '',
    current_hours: asset?.current_hours || 0,
    barcode: asset?.barcode || '',
    qr_code: asset?.qr_code || '',
    notes: asset?.notes || ''
  })
  
  const [loading, setLoading] = useState(false)

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault()
    setLoading(true)
    
    void (async () => {
      try {
        await onSave({
          ...formData,
          id: asset?.id || '',
          created_at: asset?.created_at || new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        onClose()
      } catch (error) {
        console.error('Failed to save asset:', error)
      } finally {
        setLoading(false)
      }
    })()
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>): void => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'fuel_capacity' || name === 'current_hours' ? Number(value) : value
    }))
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose} />

        <div className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              {asset ? <Edit className="h-6 w-6 text-blue-600 mr-2" /> : <Plus className="h-6 w-6 text-green-600 mr-2" />}
              <h3 className="text-lg font-medium text-gray-900">
                {asset ? 'Edit Asset' : 'Add New Asset'}
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
                Asset Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="e.g., John Deere 6120M"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Equipment Type *
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="tractor">Tractor</option>
                  <option value="forklift">Forklift</option>
                  <option value="motorbike">Motorbike</option>
                  <option value="generator">Generator</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fuel Type *
                </label>
                <select
                  name="fuel_type"
                  value={formData.fuel_type}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="diesel">Diesel</option>
                  <option value="petrol">Petrol</option>
                  <option value="electric">Electric</option>
                  <option value="hybrid">Hybrid</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fuel Capacity (Liters)
              </label>
              <input
                type="number"
                name="fuel_capacity"
                value={formData.fuel_capacity ?? ''}
                onChange={handleChange}
                min="0"
                step="0.1"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="280"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Serial Number
                </label>
                <input
                  type="text"
                  name="serial_number"
                  value={formData.serial_number ?? ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="SN-123456"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Model
                </label>
                <input
                  type="text"
                  name="model"
                  value={formData.model ?? ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="6120M"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Purchase Date
                </label>
                <input
                  type="date"
                  name="purchase_date"
                  value={formData.purchase_date ?? ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="active">Active</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="retired">Retired</option>
                  <option value="out_of_service">Out of Service</option>
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

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Saving...' : asset ? 'Update Asset' : 'Create Asset'}
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

export default AssetModal
