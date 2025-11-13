
import { motion } from 'framer-motion'
import { AlertTriangle, CheckCircle, Edit, Package, Plus, Scan, Search, Trash2 } from 'lucide-react'
import React, { useState } from 'react'
import ScanModal from '../components/ScanModal'
import ConfirmationModal from '../components/modals/ConfirmationModal'
import InventoryModal from '../components/modals/InventoryModal'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import { ToastContainer } from '../components/ui/Toast'
import { useSupabaseCRUD } from '../hooks/useSupabaseCRUD'
import { useToast } from '../hooks/useToast'
import { InventoryFormData, InventoryItem } from '../types/database'

export default function EnhancedInventory() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [showScanModal, setShowScanModal] = useState(false)
  const [showInventoryModal, setShowInventoryModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null)
  const [itemToDelete, setItemToDelete] = useState<string | null>(null)

  const { toasts, removeToast } = useToast()
  
  const {
    items: inventoryItems,
    loading,
    creating,
    updating,
    deleting,
    create,
    update,
    delete: deleteItem,
    search
  } = useSupabaseCRUD<InventoryItem>('inventory_items')

  // Filter and search items
  const filteredItems = React.useMemo(() => {
    let items = inventoryItems

    // Search functionality
    if (searchTerm) {
      items = search(searchTerm, ['name', 'sku', 'category', 'location'])
    }

    // Category filter
    if (selectedCategory !== 'all') {
      items = items.filter(item => item.category === selectedCategory)
    }

    // Status filter
    if (selectedStatus !== 'all') {
      items = items.filter(item => item.status === selectedStatus)
    }

    return items
  }, [inventoryItems, searchTerm, selectedCategory, selectedStatus, search])

  // Get unique categories
  const categories = React.useMemo(() => {
    const cats = Array.from(new Set(inventoryItems.map(item => item.category)))
    return cats.sort()
  }, [inventoryItems])

  const handleCreateItem = async (data: InventoryFormData) => {
    await create(buildInventoryPayload(data))
    setShowInventoryModal(false)
  }

  const handleUpdateItem = async (data: InventoryFormData) => {
    if (selectedItem) {
      await update(selectedItem.id, buildInventoryPayload(data))
      setShowInventoryModal(false)
      setSelectedItem(null)
    }
  }

  const handleDeleteItem = async () => {
    if (itemToDelete) {
      await deleteItem(itemToDelete)
      setShowDeleteModal(false)
      setItemToDelete(null)
    }
  }

  const handleEditClick = (item: InventoryItem) => {
    setSelectedItem(item)
    setShowInventoryModal(true)
  }

  const handleDeleteClick = (itemId: string) => {
    setItemToDelete(itemId)
    setShowDeleteModal(true)
  }

  const handleScan = (result: string) => {
    setSearchTerm(result)
    setShowScanModal(false)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in_stock': return 'text-green-600 bg-green-100'
      case 'low_stock': return 'text-yellow-600 bg-yellow-100'
      case 'out_of_stock': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'in_stock': return <CheckCircle className="h-4 w-4" />
      case 'low_stock': return <AlertTriangle className="h-4 w-4" />
      case 'out_of_stock': return <Package className="h-4 w-4" />
      default: return <Package className="h-4 w-4" />
    }
  }

  const getStockPercentage = (item: InventoryItem) => {
    if (!item.max_stock) {
      return 0
    }
    return Math.min((item.current_stock / item.max_stock) * 100, 100)
  }

  const computeInventoryStatus = (current: number, minimum: number): InventoryItem['status'] => {
    if (current <= 0) return 'out_of_stock'
    if (current <= minimum) return 'low_stock'
    return 'in_stock'
  }

  const buildInventoryPayload = (data: InventoryFormData): Omit<InventoryItem, 'id' | 'created_at' | 'updated_at'> => ({
    ...data,
    supplier: data.supplier || null,
    unit_cost: data.unit_cost ?? null,
    status: computeInventoryStatus(data.current_stock, data.min_stock),
    last_updated: new Date().toISOString()
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
        <span className="ml-3 text-gray-600">Loading inventory...</span>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Inventory Management</h1>
            <p className="text-gray-600 mt-1">Manage your farm equipment and supplies</p>
          </div>
        </div>

        {/* Search and Controls */}
        <div className="flex flex-col lg:flex-row gap-4 justify-between">
          <div className="flex-1 max-w-lg">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search inventory..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="in_stock">In Stock</option>
              <option value="low_stock">Low Stock</option>
              <option value="out_of_stock">Out of Stock</option>
            </select>

            <button
              onClick={() => setShowScanModal(true)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Scan className="h-5 w-5 mr-2" />
              <span className="hidden sm:inline">Scan</span>
            </button>
            
            <button
              onClick={() => {
                setSelectedItem(null)
                setShowInventoryModal(true)
              }}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Plus className="h-5 w-5 mr-2" />
              <span className="hidden sm:inline">Add Item</span>
            </button>
          </div>
        </div>

        {/* Inventory Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{item.name}</h3>
                  <p className="text-sm text-gray-500">SKU: {item.sku}</p>
                </div>
                <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={() => handleEditClick(item)}
                    className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                    title="Edit item"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteClick(item.id)}
                    className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                    title="Delete item"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className={`flex items-center px-2 py-1 rounded-full text-xs font-medium mb-4 ${getStatusColor(item.status)}`}>
                {getStatusIcon(item.status)}
                <span className="ml-1 capitalize">{item.status.replace('_', ' ')}</span>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Current Stock:</span>
                  <span className="font-medium">{item.current_stock} {item.unit}</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Min Stock:</span>
                  <span className="font-medium">{item.min_stock} {item.unit}</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Location:</span>
                  <span className="font-medium">{item.location}</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Category:</span>
                  <span className="font-medium">{item.category}</span>
                </div>

                {/* Stock Level Bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Min: {item.min_stock}</span>
                    <span>Max: {item.max_stock}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        item.current_stock === 0 ? 'bg-red-500' :
                        item.current_stock <= item.min_stock ? 'bg-yellow-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${getStockPercentage(item)}%` }}
                    />
                  </div>
                </div>

                <div className="text-xs text-gray-400 pt-2 border-t">
                  Last updated: {new Date(item.last_updated).toLocaleString()}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredItems.length === 0 && !loading && (
          <div className="text-center py-12">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No items found</h3>
            <p className="text-gray-500 mb-4">Try adjusting your search or filter criteria.</p>
            <button
              onClick={() => {
                setSelectedItem(null)
                setShowInventoryModal(true)
              }}
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <Plus className="h-5 w-5 mr-2" />
              Add First Item
            </button>
          </div>
        )}
      </div>

      {/* Modals */}
      <ScanModal
        isOpen={showScanModal}
        onClose={() => setShowScanModal(false)}
        onScan={handleScan}
      />

      <InventoryModal
        isOpen={showInventoryModal}
        onClose={() => {
          setShowInventoryModal(false)
          setSelectedItem(null)
        }}
        onSubmit={selectedItem ? handleUpdateItem : handleCreateItem}
        item={selectedItem}
        loading={creating || updating}
      />

      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false)
          setItemToDelete(null)
        }}
        onConfirm={handleDeleteItem}
        title="Delete Inventory Item"
        message="Are you sure you want to delete this inventory item? This action cannot be undone."
        confirmText="Delete"
        type="danger"
        loading={deleting}
      />

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </>
  )
}
