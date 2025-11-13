import { Edit, Plus, Receipt, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase'; // Import supabase for asset fetching
import { Asset, FuelRecord } from '../../types/database';
import FormSelect from '../ui/FormSelect';

interface Farm {
  id: string
  name: string
  location: string | null
}

interface FuelRecordModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (recordData: Omit<FuelRecord, '_id'>) => Promise<void>
  record?: FuelRecord | null
}

const FuelRecordModal: React.FC<FuelRecordModalProps> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  record 
}) => {
  const [formData, setFormData] = useState({
    asset_id: record?.asset_id || '',
    quantity: record?.quantity || 0,
    cost: record?.cost || 0,
    price_per_liter: record?.price_per_liter || 0,
    fuel_type: record?.fuel_type || 'diesel',
    location: record?.location || '',
    receipt_number: record?.receipt_number || '',
    odometer_reading: record?.odometer_reading || 0,
    notes: record?.notes || '',
    fuel_grade: record?.fuel_grade || '',
    weather_conditions: record?.weather_conditions || '',
    operator_id: record?.operator_id || '',
    current_hours: 0
  });
  
  const [assets, setAssets] = useState<Asset[]>([]); // State for assets
  const [farms, setFarms] = useState<Farm[]>([]); // State for farms
  const [loadingAssets, setLoadingAssets] = useState(true); // Loading state
  const [consumptionRate, setConsumptionRate] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Fetch assets when the modal opens
  useEffect(() => {
    if (isOpen) {
      const fetchAssets = async () => {
        setLoadingAssets(true);
        const { data, error } = await supabase
          .from('assets')
          .select('*')
          .order('name');

        if (!error && data) {
          setAssets(data as Asset[]);
        }
        setLoadingAssets(false);
      };

      const fetchFarms = async () => {
        const { data, error } = await supabase
          .from('farms')
          .select('id, name, location')
          .eq('status', 'active')
          .order('name');

        if (!error && data) {
          setFarms(data as Farm[]);
        }
      };
  
      void fetchAssets();
      void fetchFarms();
      
      // Reset form data
      setFormData({
        asset_id: record?.asset_id || '',
        quantity: record?.quantity || 0,
        cost: record?.cost || 0,
        price_per_liter: record?.price_per_liter || 0,
        fuel_type: record?.fuel_type || 'diesel',
        location: record?.location || '',
        receipt_number: record?.receipt_number || '',
        odometer_reading: record?.odometer_reading || 0,
        notes: record?.notes || '',
        fuel_grade: record?.fuel_grade || '',
        weather_conditions: record?.weather_conditions || '',
        operator_id: record?.operator_id || '',
        current_hours: 0
      });

      setConsumptionRate(null);
    }
  }, [isOpen, record]);

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    
    const selectedAsset = assets.find(asset => asset.id === formData.asset_id);
    // Validate current_hours
    if (selectedAsset && selectedAsset.current_hours && formData.current_hours <= selectedAsset.current_hours) {
      alert(`Current hour meter reading (${formData.current_hours}) must be greater than the previous reading (${selectedAsset.current_hours})`);
      return;
    }

    setLoading(true);

    void (async () => {
      try {
        await onSave({
          ...formData,
          id: record?.id || '',
          date: record?.date || new Date().toISOString(),
          created_at: record?.created_at || new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
        onClose();
      } catch (error) {
        console.error('Failed to save fuel record:', error);
      } finally {
        setLoading(false);
      }
    })();
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>): void => {
    const { name, value } = e.target;
    let newValue: string | number = value;

    if (['quantity', 'cost', 'price_per_liter', 'odometer_reading', 'current_hours'].includes(name)) {
      newValue = Number(value) || 0;
    }

    setFormData(prev => {
      const updated = { ...prev, [name]: newValue };

      // Auto-calculate cost or price per liter
      if (name === 'quantity' || name === 'price_per_liter') {
        updated.cost = updated.quantity * updated.price_per_liter;
      } else if (name === 'cost' && updated.quantity > 0) {
        updated.price_per_liter = updated.cost / updated.quantity;
      }

      // Calculate consumption rate when current_hours or quantity changes
      if (name === 'current_hours' || name === 'quantity' || name === 'asset_id') {
        const asset = assets.find(a => a.id === updated.asset_id);
        if (asset && asset.current_hours && updated.current_hours > asset.current_hours) {
          const hoursDiff = updated.current_hours - asset.current_hours;
          if (hoursDiff > 0 && updated.quantity > 0) {
            setConsumptionRate(updated.quantity / hoursDiff);
          }
        } else {
          setConsumptionRate(null);
        }
      }

      return updated;
    });
  }

  const selectedAsset = assets.find(asset => asset.id === formData.asset_id);

  if (!isOpen) return null; // Don't render anything if modal is not open

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose} />
        <div className="inline-block w-full max-w-lg p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              {record ? <Edit className="h-6 w-6 text-blue-600 mr-2" /> : <Plus className="h-6 w-6 text-green-600 mr-2" />}
              <h3 className="text-lg font-medium text-gray-900">
                {record ? 'Edit Fuel Record' : 'Add Fuel Record'}
              </h3>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <FormSelect
                label="Asset"
                name="asset_id"
                value={formData.asset_id}
                onChange={(value) => setFormData(prev => ({ ...prev, asset_id: value }))}
                options={[
                  { value: '', label: 'Select Asset' },
                  ...assets.map((asset) => ({
                    value: asset.id,
                    label: asset.name
                  }))
                ]}
                required
                disabled={loadingAssets} // Disable select if assets are loading
              />
              {loadingAssets && (
                <div className="mt-2 p-2 bg-gray-50 rounded border border-gray-200">
                  <p className="text-sm text-gray-500">Loading assets...</p>
                </div>
              )}
              {assets.length === 0 && !loadingAssets && (
                <div className="mt-2 p-2 bg-red-50 rounded border border-red-200">
                  <p className="text-sm text-red-800">⚠️ No assets loaded!</p>
                </div>
              )}
              {selectedAsset && (
                <div className="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="text-sm text-gray-700">
                    <span className="font-medium">Type:</span> {selectedAsset.type} • 
                    <span className="font-medium ml-2">Fuel:</span> {selectedAsset.fuel_type} • 
                    <span className="font-medium ml-2">Tank:</span> {selectedAsset.fuel_capacity ?? 'N/A'}L • 
                    <span className="font-medium ml-2">Current Hours:</span> {selectedAsset.current_hours ?? 0}h
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quantity (L) *
                </label>
                <input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="50.0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price per Liter *
                </label>
                <input
                  type="number"
                  name="price_per_liter"
                  value={formData.price_per_liter}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="1.50"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Total Cost *
              </label>
              <input
                type="number"
                name="cost"
                value={formData.cost}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="75.00"
              />
              <p className="text-sm text-gray-500 mt-1">
                Auto-calculated: {(formData.quantity * formData.price_per_liter).toFixed(2)}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Current Hour Meter Reading *
              </label>
              <input
                type="number"
                name="current_hours"
                value={formData.current_hours}
                onChange={handleChange}
                required
                min="0"
                step="0.1"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="1250.5"
              />
              {selectedAsset && (
                <p className="text-sm text-gray-500 mt-1">
                  Previous reading: {selectedAsset.current_hours ?? 0}h
                  {formData.current_hours > 0 && selectedAsset.current_hours && formData.current_hours > selectedAsset.current_hours && (
                    <span className="text-blue-600 font-medium ml-2">
                      • Hours used: {(formData.current_hours - selectedAsset.current_hours).toFixed(1)}h
                    </span>
                  )}
                </p>
              )}
              {consumptionRate !== null && (
                <div className="mt-2 p-2 bg-blue-50 rounded-lg">
                  <p className="text-sm font-medium text-blue-900">
                    ⛽ Consumption Rate: {consumptionRate.toFixed(2)} L/hour
                  </p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location *
                </label>
                <select
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">Select Location</option>
                  <optgroup label="Farms">
                    {farms.map((farm) => (
                      <option key={farm.id} value={farm.name}>
                        {farm.name}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Fuel Stations">
                    <option value="Shell Station">Shell Station</option>
                    <option value="BP Station">BP Station</option>
                    <option value="Total Station">Total Station</option>
                    <option value="Engen Station">Engen Station</option>
                    <option value="Other Station">Other Station</option>
                  </optgroup>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Odometer/Distance (optional)
                </label>
                <input
                  type="number"
                  name="odometer_reading"
                  value={formData.odometer_reading}
                  onChange={handleChange}
                  min="0"
                  step="0.1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="5000.0"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Receipt Number
              </label>
              <div className="relative">
                <Receipt className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  name="receipt_number"
                  value={formData.receipt_number}
                  onChange={handleChange}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="SH-20240115-001"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Additional notes..."
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Saving...' : record ? 'Update Record' : 'Create Record'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default FuelRecordModal;