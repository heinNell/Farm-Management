import { Edit, Plus, Receipt, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase'; // Import supabase for asset fetching
import type { Asset, FuelBunker, FuelRecord } from '../../types/database';
import FormSelect from '../ui/FormSelect';

interface Farm {
  id: string
  name: string
  location: string | null
}

interface FuelRecordModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (recordData: Omit<FuelRecord, '_id'>, sourceBunkerId?: string) => Promise<void>
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
    filling_date: record?.filling_date ? new Date(record.filling_date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
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
    driver_name: record?.driver_name || '',
    attendant_name: record?.attendant_name || '',
    current_hours: record?.current_hours || 0,
    source_bunker_id: ''
  });
  
  const [assets, setAssets] = useState<Asset[]>([]); // State for assets
  const [farms, setFarms] = useState<Farm[]>([]); // State for farms
  const [bunkers, setBunkers] = useState<FuelBunker[]>([]); // State for bunkers
  const [lastFuelRecord, setLastFuelRecord] = useState<FuelRecord | null>(null); // Last fuel record for the selected asset
  const [loadingAssets, setLoadingAssets] = useState(true); // Loading state
  const [consumptionRate, setConsumptionRate] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [fuelSource, setFuelSource] = useState<'bunker' | 'external'>('bunker'); // Track fuel source
  
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

      const fetchBunkers = async () => {
        const { data, error } = await supabase
          .from('fuel_bunkers')
          .select('*')
          .eq('status', 'active')
          .order('tank_name');

        if (!error && data) {
          setBunkers(data as FuelBunker[]);
        }
      };
  
      void fetchAssets();
      void fetchFarms();
      void fetchBunkers();
      
      // Reset form data
      setFormData({
        asset_id: record?.asset_id || '',
        filling_date: record?.filling_date ? new Date(record.filling_date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
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
        driver_name: record?.driver_name || '',
        attendant_name: record?.attendant_name || '',
        current_hours: record?.current_hours || 0,
        source_bunker_id: ''
      });

      // If editing a record with consumption rate, show it
      if (record?.consumption_rate) {
        setConsumptionRate(record.consumption_rate);
      } else {
        setConsumptionRate(null);
      }

      // Reset fuel source to bunker
      setFuelSource('bunker');
      
      // Reset last fuel record
      setLastFuelRecord(null);
    }
  }, [isOpen, record]);

  // Fetch the last fuel record for the selected asset when asset or filling_date changes
  useEffect(() => {
    if (formData.asset_id && isOpen) {
      const fetchLastFuelRecord = async () => {
        // Get the last fuel record for this asset BEFORE the current filling date
        // This ensures we're comparing against the chronologically previous fill
        let query = supabase
          .from('fuel_records')
          .select('*')
          .eq('asset_id', formData.asset_id)
          .order('filling_date', { ascending: false })
          .order('current_hours', { ascending: false });
        
        // If we have a filling date, only get records before this date
        if (formData.filling_date) {
          query = query.lt('filling_date', formData.filling_date);
        }
        
        // If editing, exclude the current record
        if (record?.id) {
          query = query.neq('id', record.id);
        }
        
        const { data, error } = await query.limit(1);
        
        if (!error && data && data.length > 0) {
          setLastFuelRecord(data[0] as FuelRecord);
        } else {
          setLastFuelRecord(null);
        }
      };
      
      void fetchLastFuelRecord();
    }
  }, [formData.asset_id, formData.filling_date, isOpen, record?.id]);

  // Filter bunkers based on selected location (farm)
  const filteredBunkers = bunkers.filter(bunker => {
    if (!formData.location) return true;
    return bunker.location === formData.location || bunker.tank_name.toLowerCase().includes(formData.location.toLowerCase());
  });

  const selectedBunker = bunkers.find(b => b.id === formData.source_bunker_id);

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    
    const selectedAsset = assets.find(asset => asset.id === formData.asset_id);
    
    // Validate current_hours - only warn if:
    // 1. Creating a new record after the last transaction date with lower hours, OR
    // 2. Editing a record and the new date is after the last transaction date with lower hours
    if (selectedAsset && lastFuelRecord && formData.current_hours > 0 && formData.filling_date) {
      const newDate = new Date(formData.filling_date);
      const lastFillingDate = lastFuelRecord.filling_date || lastFuelRecord.date;
      const lastDate = new Date(lastFillingDate);
      const lastHours = lastFuelRecord.current_hours || 0;
      
      // Only warn if the new date is after the last transaction date AND hours are less than last transaction
      if (newDate > lastDate && formData.current_hours < lastHours) {
        const confirmProceed = window.confirm(
          `Warning: The current hour meter reading (${formData.current_hours}) is less than the previous reading (${lastHours}) ` +
          `from ${lastDate.toLocaleDateString()}.\n\n` +
          `This might indicate an error. Do you want to proceed anyway?`
        );
        if (!confirmProceed) {
          return;
        }
      }
    }

    // Validate bunker has enough fuel if using bunker source
    if (fuelSource === 'bunker' && formData.source_bunker_id) {
      const bunker = bunkers.find(b => b.id === formData.source_bunker_id);
      if (bunker && formData.quantity > bunker.current_level) {
        alert(`Insufficient fuel in bunker. Available: ${bunker.current_level.toFixed(2)} L, Requested: ${formData.quantity} L`);
        return;
      }
    }

    setLoading(true);

    void (async () => {
      try {
        // Calculate hour difference and consumption rate
        // When editing, preserve the original previous_hours; when creating, use asset's current hours or lastFuelRecord
        const previousHours = record?.previous_hours ?? lastFuelRecord?.current_hours ?? selectedAsset?.current_hours ?? null;
        const hourDifference = previousHours !== null && formData.current_hours > 0 
          ? formData.current_hours - previousHours 
          : null;
        const calculatedConsumptionRate = hourDifference && hourDifference > 0 
          ? formData.quantity / hourDifference 
          : null;

        // Convert empty string asset_id to null for UUID field
        const filling_date = (formData.filling_date ?? new Date().toISOString().split('T')[0]) as string;
        
        const dataToSave: Omit<FuelRecord, 'id' | 'created_at' | 'updated_at'> & { id: string; created_at: string; updated_at: string } = {
          ...formData,
          asset_id: formData.asset_id || null,
          operator_id: formData.operator_id || null,
          driver_name: formData.driver_name || null,
          attendant_name: formData.attendant_name || null,
          filling_date,
          previous_hours: previousHours,
          hour_difference: hourDifference,
          consumption_rate: calculatedConsumptionRate,
          id: record?.id || '',
          date: record?.date || new Date().toISOString(),
          created_at: record?.created_at || new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        // Pass the bunker ID to the onSave handler for withdrawal
        const sourceBunkerId = fuelSource === 'bunker' && formData.source_bunker_id ? formData.source_bunker_id : undefined;
        await onSave(dataToSave, sourceBunkerId);
        onClose();
      } catch (error) {
        console.error('Failed to save fuel record:', error);
        alert('Failed to save fuel record. Please try again.');
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
        // When editing, use the previous_hours from the record being edited, or lastFuelRecord's hours
        // When creating, use the asset's current hours
        const previousHoursForCalc = record?.previous_hours ?? lastFuelRecord?.current_hours ?? asset?.current_hours ?? 0;
        
        if (updated.current_hours > previousHoursForCalc) {
          const hoursDiff = updated.current_hours - previousHoursForCalc;
          if (hoursDiff > 0 && updated.quantity > 0) {
            setConsumptionRate(updated.quantity / hoursDiff);
          } else {
            setConsumptionRate(null);
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Filling Date *
              </label>
              <input
                type="date"
                name="filling_date"
                value={formData.filling_date}
                onChange={handleChange}
                required
                max={new Date().toISOString().split('T')[0]}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
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
                  Previous reading: {record?.previous_hours ?? lastFuelRecord?.current_hours ?? selectedAsset.current_hours ?? 0}h
                  {formData.current_hours > 0 && (record?.previous_hours ?? lastFuelRecord?.current_hours ?? selectedAsset.current_hours ?? 0) > 0 && formData.current_hours > (record?.previous_hours ?? lastFuelRecord?.current_hours ?? selectedAsset.current_hours ?? 0) && (
                    <span className="text-blue-600 font-medium ml-2">
                      • Hours used: {(formData.current_hours - (record?.previous_hours ?? lastFuelRecord?.current_hours ?? selectedAsset.current_hours ?? 0)).toFixed(1)}h
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
                  Driver Name
                </label>
                <input
                  type="text"
                  name="driver_name"
                  value={formData.driver_name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Enter driver's name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Filling Attendant Name
                </label>
                <input
                  type="text"
                  name="attendant_name"
                  value={formData.attendant_name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Enter attendant's name"
                />
              </div>
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

            {/* Fuel Source Selection */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Fuel Source
              </label>
              <div className="flex gap-4 mb-3">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="fuelSource"
                    value="bunker"
                    checked={fuelSource === 'bunker'}
                    onChange={() => setFuelSource('bunker')}
                    className="mr-2 text-green-600 focus:ring-green-500"
                  />
                  <span className="text-sm">Farm Bunker</span>
                </label>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="fuelSource"
                    value="external"
                    checked={fuelSource === 'external'}
                    onChange={() => {
                      setFuelSource('external');
                      setFormData(prev => ({ ...prev, source_bunker_id: '' }));
                    }}
                    className="mr-2 text-green-600 focus:ring-green-500"
                  />
                  <span className="text-sm">External Source (Fuel Station)</span>
                </label>
              </div>

              {fuelSource === 'bunker' && (
                <div>
                  <FormSelect
                    label="Select Bunker"
                    name="source_bunker_id"
                    value={formData.source_bunker_id}
                    onChange={(value) => setFormData(prev => ({ ...prev, source_bunker_id: value }))}
                    options={[
                      { value: '', label: 'Select a fuel bunker' },
                      ...filteredBunkers.map((bunker) => ({
                        value: bunker.id,
                        label: `${bunker.tank_name} - ${bunker.current_level.toFixed(0)}L / ${bunker.capacity.toFixed(0)}L (${bunker.location || 'No location'})`
                      }))
                    ]}
                    required={fuelSource === 'bunker'}
                  />
                  {selectedBunker && (
                    <div className="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Available Fuel:</span>
                        <span className={`font-medium ${selectedBunker.current_level < formData.quantity ? 'text-red-600' : 'text-green-600'}`}>
                          {selectedBunker.current_level.toFixed(2)} L
                        </span>
                      </div>
                      {formData.quantity > 0 && (
                        <div className="flex items-center justify-between text-sm mt-1">
                          <span className="text-gray-600">After Filling:</span>
                          <span className={`font-medium ${selectedBunker.current_level - formData.quantity < 0 ? 'text-red-600' : 'text-blue-600'}`}>
                            {(selectedBunker.current_level - formData.quantity).toFixed(2)} L
                          </span>
                        </div>
                      )}
                      {selectedBunker.current_level < formData.quantity && (
                        <p className="text-xs text-red-600 mt-2">⚠️ Insufficient fuel in this bunker</p>
                      )}
                    </div>
                  )}
                  {filteredBunkers.length === 0 && (
                    <p className="text-sm text-orange-600 mt-2">
                      No active bunkers found {formData.location ? `for ${formData.location}` : ''}. Select a different location or use external source.
                    </p>
                  )}
                </div>
              )}

              {fuelSource === 'external' && (
                <p className="text-sm text-gray-500">
                  Fuel from external source will not affect bunker levels.
                </p>
              )}
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