import { Calendar } from 'lucide-react'
import React, { useEffect, useRef, useState } from 'react'

interface DateInputProps {
  id?: string
  name?: string
  value: string // ISO: YYYY-MM-DD
  onChange: (value: string) => void
  className?: string
  placeholder?: string
  required?: boolean
  disabled?: boolean
  min?: string
  max?: string
}

export const DateInput: React.FC<DateInputProps> = ({
  id,
  name,
  value,
  onChange,
  className = '',
  placeholder = 'DD/MM/YYYY',
  required = false,
  disabled = false,
  min,
  max,
}) => {
  const [displayValue, setDisplayValue] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const hiddenDateRef = useRef<HTMLInputElement>(null)

  // ISO → DD/MM/YYYY
  const isoToDisplay = (iso: string): string => {
    if (!iso) return ''
    const [year, month, day] = iso.split('-')
    if (!year || !month || !day) return ''
    return `${day}/${month}/${year}`
  }

  // DD/MM/YYYY → ISO (lenient, allows - or /)
  const displayToIso = (display: string): string => {
    if (!display) return ''
    const parts = display.split(/[/-]/)
    if (parts.length !== 3) return ''
    const [day, month, year] = parts.map(p => p.trim())

    if (!day || !month || !year) return ''

    const d = parseInt(day, 10)
    const m = parseInt(month, 10)
    const y = parseInt(year, 10)

    if (isNaN(d) || isNaN(m) || isNaN(y)) return ''
    if (d < 1 || d > 31 || m < 1 || m > 12 || y < 1900 || y > 2100) return ''

    return `${y.toString().padStart(4, '0')}-${m.toString().padStart(2, '0')}-${d.toString().padStart(2, '0')}`
  }

  useEffect(() => {
    if (!isEditing) {
      setDisplayValue(isoToDisplay(value))
    }
  }, [value, isEditing])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDisplayValue(e.target.value)
  }

  const handleBlur = () => {
    setIsEditing(false)
    const iso = displayToIso(displayValue)
    if (iso) {
      setDisplayValue(isoToDisplay(iso))
      onChange(iso)
    } else if (displayValue) {
      // Invalid → revert
      setDisplayValue(isoToDisplay(value))
    }
  }

  const handleFocus = () => setIsEditing(true)

  const handleNativeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const iso = e.target.value
    if (iso) {
      onChange(iso)
      setDisplayValue(isoToDisplay(iso))
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (['Backspace', 'Delete', 'Tab', 'Escape', 'ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) {
      return
    }

    // Only allow digits and slash
    if (!/[0-9/]/.test(e.key)) {
      e.preventDefault()
      return
    }

    const val = displayValue
    const len = val.length

    // Auto insert slash
    if ((len === 2 || len === 5) && e.key !== '/') {
      e.preventDefault()
      setDisplayValue(val + '/' + e.key)
      return
    }

    // Basic length protection per section
    const parts = val.split('/')
    const currentPartIndex = parts.length - 1
    const currentPart = parts[currentPartIndex] || ''

    if (currentPartIndex === 0 && currentPart.length >= 2) { // day
      e.preventDefault()
    } else if (currentPartIndex === 1 && currentPart.length >= 2) { // month
      e.preventDefault()
    } else if (currentPartIndex === 2 && currentPart.length >= 4) { // year
      e.preventDefault()
    }
  }

  const handleCalendarClick = () => {
    hiddenDateRef.current?.showPicker?.()
    hiddenDateRef.current?.click()
  }

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        inputMode="numeric"
        pattern="[0-9/]*"
        id={id}
        name={name}
        value={displayValue}
        onChange={handleChange}
        onBlur={handleBlur}
        onFocus={handleFocus}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        maxLength={10}
        className={`w-full pr-10 ${className}`}
        autoComplete="off"
      />

      <button
        type="button"
        onClick={handleCalendarClick}
        disabled={disabled}
        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 focus:outline-none"
        tabIndex={-1}
      >
        <Calendar className="h-4 w-4" />
      </button>

      {/* Hidden native picker */}
      <input
        ref={hiddenDateRef}
        type="date"
        value={value}
        onChange={handleNativeChange}
        min={min}
        max={max}
        className="absolute opacity-0 w-0 h-0 pointer-events-none"
        tabIndex={-1}
        aria-hidden="true"
      />
    </div>
  )
}

export default DateInput