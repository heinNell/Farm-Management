import { Clock, Edit, Plus, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase'; // Import supabase for asset fetching
import { Asset, OperatingSession } from '../../types/database';
import FormSelect from '../ui/FormSelect';

interface OperatingSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (sessionData: Omit<OperatingSession, 'id'>) => Promise<void>;
  session?: OperatingSession | null;
}

const OperatingSessionModal: React.FC<OperatingSessionModalProps> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  session 
}) => {
  const [formData, setFormData] = useState({
    asset_id: session?.asset_id || '',
    session_start: session?.session_start ? session.session_start.slice(0, 16) : '',
    session_end: session?.session_end ? session.session_end.slice(0, 16) : '',
    operating_hours: session?.operating_hours || null,
    fuel_consumed: session?.fuel_consumed || null,
    initial_fuel_level: session?.initial_fuel_level || null,
    final_fuel_level: session?.final_fuel_level || null,
    distance_traveled: session?.distance_traveled || null,
    efficiency_rating: session?.efficiency_rating || null,
    operator_notes: session?.operator_notes || ''
  });

  const [assets, setAssets] = useState<Asset[]>([]); // State for assets
  const [loadingAssets, setLoadingAssets] = useState(true); // Loading state for assets
  const [loading, setLoading] = useState(false); // Overall loading state

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

      void fetchAssets();

      // Reset form data when modal opens or session changes
      setFormData({
        asset_id: session?.asset_id || '',
        session_start: session?.session_start ? session.session_start.slice(0, 16) : '',
        session_end: session?.session_end ? session.session_end.slice(0, 16) : '',
        operating_hours: session?.operating_hours || null,
        fuel_consumed: session?.fuel_consumed || null,
        initial_fuel_level: session?.initial_fuel_level || null,
        final_fuel_level: session?.final_fuel_level || null,
        distance_traveled: session?.distance_traveled || null,
        efficiency_rating: session?.efficiency_rating || null,
        operator_notes: session?.operator_notes || ''
      });
    }
  }, [isOpen, session]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    void (async () => {
      try {
        await onSave({
          ...formData,
          asset_id: formData.asset_id || null,
          session_start: new Date(formData.session_start).toISOString(),
          session_end: formData.session_end ? new Date(formData.session_end).toISOString() : null,
          created_at: session?.created_at || new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
        onClose();
      } catch (error) {
        console.error('Failed to save operating session:', error);
      } finally {
        setLoading(false);
      }
    })();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    let newValue: string | number | null = value;

    if (['operating_hours', 'fuel_consumed', 'initial_fuel_level', 'final_fuel_level', 'distance_traveled', 'efficiency_rating'].includes(name)) {
      newValue = value ? Number(value) : null;
    }

    setFormData(prev => {
      const updated = { ...prev, [name]: newValue };

      // Auto-calculate operating hours when start/end time changes
      if ((name === 'session_start' || name === 'session_end') && updated.session_start && updated.session_end) {
        const start = new Date(updated.session_start);
        const end = new Date(updated.session_end);
        if (end > start) {
          updated.operating_hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60); // Convert to hours
        }
      }

      return updated;
    });
  };

  const selectedAsset = assets.find(asset => asset.id === formData.asset_id);

  if (!isOpen) return null; // Don't render anything if modal is not open

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose} />

        <div className="inline-block w-full max-w-lg p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              {session ? <Edit className="h-6 w-6 text-blue-600 mr-2" /> : <Plus className="h-6 w-6 text-green-600 mr-2" />}
              <h3 className="text-lg font-medium text-gray-900">
                {session ? 'Edit Operating Session' : 'Add Operating Session'}
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
                    <span className="font-medium ml-2">Fuel:</span> {selectedAsset.fuel_type}
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Time *
                </label>
                <input
                  type="datetime-local"
                  name="session_start"
                  value={formData.session_start}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Time *
                </label>
                <input
                  type="datetime-local"
                  name="session_end"
                  value={formData.session_end}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Operating Hours
              </label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="number"
                  name="operating_hours"
                  value={formData.operating_hours || ''}
                  onChange={handleChange}
                  min="0"
                  step="0.1"
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="8.0"
                />
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Auto-calculated from start/end times
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fuel Consumed (L)
                </label>
                <input
                  type="number"
                  name="fuel_consumed"
                  value={formData.fuel_consumed || ''}
                  onChange={handleChange}
                  min="0"
                  step="0.1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="45.2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Distance Traveled (km)
                </label>
                <input
                  type="number"
                  name="distance_traveled"
                  value={formData.distance_traveled || ''}
                  onChange={handleChange}
                  min="0"
                  step="0.1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="25.5"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Initial Fuel Level (L)
                </label>
                <input
                  type="number"
                  name="initial_fuel_level"
                  value={formData.initial_fuel_level || ''}
                  onChange={handleChange}
                  min="0"
                  step="0.1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="100.0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Final Fuel Level (L)
                </label>
                <input
                  type="number"
                  name="final_fuel_level"
                  value={formData.final_fuel_level || ''}
                  onChange={handleChange}
                  min="0"
                  step="0.1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="54.8"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Efficiency Rating (1-5)
              </label>
              <select
                name="efficiency_rating"
                value={formData.efficiency_rating || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">Not Rated</option>
                <option value={1}>1 - Poor</option>
                <option value={2}>2 - Below Average</option>
                <option value={3}>3 - Average</option>
                <option value={4}>4 - Good</option>
                <option value={5}>5 - Excellent</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Operator Notes
              </label>
              <textarea
                name="operator_notes"
                value={formData.operator_notes}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Session notes..."
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Saving...' : session ? 'Update Session' : 'Create Session'}
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

export default OperatingSessionModal;