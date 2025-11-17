import { AlertCircle, Minus, Plus, Settings } from 'lucide-react';
import React, { useState } from 'react';
import { FuelBunker } from '../../types/database';
import FormField from '../ui/FormField';
import FormTextarea from '../ui/FormTextarea';
import LoadingSpinner from '../ui/LoadingSpinner';
import Modal from '../ui/Modal';

interface FuelBunkerTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    quantity: number;
    reference_number?: string;
    notes?: string;
    performed_by?: string;
  }) => Promise<void>;
  bunker: FuelBunker;
  transactionType: 'addition' | 'withdrawal' | 'adjustment';
  loading?: boolean;
}

export default function FuelBunkerTransactionModal({
  isOpen,
  onClose,
  onSubmit,
  bunker,
  transactionType,
  loading = false
}: FuelBunkerTransactionModalProps) {
  const [formData, setFormData] = useState({
    quantity: 0,
    reference_number: '',
    notes: '',
    performed_by: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const getModalConfig = () => {
    switch (transactionType) {
      case 'addition':
        return {
          title: 'Add Fuel to Bunker',
          icon: <Plus className="h-6 w-6 text-green-600 mr-2" />,
          color: 'green',
          label: 'Quantity to Add (Liters)',
          buttonText: 'Add Fuel'
        };
      case 'withdrawal':
        return {
          title: 'Withdraw Fuel from Bunker',
          icon: <Minus className="h-6 w-6 text-orange-600 mr-2" />,
          color: 'orange',
          label: 'Quantity to Withdraw (Liters)',
          buttonText: 'Withdraw Fuel'
        };
      case 'adjustment':
        return {
          title: 'Adjust Fuel Level',
          icon: <Settings className="h-6 w-6 text-blue-600 mr-2" />,
          color: 'blue',
          label: 'New Fuel Level (Liters)',
          buttonText: 'Adjust Level'
        };
    }
  };

  const config = getModalConfig();

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (formData.quantity <= 0 && transactionType !== 'adjustment') {
      newErrors.quantity = 'Quantity must be greater than 0';
    }

    if (transactionType === 'adjustment') {
      if (formData.quantity < 0) {
        newErrors.quantity = 'Level cannot be negative';
      }
      if (formData.quantity > bunker.capacity) {
        newErrors.quantity = `Level cannot exceed capacity (${bunker.capacity.toFixed(2)} L)`;
      }
    } else if (transactionType === 'addition') {
      const newLevel = bunker.current_level + formData.quantity;
      if (newLevel > bunker.capacity) {
        newErrors.quantity = `Adding ${formData.quantity.toFixed(2)} L would exceed capacity. Maximum you can add: ${(bunker.capacity - bunker.current_level).toFixed(2)} L`;
      }
    } else if (transactionType === 'withdrawal') {
      if (formData.quantity > bunker.current_level) {
        newErrors.quantity = `Insufficient fuel. Current level: ${bunker.current_level.toFixed(2)} L`;
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
        setFormData({
          quantity: 0,
          reference_number: '',
          notes: '',
          performed_by: ''
        });
        onClose();
      } catch (error) {
        console.error('Failed to submit transaction:', error);
      }
    })();
  };

  const updateField = (field: keyof typeof formData, value: string | number): void => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const calculateNewLevel = (): number => {
    if (transactionType === 'adjustment') {
      return formData.quantity;
    } else if (transactionType === 'addition') {
      return bunker.current_level + formData.quantity;
    } else {
      return bunker.current_level - formData.quantity;
    }
  };

  const newLevel = calculateNewLevel();
  const newPercentage = bunker.capacity > 0 ? (newLevel / bunker.capacity) * 100 : 0;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center">
          {config.icon}
          {config.title}
        </div>
      }
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Bunker Info */}
        <div className="bg-gray-50 rounded-lg p-4 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700">Tank:</span>
            <span className="text-sm text-gray-900 font-semibold">{bunker.tank_name}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700">Tank ID:</span>
            <span className="text-sm text-gray-900">{bunker.tank_id}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700">Current Level:</span>
            <span className="text-sm text-gray-900 font-semibold">
              {bunker.current_level.toFixed(2)} L ({((bunker.current_level / bunker.capacity) * 100).toFixed(1)}%)
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700">Capacity:</span>
            <span className="text-sm text-gray-900">{bunker.capacity.toFixed(2)} L</span>
          </div>
        </div>

        {/* Transaction Form */}
        <FormField
          label={config.label}
          name="quantity"
          type="number"
          value={formData.quantity}
          onChange={(value) => updateField('quantity', value)}
          required
          error={errors.quantity}
          step="0.01"
        />

        {transactionType !== 'adjustment' && (
          <FormField
            label="Reference Number"
            name="reference_number"
            value={formData.reference_number}
            onChange={(value) => updateField('reference_number', value)}
            placeholder="e.g., Delivery Note #12345"
            error={errors.reference_number}
          />
        )}

        <FormField
          label="Performed By"
          name="performed_by"
          value={formData.performed_by}
          onChange={(value) => updateField('performed_by', value)}
          placeholder="Enter operator name"
          error={errors.performed_by}
        />

        <FormTextarea
          label="Notes"
          name="notes"
          value={formData.notes}
          onChange={(value) => updateField('notes', value)}
          placeholder="Add any additional notes..."
          rows={3}
          error={errors.notes}
        />

        {/* Preview New Level */}
        {formData.quantity > 0 && Object.keys(errors).length === 0 && (
          <div className="border-t pt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              New Level Preview
            </label>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">New Level:</span>
                <span className={`font-semibold ${
                  newLevel < (bunker.min_level || 0) ? 'text-red-600' :
                  newLevel > bunker.capacity ? 'text-red-600' :
                  'text-green-600'
                }`}>
                  {newLevel.toFixed(2)} L ({newPercentage.toFixed(1)}%)
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div
                  className={`h-4 rounded-full transition-all duration-300 ${
                    newPercentage < 20 ? 'bg-red-500' :
                    newPercentage < 50 ? 'bg-yellow-500' :
                    'bg-green-500'
                  }`}
                  style={{ width: `${Math.min(newPercentage, 100)}%` }}
                />
              </div>
              {newLevel < (bunker.min_level || 0) && (
                <div className="flex items-start gap-2 text-sm text-orange-600 bg-orange-50 p-2 rounded">
                  <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>Warning: New level will be below minimum threshold</span>
                </div>
              )}
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
            disabled={loading || formData.quantity <= 0}
            className={`flex items-center px-4 py-2 text-sm font-medium text-white rounded-lg disabled:opacity-50 ${
              config.color === 'green' ? 'bg-green-600 hover:bg-green-700' :
              config.color === 'orange' ? 'bg-orange-600 hover:bg-orange-700' :
              'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {loading && <LoadingSpinner size="sm" color="white" className="mr-2" />}
            {config.buttonText}
          </button>
        </div>
      </form>
    </Modal>
  );
}
