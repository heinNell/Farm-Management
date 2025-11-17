import { Fuel } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { FuelBunker, FuelBunkerFormData } from '../../types/database';
import FormField from '../ui/FormField';
import FormSelect from '../ui/FormSelect';
import FormTextarea from '../ui/FormTextarea';
import LoadingSpinner from '../ui/LoadingSpinner';
import Modal from '../ui/Modal';

interface FuelBunkerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: FuelBunkerFormData) => Promise<void>;
  bunker?: FuelBunker | null;
  loading?: boolean;
}

const TANK_TYPES = [
  { value: 'stationary', label: 'Stationary Tank' },
  { value: 'mobile', label: 'Mobile Tank (Truck)' }
];

const STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'maintenance', label: 'Under Maintenance' }
];

const FUEL_TYPES = [
  { value: 'diesel', label: 'Diesel' },
  { value: 'petrol', label: 'Petrol/Gasoline' },
  { value: 'ethanol', label: 'Ethanol' },
  { value: 'biodiesel', label: 'Biodiesel' },
  { value: 'other', label: 'Other' }
];

export default function FuelBunkerModal({
  isOpen,
  onClose,
  onSubmit,
  bunker,
  loading = false
}: FuelBunkerModalProps) {
  const [formData, setFormData] = useState<FuelBunkerFormData>({
    tank_id: '',
    tank_name: '',
    location: '',
    description: '',
    tank_type: 'stationary',
    capacity: 0,
    current_level: 0,
    min_level: 0,
    fuel_type: 'diesel',
    status: 'active'
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (bunker) {
      setFormData({
        tank_id: bunker.tank_id,
        tank_name: bunker.tank_name,
        location: bunker.location || '',
        description: bunker.description || '',
        tank_type: bunker.tank_type,
        capacity: bunker.capacity,
        current_level: bunker.current_level,
        min_level: bunker.min_level || 0,
        fuel_type: bunker.fuel_type || 'diesel',
        status: bunker.status
      });
    } else {
      setFormData({
        tank_id: '',
        tank_name: '',
        location: '',
        description: '',
        tank_type: 'stationary',
        capacity: 0,
        current_level: 0,
        min_level: 0,
        fuel_type: 'diesel',
        status: 'active'
      });
    }
    setErrors({});
  }, [bunker, isOpen]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.tank_id.trim()) {
      newErrors.tank_id = 'Tank ID is required';
    }

    if (!formData.tank_name.trim()) {
      newErrors.tank_name = 'Tank name is required';
    }

    if (formData.capacity <= 0) {
      newErrors.capacity = 'Capacity must be greater than 0';
    }

    if (formData.current_level < 0) {
      newErrors.current_level = 'Current level cannot be negative';
    }

    if (formData.current_level > formData.capacity) {
      newErrors.current_level = 'Current level cannot exceed capacity';
    }

    if (formData.min_level && formData.min_level < 0) {
      newErrors.min_level = 'Minimum level cannot be negative';
    }

    if (formData.min_level && formData.min_level > formData.capacity) {
      newErrors.min_level = 'Minimum level cannot exceed capacity';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    
    if (!validate()) return;

    void (async () => {
      try {
        await onSubmit(formData);
        onClose();
      } catch (error) {
        console.error('Failed to submit form:', error);
      }
    })();
  };

  const updateField = (field: keyof FuelBunkerFormData, value: string | number): void => {
    setFormData((prev: FuelBunkerFormData) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev: Record<string, string>) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const fillPercentage = formData.capacity > 0 
    ? Math.min((formData.current_level / formData.capacity) * 100, 100) 
    : 0;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center">
          <Fuel className="h-6 w-6 text-blue-600 mr-2" />
          {bunker ? 'Edit Fuel Bunker' : 'Add New Fuel Bunker'}
        </div>
      }
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            label="Tank ID"
            name="tank_id"
            value={formData.tank_id}
            onChange={(value) => updateField('tank_id', value)}
            placeholder="e.g., TANK-001"
            required
            error={errors.tank_id}
          />

          <FormField
            label="Tank Name"
            name="tank_name"
            value={formData.tank_name}
            onChange={(value) => updateField('tank_name', value)}
            placeholder="e.g., Main Storage Tank"
            required
            error={errors.tank_name}
          />

          <FormSelect
            label="Tank Type"
            name="tank_type"
            value={formData.tank_type}
            onChange={(value) => updateField('tank_type', value)}
            options={TANK_TYPES}
            required
            error={errors.tank_type}
          />

          <FormSelect
            label="Fuel Type"
            name="fuel_type"
            value={formData.fuel_type || 'diesel'}
            onChange={(value) => updateField('fuel_type', value)}
            options={FUEL_TYPES}
            error={errors.fuel_type}
          />

          <FormField
            label="Location"
            name="location"
            value={formData.location || ''}
            onChange={(value) => updateField('location', value)}
            placeholder="e.g., Warehouse A"
            error={errors.location}
          />

          <FormSelect
            label="Status"
            name="status"
            value={formData.status}
            onChange={(value) => updateField('status', value)}
            options={STATUS_OPTIONS}
            required
            error={errors.status}
          />

          <FormField
            label="Capacity (Liters)"
            name="capacity"
            type="number"
            value={formData.capacity}
            onChange={(value) => updateField('capacity', value)}
            required
            error={errors.capacity}
            step="0.01"
          />

          <FormField
            label="Current Level (Liters)"
            name="current_level"
            type="number"
            value={formData.current_level}
            onChange={(value) => updateField('current_level', value)}
            required
            error={errors.current_level}
            step="0.01"
          />

          <FormField
            label="Minimum Level Alert (Liters)"
            name="min_level"
            type="number"
            value={formData.min_level || 0}
            onChange={(value) => updateField('min_level', value)}
            error={errors.min_level}
            step="0.01"
          />

          <div className="md:col-span-2">
            <FormTextarea
              label="Description"
              name="description"
              value={formData.description || ''}
              onChange={(value) => updateField('description', value)}
              placeholder="Additional details about this fuel bunker..."
              rows={3}
              error={errors.description}
            />
          </div>
        </div>

        {/* Fuel Level Visual Indicator */}
        {formData.capacity > 0 && (
          <div className="border-t pt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fuel Level Preview
            </label>
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>{formData.current_level.toFixed(2)} L</span>
                <span>{fillPercentage.toFixed(1)}%</span>
                <span>{formData.capacity.toFixed(2)} L</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div
                  className={`h-4 rounded-full transition-all duration-300 ${
                    fillPercentage < 20 ? 'bg-red-500' :
                    fillPercentage < 50 ? 'bg-yellow-500' :
                    'bg-green-500'
                  }`}
                  style={{ width: `${fillPercentage}%` }}
                />
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end space-x-3 pt-6 border-t">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading && <LoadingSpinner size="sm" color="white" className="mr-2" />}
            {bunker ? 'Update Bunker' : 'Create Bunker'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
