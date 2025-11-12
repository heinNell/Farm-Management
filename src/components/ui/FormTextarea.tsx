
import React, { useEffect, useRef } from 'react'

interface FormTextareaProps {
  label: string
  name: string
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
  required?: boolean
  error?: string | undefined
  rows?: number
  maxLength?: number
  autoResize?: boolean
  className?: string
}

export default function FormTextarea({
  label,
  name,
  value = '',
  onChange,
  placeholder,
  required = false,
  error,
  rows = 3,
  maxLength,
  autoResize = false,
  className = ''
}: FormTextareaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange?.(e.target.value)
  }

  useEffect(() => {
    if (autoResize && textareaRef.current) {
      const textarea = textareaRef.current
      textarea.style.height = 'auto'
      textarea.style.height = `${textarea.scrollHeight}px`
    }
  }, [value, autoResize])

  return (
    <div className={`space-y-1 ${className}`}>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      <textarea
        ref={textareaRef}
        id={name}
        name={name}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        required={required}
        rows={autoResize ? 1 : rows}
        maxLength={maxLength}
        className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors resize-none ${
          error 
            ? 'border-red-300 focus:ring-red-500' 
            : 'border-gray-300 hover:border-gray-400'
        }`}
        style={autoResize ? { minHeight: `${rows * 1.5}rem` } : {}}
      />
      
      <div className="flex justify-between items-center">
        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}
        {maxLength && (
          <p className="text-sm text-gray-500 ml-auto">
            {value.length}/{maxLength}
          </p>
        )}
      </div>
    </div>
  )
}
