import React, { useCallback } from 'react'
import { FormFieldProps } from '../../types/database'
import { DateInput } from './DateInput'

export default function FormField({
  label,
  name,
  type = 'text',
  placeholder,
  required = false,
  error,
  value,
  onChange,
  className = '',
  step,
  disabled = false,
  min,
  max,
  autoComplete = 'off'
}: FormFieldProps) {
  // Memoized change handler for better performance
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    let newValue: string | number = e.target.value
    
    if (type === 'number') {
      const parsed = parseFloat(e.target.value)
      newValue = isNaN(parsed) ? 0 : parsed
    }
    
    onChange?.(newValue)
  }, [onChange, type])

  // Memoized date change handler
  const handleDateChange = useCallback((newValue: string) => {
    onChange?.(newValue)
  }, [onChange])

  // Dynamically generate input classes based on state
  const getInputClassName = (isDateInput = false) => {
    const baseClasses = 'w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
    const focusClasses = error 
      ? 'focus:ring-red-500 focus:border-transparent' 
      : 'focus:ring-green-500 focus:border-transparent'
    const borderClasses = error 
      ? 'border-red-300 hover:border-red-400' 
      : 'border-gray-300 hover:border-gray-400'
    
    return `${baseClasses} ${borderClasses} ${focusClasses} ${isDateInput ? 'pr-10' : ''}`
  }

  // Determine input value based on type
  const getInputValue = () => {
    if (value === null || value === undefined) return ''
    if (type === 'number') return value
    return String(value)
  }

  // Generate unique ID for accessibility if none provided
  const inputId = name || `form-field-${label.toLowerCase().replace(/\s+/g, '-')}`

  return (
    <div className={`space-y-1.5 ${className}`}>
      <div className="flex items-center justify-between">
        <label 
          htmlFor={inputId}
          className="block text-sm font-medium text-gray-700"
        >
          {label}
          {required && (
            <span 
              className="text-red-500 ml-1" 
              aria-label="required"
            >
              *
            </span>
          )}
        </label>
        
        {type === 'date' && (
          <span className="text-xs text-gray-500">
            Format: DD/MM/YYYY
          </span>
        )}
      </div>
      
      {type === 'date' ? (
        <DateInput
          id={inputId}
          name={name}
          value={String(value ?? '')}
          onChange={handleDateChange}
          required={required}
          disabled={disabled}
          placeholder={placeholder || 'DD/MM/YYYY'}
          className={getInputClassName(true)}
          min={min as string}
          max={max as string}
        />
      ) : (
        <div className="relative">
          <input
            id={inputId}
            name={name}
            type={type}
            value={getInputValue()}
            onChange={handleChange}
            placeholder={placeholder}
            required={required}
            disabled={disabled}
            step={step}
            min={min}
            max={max}
            autoComplete={autoComplete}
            className={getInputClassName()}
            aria-invalid={!!error}
            aria-describedby={error ? `${inputId}-error` : undefined}
          />
          
          {/* Show units for number inputs if specified */}
          {type === 'number' && placeholder?.includes('kg') && (
            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none">
              kg
            </span>
          )}
        </div>
      )}
      
      {/* Error message with better accessibility */}
      {error && (
        <p 
          id={`${inputId}-error`}
          className="text-sm text-red-600 mt-1 flex items-center gap-1"
          role="alert"
        >
          <svg 
            className="w-4 h-4 shrink-0" 
            fill="currentColor" 
            viewBox="0 0 20 20"
            aria-hidden="true"
          >
            <path 
              fillRule="evenodd" 
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" 
              clipRule="evenodd" 
            />
          </svg>
          {error}
        </p>
      )}
      
      {/* Helper text for number inputs with min/max */}
      {(type === 'number' && (min !== undefined || max !== undefined)) && (
        <p className="text-xs text-gray-500 mt-1">
          {min !== undefined && max !== undefined 
            ? `Range: ${min} - ${max}`
            : min !== undefined 
              ? `Minimum: ${min}`
              : `Maximum: ${max}`
          }
        </p>
      )}
    </div>
  )
}