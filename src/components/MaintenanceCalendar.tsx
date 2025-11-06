
import React, { useState } from 'react'
import {ChevronLeft, ChevronRight, Calendar as CalendarIcon} from 'lucide-react'
import { motion } from 'framer-motion'

interface MaintenanceItem {
  id: string
  equipmentName: string
  maintenanceType: string
  scheduledDate: string
  priority: string
  status: string
}

interface MaintenanceCalendarProps {
  maintenanceItems: MaintenanceItem[]
}

export default function MaintenanceCalendar({ maintenanceItems }: MaintenanceCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const getMaintenanceForDate = (day: number) => {
    const targetDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
    return maintenanceItems.filter(item => {
      const itemDate = new Date(item.scheduledDate)
      return itemDate.toDateString() === targetDate.toDateString()
    })
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate)
    if (direction === 'prev') {
      newDate.setMonth(currentDate.getMonth() - 1)
    } else {
      newDate.setMonth(currentDate.getMonth() + 1)
    }
    setCurrentDate(newDate)
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-green-500'
      case 'medium': return 'bg-yellow-500'
      case 'high': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800'
      case 'in_progress': return 'bg-yellow-100 text-yellow-800'
      case 'upcoming': return 'bg-orange-100 text-orange-800'
      default: return 'bg-blue-100 text-blue-800'
    }
  }

  const daysInMonth = getDaysInMonth(currentDate)
  const firstDay = getFirstDayOfMonth(currentDate)
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)
  const emptyDays = Array.from({ length: firstDay }, (_, i) => i)

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-gray-900 flex items-center">
          <CalendarIcon className="h-6 w-6 mr-2 text-green-600" />
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h3>
        <div className="flex gap-2">
          <button
            onClick={() => navigateMonth('prev')}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={() => navigateMonth('next')}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Day Headers */}
        {dayNames.map(day => (
          <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
            {day}
          </div>
        ))}

        {/* Empty Days */}
        {emptyDays.map(day => (
          <div key={`empty-${day}`} className="p-2 h-24" />
        ))}

        {/* Calendar Days */}
        {days.map(day => {
          const dayMaintenance = getMaintenanceForDate(day)
          const isToday = new Date().toDateString() === new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString()
          
          return (
            <motion.div
              key={day}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: day * 0.01 }}
              className={`p-2 h-24 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors ${
                isToday ? 'bg-green-50 border-green-200' : ''
              }`}
            >
              <div className={`text-sm font-medium mb-1 ${
                isToday ? 'text-green-600' : 'text-gray-900'
              }`}>
                {day}
              </div>
              
              <div className="space-y-1">
                {dayMaintenance.slice(0, 2).map(item => (
                  <div
                    key={item.id}
                    className={`text-xs p-1 rounded text-center truncate ${getStatusColor(item.status)}`}
                    title={`${item.equipmentName} - ${item.maintenanceType}`}
                  >
                    <div className="flex items-center justify-center">
                      <div className={`w-2 h-2 rounded-full mr-1 ${getPriorityColor(item.priority)}`} />
                      <span className="truncate">{item.maintenanceType}</span>
                    </div>
                  </div>
                ))}
                
                {dayMaintenance.length > 2 && (
                  <div className="text-xs text-gray-500 text-center">
                    +{dayMaintenance.length - 2} more
                  </div>
                )}
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Legend */}
      <div className="mt-6 flex flex-wrap gap-4 text-sm">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-red-500 rounded-full mr-2" />
          <span className="text-gray-600">High Priority</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2" />
          <span className="text-gray-600">Medium Priority</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-green-500 rounded-full mr-2" />
          <span className="text-gray-600">Low Priority</span>
        </div>
      </div>
    </div>
  )
}
