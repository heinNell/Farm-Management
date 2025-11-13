import { Edit, Plus, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase'; // Import supabase for fetching assets
import { Asset } from '../../types/database';

interface AssetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (assetData: Omit<Asset, '_id'>) => Promise<void>;
  asset?: Asset | null;
}

const AssetModal: React.FC<AssetModalProps> = ({ isOpen, onClose, onSave, asset }) => {
  const [formData, setFormData] = useState({
    name: asset?.name || '',
    type: asset?.type || 'tractor',
    fuel_type: asset?.fuel_type || 'diesel',
    fuel_capacity: asset?.fuel_capacity || 0,
    model: asset?.model || '',
    serial_number: asset?.serial_number || '',
    purchase_date: asset?.purchase_date || '',
    status: asset?.status || 'active',
    location: asset?.location || '',
    current_hours: asset?.current_hours || 0,
    barcode: asset?.barcode || '',
    qr_code: asset?.qr_code || '',
    notes: asset?.notes || ''
  });
  
  const [loading, setLoading] = useState(false);
  const [assets, setAssets] = useState<Asset[]>([]); // State for the list of assets
  const [selectedAssets, setSelectedAssets] = useState<string[]>([]); // To track selected assets

  // Fetch assets when the modal opens
  useEffect(() => {
    if (isOpen) {
      const fetchAssets = async () => {
        const { data, error } = await supabase
          .from('assets')
          .select('*')
          .order('name');
        
        if (!error && data) {
          setAssets(data as Asset[]);
        }
      };

      void fetchAssets();
    }
  }, [isOpen]);

  // Handle form submission
  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    setLoading(true);
    
    void (async () => {
      try {
        await onSave({
          ...formData,
          id: asset?.id || '',
          created_at: asset?.created_at || new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
        onClose();
      } catch (error) {
        console.error('Failed to save asset:', error);
      } finally {
        setLoading(false);
      }
    })();
  };

  // Handle change for input and select elements
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>): void => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'fuel_capacity' || name === 'current_hours' ? Number(value) : value
    }));
  };

  // Handle selection of assets 
  const handleAssetSelection = (id: string) => {
    setSelectedAssets(prevSelected =>
      prevSelected.includes(id)
        ? prevSelected.filter(assetId => assetId !== id)
        : [...prevSelected, id]
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose} />

        <div className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              {asset ? <Edit className="h-6 w-6 text-blue-600 mr-2" /> : <Plus className="h-6 w-6 text-green-600 mr-2" />}
              <h3 className="text-lg font-medium text-gray-900">
                {asset ? 'Edit Asset' : 'Add New Asset'}
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
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Assets *
              </label>
              <div className="max-h-48 overflow-y-auto border border-gray-300 rounded-lg p-2">
                {assets.map(asset => (
                  <label key={asset.id} className="block">
                    <input
                      type="checkbox"
                      value={asset.id}
                      checked={selectedAssets.includes(asset.id)}
                      onChange={() => handleAssetSelection(asset.id)}
                      className="mr-2"
                    />
                    {asset.name} (Type: {asset.type}, Fuel: {asset.fuel_type})
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Asset Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="e.g., John Deere 6120M"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Equipment Type *
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="tractor">Tractor</option>
                  <option value="forklift">Forklift</option>
                  <option value="motorbike">Motorbike</option>
                  <option value="generator">Generator</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fuel Type *
                </label>
                <select
                  name="fuel_type"
                  value={formData.fuel_type}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="diesel">Diesel</option>
                  <option value="petrol">Petrol</option>
                  <option value="electric">Electric</option>
                  <option value="hybrid">Hybrid</option>
                </select>
              </div>
            </div>

            {/* Remaining fields go here... */}

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Saving...' : asset ? 'Update Asset' : 'Create Asset'}
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
  )
}

export default AssetModal;