import { BarChart3, Clock, Download, Edit, Fuel, Plus, Search, Trash2, Truck, Upload } from 'lucide-react'
import React, { useState } from 'react'
import FuelAnalytics from '../components/fuel/FuelAnalytics'
import FuelDashboard from '../components/fuel/FuelDashboard'
import AssetModal from '../components/modals/AssetModal'
import BulkFuelUploadModal from '../components/modals/BulkFuelUploadModal'
import FuelRecordModal from '../components/modals/FuelRecordModal'
import OperatingSessionModal from '../components/modals/OperatingSessionModal'
import { useFuelData } from '../hooks/useFuelData'
import { supabase } from '../lib/supabase'
import type { Asset, FuelRecord, OperatingSession } from '../types/database'
import { downloadFuelTemplate, exportFuelRecordsToExcel } from '../utils/fuelExcelUtils'

const FuelManagement: React.FC = () => {
  const {
    assets,
    fuelRecords,
    operatingSessions,
    loading,
    createAsset,
    updateAsset,
    deleteAsset,
    createFuelRecord,
    updateFuelRecord,
    deleteFuelRecord,
    createOperatingSession,
    updateOperatingSession,
    deleteOperatingSession
  } = useFuelData()

  console.log('FuelManagement - assets loaded:', assets.length)
  console.log('FuelManagement - fuel records:', fuelRecords.length)
  console.log('FuelManagement - sessions:', operatingSessions.length)
  console.log('FuelManagement - loading:', loading)

  const [activeTab, setActiveTab] = useState<'dashboard' | 'assets' | 'fuel-records' | 'sessions' | 'analytics'>('dashboard')
  const [showAssetModal, setShowAssetModal] = useState(false)
  const [showFuelRecordModal, setShowFuelRecordModal] = useState(false)
  const [showSessionModal, setShowSessionModal] = useState(false)
  const [showBulkUploadModal, setShowBulkUploadModal] = useState(false)
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null)
  const [editingRecord, setEditingRecord] = useState<FuelRecord | null>(null)
  const [editingSession, setEditingSession] = useState<OperatingSession | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')
  
  // Fuel records filters
  const [fuelFilterAsset, setFuelFilterAsset] = useState('')
  const [fuelFilterLocation, setFuelFilterLocation] = useState('')
  const [fuelFilterFuelType, setFuelFilterFuelType] = useState('')
  const [fuelFilterDateFrom, setFuelFilterDateFrom] = useState('')
  const [fuelFilterDateTo, setFuelFilterDateTo] = useState('')
  const [fuelFilterDriver, setFuelFilterDriver] = useState('')

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'assets', label: 'Assets', icon: Truck },
    { id: 'fuel-records', label: 'Fuel Records', icon: Fuel },
    { id: 'sessions', label: 'Operating Sessions', icon: Clock },
    { id: 'analytics', label: 'Analytics & Reports', icon: BarChart3 }
  ]

  const handleEditAsset = (asset: Asset) => {
    setEditingAsset(asset)
    setShowAssetModal(true)
  }

  const handleEditRecord = (record: FuelRecord) => {
    setEditingRecord(record)
    setShowFuelRecordModal(true)
  }

  const handleEditSession = (session: OperatingSession) => {
    setEditingSession(session)
    setShowSessionModal(true)
  }

  const handleDeleteAsset = async (assetId: string, assetName: string) => {
    if (confirm(`Are you sure you want to delete ${assetName}?`)) {
      await deleteAsset(assetId)
    }
  }

  const handleDeleteRecord = async (recordId: string) => {
    if (confirm('Are you sure you want to delete this fuel record?')) {
      await deleteFuelRecord(recordId)
    }
  }

  const handleDeleteSession = async (sessionId: string) => {
    if (confirm('Are you sure you want to delete this operating session?')) {
      await deleteOperatingSession(sessionId)
    }
  }

  const filteredAssets = assets.filter(asset => {
    const matchesSearch = asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         asset.id.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === 'all' || asset.type === filterType
    return matchesSearch && matchesType
  })

  const filteredRecords = fuelRecords.filter(record => {
    const asset = assets.find(a => a.id === record.asset_id)
    
    // Text search
    const matchesSearch = !searchTerm || 
      asset?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.driver_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.receipt_number?.toLowerCase().includes(searchTerm.toLowerCase())
    
    // Asset filter
    const matchesAsset = !fuelFilterAsset || record.asset_id === fuelFilterAsset
    
    // Location filter
    const matchesLocation = !fuelFilterLocation || record.location === fuelFilterLocation
    
    // Fuel type filter
    const matchesFuelType = !fuelFilterFuelType || record.fuel_type === fuelFilterFuelType
    
    // Driver filter
    const matchesDriver = !fuelFilterDriver || record.driver_name === fuelFilterDriver
    
    // Date range filter (using filling_date)
    const recordDate = new Date(record.filling_date || record.date)
    const matchesDateFrom = !fuelFilterDateFrom || recordDate >= new Date(fuelFilterDateFrom)
    const matchesDateTo = !fuelFilterDateTo || recordDate <= new Date(fuelFilterDateTo + 'T23:59:59')
    
    return matchesSearch && matchesAsset && matchesLocation && matchesFuelType && matchesDriver && matchesDateFrom && matchesDateTo
  })

  // Get unique values for filter dropdowns
  const uniqueLocations = [...new Set(fuelRecords.map(r => r.location).filter((loc): loc is string => Boolean(loc)))]
  const uniqueFuelTypes = [...new Set(fuelRecords.map(r => r.fuel_type).filter((type): type is string => Boolean(type)))]
  const uniqueDrivers = [...new Set(fuelRecords.map(r => r.driver_name).filter((driver): driver is string => Boolean(driver)))]
  
  // Count active filters for fuel records
  const activeFuelFilters = [fuelFilterAsset, fuelFilterLocation, fuelFilterFuelType, fuelFilterDriver, fuelFilterDateFrom, fuelFilterDateTo].filter(Boolean).length
  
  const clearFuelFilters = () => {
    setFuelFilterAsset('')
    setFuelFilterLocation('')
    setFuelFilterFuelType('')
    setFuelFilterDriver('')
    setFuelFilterDateFrom('')
    setFuelFilterDateTo('')
    setSearchTerm('')
  }

  const filteredSessions = operatingSessions.filter(session => {
    const asset = assets.find(a => a.id === session.asset_id)
    const matchesSearch = asset?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         session.operator_notes?.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        <span className="ml-3 text-gray-600">Loading fuel management system...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Fuel Management System</h1>
          <p className="text-gray-600 mt-1">Comprehensive fuel tracking and analytics for farm equipment</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map(tab => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as 'dashboard' | 'assets' | 'fuel-records' | 'sessions')}
                className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-5 w-5 mr-2" />
                {tab.label}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'dashboard' && <FuelDashboard />}

      {activeTab === 'assets' && (
        <div className="space-y-6">
          {/* Assets Header */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <div className="flex-1 max-w-lg">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search assets..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="all">All Types</option>
                <option value="tractor">Tractors</option>
                <option value="forklift">Forklifts</option>
                <option value="motorbike">Motorbikes</option>
                <option value="generator">Generators</option>
              </select>
              
              <button
                onClick={() => {
                  setEditingAsset(null)
                  setShowAssetModal(true)
                }}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Plus className="h-5 w-5 mr-2" />
                Add Asset
              </button>
            </div>
          </div>

          {/* Assets Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAssets.map(asset => (
              <div key={asset.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{asset.name}</h3>
                    <p className="text-sm text-gray-500">{asset.id}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    asset.status === 'active' ? 'bg-green-100 text-green-800' :
                    asset.status === 'maintenance' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {asset.status}
                  </span>
                </div>

                  <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Type:</span>
                    <span className="font-medium capitalize">{asset.type}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Fuel Type:</span>
                    <span className="font-medium capitalize">{asset.fuel_type}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tank Capacity:</span>
                    <span className="font-medium">{asset.fuel_capacity ?? 'N/A'}L</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Location:</span>
                    <span className="font-medium">{asset.location}</span>
                  </div>
                </div>                <div className="flex gap-2">
                  <button
                    onClick={() => handleEditAsset(asset)}
                    className="flex-1 bg-blue-600 text-white py-2 px-3 rounded text-sm hover:bg-blue-700 transition-colors"
                  >
                    <Edit className="h-4 w-4 inline mr-1" />
                    Edit
                  </button>
                  <button
                    onClick={() => void handleDeleteAsset(asset.id, asset.name)}
                    className="flex-1 bg-red-600 text-white py-2 px-3 rounded text-sm hover:bg-red-700 transition-colors"
                  >
                    <Trash2 className="h-4 w-4 inline mr-1" />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'fuel-records' && (
        <div className="space-y-6">
          {/* Fuel Records Header */}
          <div className="flex flex-col gap-4">
            {/* Search and Action Buttons Row */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between">
              <div className="flex-1 max-w-lg">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by asset, location, driver, receipt..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={downloadFuelTemplate}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Download className="h-5 w-5 mr-2" />
                  Template
                </button>
                
                <button
                  onClick={() => exportFuelRecordsToExcel(filteredRecords, assets)}
                  className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <Download className="h-5 w-5 mr-2" />
                  Export ({filteredRecords.length})
                </button>
                
                <button
                  onClick={() => setShowBulkUploadModal(true)}
                  className="flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                >
                  <Upload className="h-5 w-5 mr-2" />
                  Bulk Upload
                </button>
                
                <button
                  onClick={() => {
                    setEditingRecord(null)
                    setShowFuelRecordModal(true)
                  }}
                  className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Add Record
                </button>
              </div>
            </div>

            {/* Filters Row */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-700">Filters</h3>
                {activeFuelFilters > 0 && (
                  <button
                    onClick={clearFuelFilters}
                    className="text-sm text-red-600 hover:text-red-700 font-medium"
                  >
                    Clear all ({activeFuelFilters})
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                {/* Asset Filter */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Asset</label>
                  <select
                    value={fuelFilterAsset}
                    onChange={(e) => setFuelFilterAsset(e.target.value)}
                    className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">All Assets</option>
                    {assets.map(asset => (
                      <option key={asset.id} value={asset.id}>{asset.name}</option>
                    ))}
                  </select>
                </div>

                {/* Location Filter */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Location</label>
                  <select
                    value={fuelFilterLocation}
                    onChange={(e) => setFuelFilterLocation(e.target.value)}
                    className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">All Locations</option>
                    {uniqueLocations.map(loc => (
                      <option key={loc} value={loc}>{loc}</option>
                    ))}
                  </select>
                </div>

                {/* Fuel Type Filter */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Fuel Type</label>
                  <select
                    value={fuelFilterFuelType}
                    onChange={(e) => setFuelFilterFuelType(e.target.value)}
                    className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">All Types</option>
                    {uniqueFuelTypes.map(type => (
                      <option key={type} value={type} className="capitalize">{type}</option>
                    ))}
                  </select>
                </div>

                {/* Driver Filter */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Driver</label>
                  <select
                    value={fuelFilterDriver}
                    onChange={(e) => setFuelFilterDriver(e.target.value)}
                    className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">All Drivers</option>
                    {uniqueDrivers.map(driver => (
                      <option key={driver} value={driver}>{driver}</option>
                    ))}
                  </select>
                </div>

                {/* Date From Filter */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">From Date</label>
                  <input
                    type="date"
                    value={fuelFilterDateFrom}
                    onChange={(e) => setFuelFilterDateFrom(e.target.value)}
                    className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                {/* Date To Filter */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">To Date</label>
                  <input
                    type="date"
                    value={fuelFilterDateTo}
                    onChange={(e) => setFuelFilterDateTo(e.target.value)}
                    className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Results Summary */}
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>
                Showing <strong>{filteredRecords.length}</strong> of <strong>{fuelRecords.length}</strong> records
              </span>
              {filteredRecords.length > 0 && (
                <span>
                  Total: <strong>{filteredRecords.reduce((sum, r) => sum + r.quantity, 0).toFixed(1)}L</strong> • 
                  Cost: <strong>${filteredRecords.reduce((sum, r) => sum + r.cost, 0).toFixed(2)}</strong>
                </span>
              )}
            </div>
          </div>

          {/* Fuel Records Table */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fleet / Asset</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fuel Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cost</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hours</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Consumption</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Filling Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredRecords.map(record => {
                    const asset = assets.find(a => a.id === record.asset_id)
                    return (
                      <tr key={record.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{asset?.name || 'Unknown'}</div>
                            <div className="text-xs text-gray-500">{asset?.type || 'N/A'}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full capitalize">
                            {record.fuel_type}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {record.quantity.toFixed(1)}L
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">${record.cost.toFixed(2)}</div>
                          <div className="text-xs text-gray-500">${record.price_per_liter.toFixed(2)}/L</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {record.current_hours !== null && record.current_hours !== undefined ? (
                            <div>
                              <div className="text-sm text-gray-900">{record.current_hours}h</div>
                              {record.hour_difference ? (
                                <div className="text-xs text-green-600">+{record.hour_difference}h</div>
                              ) : null}
                            </div>
                          ) : (
                            <span className="text-sm text-gray-400">N/A</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {record.consumption_rate ? (
                            <div>
                              <div className="text-sm font-medium text-gray-900">{record.consumption_rate.toFixed(2)} L/h</div>
                              {record.hour_difference ? (
                                <div className="text-xs text-gray-500">{record.hour_difference}h used</div>
                              ) : null}
                            </div>
                          ) : (
                            <span className="text-sm text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {record.location || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(record.filling_date || record.date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                          <button
                            onClick={() => handleEditRecord(record)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => void handleDeleteRecord(record.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'sessions' && (
        <div className="space-y-6">
          {/* Sessions Header */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <div className="flex-1 max-w-lg">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search sessions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <button
              onClick={() => {
                setEditingSession(null)
                setShowSessionModal(true)
              }}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Plus className="h-5 w-5 mr-2" />
              Add Session
            </button>
          </div>

          {/* Sessions Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredSessions.map(session => {
              const asset = assets.find(a => a.id === session.asset_id)
              const operatingHours = session.operating_hours ?? 0
              const fuelConsumed = session.fuel_consumed ?? 0
              const consumptionRate = operatingHours > 0 ? fuelConsumed / operatingHours : 0
              
              return (
                <div key={session.id} className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{asset?.name}</h3>
                      <p className="text-sm text-gray-500">Session ID: {session.id.slice(0, 8)}</p>
                    </div>
                    <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                      Operating
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-600">Operating Hours</p>
                      <p className="text-lg font-semibold text-gray-900">{operatingHours.toFixed(1)}h</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Fuel Consumed</p>
                      <p className="text-lg font-semibold text-gray-900">{fuelConsumed.toFixed(1)}L</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Efficiency Rating</p>
                      <div className="flex items-center">
                        <span className="text-lg font-semibold text-gray-900 mr-2">{session.efficiency_rating ?? 0}/5</span>
                        <div className="flex">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <div
                              key={i}
                              className={`w-3 h-3 rounded-full mr-1 ${
                                i < (session.efficiency_rating ?? 0) ? 'bg-yellow-400' : 'bg-gray-200'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Consumption Rate</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {consumptionRate.toFixed(2)} L/H
                      </p>
                    </div>
                  </div>

                  <div className="text-sm text-gray-500 mb-4">
                    <p>{new Date(session.session_start).toLocaleString()} - {session.session_end ? new Date(session.session_end).toLocaleString() : 'Ongoing'}</p>
                    {session.operator_notes && <p>Notes: {session.operator_notes}</p>}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditSession(session)}
                      className="flex-1 bg-blue-600 text-white py-2 px-3 rounded text-sm hover:bg-blue-700 transition-colors"
                    >
                      <Edit className="h-4 w-4 inline mr-1" />
                      Edit
                    </button>
                    <button
                      onClick={() => void handleDeleteSession(session.id)}
                      className="flex-1 bg-red-600 text-white py-2 px-3 rounded text-sm hover:bg-red-700 transition-colors"
                    >
                      <Trash2 className="h-4 w-4 inline mr-1" />
                      Delete
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <FuelAnalytics
          fuelRecords={fuelRecords}
          assets={assets}
          operatingSessions={operatingSessions}
        />
      )}

      {/* Modals */}
      <AssetModal
        isOpen={showAssetModal}
        onClose={() => {
          setShowAssetModal(false)
          setEditingAsset(null)
        }}
        onSave={async (data) => {
          if (editingAsset) {
            await updateAsset(editingAsset.id, data)
          } else {
            await createAsset(data)
          }
        }}
        asset={editingAsset}
      />

      <FuelRecordModal
        isOpen={showFuelRecordModal}
        onClose={() => {
          setShowFuelRecordModal(false)
          setEditingRecord(null)
        }}
        onSave={async (data, sourceBunkerId) => {
          if (editingRecord) {
            await updateFuelRecord(editingRecord.id, data)
          } else {
            // If a source bunker is specified, withdraw fuel from it first
            if (sourceBunkerId && data.quantity > 0) {
              try {
                const { error: withdrawError } = await supabase.rpc('withdraw_fuel_for_record', {
                  p_bunker_id: sourceBunkerId,
                  p_quantity: data.quantity,
                  p_notes: `Fuel record for asset: ${data.asset_id || 'Unknown'}`,
                  p_performed_by: data.driver_name || data.attendant_name || null
                })
                
                if (withdrawError) {
                  throw new Error(`Failed to withdraw fuel from bunker: ${withdrawError.message}`)
                }
              } catch (error) {
                console.error('Failed to withdraw fuel from bunker:', error)
                throw error
              }
            }
            
            await createFuelRecord(data)
            
            // Update asset's current_hours if current_hours is provided in the fuel record
            if ('current_hours' in data && typeof data.current_hours === 'number' && data.current_hours > 0 && data.asset_id) {
              const asset = assets.find(a => a.id === data.asset_id)
              if (asset && (!asset.current_hours || data.current_hours > asset.current_hours)) {
                await updateAsset(data.asset_id, { current_hours: data.current_hours })
              }
            }
          }
        }}
        record={editingRecord}
      />

      <OperatingSessionModal
        isOpen={showSessionModal}
        onClose={() => {
          setShowSessionModal(false)
          setEditingSession(null)
        }}
        onSave={async (data) => {
          if (editingSession) {
            await updateOperatingSession(editingSession.id, data)
          } else {
            await createOperatingSession(data)
          }
        }}
        session={editingSession}
      />

      <BulkFuelUploadModal
        isOpen={showBulkUploadModal}
        onClose={() => setShowBulkUploadModal(false)}
        onUpload={async (records) => {
          // Upload all records
          for (const record of records) {
            // Records are already validated in the parser
            await createFuelRecord(record as Omit<FuelRecord, 'id' | 'created_at' | 'updated_at'>)
            
            // Update asset's current_hours if provided
            if (record.current_hours && record.asset_id) {
              const asset = assets.find(a => a.id === record.asset_id)
              if (asset && (!asset.current_hours || record.current_hours > asset.current_hours)) {
                await updateAsset(record.asset_id, { current_hours: record.current_hours })
              }
            }
          }
        }}
        assets={assets}
      />
    </div>
  )
}

export default FuelManagement
