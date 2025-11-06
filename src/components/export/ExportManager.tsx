
import React, { useState } from 'react'
import {Download, FileText, Calendar, Filter, Settings, CheckCircle, AlertCircle, X} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import useExportData from '../../hooks/useExportData'

interface ExportManagerProps {
  isOpen: boolean
  onClose: () => void
  defaultDataType?: 'fuel' | 'maintenance' | 'inventory' | 'assets' | 'comprehensive'
}

type ExportDataType = 'fuel' | 'maintenance' | 'inventory' | 'assets' | 'comprehensive'
type ExportFormat = 'csv' | 'excel' | 'pdf'

export const ExportManager: React.FC<ExportManagerProps> = ({
  isOpen,
  onClose,
  defaultDataType = 'fuel'
}) => {
  const {
    exportFuelRecords,
    exportMaintenanceRecords,
    exportInventoryData,
    exportAssetData,
    exportComprehensiveReport,
    isExporting,
    progress,
    error
  } = useExportData()

  const [selectedDataType, setSelectedDataType] = useState<ExportDataType>(defaultDataType)
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('excel')
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days ago
    end: new Date().toISOString().split('T')[0] // today
  })
  const [selectedAssets, setSelectedAssets] = useState<string[]>([])
  const [includeImages, setIncludeImages] = useState(false)
  const [groupBy, setGroupBy] = useState<'asset' | 'date' | 'type' | 'none'>('none')
  
  // Mock asset data for selection
  const mockAssets = [
    { id: 'asset-1', name: 'John Deere 8370R Tractor' },
    { id: 'asset-2', name: 'Case IH 8250 Combine' },
    { id: 'asset-3', name: 'Apache AS1240 Sprayer' },
    { id: 'asset-4', name: 'Kubota M7-172 Tiller' }
  ]

  const dataTypeOptions = [
    { value: 'fuel', label: 'Fuel Records', description: 'Fuel consumption and cost data' },
    { value: 'maintenance', label: 'Maintenance Records', description: 'Scheduled and completed maintenance' },
    { value: 'inventory', label: 'Inventory Data', description: 'Stock levels and item information' },
    { value: 'assets', label: 'Asset Data', description: 'Equipment and asset information' },
    { value: 'comprehensive', label: 'Comprehensive Report', description: 'All data combined with analytics' }
  ]

  const formatOptions = [
    { value: 'csv', label: 'CSV', description: 'Comma-separated values' },
    { value: 'excel', label: 'Excel', description: 'Microsoft Excel spreadsheet' },
    { value: 'pdf', label: 'PDF', description: 'Portable document format' }
  ]

  const handleExport = async () => {
    const exportOptions = {
      format: selectedFormat,
      dateRange: {
        start: dateRange.start,
        end: dateRange.end
      },
      assetIds: selectedAssets,
      includeImages,
      groupBy
    }

    try {
      switch (selectedDataType) {
        case 'fuel':
          await exportFuelRecords(exportOptions)
          break
        case 'maintenance':
          await exportMaintenanceRecords(exportOptions)
          break
        case 'inventory':
          await exportInventoryData(exportOptions)
          break
        case 'assets':
          await exportAssetData(exportOptions)
          break
        case 'comprehensive':
          await exportComprehensiveReport(exportOptions)
          break
      }
    } catch (err) {
      console.error('Export failed:', err)
    }
  }

  const handleAssetToggle = (assetId: string) => {
    setSelectedAssets(prev => 
      prev.includes(assetId) 
        ? prev.filter(id => id !== assetId)
        : [...prev, assetId]
    )
  }

  const getProgressColor = (stage: string) => {
    switch (stage) {
      case 'preparing': return 'bg-blue-500'
      case 'fetching': return 'bg-yellow-500'
      case 'processing': return 'bg-orange-500'
      case 'generating': return 'bg-purple-500'
      case 'complete': return 'bg-green-500'
      default: return 'bg-gray-500'
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        >
          <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <Download className="h-6 w-6 text-blue-600 mr-2" />
                <h2 className="text-xl font-semibold text-gray-900">Export Data</h2>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Export Progress */}
            {isExporting && progress && (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">{progress.message}</span>
                  <span className="text-sm text-gray-500">{progress.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(progress.stage)}`}
                    style={{ width: `${progress.progress}%` }}
                  />
                </div>
                <div className="mt-2 text-xs text-gray-500 capitalize">
                  Stage: {progress.stage.replace('_', ' ')}
                </div>
              </div>
            )}

            {/* Error Display */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            )}

            {/* Data Type Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Data Type
              </label>
              <div className="grid grid-cols-1 gap-3">
                {dataTypeOptions.map((option) => (
                  <label
                    key={option.value}
                    className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedDataType === option.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="dataType"
                      value={option.value}
                      checked={selectedDataType === option.value}
                      onChange={(e) => setSelectedDataType(e.target.value as ExportDataType)}
                      className="sr-only"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{option.label}</div>
                      <div className="text-sm text-gray-500">{option.description}</div>
                    </div>
                    {selectedDataType === option.value && (
                      <CheckCircle className="h-5 w-5 text-blue-600" />
                    )}
                  </label>
                ))}
              </div>
            </div>

            {/* Format Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Export Format
              </label>
              <div className="grid grid-cols-3 gap-3">
                {formatOptions.map((option) => (
                  <label
                    key={option.value}
                    className={`flex flex-col items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedFormat === option.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="format"
                      value={option.value}
                      checked={selectedFormat === option.value}
                      onChange={(e) => setSelectedFormat(e.target.value as ExportFormat)}
                      className="sr-only"
                    />
                    <FileText className={`h-6 w-6 mb-2 ${
                      selectedFormat === option.value ? 'text-blue-600' : 'text-gray-400'
                    }`} />
                    <div className="font-medium text-gray-900 text-sm">{option.label}</div>
                    <div className="text-xs text-gray-500 text-center">{option.description}</div>
                  </label>
                ))}
              </div>
            </div>

            {/* Date Range */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                <Calendar className="h-4 w-4 inline mr-1" />
                Date Range
              </label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={dateRange.start}
                    onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">End Date</label>
                  <input
                    type="date"
                    value={dateRange.end}
                    onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Asset Filter */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                <Filter className="h-4 w-4 inline mr-1" />
                Asset Filter (Optional)
              </label>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {mockAssets.map((asset) => (
                  <label
                    key={asset.id}
                    className="flex items-center p-2 hover:bg-gray-50 rounded cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedAssets.includes(asset.id)}
                      onChange={() => handleAssetToggle(asset.id)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">{asset.name}</span>
                  </label>
                ))}
              </div>
              {selectedAssets.length === 0 && (
                <p className="text-xs text-gray-500 mt-1">All assets will be included</p>
              )}
            </div>

            {/* Advanced Options */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                <Settings className="h-4 w-4 inline mr-1" />
                Advanced Options
              </label>
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={includeImages}
                    onChange={(e) => setIncludeImages(e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">Include images and attachments</span>
                </label>

                <div>
                  <label className="block text-xs text-gray-500 mb-1">Group data by</label>
                  <select
                    value={groupBy}
                    onChange={(e) => setGroupBy(e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="none">No grouping</option>
                    <option value="asset">Asset</option>
                    <option value="date">Date</option>
                    <option value="type">Type</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Export Summary */}
            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Export Summary</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Data: {dataTypeOptions.find(opt => opt.value === selectedDataType)?.label}</li>
                <li>• Format: {formatOptions.find(opt => opt.value === selectedFormat)?.label}</li>
                <li>• Date range: {dateRange.start} to {dateRange.end}</li>
                <li>• Assets: {selectedAssets.length > 0 ? `${selectedAssets.length} selected` : 'All assets'}</li>
                {groupBy !== 'none' && <li>• Grouped by: {groupBy}</li>}
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3">
              <button
                onClick={onClose}
                disabled={isExporting}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleExport}
                disabled={isExporting}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center"
              >
                {isExporting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Export Data
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

export default ExportManager
