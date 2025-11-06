
import React, { useState } from 'react'
import {X, Plus, Edit, Receipt} from 'lucide-react'
import { FuelRecord, Asset } from '../../types/fuel'

interface FuelRecordModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (recordData: Omit<FuelRecord, '_id'>) => Promise<void>
  assets: Asset[]
  record?: FuelRecord | null
}

const FuelRecordModal: React.FC<FuelRecordModalProps> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  assets,
  record 
}) => {
  const [formData, setFormData] = useState({
    asset_id: record?.asset_id || '',
    fuel_amount: record?.fuel_amount || 0,
    fuel_cost: record?.fuel_cost || 0,
    fuel_price_per_liter: record?.fuel_price_per_liter || 0,
    record_type: record?.record_type || 'purchase',
    station_name: record?.station_name || '',
    receipt_number: record?.receipt_number || '',
    odometer_reading: record?.odometer_reading || 0,
    notes: record?.notes || ''
  })
  
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      await onSave({
        ...formData,
        created_at: record?.created_at || new Date().toISOString()
      })
      onClose()
    } catch (error) {
      console.error('Failed to save fuel record:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    let newValue: string | number = value
    
    if (['fuel_amount', 'fuel_cost', 'fuel_price_per_liter', 'odometer_reading'].includes(name)) {
      newValue = Number(value) || 0
    }
    
    setFormData(prev => {
      const updated = { ...prev, [name]: newValue }
      
      // Auto-calculate cost or price per liter
      if (name === 'fuel_amount' || name === 'fuel_price_per_liter') {
        updated.fuel_cost = updated.fuel_amount * updated.fuel_price_per_liter
      } else if (name === 'fuel_cost' && updated.fuel_amount > 0) {
        updated.fuel_price_per_liter = updated.fuel_cost / updated.fuel_amount
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
              {record ? <Edit className="h-6 w-6 text-blue-600 mr-2" /> : <Plus className="h-6 w-6 text-green-600 mr-2" />}
              <h3 className="text-lg font-medium text-gray-900">
                {record ? 'Edit Fuel Record' : 'Add Fuel Record'}
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
                  {selectedAsset.type} • {selectedAsset.fuel_type} • Tank: {selectedAsset.tank_capacity}L
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Record Type *
              </label>
              <select
                name="record_type"
                value={formData.record_type}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="purchase">Purchase</option>
                <option value="consumption">Consumption</option>
                <option value="refill">Refill</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fuel Amount (L) *
                </label>
                <input
                  type="number"
                  name="fuel_amount"
                  value={formData.fuel_amount}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="50.0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price per Liter *
                </label>
                <input
                  type="number"
                  name="fuel_price_per_liter"
                  value={formData.fuel_price_per_liter}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="1.50"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Total Cost *
              </label>
              <input
                type="number"
                name="fuel_cost"
                value={formData.fuel_cost}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="75.00"
              />
              <p className="text-sm text-gray-500 mt-1">
                Auto-calculated: {(formData.fuel_amount * formData.fuel_price_per_liter).toFixed(2)}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Station Name
                </label>
                <input
                  type="text"
                  name="station_name"
                  value={formData.station_name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Shell Station"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Operating Hours
                </label>
                <input
                  type="number"
                  name="odometer_reading"
                  value={formData.odometer_reading}
                  onChange={handleChange}
                  min="0"
                  step="0.1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="1250.5"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Receipt Number
              </label>
              <div className="relative">
                <Receipt className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  name="receipt_number"
                  value={formData.receipt_number}
                  onChange={handleChange}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="SH-20240115-001"
                />
              </div>
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
                placeholder="Additional notes..."
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Saving...' : record ? 'Update Record' : 'Create Record'}
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

export default FuelRecordModal
