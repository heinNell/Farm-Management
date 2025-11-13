import type { StockItem } from '@/types/database'
import { X } from 'lucide-react'
import { useEffect, useState } from 'react'

interface StockItemModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: Partial<StockItem>) => void
  editingItem?: StockItem | null
}

export default function StockItemModal({ isOpen, onClose, onSubmit, editingItem }: StockItemModalProps) {
  const [formData, setFormData] = useState<{
    item_name: string
    category: 'raw_materials' | 'finished_goods' | 'spare_parts' | 'consumables' | 'tools'
    quantity: number
    unit: 'pieces' | 'kg' | 'liters' | 'boxes' | 'pallets' | 'meters'
    location: string
    status: 'available' | 'reserved' | 'low_stock' | 'out_of_stock'
    reorder_point: number
    reorder_quantity: number
    unit_price: number
    supplier: string
    last_restocked: string
    expiry_date: string
  }>({
    item_name: '',
    category: 'spare_parts',
    quantity: 0,
    unit: 'pieces',
    location: '',
    status: 'available',
    reorder_point: 0,
    reorder_quantity: 0,
    unit_price: 0,
    supplier: '',
    last_restocked: '',
    expiry_date: ''
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (editingItem) {
      setFormData({
        item_name: editingItem.item_name,
        category: editingItem.category || 'spare_parts',
        quantity: editingItem.quantity,
        unit: editingItem.unit || 'pieces',
        location: editingItem.location,
        status: editingItem.status || 'available',
        reorder_point: editingItem.reorder_point,
        reorder_quantity: editingItem.reorder_quantity,
        unit_price: editingItem.unit_price,
        supplier: editingItem.supplier,
        last_restocked: editingItem.last_restocked || '',
        expiry_date: editingItem.expiry_date || ''
      })
    } else {
      setFormData({
        item_name: '',
        category: 'spare_parts',
        quantity: 0,
        unit: 'pieces',
        location: '',
        status: 'available',
        reorder_point: 0,
        reorder_quantity: 0,
        unit_price: 0,
        supplier: '',
        last_restocked: '',
        expiry_date: ''
      })
    }
    setErrors({})
  }, [editingItem, isOpen])

  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.item_name.trim()) {
      newErrors.item_name = 'Item name is required'
    }
    if (!formData.location.trim()) {
      newErrors.location = 'Location is required'
    }
    if (formData.quantity < 0) {
      newErrors.quantity = 'Quantity cannot be negative'
    }
    if (formData.reorder_point < 0) {
      newErrors.reorder_point = 'Reorder point cannot be negative'
    }
    if (formData.reorder_quantity < 0) {
      newErrors.reorder_quantity = 'Reorder quantity cannot be negative'
    }
    if (formData.unit_price < 0) {
      newErrors.unit_price = 'Unit price cannot be negative'
    }
    if (!formData.supplier.trim()) {
      newErrors.supplier = 'Supplier is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validate()) {
      const submitData: Partial<StockItem> = {
        ...formData,
        last_restocked: formData.last_restocked || null,
        expiry_date: formData.expiry_date || null
      }
      onSubmit(submitData)
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">
            {editingItem ? 'Edit Stock Item' : 'Add Stock Item'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Item Name *
              </label>
              <input
                type="text"
                value={formData.item_name}
                onChange={(e) => setFormData({ ...formData, item_name: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg ${
                  errors.item_name ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.item_name && (
                <p className="text-red-500 text-sm mt-1">{errors.item_name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as Exclude<StockItem['category'], null> })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="raw_materials">Raw Materials</option>
                <option value="finished_goods">Finished Goods</option>
                <option value="spare_parts">Spare Parts</option>
                <option value="consumables">Consumables</option>
                <option value="tools">Tools</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quantity *
              </label>
              <input
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                className={`w-full px-3 py-2 border rounded-lg ${
                  errors.quantity ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.quantity && (
                <p className="text-red-500 text-sm mt-1">{errors.quantity}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Unit *
              </label>
              <select
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value as Exclude<StockItem['unit'], null> })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="pieces">Pieces</option>
                <option value="kg">Kilograms</option>
                <option value="liters">Liters</option>
                <option value="boxes">Boxes</option>
                <option value="pallets">Pallets</option>
                <option value="meters">Meters</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location *
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg ${
                  errors.location ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.location && (
                <p className="text-red-500 text-sm mt-1">{errors.location}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status *
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as Exclude<StockItem['status'], null> })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="available">Available</option>
                <option value="reserved">Reserved</option>
                <option value="low_stock">Low Stock</option>
                <option value="out_of_stock">Out of Stock</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reorder Point *
              </label>
              <input
                type="number"
                value={formData.reorder_point}
                onChange={(e) => setFormData({ ...formData, reorder_point: Number(e.target.value) })}
                className={`w-full px-3 py-2 border rounded-lg ${
                  errors.reorder_point ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.reorder_point && (
                <p className="text-red-500 text-sm mt-1">{errors.reorder_point}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reorder Quantity *
              </label>
              <input
                type="number"
                value={formData.reorder_quantity}
                onChange={(e) => setFormData({ ...formData, reorder_quantity: Number(e.target.value) })}
                className={`w-full px-3 py-2 border rounded-lg ${
                  errors.reorder_quantity ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.reorder_quantity && (
                <p className="text-red-500 text-sm mt-1">{errors.reorder_quantity}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Unit Price *
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.unit_price}
                onChange={(e) => setFormData({ ...formData, unit_price: Number(e.target.value) })}
                className={`w-full px-3 py-2 border rounded-lg ${
                  errors.unit_price ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.unit_price && (
                <p className="text-red-500 text-sm mt-1">{errors.unit_price}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Supplier *
              </label>
              <input
                type="text"
                value={formData.supplier}
                onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg ${
                  errors.supplier ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.supplier && (
                <p className="text-red-500 text-sm mt-1">{errors.supplier}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Restocked
              </label>
              <input
                type="date"
                value={formData.last_restocked}
                onChange={(e) => setFormData({ ...formData, last_restocked: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Expiry Date
              </label>
              <input
                type="date"
                value={formData.expiry_date}
                onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {editingItem ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
