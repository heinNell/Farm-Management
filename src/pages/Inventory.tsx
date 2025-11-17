
import { motion } from 'framer-motion'
import { AlertTriangle, CheckCircle, Download, Filter, Package, Plus, Scan, Search, Upload } from 'lucide-react'
import { useEffect, useState } from 'react'
import BulkInventoryUploadModal from '../components/modals/BulkInventoryUploadModal'
import InventoryModal from '../components/modals/InventoryModal'
import ScanModal from '../components/ScanModal'
import { useSupabaseCRUD } from '../hooks/useSupabaseCRUD'
import type { InventoryFormData, InventoryItem } from '../types/database'
import { exportInventoryToExcel, ParsedInventoryItem } from '../utils/inventoryExcelUtils'

export default function Inventory() {
  const { items: inventoryItems, loading, create, update, delete: deleteItem, refresh } = useSupabaseCRUD<InventoryItem>('inventory_items')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [showScanModal, setShowScanModal] = useState(false)
  const [showInventoryModal, setShowInventoryModal] = useState(false)
  const [showBulkUploadModal, setShowBulkUploadModal] = useState(false)
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null)

  useEffect(() => {
    void refresh()
  }, [refresh])

  const filteredItems = inventoryItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.sku.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const categories = ['all', ...Array.from(new Set(inventoryItems.map(item => item.category)))]

  // CRUD handlers
  const handleCreateOrUpdateItem = async (data: InventoryFormData) => {
    if (editingItem) {
      await update(editingItem.id, data)
    } else {
      // Calculate status based on stock levels
      const status = data.current_stock === 0 ? 'out_of_stock' : 
                     data.current_stock <= data.min_stock ? 'low_stock' : 'in_stock'
      
      await create({
        ...data,
        supplier: data.supplier || null,
        unit_cost: data.unit_cost ?? null,
        status,
        last_updated: new Date().toISOString()
      })
    }
    await refresh()
  }

  const handleEditItem = (item: InventoryItem) => {
    setEditingItem(item)
    setShowInventoryModal(true)
  }

  const handleDeleteItem = async (id: string) => {
    if (confirm('Are you sure you want to delete this item?')) {
      await deleteItem(id)
    }
  }

  const handleCloseModal = () => {
    setShowInventoryModal(false)
    setEditingItem(null)
  }

  const handleBulkUpload = async (items: ParsedInventoryItem[]) => {
    for (const item of items) {
      await create({
        ...item,
        supplier: item.supplier || null,
        unit_cost: item.unit_cost ?? null
      })
    }
    await refresh()
  }

  const handleExportToExcel = () => {
    exportInventoryToExcel(inventoryItems)
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

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
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
        
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={handleExportToExcel}
            className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Download className="h-5 w-5 mr-2" />
            Export
          </button>
          <button
            onClick={() => setShowBulkUploadModal(true)}
            className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Upload className="h-5 w-5 mr-2" />
            Bulk Upload
          </button>
          <button
            onClick={() => setShowScanModal(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Scan className="h-5 w-5 mr-2" />
            Scan Item
          </button>
          <button
            onClick={() => setShowInventoryModal(true)}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Item
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <Filter className="h-5 w-5 text-gray-400" />
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
        >
          {categories.map(category => (
            <option key={category} value={category}>
              {category === 'all' ? 'All Categories' : category}
            </option>
          ))}
        </select>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading inventory...</p>
          </div>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-md">
          <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No inventory items found</p>
          <p className="text-gray-400 text-sm mt-2">
            {searchTerm || selectedCategory !== 'all'
              ? 'Try adjusting your filters'
              : 'Add your first inventory item to get started'}
          </p>
        </div>
      ) : (
        /* Inventory Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
                <p className="text-sm text-gray-500">SKU: {item.sku}</p>
              </div>
              <div className={`flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                {getStatusIcon(item.status)}
                <span className="ml-1 capitalize">{item.status.replace('_', ' ')}</span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Current Stock:</span>
                <span className="text-sm font-medium">{item.current_stock} {item.unit}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Min Stock:</span>
                <span className="text-sm font-medium">{item.min_stock} {item.unit}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Location:</span>
                <span className="text-sm font-medium">{item.location}</span>
              </div>

              {/* Stock Level Bar */}
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${
                    item.current_stock === 0 ? 'bg-red-500' :
                    item.current_stock <= item.min_stock ? 'bg-yellow-500' : 'bg-green-500'
                  }`}
                  style={{ 
                    width: `${Math.min((item.current_stock / item.max_stock) * 100, 100)}%` 
                  }}
                />
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200 flex gap-2">
              <button 
                onClick={() => handleEditItem(item)}
                className="flex-1 text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                Edit
              </button>
              <button 
                onClick={() => { void handleDeleteItem(item.id) }}
                className="flex-1 text-red-600 hover:text-red-700 text-sm font-medium"
              >
                Delete
              </button>
            </div>
          </motion.div>
        ))}
        </div>
      )}

      {/* Scan Modal */}
      {showScanModal && (
        <ScanModal
          isOpen={showScanModal}
          onClose={() => setShowScanModal(false)}
          onScan={(result) => {
            console.log('Scanned:', result)
            setShowScanModal(false)
          }}
        />
      )}

      {/* Inventory Modal */}
      <InventoryModal
        isOpen={showInventoryModal}
        onClose={handleCloseModal}
        onSubmit={handleCreateOrUpdateItem}
        item={editingItem}
        loading={loading}
      />

      {/* Bulk Upload Modal */}
      <BulkInventoryUploadModal
        isOpen={showBulkUploadModal}
        onClose={() => setShowBulkUploadModal(false)}
        onUpload={handleBulkUpload}
      />
    </div>
  )
}
