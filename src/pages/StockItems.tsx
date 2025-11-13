import StockItemModal from '@/components/modals/StockItemModal'
import { useSupabaseCRUD } from '@/hooks/useSupabaseCRUD'
import type { StockItem } from '@/types/database'
import { AlertTriangle, Edit2, Package, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'

export default function StockItems() {
  const { items, loading, error, create, update, delete: deleteItem } = useSupabaseCRUD<StockItem>('stock_items')
  const [showModal, setShowModal] = useState(false)
  const [editingItem, setEditingItem] = useState<StockItem | null>(null)

  const handleCreateOrUpdateItem = async (data: Partial<StockItem>) => {
    try {
      if (editingItem) {
        await update(editingItem.id, data)
      } else {
        await create(data as Omit<StockItem, 'id' | 'created_at' | 'updated_at'>)
      }
      setShowModal(false)
      setEditingItem(null)
    } catch (err) {
      console.error('Error saving stock item:', err)
    }
  }

  const handleEditItem = (item: StockItem) => {
    setEditingItem(item)
    setShowModal(true)
  }

  const handleDeleteItem = (id: string) => {
    if (confirm('Are you sure you want to delete this stock item?')) {
      deleteItem(id).catch((err) => {
        console.error('Error deleting stock item:', err)
      })
    }
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingItem(null)
  }

  const getStatusBadge = (status: StockItem['status']) => {
    if (!status) return 'bg-gray-100 text-gray-800'
    const statusConfig = {
      available: 'bg-green-100 text-green-800',
      reserved: 'bg-blue-100 text-blue-800',
      low_stock: 'bg-yellow-100 text-yellow-800',
      out_of_stock: 'bg-red-100 text-red-800'
    }
    return statusConfig[status] || statusConfig.available
  }

  const getCategoryBadge = (category: StockItem['category']) => {
    if (!category) return 'bg-gray-100 text-gray-800'
    const categoryConfig = {
      raw_materials: 'bg-purple-100 text-purple-800',
      finished_goods: 'bg-green-100 text-green-800',
      spare_parts: 'bg-blue-100 text-blue-800',
      consumables: 'bg-orange-100 text-orange-800',
      tools: 'bg-gray-100 text-gray-800'
    }
    return categoryConfig[category] || categoryConfig.spare_parts
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
        Error loading stock items: {error}
      </div>
    )
  }

  const lowStockItems = items.filter(item => item.quantity <= item.reorder_point)
  const totalValue = items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Stock Items</h1>
          <p className="text-gray-600 mt-1">Manage your stock inventory and supplies</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-5 w-5" />
          Add Stock Item
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Items</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{items.length}</p>
            </div>
            <Package className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Low Stock</p>
              <p className="text-2xl font-bold text-yellow-600 mt-1">{lowStockItems.length}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-yellow-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Value</p>
              <p className="text-2xl font-bold text-green-600 mt-1">{formatCurrency(totalValue)}</p>
            </div>
            <Package className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Categories</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {new Set(items.map(i => i.category)).size}
              </p>
            </div>
            <Package className="h-8 w-8 text-gray-600" />
          </div>
        </div>
      </div>

      {/* Low Stock Alert */}
      {lowStockItems.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            <h3 className="font-semibold text-yellow-900">Low Stock Alert</h3>
          </div>
          <p className="text-yellow-800 mt-1">
            {lowStockItems.length} item{lowStockItems.length !== 1 ? 's' : ''} need restocking
          </p>
        </div>
      )}

      {/* Stock Items Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Item
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Unit Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Supplier
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {items.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                    <Package className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                    <p className="text-lg font-medium">No stock items yet</p>
                    <p className="text-sm mt-1">Get started by adding your first stock item</p>
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{item.item_name}</div>
                      {item.expiry_date && (
                        <div className="text-sm text-gray-500">
                          Expires: {new Date(item.expiry_date).toLocaleDateString()}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryBadge(item.category)}`}>
                        {item.category ? item.category.replace('_', ' ') : 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {item.quantity} {item.unit}
                      </div>
                      {item.quantity <= item.reorder_point && (
                        <div className="text-xs text-yellow-600 flex items-center gap-1 mt-1">
                          <AlertTriangle className="h-3 w-3" />
                          Reorder at {item.reorder_point}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{item.location}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(item.status)}`}>
                        {item.status ? item.status.replace('_', ' ') : 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {formatCurrency(item.unit_price)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{item.supplier}</td>
                    <td className="px-6 py-4 text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEditItem(item)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteItem(item.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      <StockItemModal
        isOpen={showModal}
        onClose={handleCloseModal}
        onSubmit={(data) => void handleCreateOrUpdateItem(data)}
        editingItem={editingItem}
      />
    </div>
  )
}
