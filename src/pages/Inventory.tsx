
import React, { useState } from 'react'
import {Search, Plus, Scan, Filter, Package, AlertTriangle, CheckCircle} from 'lucide-react'
import { motion } from 'framer-motion'
import ScanModal from '../components/ScanModal'
import { useInventory } from '../hooks/useInventory'

const mockInventoryItems = [
  {
    id: '1',
    sku: 'HYD-001',
    name: 'Hydraulic Fluid - Premium Grade',
    category: 'Fluids',
    currentStock: 45,
    minStock: 20,
    maxStock: 100,
    unit: 'Liters',
    location: 'Warehouse A-1',
    lastUpdated: '2024-01-15T10:30:00Z',
    status: 'in_stock'
  },
  {
    id: '2',
    sku: 'FLT-002',
    name: 'Air Filter - Heavy Duty',
    category: 'Filters',
    currentStock: 8,
    minStock: 15,
    maxStock: 50,
    unit: 'Units',
    location: 'Warehouse B-2',
    lastUpdated: '2024-01-14T14:20:00Z',
    status: 'low_stock'
  },
  {
    id: '3',
    sku: 'SPR-003',
    name: 'Spark Plugs - Set of 4',
    category: 'Engine Parts',
    currentStock: 0,
    minStock: 10,
    maxStock: 40,
    unit: 'Sets',
    location: 'Warehouse C-1',
    lastUpdated: '2024-01-13T09:15:00Z',
    status: 'out_of_stock'
  },
  {
    id: '4',
    sku: 'TIR-004',
    name: 'Tractor Tire - 18.4-30',
    category: 'Tires',
    currentStock: 12,
    minStock: 5,
    maxStock: 20,
    unit: 'Units',
    location: 'Warehouse D-1',
    lastUpdated: '2024-01-15T16:45:00Z',
    status: 'in_stock'
  }
]

export default function Inventory() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [showScanModal, setShowScanModal] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  
  const { inventoryItems, isLoading } = useInventory()

  const filteredItems = mockInventoryItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.sku.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const categories = ['all', ...Array.from(new Set(mockInventoryItems.map(item => item.category)))]

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
        
        <div className="flex gap-2">
          <button
            onClick={() => setShowScanModal(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Scan className="h-5 w-5 mr-2" />
            Scan Item
          </button>
          <button
            onClick={() => setShowAddModal(true)}
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

      {/* Inventory Grid */}
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
                <span className="text-sm font-medium">{item.currentStock} {item.unit}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Min Stock:</span>
                <span className="text-sm font-medium">{item.minStock} {item.unit}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Location:</span>
                <span className="text-sm font-medium">{item.location}</span>
              </div>

              {/* Stock Level Bar */}
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${
                    item.currentStock === 0 ? 'bg-red-500' :
                    item.currentStock <= item.minStock ? 'bg-yellow-500' : 'bg-green-500'
                  }`}
                  style={{ 
                    width: `${Math.min((item.currentStock / item.maxStock) * 100, 100)}%` 
                  }}
                />
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <button className="w-full text-green-600 hover:text-green-700 text-sm font-medium">
                Update Stock
              </button>
            </div>
          </motion.div>
        ))}
      </div>

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
    </div>
  )
}
