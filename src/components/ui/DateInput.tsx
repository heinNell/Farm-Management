import { Calendar, ChevronLeft, ChevronRight, X } from 'lucide-react'
import React, { useCallback, useEffect, useRef, useState } from 'react'

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

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

// ISO → DD/MM/YYYY helper (defined outside component for reliable initialization)
const isoToDisplay = (iso: string): string => {
  if (!iso) return ''
  const parts = iso.split('-')
  if (parts.length !== 3) return ''
  const [year, month, day] = parts
  if (!year || !month || !day) return ''
  // Ensure proper padding
  const d = day.padStart(2, '0')
  const m = month.padStart(2, '0')
  return `${d}/${m}/${year}`
}

// DD/MM/YYYY → ISO helper (defined outside component)
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
  const [displayValue, setDisplayValue] = useState(() => isoToDisplay(value))
  const [isEditing, setIsEditing] = useState(false)
  const [showPicker, setShowPicker] = useState(false)
  const [viewDate, setViewDate] = useState<{ year: number; month: number }>(() => {
    if (value) {
      const parts = value.split('-').map(Number)
      const year = parts[0]
      const month = parts[1]
      if (year && month) {
        return { year, month: month - 1 }
      }
    }
    const now = new Date()
    return { year: now.getFullYear(), month: now.getMonth() }
  })
  
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Parse ISO date string
  const parseIsoDate = (iso: string): Date | null => {
    if (!iso) return null
    const [year, month, day] = iso.split('-').map(Number)
    if (!year || !month || !day) return null
    return new Date(year, month - 1, day)
  }

  // Check if a date is within min/max bounds
  const isDateDisabled = useCallback((date: Date): boolean => {
    if (min) {
      const minDate = parseIsoDate(min)
      if (minDate && date < minDate) return true
    }
    if (max) {
      const maxDate = parseIsoDate(max)
      if (maxDate && date > maxDate) return true
    }
    return false
  }, [min, max])

  // Generate calendar days
  const generateCalendarDays = useCallback(() => {
    const { year, month } = viewDate
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startDayOfWeek = firstDay.getDay()
    
    const days: Array<{ date: Date; isCurrentMonth: boolean; isToday: boolean; isSelected: boolean; isDisabled: boolean }> = []
    
    // Previous month days
    const prevMonthLastDay = new Date(year, month, 0).getDate()
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const date = new Date(year, month - 1, prevMonthLastDay - i)
      days.push({
        date,
        isCurrentMonth: false,
        isToday: false,
        isSelected: false,
        isDisabled: isDateDisabled(date)
      })
    }
    
    // Current month days
    const today = new Date()
    const selectedDate = parseIsoDate(value)
    
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day)
      const isToday = date.toDateString() === today.toDateString()
      const isSelected = selectedDate ? date.toDateString() === selectedDate.toDateString() : false
      
      days.push({
        date,
        isCurrentMonth: true,
        isToday,
        isSelected,
        isDisabled: isDateDisabled(date)
      })
    }
    
    // Next month days to fill the grid
    const remainingDays = 42 - days.length // 6 rows × 7 days
    for (let day = 1; day <= remainingDays; day++) {
      const date = new Date(year, month + 1, day)
      days.push({
        date,
        isCurrentMonth: false,
        isToday: false,
        isSelected: false,
        isDisabled: isDateDisabled(date)
      })
    }
    
    return days
  }, [viewDate, value, isDateDisabled])

  useEffect(() => {
    if (!isEditing) {
      setDisplayValue(isoToDisplay(value))
    }
  }, [value, isEditing])

  // Update view date when value changes
  useEffect(() => {
    if (value && !showPicker) {
      const [year, month] = value.split('-').map(Number)
      if (year && month) {
        setViewDate({ year, month: month - 1 })
      }
    }
  }, [value, showPicker])

  // Close picker on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowPicker(false)
      }
    }
    
    if (showPicker) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showPicker])

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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleBlur()
      return
    }
    
    if (['Backspace', 'Delete', 'Tab', 'Escape', 'ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) {
      if (e.key === 'Escape') {
        setShowPicker(false)
      }
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
    if (!disabled) {
      setShowPicker(!showPicker)
    }
  }

  const handleDateSelect = (date: Date) => {
    const iso = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
    onChange(iso)
    setDisplayValue(isoToDisplay(iso))
    setShowPicker(false)
  }

  const handlePrevMonth = () => {
    setViewDate(prev => {
      if (prev.month === 0) {
        return { year: prev.year - 1, month: 11 }
      }
      return { ...prev, month: prev.month - 1 }
    })
  }

  const handleNextMonth = () => {
    setViewDate(prev => {
      if (prev.month === 11) {
        return { year: prev.year + 1, month: 0 }
      }
      return { ...prev, month: prev.month + 1 }
    })
  }

  const handleToday = () => {
    const today = new Date()
    const iso = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
    if (!isDateDisabled(today)) {
      onChange(iso)
      setDisplayValue(isoToDisplay(iso))
    }
    setViewDate({ year: today.getFullYear(), month: today.getMonth() })
    setShowPicker(false)
  }

  const handleClear = () => {
    onChange('')
    setDisplayValue('')
    setShowPicker(false)
  }

  const calendarDays = generateCalendarDays()

  return (
    <div ref={containerRef} className="relative">
      {/* Input Field */}
      <div className="relative group">
        <div className={`absolute inset-0 rounded-lg transition-all duration-300 ${
          showPicker ? 'ring-2 ring-green-500/20 bg-green-50/30' : 'group-hover:bg-gray-50/50'
        }`} />
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
          className={`relative w-full pr-12 bg-white border-2 rounded-lg transition-all duration-200 font-medium tracking-wide ${className} ${
            disabled 
              ? 'bg-gray-50 cursor-not-allowed opacity-60 border-gray-200' 
              : showPicker 
                ? 'border-green-500 shadow-sm shadow-green-100' 
                : 'border-gray-200 hover:border-gray-300 focus:border-green-500 focus:shadow-sm focus:shadow-green-100'
          }`}
          autoComplete="off"
        />

        <button
          type="button"
          onClick={handleCalendarClick}
          disabled={disabled}
          className={`absolute right-1 top-1/2 -translate-y-1/2 p-2 rounded-lg transition-all duration-200 ${
            disabled 
              ? 'text-gray-300 cursor-not-allowed' 
              : showPicker
                ? 'text-white bg-green-500 shadow-md'
                : 'text-gray-400 hover:text-white hover:bg-green-500 hover:shadow-md'
          }`}
          tabIndex={-1}
          aria-label="Open calendar"
        >
          <Calendar className="h-4 w-4" />
        </button>
      </div>

      {/* Calendar Picker Dropdown */}
      {showPicker && (
        <div 
          className="absolute z-50 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 p-5 w-[320px]"
          style={{
            animation: 'fadeInScale 0.2s ease-out',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0, 0, 0, 0.05)'
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 active:scale-95 transition-all duration-150"
              aria-label="Previous month"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            
            <div className="flex items-center gap-1">
              <select
                value={viewDate.month}
                onChange={(e) => setViewDate(prev => ({ ...prev, month: parseInt(e.target.value) }))}
                className="text-base font-bold text-gray-800 bg-transparent border-none focus:ring-0 cursor-pointer hover:text-green-600 transition-colors pr-1"
              >
                {MONTHS.map((month, idx) => (
                  <option key={month} value={idx}>{month}</option>
                ))}
              </select>
              <select
                value={viewDate.year}
                onChange={(e) => setViewDate(prev => ({ ...prev, year: parseInt(e.target.value) }))}
                className="text-base font-bold text-gray-800 bg-transparent border-none focus:ring-0 cursor-pointer hover:text-green-600 transition-colors"
              >
                {Array.from({ length: 50 }, (_, i) => new Date().getFullYear() - 25 + i).map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
            
            <button
              type="button"
              onClick={handleNextMonth}
              className="p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 active:scale-95 transition-all duration-150"
              aria-label="Next month"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-0.5 mb-2">
            {DAYS.map(day => (
              <div key={day} className="text-center text-xs font-semibold text-gray-400 uppercase tracking-wider py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-0.5">
            {calendarDays.map((dayInfo, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => !dayInfo.isDisabled && handleDateSelect(dayInfo.date)}
                disabled={dayInfo.isDisabled}
                className={`
                  relative h-10 w-10 text-sm rounded-xl transition-all duration-150 font-medium
                  ${dayInfo.isSelected 
                    ? 'bg-gradient-to-br from-green-500 to-green-600 text-white shadow-lg shadow-green-200 scale-105 hover:shadow-xl' 
                    : dayInfo.isToday
                      ? 'bg-green-50 text-green-600 font-bold ring-2 ring-green-200'
                      : dayInfo.isCurrentMonth
                        ? dayInfo.isDisabled
                          ? 'text-gray-200 cursor-not-allowed'
                          : 'text-gray-700 hover:bg-green-50 hover:text-green-600 active:scale-95'
                        : 'text-gray-300'
                  }
                `}
              >
                {dayInfo.date.getDate()}
                {dayInfo.isToday && !dayInfo.isSelected && (
                  <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-green-500" />
                )}
              </button>
            ))}
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between mt-5 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={handleClear}
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-150 active:scale-95"
            >
              <X className="h-4 w-4" />
              Clear
            </button>
            <button
              type="button"
              onClick={handleToday}
              className="px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 rounded-xl shadow-md shadow-green-200 transition-all duration-150 active:scale-95"
            >
              Today
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeInScale {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(-4px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
      `}</style>
    </div>
  )
}

export default DateInput