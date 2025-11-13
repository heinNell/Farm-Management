import { motion } from 'framer-motion'
import { Check, Edit2, MapPin, Plus, Trash2, X } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { useToast } from '../hooks/useToast'
import { supabase } from '../lib/supabase'

interface Farm {
  id: string
  name: string
  location: string | null
  description: string | null
  area_hectares: number | null
  manager_name: string | null
  contact_phone: string | null
  contact_email: string | null
  status: 'active' | 'inactive'
  created_at: string
  updated_at: string
}

interface FarmFormData {
  name: string
  location: string
  description: string
  area_hectares: string
  manager_name: string
  contact_phone: string
  contact_email: string
  status: 'active' | 'inactive'
}

export function FarmsManagement() {
  const [farms, setFarms] = useState<Farm[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const toast = useToast()

  const emptyForm: FarmFormData = {
    name: '',
    location: '',
    description: '',
    area_hectares: '',
    manager_name: '',
    contact_phone: '',
    contact_email: '',
    status: 'active'
  }

  const [formData, setFormData] = useState<FarmFormData>(emptyForm)

  const loadFarms = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('farms')
        .select('*')
        .order('name')

      if (error) throw error
      setFarms(data || [])
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      toast.error('Failed to load farms', message)
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    void loadFarms()
  }, [loadFarms])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const farmData = {
        name: formData.name,
        location: formData.location || null,
        description: formData.description || null,
        area_hectares: formData.area_hectares ? parseFloat(formData.area_hectares) : null,
        manager_name: formData.manager_name || null,
        contact_phone: formData.contact_phone || null,
        contact_email: formData.contact_email || null,
        status: formData.status
      }

      if (editingId) {
        const { error } = await supabase
          .from('farms')
          .update(farmData)
          .eq('id', editingId)

        if (error) throw error
        toast.success('Farm updated successfully')
      } else {
        const { error } = await supabase
          .from('farms')
          .insert([farmData])

        if (error) throw error
        toast.success('Farm added successfully')
      }

      setFormData(emptyForm)
      setEditingId(null)
      setShowAddForm(false)
      void loadFarms()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      toast.error('Failed to save farm', message)
    }
  }

  const handleEdit = (farm: Farm) => {
    setFormData({
      name: farm.name,
      location: farm.location || '',
      description: farm.description || '',
      area_hectares: farm.area_hectares?.toString() || '',
      manager_name: farm.manager_name || '',
      contact_phone: farm.contact_phone || '',
      contact_email: farm.contact_email || '',
      status: farm.status
    })
    setEditingId(farm.id)
    setShowAddForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this farm? Assets linked to this farm will be unassigned.')) {
      return
    }

    try {
      const { error } = await supabase
        .from('farms')
        .delete()
        .eq('id', id)

      if (error) throw error
      toast.success('Farm deleted successfully')
      void loadFarms()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      toast.error('Failed to delete farm', message)
    }
  }

  const handleCancel = () => {
    setFormData(emptyForm)
    setEditingId(null)
    setShowAddForm(false)
  }

  if (loading) {
    return <div className="text-center py-8">Loading farms...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-600">
          Manage farm locations and assign assets to specific farms
        </p>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Farm
        </button>
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-50 rounded-lg p-6 border-2 border-green-200"
        >
          <h4 className="text-lg font-semibold text-gray-900 mb-4">
            {editingId ? 'Edit Farm' : 'Add New Farm'}
          </h4>
          <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Farm Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="e.g., BURMA VALLEY FARM"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="e.g., District, Region"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Area (Hectares)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.area_hectares}
                  onChange={(e) => setFormData({ ...formData, area_hectares: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="e.g., 150.50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Manager Name
                </label>
                <input
                  type="text"
                  value={formData.manager_name}
                  onChange={(e) => setFormData({ ...formData, manager_name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="e.g., John Smith"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contact Phone
                </label>
                <input
                  type="tel"
                  value={formData.contact_phone}
                  onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="e.g., +1234567890"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contact Email
                </label>
                <input
                  type="email"
                  value={formData.contact_email}
                  onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="e.g., manager@farm.com"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Additional information about the farm"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={handleCancel}
                className="flex items-center px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Check className="h-4 w-4 mr-2" />
                {editingId ? 'Update' : 'Add'} Farm
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Farms List */}
      <div className="grid gap-4">
        {farms.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">No farms found</p>
            <p className="text-sm text-gray-500 mt-1">Add your first farm to get started</p>
          </div>
        ) : (
          farms.map((farm, index) => (
            <motion.div
              key={farm.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="text-lg font-semibold text-gray-900">{farm.name}</h4>
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        farm.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {farm.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    {farm.location && (
                      <div className="text-gray-600">
                        <span className="font-medium">Location:</span> {farm.location}
                      </div>
                    )}
                    {farm.area_hectares && (
                      <div className="text-gray-600">
                        <span className="font-medium">Area:</span> {farm.area_hectares} ha
                      </div>
                    )}
                    {farm.manager_name && (
                      <div className="text-gray-600">
                        <span className="font-medium">Manager:</span> {farm.manager_name}
                      </div>
                    )}
                    {farm.contact_phone && (
                      <div className="text-gray-600">
                        <span className="font-medium">Phone:</span> {farm.contact_phone}
                      </div>
                    )}
                    {farm.contact_email && (
                      <div className="text-gray-600 md:col-span-2">
                        <span className="font-medium">Email:</span> {farm.contact_email}
                      </div>
                    )}
                  </div>

                  {farm.description && (
                    <p className="text-sm text-gray-600 mt-2">{farm.description}</p>
                  )}
                </div>

                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => handleEdit(farm)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Edit"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => void handleDelete(farm.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  )
}
