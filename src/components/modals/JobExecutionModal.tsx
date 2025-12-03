import { AlertTriangle, Check, ChevronDown, ChevronUp, DollarSign, Package, Plus, Search, Trash2, Truck, Wrench } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import type {
    Asset,
    InventoryItem,
    JobCard,
    JobExtendedData,
    JobIRRequest,
    JobRepairItem,
    JobSpareAllocation,
    JobThirdPartyService
} from '../../types/database'
import { formatCurrency, getCurrencySymbol, type CurrencyCode } from '../../utils/currency'
import Modal from '../ui/Modal'

// Currency options for dropdown
const CURRENCY_OPTIONS: { code: CurrencyCode; label: string }[] = [
  { code: 'ZAR', label: 'ZAR - South African Rand (R)' },
  { code: 'USD', label: 'USD - US Dollar ($)' },
  { code: 'EUR', label: 'EUR - Euro (€)' },
  { code: 'GBP', label: 'GBP - British Pound (£)' },
  { code: 'AUD', label: 'AUD - Australian Dollar (A$)' },
  { code: 'CAD', label: 'CAD - Canadian Dollar (C$)' },
  { code: 'INR', label: 'INR - Indian Rupee (₹)' },
  { code: 'JPY', label: 'JPY - Japanese Yen (¥)' },
  { code: 'CNY', label: 'CNY - Chinese Yuan (¥)' },
  { code: 'BRL', label: 'BRL - Brazilian Real (R$)' }
]

interface JobExecutionModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: Partial<JobCard>) => Promise<void>
  job: JobCard | null
}

const defaultExtendedData: JobExtendedData = {
  repair_items: [],
  spare_allocations: [],
  ir_requests: [],
  third_party_services: [],
  total_parts_cost: 0,
  total_service_cost: 0,
  total_labor_cost: 0
}

export default function JobExecutionModal({
  isOpen,
  onClose,
  onSave,
  job
}: JobExecutionModalProps) {
  const [activeTab, setActiveTab] = useState<'repairs' | 'spares' | 'ir' | 'services' | 'summary'>('repairs')
  const [extendedData, setExtendedData] = useState<JobExtendedData>(defaultExtendedData)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [asset, setAsset] = useState<Asset | null>(null)
  
  // Currency state
  const [currencyCode, setCurrencyCode] = useState<CurrencyCode>('ZAR')
  const currencySymbol = getCurrencySymbol(currencyCode)
  
  // Inventory search
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([])
  const [inventorySearch, setInventorySearch] = useState('')
  const [showInventoryDropdown, setShowInventoryDropdown] = useState(false)
  
  // Expanded sections
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['repairs', 'spares', 'ir', 'services']))
  
  // Labor cost tracking
  const [laborRate, setLaborRate] = useState(50) // Default hourly rate
  const [laborHours, setLaborHours] = useState(0)

  // Load job data
  useEffect(() => {
    if (job && isOpen) {
      const data = job.extended_data || defaultExtendedData
      setExtendedData({
        ...defaultExtendedData,
        ...data
      })
      setLaborHours(job.actual_hours || 0)
      
      if (job.asset_id) {
        void loadAsset(job.asset_id)
      }
    }
  }, [job, isOpen])

  // Load inventory items
  useEffect(() => {
    if (isOpen) {
      void loadInventory()
    }
  }, [isOpen])

  const loadAsset = async (assetId: string) => {
    const response = await supabase
      .from('assets')
      .select('*')
      .eq('id', assetId)
      .single()
    
    if (!response.error && response.data) {
      setAsset(response.data as Asset)
    }
  }

  const loadInventory = async () => {
    const response = await supabase
      .from('inventory_items')
      .select('*')
      .order('name')
    
    if (!response.error && response.data) {
      setInventoryItems(response.data as InventoryItem[])
    }
  }

  // Calculate totals
  const calculateTotals = useCallback(() => {
    const partsCost = extendedData.spare_allocations.reduce((sum, item) => sum + item.total_cost, 0)
    const irCost = extendedData.ir_requests.reduce((sum, item) => sum + (item.actual_cost || item.estimated_cost || 0), 0)
    const serviceCost = extendedData.third_party_services.reduce((sum, item) => sum + (item.actual_cost || item.quoted_cost || 0), 0)
    const laborCost = laborHours * laborRate
    
    return {
      parts: partsCost + irCost,
      services: serviceCost,
      labor: laborCost,
      total: partsCost + irCost + serviceCost + laborCost
    }
  }, [extendedData, laborHours, laborRate])

  // Toggle section
  const toggleSection = (section: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev)
      if (newSet.has(section)) {
        newSet.delete(section)
      } else {
        newSet.add(section)
      }
      return newSet
    })
  }

  // ==================== REPAIR ITEMS ====================
  const addRepairItem = () => {
    const newItem: JobRepairItem = {
      id: crypto.randomUUID(),
      description: '',
      type: 'repair',
      status: 'pending',
      completed_date: null,
      completed_by: null,
      notes: null,
      cost: 0
    }
    setExtendedData(prev => ({
      ...prev,
      repair_items: [...prev.repair_items, newItem]
    }))
  }

  const updateRepairItem = (id: string, updates: Partial<JobRepairItem>) => {
    setExtendedData(prev => ({
      ...prev,
      repair_items: prev.repair_items.map(item =>
        item.id === id ? { ...item, ...updates } : item
      )
    }))
  }

  const removeRepairItem = (id: string) => {
    setExtendedData(prev => ({
      ...prev,
      repair_items: prev.repair_items.filter(item => item.id !== id)
    }))
  }

  const markRepairComplete = (id: string) => {
    setExtendedData(prev => ({
      ...prev,
      repair_items: prev.repair_items.map(item =>
        item.id === id ? {
          ...item,
          status: 'completed',
          completed_date: new Date().toISOString(),
          completed_by: job?.assigned_to || 'Unknown'
        } : item
      )
    }))
  }

  // ==================== SPARE ALLOCATIONS ====================
  const filteredInventory = inventoryItems.filter(item =>
    item.name.toLowerCase().includes(inventorySearch.toLowerCase()) ||
    item.sku.toLowerCase().includes(inventorySearch.toLowerCase())
  )

  const addSpareAllocation = (inventoryItem: InventoryItem) => {
    // Check if already allocated
    const existing = extendedData.spare_allocations.find(
      a => a.inventory_item_id === inventoryItem.id
    )
    if (existing) {
      // Increase quantity
      setExtendedData(prev => ({
        ...prev,
        spare_allocations: prev.spare_allocations.map(a =>
          a.inventory_item_id === inventoryItem.id
            ? { ...a, quantity: a.quantity + 1, total_cost: (a.quantity + 1) * a.unit_cost }
            : a
        )
      }))
    } else {
      const newAllocation: JobSpareAllocation = {
        id: crypto.randomUUID(),
        inventory_item_id: inventoryItem.id,
        item_name: inventoryItem.name,
        item_sku: inventoryItem.sku,
        quantity: 1,
        unit_cost: inventoryItem.unit_cost || 0,
        total_cost: inventoryItem.unit_cost || 0,
        allocated_date: new Date().toISOString(),
        allocated_by: job?.assigned_to || 'Unknown'
      }
      setExtendedData(prev => ({
        ...prev,
        spare_allocations: [...prev.spare_allocations, newAllocation]
      }))
    }
    setInventorySearch('')
    setShowInventoryDropdown(false)
  }

  const updateSpareQuantity = (id: string, quantity: number) => {
    if (quantity < 1) return
    setExtendedData(prev => ({
      ...prev,
      spare_allocations: prev.spare_allocations.map(a =>
        a.id === id ? { ...a, quantity, total_cost: quantity * a.unit_cost } : a
      )
    }))
  }

  const removeSpareAllocation = (id: string) => {
    setExtendedData(prev => ({
      ...prev,
      spare_allocations: prev.spare_allocations.filter(a => a.id !== id)
    }))
  }

  // ==================== IR REQUESTS ====================
  const addIRRequest = () => {
    const newRequest: JobIRRequest = {
      id: crypto.randomUUID(),
      item_description: '',
      quantity: 1,
      urgency: 'medium',
      status: 'pending',
      estimated_cost: null,
      actual_cost: null,
      supplier: null,
      requested_date: new Date().toISOString(),
      requested_by: job?.assigned_to || 'Unknown',
      notes: null
    }
    setExtendedData(prev => ({
      ...prev,
      ir_requests: [...prev.ir_requests, newRequest]
    }))
  }

  const updateIRRequest = (id: string, updates: Partial<JobIRRequest>) => {
    setExtendedData(prev => ({
      ...prev,
      ir_requests: prev.ir_requests.map(item =>
        item.id === id ? { ...item, ...updates } : item
      )
    }))
  }

  const removeIRRequest = (id: string) => {
    setExtendedData(prev => ({
      ...prev,
      ir_requests: prev.ir_requests.filter(item => item.id !== id)
    }))
  }

  // ==================== THIRD PARTY SERVICES ====================
  const addThirdPartyService = () => {
    const newService: JobThirdPartyService = {
      id: crypto.randomUUID(),
      service_provider: '',
      service_description: '',
      status: 'requested',
      quoted_cost: null,
      actual_cost: null,
      contact_person: null,
      contact_phone: null,
      requested_date: new Date().toISOString(),
      scheduled_date: null,
      completed_date: null,
      notes: null
    }
    setExtendedData(prev => ({
      ...prev,
      third_party_services: [...prev.third_party_services, newService]
    }))
  }

  const updateThirdPartyService = (id: string, updates: Partial<JobThirdPartyService>) => {
    setExtendedData(prev => ({
      ...prev,
      third_party_services: prev.third_party_services.map(item =>
        item.id === id ? { ...item, ...updates } : item
      )
    }))
  }

  const removeThirdPartyService = (id: string) => {
    setExtendedData(prev => ({
      ...prev,
      third_party_services: prev.third_party_services.filter(item => item.id !== id)
    }))
  }

  // ==================== SAVE ====================
  const handleSave = async (complete = false) => {
    if (!job) return
    setLoading(true)
    setError('')

    try {
      const totals = calculateTotals()
      const updatedExtendedData: JobExtendedData = {
        ...extendedData,
        total_parts_cost: totals.parts,
        total_service_cost: totals.services,
        total_labor_cost: totals.labor
      }

      const updateData: Partial<JobCard> = {
        extended_data: updatedExtendedData,
        actual_hours: laborHours,
        status: complete ? 'completed' : job.status === 'todo' ? 'in_progress' : job.status,
        completed_date: complete ? new Date().toISOString() : null
      }

      await onSave(updateData)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save job')
    } finally {
      setLoading(false)
    }
  }

  const totals = calculateTotals()

  if (!job) return null

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center justify-between w-full pr-8">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{job.title}</h2>
            <p className="text-sm text-gray-500">
              {asset?.name || 'No asset'} • {job.location}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div>
              <select
                value={currencyCode}
                onChange={(e) => setCurrencyCode(e.target.value as CurrencyCode)}
                className="text-sm border border-gray-300 rounded-lg px-2 py-1 bg-white focus:ring-2 focus:ring-blue-500"
              >
                {CURRENCY_OPTIONS.map(opt => (
                  <option key={opt.code} value={opt.code}>{opt.code}</option>
                ))}
              </select>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-green-600">{formatCurrency(totals.total, { currency: currencyCode })}</div>
              <div className="text-xs text-gray-500">Total Cost</div>
            </div>
          </div>
        </div>
      }
      size="xl"
    >
      <div className="flex flex-col h-[70vh]">
        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-4 overflow-x-auto">
          <button
            onClick={() => setActiveTab('repairs')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'repairs'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Wrench className="inline-block h-4 w-4 mr-1" />
            Repairs ({extendedData.repair_items.length})
          </button>
          <button
            onClick={() => setActiveTab('spares')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'spares'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Package className="inline-block h-4 w-4 mr-1" />
            Spares ({extendedData.spare_allocations.length})
          </button>
          <button
            onClick={() => setActiveTab('ir')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'ir'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <AlertTriangle className="inline-block h-4 w-4 mr-1" />
            IR Requests ({extendedData.ir_requests.length})
          </button>
          <button
            onClick={() => setActiveTab('services')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'services'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Truck className="inline-block h-4 w-4 mr-1" />
            Services ({extendedData.third_party_services.length})
          </button>
          <button
            onClick={() => setActiveTab('summary')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'summary'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <DollarSign className="inline-block h-4 w-4 mr-1" />
            Cost Summary
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto">
          {/* Repairs Tab */}
          {activeTab === 'repairs' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold text-gray-900">Repair & Replacement Items</h3>
                <button
                  onClick={addRepairItem}
                  className="flex items-center px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Item
                </button>
              </div>

              {extendedData.repair_items.length === 0 ? (
                <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
                  <Wrench className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p>No repair items added yet</p>
                  <button
                    onClick={addRepairItem}
                    className="mt-3 text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    + Add your first item
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {extendedData.repair_items.map((item, index) => (
                    <div
                      key={item.id}
                      className={`border rounded-lg p-4 ${
                        item.status === 'completed' ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm font-medium text-gray-600">
                          {index + 1}
                        </div>
                        <div className="flex-1 space-y-3">
                          <div className="flex gap-3">
                            <input
                              type="text"
                              value={item.description}
                              onChange={(e) => updateRepairItem(item.id, { description: e.target.value })}
                              placeholder="Description of repair/replacement..."
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              disabled={item.status === 'completed'}
                            />
                            <select
                              value={item.type}
                              onChange={(e) => updateRepairItem(item.id, { type: e.target.value as 'repair' | 'replace' })}
                              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                              disabled={item.status === 'completed'}
                            >
                              <option value="repair">Repair</option>
                              <option value="replace">Replace</option>
                            </select>
                          </div>
                          
                          <div className="flex gap-3 items-center">
                            <div className="flex items-center gap-2">
                              <label className="text-sm text-gray-500">Cost:</label>
                              <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">{currencySymbol}</span>
                                <input
                                  type="number"
                                  value={item.cost}
                                  onChange={(e) => updateRepairItem(item.id, { cost: parseFloat(e.target.value) || 0 })}
                                  className="w-28 pl-7 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                                  disabled={item.status === 'completed'}
                                />
                              </div>
                            </div>
                            
                            {item.status === 'completed' ? (
                              <div className="flex items-center gap-2 text-green-600 text-sm">
                                <Check className="h-4 w-4" />
                                Completed on {new Date(item.completed_date!).toLocaleDateString()}
                              </div>
                            ) : (
                              <button
                                onClick={() => markRepairComplete(item.id)}
                                className="px-3 py-2 bg-green-100 text-green-700 rounded-lg text-sm hover:bg-green-200"
                              >
                                <Check className="inline-block h-4 w-4 mr-1" />
                                Mark Done
                              </button>
                            )}
                            
                            <button
                              onClick={() => removeRepairItem(item.id)}
                              className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                          
                          <textarea
                            value={item.notes || ''}
                            onChange={(e) => updateRepairItem(item.id, { notes: e.target.value || null })}
                            placeholder="Additional notes..."
                            rows={2}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                            disabled={item.status === 'completed'}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Spares Tab */}
          {activeTab === 'spares' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold text-gray-900">Spare Parts Allocation</h3>
              </div>

              {/* Inventory Search */}
              <div className="relative">
                <div className="flex items-center border border-gray-300 rounded-lg bg-white">
                  <Search className="h-5 w-5 text-gray-400 ml-3" />
                  <input
                    type="text"
                    value={inventorySearch}
                    onChange={(e) => {
                      setInventorySearch(e.target.value)
                      setShowInventoryDropdown(true)
                    }}
                    onFocus={() => setShowInventoryDropdown(true)}
                    placeholder="Search inventory items by name or SKU..."
                    className="flex-1 px-3 py-2 border-0 focus:ring-0 text-sm"
                  />
                </div>
                
                {showInventoryDropdown && inventorySearch && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {filteredInventory.length === 0 ? (
                      <div className="p-4 text-center text-gray-500">
                        <p>No items found in inventory</p>
                        <button
                          onClick={() => {
                            setActiveTab('ir')
                            addIRRequest()
                            setShowInventoryDropdown(false)
                          }}
                          className="mt-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
                        >
                          Create IR Request instead →
                        </button>
                      </div>
                    ) : (
                      filteredInventory.slice(0, 10).map(item => (
                        <button
                          key={item.id}
                          onClick={() => addSpareAllocation(item)}
                          className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-0"
                        >
                          <div>
                            <div className="font-medium text-gray-900">{item.name}</div>
                            <div className="text-sm text-gray-500">
                              SKU: {item.sku} • Stock: {item.current_stock} {item.unit}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium text-gray-900">
                              R{(item.unit_cost || 0).toFixed(2)}
                            </div>
                            <div className={`text-xs ${
                              item.current_stock > item.min_stock ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {item.current_stock > item.min_stock ? 'In Stock' : 'Low Stock'}
                            </div>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>

              {/* Allocated Items */}
              {extendedData.spare_allocations.length === 0 ? (
                <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
                  <Package className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p>No spare parts allocated yet</p>
                  <p className="text-sm mt-1">Search inventory above to add parts</p>
                </div>
              ) : (
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Qty</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Unit Cost</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                        <th className="px-4 py-3 w-10"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {extendedData.spare_allocations.map(allocation => (
                        <tr key={allocation.id} className="bg-white">
                          <td className="px-4 py-3">
                            <div className="font-medium text-gray-900">{allocation.item_name}</div>
                            <div className="text-sm text-gray-500">SKU: {allocation.item_sku}</div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => updateSpareQuantity(allocation.id, allocation.quantity - 1)}
                                className="p-1 rounded border border-gray-300 hover:bg-gray-50"
                                disabled={allocation.quantity <= 1}
                              >
                                -
                              </button>
                              <span className="w-8 text-center font-medium">{allocation.quantity}</span>
                              <button
                                onClick={() => updateSpareQuantity(allocation.id, allocation.quantity + 1)}
                                className="p-1 rounded border border-gray-300 hover:bg-gray-50"
                              >
                                +
                              </button>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-right text-gray-600">
                            {formatCurrency(allocation.unit_cost, { currency: currencyCode })}
                          </td>
                          <td className="px-4 py-3 text-right font-medium text-gray-900">
                            {formatCurrency(allocation.total_cost, { currency: currencyCode })}
                          </td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => removeSpareAllocation(allocation.id)}
                              className="p-1 text-red-500 hover:bg-red-50 rounded"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-50">
                      <tr>
                        <td colSpan={3} className="px-4 py-3 text-right font-medium text-gray-700">
                          Total Parts Cost:
                        </td>
                        <td className="px-4 py-3 text-right font-bold text-gray-900">
                          {formatCurrency(extendedData.spare_allocations.reduce((sum, a) => sum + a.total_cost, 0), { currency: currencyCode })}
                        </td>
                        <td></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}

              {/* Quick action to create IR */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-900">Need parts not in inventory?</h4>
                    <p className="text-sm text-blue-700 mt-1">
                      Create an Internal Requisition (IR) request for parts that need to be ordered.
                    </p>
                    <button
                      onClick={() => {
                        setActiveTab('ir')
                        addIRRequest()
                      }}
                      className="mt-2 text-sm font-medium text-blue-600 hover:text-blue-700"
                    >
                      + Create IR Request
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* IR Requests Tab */}
          {activeTab === 'ir' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold text-gray-900">Internal Requisition (IR) Requests</h3>
                <button
                  onClick={addIRRequest}
                  className="flex items-center px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  New IR Request
                </button>
              </div>

              {extendedData.ir_requests.length === 0 ? (
                <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
                  <AlertTriangle className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p>No IR requests created</p>
                  <p className="text-sm mt-1">Request parts that are not available in inventory</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {extendedData.ir_requests.map((request, index) => (
                    <div key={request.id} className="border border-gray-200 rounded-lg p-4 bg-white">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium">
                            IR-{String(index + 1).padStart(3, '0')}
                          </span>
                          <select
                            value={request.status}
                            onChange={(e) => updateIRRequest(request.id, { status: e.target.value as JobIRRequest['status'] })}
                            className={`px-2 py-1 rounded text-xs font-medium border-0 ${
                              request.status === 'received' ? 'bg-green-100 text-green-700' :
                              request.status === 'ordered' ? 'bg-blue-100 text-blue-700' :
                              request.status === 'approved' ? 'bg-yellow-100 text-yellow-700' :
                              request.status === 'cancelled' ? 'bg-gray-100 text-gray-500' :
                              'bg-orange-100 text-orange-700'
                            }`}
                          >
                            <option value="pending">Pending</option>
                            <option value="approved">Approved</option>
                            <option value="ordered">Ordered</option>
                            <option value="received">Received</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </div>
                        <button
                          onClick={() => removeIRRequest(request.id)}
                          className="p-1 text-red-500 hover:bg-red-50 rounded"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                          <label className="block text-xs text-gray-500 mb-1">Item Description</label>
                          <input
                            type="text"
                            value={request.item_description}
                            onChange={(e) => updateIRRequest(request.id, { item_description: e.target.value })}
                            placeholder="Describe the part/item needed..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Quantity</label>
                          <input
                            type="number"
                            value={request.quantity}
                            onChange={(e) => updateIRRequest(request.id, { quantity: parseInt(e.target.value) || 1 })}
                            min={1}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Urgency</label>
                          <select
                            value={request.urgency}
                            onChange={(e) => updateIRRequest(request.id, { urgency: e.target.value as JobIRRequest['urgency'] })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                            <option value="critical">Critical</option>
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Estimated Cost</label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">{currencySymbol}</span>
                            <input
                              type="number"
                              value={request.estimated_cost || ''}
                              onChange={(e) => updateIRRequest(request.id, { estimated_cost: parseFloat(e.target.value) || null })}
                              placeholder="0.00"
                              className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Actual Cost</label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">{currencySymbol}</span>
                            <input
                              type="number"
                              value={request.actual_cost || ''}
                              onChange={(e) => updateIRRequest(request.id, { actual_cost: parseFloat(e.target.value) || null })}
                              placeholder="0.00"
                              className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        </div>
                        
                        <div className="col-span-2">
                          <label className="block text-xs text-gray-500 mb-1">Supplier (optional)</label>
                          <input
                            type="text"
                            value={request.supplier || ''}
                            onChange={(e) => updateIRRequest(request.id, { supplier: e.target.value || null })}
                            placeholder="Preferred supplier..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        
                        <div className="col-span-2">
                          <label className="block text-xs text-gray-500 mb-1">Notes</label>
                          <textarea
                            value={request.notes || ''}
                            onChange={(e) => updateIRRequest(request.id, { notes: e.target.value || null })}
                            placeholder="Additional notes..."
                            rows={2}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Third Party Services Tab */}
          {activeTab === 'services' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold text-gray-900">Third-Party Services</h3>
                <button
                  onClick={addThirdPartyService}
                  className="flex items-center px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Service
                </button>
              </div>

              {extendedData.third_party_services.length === 0 ? (
                <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
                  <Truck className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p>No third-party services requested</p>
                  <p className="text-sm mt-1">Add external service providers for specialized work</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {extendedData.third_party_services.map((service) => (
                    <div key={service.id} className="border border-gray-200 rounded-lg p-4 bg-white">
                      <div className="flex items-start justify-between mb-3">
                        <select
                          value={service.status}
                          onChange={(e) => updateThirdPartyService(service.id, { status: e.target.value as JobThirdPartyService['status'] })}
                          className={`px-2 py-1 rounded text-xs font-medium border-0 ${
                            service.status === 'completed' ? 'bg-green-100 text-green-700' :
                            service.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                            service.status === 'approved' ? 'bg-yellow-100 text-yellow-700' :
                            service.status === 'quoted' ? 'bg-purple-100 text-purple-700' :
                            service.status === 'cancelled' ? 'bg-gray-100 text-gray-500' :
                            'bg-orange-100 text-orange-700'
                          }`}
                        >
                          <option value="requested">Requested</option>
                          <option value="quoted">Quoted</option>
                          <option value="approved">Approved</option>
                          <option value="in_progress">In Progress</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                        <button
                          onClick={() => removeThirdPartyService(service.id)}
                          className="p-1 text-red-500 hover:bg-red-50 rounded"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Service Provider</label>
                          <input
                            type="text"
                            value={service.service_provider}
                            onChange={(e) => updateThirdPartyService(service.id, { service_provider: e.target.value })}
                            placeholder="Company/provider name..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Contact Person</label>
                          <input
                            type="text"
                            value={service.contact_person || ''}
                            onChange={(e) => updateThirdPartyService(service.id, { contact_person: e.target.value || null })}
                            placeholder="Contact name..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        
                        <div className="col-span-2">
                          <label className="block text-xs text-gray-500 mb-1">Service Description</label>
                          <textarea
                            value={service.service_description}
                            onChange={(e) => updateThirdPartyService(service.id, { service_description: e.target.value })}
                            placeholder="Describe the work to be done..."
                            rows={2}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Contact Phone</label>
                          <input
                            type="tel"
                            value={service.contact_phone || ''}
                            onChange={(e) => updateThirdPartyService(service.id, { contact_phone: e.target.value || null })}
                            placeholder="Phone number..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Scheduled Date</label>
                          <input
                            type="date"
                            value={service.scheduled_date?.split('T')[0] || ''}
                            onChange={(e) => updateThirdPartyService(service.id, { scheduled_date: e.target.value ? new Date(e.target.value).toISOString() : null })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Quoted Cost</label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">{currencySymbol}</span>
                            <input
                              type="number"
                              value={service.quoted_cost || ''}
                              onChange={(e) => updateThirdPartyService(service.id, { quoted_cost: parseFloat(e.target.value) || null })}
                              placeholder="0.00"
                              className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Actual Cost</label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">{currencySymbol}</span>
                            <input
                              type="number"
                              value={service.actual_cost || ''}
                              onChange={(e) => updateThirdPartyService(service.id, { actual_cost: parseFloat(e.target.value) || null })}
                              placeholder="0.00"
                              className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        </div>
                        
                        <div className="col-span-2">
                          <label className="block text-xs text-gray-500 mb-1">Notes</label>
                          <textarea
                            value={service.notes || ''}
                            onChange={(e) => updateThirdPartyService(service.id, { notes: e.target.value || null })}
                            placeholder="Additional notes..."
                            rows={2}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Cost Summary Tab */}
          {activeTab === 'summary' && (
            <div className="space-y-6">
              {/* Labor Cost */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-4">Labor Cost</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Hours Worked</label>
                    <input
                      type="number"
                      value={laborHours}
                      onChange={(e) => setLaborHours(parseFloat(e.target.value) || 0)}
                      min={0}
                      step={0.5}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Hourly Rate (R)</label>
                    <input
                      type="number"
                      value={laborRate}
                      onChange={(e) => setLaborRate(parseFloat(e.target.value) || 0)}
                      min={0}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Total Labor</label>
                    <div className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium">
                      {formatCurrency(totals.labor, { currency: currencyCode })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Cost Breakdown */}
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                  <h4 className="font-semibold text-gray-900">Cost Breakdown</h4>
                </div>
                <div className="divide-y divide-gray-200">
                  {/* Parts Cost */}
                  <div className="px-4 py-3">
                    <button
                      onClick={() => toggleSection('parts')}
                      className="w-full flex items-center justify-between"
                    >
                      <span className="font-medium text-gray-700">Parts & Materials</span>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{formatCurrency(totals.parts, { currency: currencyCode })}</span>
                        {expandedSections.has('parts') ? (
                          <ChevronUp className="h-4 w-4 text-gray-400" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-gray-400" />
                        )}
                      </div>
                    </button>
                    {expandedSections.has('parts') && (
                      <div className="mt-3 pl-4 space-y-2 text-sm">
                        {extendedData.spare_allocations.map(a => (
                          <div key={a.id} className="flex justify-between text-gray-600">
                            <span>{a.item_name} x{a.quantity}</span>
                            <span>{formatCurrency(a.total_cost, { currency: currencyCode })}</span>
                          </div>
                        ))}
                        {extendedData.ir_requests.filter(r => r.status !== 'cancelled').map(r => (
                          <div key={r.id} className="flex justify-between text-gray-600">
                            <span>{r.item_description} (IR)</span>
                            <span>{formatCurrency(r.actual_cost || r.estimated_cost || 0, { currency: currencyCode })}</span>
                          </div>
                        ))}
                        {extendedData.spare_allocations.length === 0 && extendedData.ir_requests.length === 0 && (
                          <div className="text-gray-400 italic">No parts allocated</div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Services Cost */}
                  <div className="px-4 py-3">
                    <button
                      onClick={() => toggleSection('services-summary')}
                      className="w-full flex items-center justify-between"
                    >
                      <span className="font-medium text-gray-700">Third-Party Services</span>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{formatCurrency(totals.services, { currency: currencyCode })}</span>
                        {expandedSections.has('services-summary') ? (
                          <ChevronUp className="h-4 w-4 text-gray-400" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-gray-400" />
                        )}
                      </div>
                    </button>
                    {expandedSections.has('services-summary') && (
                      <div className="mt-3 pl-4 space-y-2 text-sm">
                        {extendedData.third_party_services.filter(s => s.status !== 'cancelled').map(s => (
                          <div key={s.id} className="flex justify-between text-gray-600">
                            <span>{s.service_provider}</span>
                            <span>{formatCurrency(s.actual_cost || s.quoted_cost || 0, { currency: currencyCode })}</span>
                          </div>
                        ))}
                        {extendedData.third_party_services.length === 0 && (
                          <div className="text-gray-400 italic">No services requested</div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Labor Cost */}
                  <div className="px-4 py-3 flex justify-between">
                    <span className="font-medium text-gray-700">Labor ({laborHours} hrs @ {currencySymbol}{laborRate}/hr)</span>
                    <span className="font-medium">{formatCurrency(totals.labor, { currency: currencyCode })}</span>
                  </div>
                </div>
                
                {/* Total */}
                <div className="px-4 py-4 bg-green-50 border-t border-green-200 flex justify-between">
                  <span className="font-bold text-green-900">TOTAL COST</span>
                  <span className="font-bold text-green-900 text-xl">{formatCurrency(totals.total, { currency: currencyCode })}</span>
                </div>
              </div>

              {/* Repair Items Progress */}
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3">Repair Items Progress</h4>
                {extendedData.repair_items.length === 0 ? (
                  <p className="text-gray-500 text-sm">No repair items added</p>
                ) : (
                  <div className="space-y-2">
                    {extendedData.repair_items.map(item => (
                      <div key={item.id} className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                          item.status === 'completed' ? 'bg-green-500' : 'bg-gray-300'
                        }`}>
                          {item.status === 'completed' && <Check className="h-3 w-3 text-white" />}
                        </div>
                        <span className={item.status === 'completed' ? 'text-gray-500 line-through' : 'text-gray-900'}>
                          {item.description || 'Untitled item'}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded ${
                          item.type === 'replace' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                        }`}>
                          {item.type}
                        </span>
                      </div>
                    ))}
                    <div className="mt-3 text-sm text-gray-500">
                      {extendedData.repair_items.filter(i => i.status === 'completed').length} of {extendedData.repair_items.length} items completed
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex justify-between items-center pt-4 border-t border-gray-200 mt-4">
          <div className="text-sm text-gray-500">
            Total: {formatCurrency(totals.total, { currency: currencyCode })} • {extendedData.repair_items.filter(i => i.status === 'completed').length}/{extendedData.repair_items.length} repairs done
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              onClick={() => { void handleSave(false) }}
              className="px-4 py-2 text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100"
              disabled={loading}
            >
              Save Progress
            </button>
            <button
              onClick={() => { void handleSave(true) }}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Complete Job'}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  )
}
