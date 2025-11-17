import { motion } from 'framer-motion';
import { AlertCircle, BarChart3, Clock, Fuel, History, Minus, Plus, Search, Settings, Truck } from 'lucide-react';
import { useEffect, useState } from 'react';
import FuelBunkerModal from '../components/modals/FuelBunkerModal';
import FuelBunkerTransactionModal from '../components/modals/FuelBunkerTransactionModal';
import { useSupabaseCRUD } from '../hooks/useSupabaseCRUD';
import { supabase } from '../lib/supabase';
import type { FuelBunker, FuelBunkerFormData, FuelBunkerTransaction } from '../types/database';

export default function FuelBunkers() {
  const { items: bunkers, loading, create, update, refresh } = useSupabaseCRUD<FuelBunker>('fuel_bunkers');
  const [searchTerm, setSearchTerm] = useState('');
  const [tankTypeFilter, setTankTypeFilter] = useState<'all' | 'stationary' | 'mobile'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'maintenance'>('all');
  const [showBunkerModal, setShowBunkerModal] = useState(false);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [editingBunker, setEditingBunker] = useState<FuelBunker | null>(null);
  const [selectedBunker, setSelectedBunker] = useState<FuelBunker | null>(null);
  const [transactionType, setTransactionType] = useState<'addition' | 'withdrawal' | 'adjustment'>('addition');
  const [transactions, setTransactions] = useState<FuelBunkerTransaction[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const filteredBunkers = bunkers.filter(bunker => {
    const matchesSearch = bunker.tank_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         bunker.tank_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (bunker.location && bunker.location.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = tankTypeFilter === 'all' || bunker.tank_type === tankTypeFilter;
    const matchesStatus = statusFilter === 'all' || bunker.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  const handleCreateOrUpdateBunker = async (data: FuelBunkerFormData) => {
    if (editingBunker) {
      await update(editingBunker.id, data);
    } else {
      await create({
        ...data,
        location: data.location || null,
        description: data.description || null,
        min_level: data.min_level || null,
        fuel_type: data.fuel_type || null,
        last_filled_date: null
      });
    }
    await refresh();
  };

  const handleEditBunker = (bunker: FuelBunker) => {
    setEditingBunker(bunker);
    setShowBunkerModal(true);
  };

  const handleCloseBunkerModal = () => {
    setShowBunkerModal(false);
    setEditingBunker(null);
  };

  const handleOpenTransactionModal = (bunker: FuelBunker, type: 'addition' | 'withdrawal' | 'adjustment') => {
    setSelectedBunker(bunker);
    setTransactionType(type);
    setShowTransactionModal(true);
  };

  const handleTransaction = async (data: {
    quantity: number;
    reference_number?: string;
    notes?: string;
    performed_by?: string;
  }) => {
    if (!selectedBunker) return;

    try {
      if (transactionType === 'addition') {
        const { error } = await supabase.rpc('add_fuel_to_bunker', {
          p_bunker_id: selectedBunker.id,
          p_quantity: data.quantity,
          p_reference_number: data.reference_number || null,
          p_notes: data.notes || null,
          p_performed_by: data.performed_by || null
        });
        if (error) throw error;
      } else if (transactionType === 'withdrawal') {
        const { error } = await supabase.rpc('withdraw_fuel_from_bunker', {
          p_bunker_id: selectedBunker.id,
          p_quantity: data.quantity,
          p_reference_number: data.reference_number || null,
          p_notes: data.notes || null,
          p_performed_by: data.performed_by || null
        });
        if (error) throw error;
      } else if (transactionType === 'adjustment') {
        const { error } = await supabase.rpc('adjust_fuel_bunker_level', {
          p_bunker_id: selectedBunker.id,
          p_new_level: data.quantity,
          p_notes: data.notes || null,
          p_performed_by: data.performed_by || null
        });
        if (error) throw error;
      }
      await refresh();
    } catch (error) {
      console.error('Transaction failed:', error);
      throw error;
    }
  };

  const handleViewHistory = async (bunker: FuelBunker) => {
    setSelectedBunker(bunker);
    const { data, error } = await supabase
      .from('fuel_bunker_transactions')
      .select('*')
      .eq('bunker_id', bunker.id)
      .order('transaction_date', { ascending: false })
      .limit(20);

    if (!error && data) {
      setTransactions(data as FuelBunkerTransaction[]);
      setShowHistory(true);
    }
  };

  const getFillPercentage = (bunker: FuelBunker) => {
    return bunker.capacity > 0 ? (bunker.current_level / bunker.capacity) * 100 : 0;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'inactive': return 'text-gray-600 bg-gray-100';
      case 'maintenance': return 'text-orange-600 bg-orange-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTankTypeIcon = (type: string) => {
    return type === 'mobile' ? <Truck className="h-5 w-5" /> : <Fuel className="h-5 w-5" />;
  };

  // Calculate summary statistics
  const totalCapacity = bunkers.reduce((sum, b) => sum + b.capacity, 0);
  const totalFuel = bunkers.reduce((sum, b) => sum + b.current_level, 0);
  const activeBunkers = bunkers.filter(b => b.status === 'active').length;
  const lowLevelBunkers = bunkers.filter(b => b.min_level && b.current_level <= b.min_level).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Fuel Bunkers</h1>
          <p className="text-gray-600 mt-1">Manage fuel storage tanks and mobile bunkers</p>
        </div>
        <button
          onClick={() => setShowBunkerModal(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add Fuel Bunker
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Capacity</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{totalCapacity.toFixed(0)} L</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <BarChart3 className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Fuel</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{totalFuel.toFixed(0)} L</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <Fuel className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Bunkers</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{activeBunkers}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <Truck className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Low Level Alerts</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{lowLevelBunkers}</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-full">
              <AlertCircle className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search bunkers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
        
        <select
          value={tankTypeFilter}
          onChange={(e) => setTankTypeFilter(e.target.value as typeof tankTypeFilter)}
          className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">All Types</option>
          <option value="stationary">Stationary</option>
          <option value="mobile">Mobile</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
          className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="maintenance">Maintenance</option>
        </select>
      </div>

      {/* Bunkers Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading fuel bunkers...</p>
          </div>
        </div>
      ) : filteredBunkers.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-md">
          <Fuel className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No fuel bunkers found</p>
          <p className="text-gray-400 text-sm mt-2">
            {searchTerm || tankTypeFilter !== 'all' || statusFilter !== 'all'
              ? 'Try adjusting your filters'
              : 'Add your first fuel bunker to get started'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredBunkers.map((bunker, index) => {
            const fillPercentage = getFillPercentage(bunker);
            const isLowLevel = bunker.min_level && bunker.current_level <= bunker.min_level;

            return (
              <motion.div
                key={bunker.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${bunker.tank_type === 'mobile' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
                      {getTankTypeIcon(bunker.tank_type)}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{bunker.tank_name}</h3>
                      <p className="text-sm text-gray-500">{bunker.tank_id}</p>
                      {bunker.location && <p className="text-sm text-gray-600 mt-1">{bunker.location}</p>}
                    </div>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(bunker.status)}`}>
                    {bunker.status}
                  </div>
                </div>

                {isLowLevel && (
                  <div className="mb-4 flex items-center gap-2 text-sm text-orange-600 bg-orange-50 p-2 rounded">
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                    <span>Low fuel level alert</span>
                  </div>
                )}

                <div className="space-y-3 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Current Level:</span>
                    <span className="font-medium">{bunker.current_level.toFixed(2)} L</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Capacity:</span>
                    <span className="font-medium">{bunker.capacity.toFixed(2)} L</span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Fill Level:</span>
                    <span className="font-medium">{fillPercentage.toFixed(1)}%</span>
                  </div>

                  {bunker.fuel_type && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Fuel Type:</span>
                      <span className="font-medium capitalize">{bunker.fuel_type}</span>
                    </div>
                  )}
                </div>

                {/* Fuel Level Bar */}
                <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                  <div
                    className={`h-3 rounded-full transition-all duration-300 ${
                      fillPercentage < 20 ? 'bg-red-500' :
                      fillPercentage < 50 ? 'bg-yellow-500' :
                      'bg-green-500'
                    }`}
                    style={{ width: `${fillPercentage}%` }}
                  />
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <button
                    onClick={() => handleOpenTransactionModal(bunker, 'addition')}
                    disabled={bunker.status !== 'active'}
                    className="flex items-center justify-center gap-1 px-3 py-2 text-sm font-medium text-green-700 bg-green-50 rounded-lg hover:bg-green-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                    Add Fuel
                  </button>
                  <button
                    onClick={() => handleOpenTransactionModal(bunker, 'withdrawal')}
                    disabled={bunker.status !== 'active'}
                    className="flex items-center justify-center gap-1 px-3 py-2 text-sm font-medium text-orange-700 bg-orange-50 rounded-lg hover:bg-orange-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Minus className="h-4 w-4" />
                    Withdraw
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-3 border-t border-gray-200">
                  <button
                    onClick={() => handleOpenTransactionModal(bunker, 'adjustment')}
                    className="flex items-center justify-center gap-1 text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    <Settings className="h-4 w-4" />
                    Adjust
                  </button>
                  <button
                    onClick={() => { void handleViewHistory(bunker) }}
                    className="flex items-center justify-center gap-1 text-purple-600 hover:text-purple-700 text-sm font-medium"
                  >
                    <History className="h-4 w-4" />
                    History
                  </button>
                  <button
                    onClick={() => handleEditBunker(bunker)}
                    className="flex items-center justify-center gap-1 text-gray-600 hover:text-gray-700 text-sm font-medium"
                  >
                    <Settings className="h-4 w-4" />
                    Edit
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Bunker Modal */}
      <FuelBunkerModal
        isOpen={showBunkerModal}
        onClose={handleCloseBunkerModal}
        onSubmit={handleCreateOrUpdateBunker}
        bunker={editingBunker}
        loading={loading}
      />

      {/* Transaction Modal */}
      {selectedBunker && (
        <FuelBunkerTransactionModal
          isOpen={showTransactionModal}
          onClose={() => {
            setShowTransactionModal(false);
            setSelectedBunker(null);
          }}
          onSubmit={handleTransaction}
          bunker={selectedBunker}
          transactionType={transactionType}
          loading={loading}
        />
      )}

      {/* History Modal */}
      {showHistory && selectedBunker && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-4 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <History className="h-6 w-6 text-white" />
                <div>
                  <h2 className="text-xl font-bold text-white">Transaction History</h2>
                  <p className="text-purple-100 text-sm">{selectedBunker.tank_name}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowHistory(false);
                  setSelectedBunker(null);
                }}
                className="text-white hover:text-gray-200"
              >
                <Plus className="h-6 w-6 transform rotate-45" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {transactions.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No transactions recorded</p>
              ) : (
                <div className="space-y-3">
                  {transactions.map((txn) => (
                    <div key={txn.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            txn.transaction_type === 'addition' ? 'bg-green-100 text-green-700' :
                            txn.transaction_type === 'withdrawal' ? 'bg-orange-100 text-orange-700' :
                            'bg-blue-100 text-blue-700'
                          }`}>
                            {txn.transaction_type}
                          </span>
                          <span className="text-sm font-medium text-gray-900">
                            {txn.quantity > 0 ? '+' : ''}{txn.quantity.toFixed(2)} L
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <Clock className="h-4 w-4" />
                          {new Date(txn.transaction_date).toLocaleString()}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-gray-600">Previous: </span>
                          <span className="font-medium">{txn.previous_level?.toFixed(2) || 'N/A'} L</span>
                        </div>
                        <div>
                          <span className="text-gray-600">New: </span>
                          <span className="font-medium">{txn.new_level?.toFixed(2) || 'N/A'} L</span>
                        </div>
                      </div>
                      {txn.reference_number && (
                        <p className="text-sm text-gray-600 mt-1">Ref: {txn.reference_number}</p>
                      )}
                      {txn.performed_by && (
                        <p className="text-sm text-gray-600 mt-1">By: {txn.performed_by}</p>
                      )}
                      {txn.notes && (
                        <p className="text-sm text-gray-700 mt-2 italic">{txn.notes}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
