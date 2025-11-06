
import React, { useState, useMemo } from 'react'
import { useRealtimeInventory } from '../hooks/useRealtimeInventory'
import { Search, Filter, Package, AlertTriangle, TrendingDown, Plus, Scan } from 'lucide-react'
import { motion } from 'framer-motion'
import RealtimeStatus from './RealtimeStatus'
import ScanModal from './ScanModal'

export const RealtimeInventoryDashboard: React.FC = () => {
  const {
    inventoryItems,
    lowStockItems,
    outOfStockItems,
    loading,
    addInventoryItem,
    updateStock,
    searchItems,
    filterByCategory,
    filterByStatus,
    totalItems,
    totalLowStock,
    totalOutOfStock,
    categories
  } = useRealtimeInventory()

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [showAddForm, setShowAddForm] = useState(false)
  const [showScanModal, setShowScanModal] = useState(false)

  // Filter and search items
  const filteredItems = useMemo(() => {
    let items = inventoryItems

    if (searchQuery) {
      items = searchItems(searchQuery)
    }

    if (selectedCategory !== 'all') {
      items = items.filter(item => item.category === selectedCategory)
    }

    if (selectedStatus !== 'all') {
      items = filterByStatus(selectedStatus as any)
    }

    return items
  }, [inventoryItems, searchQuery, selectedCategory, selectedStatus, searchItems, filterByStatus])

  const handleStockUpdate = async (itemId: string, newStock: number) => {
    await updateStock(itemId, newStock)
  }

  const handleBarcodeScan = (scannedData: string) => {
    const item = inventoryItems.find(item => item.sku === scannedData)
    if (item) {
      setSearchQuery(scannedData)
    }
    setShowScanModal(false)
  }

  const getStockColor = (item: any) => {
    if (item.current_stock === 0) return 'text-red-600 bg-red-50'
    if (item.current_stock <= item.min_stock) return 'text-yellow-600 bg-yellow-50'
    return 'text-green-600 bg-green-50'
  }

  const getStockPercentage = (item: any) => {
    return Math.min((item.current_stock / item.max_stock) * 100, 100)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        <span className="ml-3 text-gray-600">Loading real-time inventory...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with Real-time Status */}
      <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Real-time Inventory</h1>
          <p className="text-gray-600 mt-1">Live inventory management with instant updates</p>
        </div>
        <RealtimeStatus />
      </div>

      {/* Real-time Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-lg shadow-md"
        >
          <div className="flex items-center">
            <Package className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Items</p>
              <p className="text-2xl font-semibold text-gray-900">{totalItems}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-6 rounded-lg shadow-md"
        >
          <div className="flex items-center">
            <AlertTriangle className="h-8 w-8 text-yellow-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Low Stock</p>
              <p className="text-2xl font-semibold text-yellow-600">{totalLowStock}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-6 rounded-lg shadow-md"
        >
          <div className="flex items-center">
            <TrendingDown className="h-8 w-8 text-red-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Out of Stock</p>
              <p className="text-2xl font-semibold text-red-600">{totalOutOfStock}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white p-6 rounded-lg shadow-md"
        >
          <div className="flex items-center">
            <Filter className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Categories</p>
              <p className="text-2xl font-semibold text-green-600">{categories.length}</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Search and Filter Controls */}
      <div className="flex flex-col lg:flex-row gap-4 justify-between">
        <div className="flex-1 max-w-lg">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by SKU, name, or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
        </div>
        
        <div className="flex gap-2">
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
            Scan
          </button>

          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Item
          </button>
        </div>
      </div>

      {/* Real-time Inventory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{item.name}</h3>
                  <p className="text-sm text-gray-500">SKU: {item.sku}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStockColor(item)}`}>
                  {item.status.replace('_', ' ')}
                </span>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Current Stock:</span>
                  <span className="font-medium">{item.current_stock} {item.unit}</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Location:</span>
                  <span className="font-medium">{item.location}</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Category:</span>
                  <span className="font-medium">{item.category}</span>
                </div>

                {/* Stock Level Progress Bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Min: {item.min_stock}</span>
                    <span>Max: {item.max_stock}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${
                        item.current_stock === 0 
                          ? 'bg-red-500' 
                          : item.current_stock <= item.min_stock 
                            ? 'bg-yellow-500' 
                            : 'bg-green-500'
                      }`}
                      style={{ width: `${getStockPercentage(item)}%` }}
                    ></div>
                  </div>
                </div>

                {/* Quick Stock Update */}
                <div className="flex items-center space-x-2 pt-2 border-t">
                  <input
                    type="number"
                    min="0"
                    defaultValue={item.current_stock}
                    className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-green-500 focus:border-transparent"
                    onBlur={(e) => {
                      const newStock = parseInt(e.target.value) || 0
                      if (newStock !== item.current_stock) {
                        handleStockUpdate(item.id, newStock)
                      }
                    }}
                  />
                  <span className="text-xs text-gray-500">{item.unit}</span>
                </div>

                <div className="text-xs text-gray-400 pt-2">
                  Last updated: {new Date(item.last_updated).toLocaleString()}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-12">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No items found</h3>
          <p className="text-gray-500">Try adjusting your search or filter criteria.</p>
        </div>
      )}

      {/* Scan Modal */}
      {showScanModal && (
        <ScanModal
          isOpen={showScanModal}
          onClose={() => setShowScanModal(false)}
          onScan={handleBarcodeScan}
          title="Scan Item Barcode"
        />
      )}
    </div>
  )
}

export default RealtimeInventoryDashboard
