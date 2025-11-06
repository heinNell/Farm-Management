
import React, { useState } from 'react'
import { useFuelData } from '../hooks/useFuelData'
import FuelDashboard from '../components/fuel/FuelDashboard'
import AssetModal from '../components/modals/AssetModal'
import FuelRecordModal from '../components/modals/FuelRecordModal'
import OperatingSessionModal from '../components/modals/OperatingSessionModal'
import {Plus, Edit, Trash2, BarChart3, Truck, Fuel, Clock, Search, Filter} from 'lucide-react'

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

  const [activeTab, setActiveTab] = useState<'dashboard' | 'assets' | 'fuel-records' | 'sessions'>('dashboard')
  const [showAssetModal, setShowAssetModal] = useState(false)
  const [showFuelRecordModal, setShowFuelRecordModal] = useState(false)
  const [showSessionModal, setShowSessionModal] = useState(false)
  const [editingAsset, setEditingAsset] = useState(null)
  const [editingRecord, setEditingRecord] = useState(null)
  const [editingSession, setEditingSession] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'assets', label: 'Assets', icon: Truck },
    { id: 'fuel-records', label: 'Fuel Records', icon: Fuel },
    { id: 'sessions', label: 'Operating Sessions', icon: Clock }
  ]

  const handleEditAsset = (asset: any) => {
    setEditingAsset(asset)
    setShowAssetModal(true)
  }

  const handleEditRecord = (record: any) => {
    setEditingRecord(record)
    setShowFuelRecordModal(true)
  }

  const handleEditSession = (session: any) => {
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
                         asset.asset_id.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === 'all' || asset.type === filterType
    return matchesSearch && matchesType
  })

  const filteredRecords = fuelRecords.filter(record => {
    const asset = assets.find(a => a.asset_id === record.asset_id)
    const matchesSearch = asset?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.station_name?.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  const filteredSessions = operatingSessions.filter(session => {
    const asset = assets.find(a => a.asset_id === session.asset_id)
    const matchesSearch = asset?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         session.operator.toLowerCase().includes(searchTerm.toLowerCase())
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
                onClick={() => setActiveTab(tab.id as any)}
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
              <div key={asset._id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{asset.name}</h3>
                    <p className="text-sm text-gray-500">{asset.asset_id}</p>
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
                    <span className="font-medium">{asset.tank_capacity}L</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Location:</span>
                    <span className="font-medium">{asset.location}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleEditAsset(asset)}
                    className="flex-1 bg-blue-600 text-white py-2 px-3 rounded text-sm hover:bg-blue-700 transition-colors"
                  >
                    <Edit className="h-4 w-4 inline mr-1" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteAsset(asset._id, asset.name)}
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
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <div className="flex-1 max-w-lg">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search fuel records..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>
            
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

          {/* Fuel Records Table */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Asset</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cost</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Station</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredRecords.map(record => {
                    const asset = assets.find(a => a.asset_id === record.asset_id)
                    return (
                      <tr key={record._id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{asset?.name}</div>
                            <div className="text-sm text-gray-500">{record.asset_id}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full capitalize">
                            {record.record_type}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {record.fuel_amount.toFixed(1)}L
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ${record.fuel_cost.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {record.station_name || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(record.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                          <button
                            onClick={() => handleEditRecord(record)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteRecord(record._id)}
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
              const asset = assets.find(a => a.asset_id === session.asset_id)
              return (
                <div key={session._id} className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{asset?.name}</h3>
                      <p className="text-sm text-gray-500">{session.operator}</p>
                    </div>
                    <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full capitalize">
                      {session.task_type}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-600">Operating Hours</p>
                      <p className="text-lg font-semibold text-gray-900">{session.operating_hours.toFixed(1)}h</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Fuel Consumed</p>
                      <p className="text-lg font-semibold text-gray-900">{session.fuel_consumed.toFixed(1)}L</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Efficiency Rating</p>
                      <div className="flex items-center">
                        <span className="text-lg font-semibold text-gray-900 mr-2">{session.efficiency_rating}/5</span>
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <div
                              key={i}
                              className={`w-3 h-3 rounded-full mr-1 ${
                                i < session.efficiency_rating ? 'bg-yellow-400' : 'bg-gray-200'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Consumption Rate</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {(session.fuel_consumed / session.operating_hours).toFixed(2)} L/H
                      </p>
                    </div>
                  </div>

                  <div className="text-sm text-gray-500 mb-4">
                    <p>{new Date(session.start_time).toLocaleString()} - {new Date(session.end_time).toLocaleString()}</p>
                    <p>Location: {session.location}</p>
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
                      onClick={() => handleDeleteSession(session._id)}
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

      {/* Modals */}
      <AssetModal
        isOpen={showAssetModal}
        onClose={() => {
          setShowAssetModal(false)
          setEditingAsset(null)
        }}
        onSave={editingAsset ? 
          (data) => updateAsset(editingAsset._id, data) : 
          createAsset
        }
        asset={editingAsset}
      />

      <FuelRecordModal
        isOpen={showFuelRecordModal}
        onClose={() => {
          setShowFuelRecordModal(false)
          setEditingRecord(null)
        }}
        onSave={editingRecord ?
          (data) => updateFuelRecord(editingRecord._id, data) :
          createFuelRecord
        }
        assets={assets}
        record={editingRecord}
      />

      <OperatingSessionModal
        isOpen={showSessionModal}
        onClose={() => {
          setShowSessionModal(false)
          setEditingSession(null)
        }}
        onSave={editingSession ?
          (data) => updateOperatingSession(editingSession._id, data) :
          createOperatingSession
        }
        assets={assets}
        session={editingSession}
      />
    </div>
  )
}

export default FuelManagement
