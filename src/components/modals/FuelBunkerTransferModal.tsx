import { ArrowRight, Fuel } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import type { FuelBunker, FuelBunkerTransferFormData } from '../../types/database';
import FormField from '../ui/FormField';
import FormSelect from '../ui/FormSelect';
import FormTextarea from '../ui/FormTextarea';
import LoadingSpinner from '../ui/LoadingSpinner';
import Modal from '../ui/Modal';

interface FuelBunkerTransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: FuelBunkerTransferFormData) => Promise<void>;
  bunkers: FuelBunker[];
  sourceBunker?: FuelBunker | null;
  loading?: boolean;
}

export default function FuelBunkerTransferModal({
  isOpen,
  onClose,
  onSubmit,
  bunkers,
  sourceBunker,
  loading = false
}: FuelBunkerTransferModalProps) {
  const [formData, setFormData] = useState<FuelBunkerTransferFormData>({
    source_bunker_id: '',
    destination_bunker_id: '',
    quantity: 0,
    notes: '',
    performed_by: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      setFormData({
        source_bunker_id: sourceBunker?.id || '',
        destination_bunker_id: '',
        quantity: 0,
        notes: '',
        performed_by: ''
      });
      setErrors({});
    }
  }, [isOpen, sourceBunker]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.source_bunker_id) {
      newErrors.source_bunker_id = 'Source bunker is required';
    }

    if (!formData.destination_bunker_id) {
      newErrors.destination_bunker_id = 'Destination bunker is required';
    }

    if (formData.source_bunker_id === formData.destination_bunker_id) {
      newErrors.destination_bunker_id = 'Source and destination must be different';
    }

    if (formData.quantity <= 0) {
      newErrors.quantity = 'Quantity must be greater than 0';
    }

    const source = bunkers.find(b => b.id === formData.source_bunker_id);
    if (source && formData.quantity > source.current_level) {
      newErrors.quantity = `Insufficient fuel. Available: ${source.current_level.toFixed(2)} L`;
    }

    const destination = bunkers.find(b => b.id === formData.destination_bunker_id);
    if (destination) {
      const availableSpace = destination.capacity - destination.current_level;
      if (formData.quantity > availableSpace) {
        newErrors.quantity = `Exceeds destination capacity. Available space: ${availableSpace.toFixed(2)} L`;
      }
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
        console.error('Failed to transfer fuel:', error);
      }
    })();
  };

  const updateField = (field: keyof FuelBunkerTransferFormData, value: string | number): void => {
    setFormData((prev: FuelBunkerTransferFormData) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev: Record<string, string>) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const selectedSource = bunkers.find(b => b.id === formData.source_bunker_id);
  const selectedDestination = bunkers.find(b => b.id === formData.destination_bunker_id);
  const activeBunkers = bunkers.filter(b => b.status === 'active');

  // Calculate levels after transfer
  const sourceAfter = selectedSource ? selectedSource.current_level - formData.quantity : 0;
  const destAfter = selectedDestination ? selectedDestination.current_level + formData.quantity : 0;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center">
          <Fuel className="h-6 w-6 text-purple-600 mr-2" />
          Transfer Fuel Between Bunkers
        </div>
      }
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <FormSelect
              label="Source Bunker"
              name="source_bunker_id"
              value={formData.source_bunker_id}
              onChange={(value) => updateField('source_bunker_id', value)}
              options={[
                { value: '', label: 'Select Source Bunker' },
                ...activeBunkers
                  .filter(b => b.id !== formData.destination_bunker_id)
                  .map(bunker => ({
                    value: bunker.id,
                    label: `${bunker.tank_name} (${bunker.current_level.toFixed(0)}L / ${bunker.capacity.toFixed(0)}L)`
                  }))
              ]}
              required
              error={errors.source_bunker_id}
            />
            {selectedSource && (
              <div className="mt-2 p-3 bg-orange-50 rounded-lg border border-orange-200">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Current Level:</span>
                  <span className="font-medium text-orange-700">{selectedSource.current_level.toFixed(2)} L</span>
                </div>
                {formData.quantity > 0 && (
                  <div className="flex items-center justify-between text-sm mt-1">
                    <span className="text-gray-600">After Transfer:</span>
                    <span className={`font-medium ${sourceAfter < (selectedSource.min_level || 0) ? 'text-red-600' : 'text-green-600'}`}>
                      {sourceAfter.toFixed(2)} L
                    </span>
                  </div>
                )}
                {selectedSource.location && (
                  <div className="text-xs text-gray-500 mt-1">📍 {selectedSource.location}</div>
                )}
              </div>
            )}
          </div>

          <div>
            <FormSelect
              label="Destination Bunker"
              name="destination_bunker_id"
              value={formData.destination_bunker_id}
              onChange={(value) => updateField('destination_bunker_id', value)}
              options={[
                { value: '', label: 'Select Destination Bunker' },
                ...activeBunkers
                  .filter(b => b.id !== formData.source_bunker_id)
                  .map(bunker => ({
                    value: bunker.id,
                    label: `${bunker.tank_name} (${bunker.current_level.toFixed(0)}L / ${bunker.capacity.toFixed(0)}L)`
                  }))
              ]}
              required
              error={errors.destination_bunker_id}
            />
            {selectedDestination && (
              <div className="mt-2 p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Current Level:</span>
                  <span className="font-medium text-green-700">{selectedDestination.current_level.toFixed(2)} L</span>
                </div>
                {formData.quantity > 0 && (
                  <div className="flex items-center justify-between text-sm mt-1">
                    <span className="text-gray-600">After Transfer:</span>
                    <span className={`font-medium ${destAfter > selectedDestination.capacity ? 'text-red-600' : 'text-green-600'}`}>
                      {destAfter.toFixed(2)} L
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between text-sm mt-1">
                  <span className="text-gray-600">Available Space:</span>
                  <span className="font-medium">{(selectedDestination.capacity - selectedDestination.current_level).toFixed(2)} L</span>
                </div>
                {selectedDestination.location && (
                  <div className="text-xs text-gray-500 mt-1">📍 {selectedDestination.location}</div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Visual Transfer Indicator */}
        {selectedSource && selectedDestination && formData.quantity > 0 && (
          <div className="flex items-center justify-center py-4">
            <div className="flex items-center gap-4 bg-gray-50 rounded-lg p-4">
              <div className="text-center">
                <div className="text-sm font-medium text-gray-700">{selectedSource.tank_name}</div>
                <div className="text-lg font-bold text-orange-600">-{formData.quantity.toFixed(1)} L</div>
              </div>
              <ArrowRight className="h-8 w-8 text-purple-600" />
              <div className="text-center">
                <div className="text-sm font-medium text-gray-700">{selectedDestination.tank_name}</div>
                <div className="text-lg font-bold text-green-600">+{formData.quantity.toFixed(1)} L</div>
              </div>
            </div>
          </div>
        )}

        <FormField
          label="Transfer Quantity (Liters)"
          name="quantity"
          type="number"
          value={formData.quantity}
          onChange={(value) => updateField('quantity', value)}
          placeholder="Enter quantity to transfer"
          required
          error={errors.quantity}
          step="0.01"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            label="Performed By"
            name="performed_by"
            value={formData.performed_by || ''}
            onChange={(value) => updateField('performed_by', value)}
            placeholder="Name of person performing transfer"
            error={errors.performed_by}
          />
        </div>

        <FormTextarea
          label="Notes"
          name="notes"
          value={formData.notes || ''}
          onChange={(value) => updateField('notes', value)}
          placeholder="Additional notes about this transfer..."
          rows={3}
          error={errors.notes}
        />

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
            disabled={loading || !formData.source_bunker_id || !formData.destination_bunker_id || formData.quantity <= 0}
            className="flex items-center px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 disabled:opacity-50"
          >
            {loading && <LoadingSpinner size="sm" color="white" className="mr-2" />}
            Transfer Fuel
          </button>
        </div>
      </form>
    </Modal>
  );
}
