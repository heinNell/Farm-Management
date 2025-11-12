import { motion } from 'framer-motion'
import { AlertTriangle, Bell, Calendar, Clock, Plus, Wrench } from 'lucide-react'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { useSupabaseCRUD } from '../../hooks/useSupabaseCRUD'
import { useSupabaseRealtime } from '../../hooks/useSupabaseRealtime'

interface MaintenanceTemplate {
  id: string
  name: string
  description: string
  maintenance_type: string
  category: string
  interval_type: 'hours' | 'days' | 'weeks' | 'months' | 'calendar'
  interval_value: number
  estimated_duration: number
  priority: 'low' | 'medium' | 'high' | 'critical'
  required_parts: string[]
  required_tools: string[]
  instructions: string
  safety_notes: string
  is_active: boolean
  created_at: string
  updated_at: string
}

interface MaintenanceSchedule {
  id: string
  template_id: string
  asset_id: string
  title: string
  maintenance_type: string
  category: string
  interval_type: string
  interval_value: number
  next_due_date: string
  last_completed_date: string
  status: 'scheduled' | 'due' | 'overdue' | 'in_progress' | 'completed' | 'cancelled'
  priority: 'low' | 'medium' | 'high' | 'critical'
  assigned_technician: string
  estimated_duration: number
  current_hours: number
  alert_thresholds: {
    hours_before: number[]
    days_before: number[]
  }
  created_at: string
  updated_at: string
  asset?: {
    name: string
    type: string
    location: string
  }
}

interface CalendarEvent {
  id: string
  schedule_id: string
  asset_id: string
  title: string
  start_time: string
  end_time: string
  assigned_to: string
  location: string
  status: string
  color: string
  created_at: string
  updated_at: string
}

export default function MaintenanceScheduler() {
  const [activeTab, setActiveTab] = useState<'calendar' | 'schedules' | 'templates'>('calendar')
  const selectedDate = new Date()
  const [calendarView, setCalendarView] = useState<'month' | 'week' | 'day'>('month')

  // CRUD hooks
  const templatesHook = useSupabaseCRUD<MaintenanceTemplate>('maintenance')
  const schedulesHook = useSupabaseCRUD<MaintenanceSchedule>('maintenance')
  const eventsHook = useSupabaseCRUD<CalendarEvent>('maintenance')

  // Real-time subscriptions
  useSupabaseRealtime<Record<string, unknown> & { id: string; created_at?: string }>({
    table: 'maintenance_schedules',
    onUpdate: () => {
      void schedulesHook.refresh()
    }
  })
  useSupabaseRealtime<Record<string, unknown> & { id: string; created_at?: string }>({
    table: 'maintenance_calendar_events',
    onUpdate: () => {
      void eventsHook.refresh()
    }
  })

  const templates = templatesHook.items
  const templatesLoading = templatesHook.loading
  const schedules = schedulesHook.items
  const schedulesLoading = schedulesHook.loading
  const events = eventsHook.items
  const eventsLoading = eventsHook.loading

  useEffect(() => {
    void templatesHook.refresh()
    void schedulesHook.refresh()
    void eventsHook.refresh()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-500 text-white'
      case 'high': return 'bg-orange-500 text-white'
      case 'medium': return 'bg-blue-500 text-white'
      case 'low': return 'bg-green-500 text-white'
      default: return 'bg-gray-500 text-white'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'overdue': return 'bg-red-100 text-red-800 border-red-200'
      case 'due': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'in_progress': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'scheduled': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'completed': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  // Helper function for creating schedules from templates (for future use)
  const createScheduleFromTemplate = async (template: MaintenanceTemplate, assetId: string, startDate: Date) => {
    try {
      const nextDueDate = new Date(startDate)
      
      // Calculate next due date based on interval
      switch (template.interval_type) {
        case 'hours':
          nextDueDate.setHours(nextDueDate.getHours() + template.interval_value)
          break
        case 'days':
          nextDueDate.setDate(nextDueDate.getDate() + template.interval_value)
          break
        case 'weeks':
          nextDueDate.setDate(nextDueDate.getDate() + (template.interval_value * 7))
          break
        case 'months':
          nextDueDate.setMonth(nextDueDate.getMonth() + template.interval_value)
          break
      }

      const scheduleData = {
        template_id: template.id,
        asset_id: assetId,
        title: template.name,
        description: template.description,
        maintenance_type: template.maintenance_type,
        category: template.category,
        interval_type: template.interval_type,
        interval_value: template.interval_value,
        next_due_date: nextDueDate.toISOString(),
        last_completed_date: startDate.toISOString(),
        status: 'scheduled' as const,
        priority: template.priority,
        assigned_technician: '',
        estimated_duration: template.estimated_duration,
        current_hours: 0,
        required_parts: template.required_parts,
        required_tools: template.required_tools,
        instructions: template.instructions,
        safety_notes: template.safety_notes,
        alert_thresholds: {
          hours_before: [48, 24, 1],
          days_before: [7, 3, 1]
        }
      }

      await schedulesHook.create(scheduleData)
      
      // Create corresponding calendar event
      const eventData = {
        schedule_id: '', // Will be updated after schedule creation
        asset_id: assetId,
        title: template.name,
        description: template.description,
        start_time: nextDueDate.toISOString(),
        end_time: new Date(nextDueDate.getTime() + template.estimated_duration * 60 * 60 * 1000).toISOString(),
        assigned_to: '',
        location: '',
        status: 'scheduled',
        color: template.priority === 'critical' ? '#DC2626' : 
               template.priority === 'high' ? '#EA580C' :
               template.priority === 'medium' ? '#2563EB' : '#059669'
      }

      await eventsHook.create(eventData)
      toast.success('Maintenance schedule created successfully')
      
      // Return for future use
      return true
    } catch (error) {
      console.error('Failed to create schedule:', error)
      toast.error('Failed to create maintenance schedule')
      return false
    }
  }
  void createScheduleFromTemplate // Suppress unused warning

  const updateScheduleStatus = async (scheduleId: string, status: MaintenanceSchedule['status']) => {
    try {
      await schedulesHook.update(scheduleId, { 
        status
      })
      toast.success('Schedule status updated')
    } catch (_error) {
      console.error('Failed to update schedule:', _error)
      toast.error('Failed to update schedule status')
    }
  }

  const rescheduleMaintenanceItem = async (scheduleId: string, newDate: Date) => {
    try {
      const schedule = schedules?.find((s: MaintenanceSchedule) => s.id === scheduleId)
      if (!schedule) return

      const endTime = new Date(newDate.getTime() + schedule.estimated_duration * 60 * 60 * 1000)

      await schedulesHook.update(scheduleId, {
        next_due_date: newDate.toISOString(),
        status: 'scheduled' as const
      })

      // Update calendar event
      const event = events?.find((e: CalendarEvent) => e.schedule_id === scheduleId)
      if (event) {
        await eventsHook.update(event.id, {
          start_time: newDate.toISOString(),
          end_time: endTime.toISOString()
        })
      }

      toast.success('Maintenance rescheduled successfully')
    } catch (_error) {
      console.error('Failed to reschedule:', _error)
      toast.error('Failed to reschedule maintenance')
    }
  }

  const generateAutomaticAlerts = () => {
    try {
      // This would typically be handled by a background service
      // For demo purposes, we'll simulate the alert generation
      const now = new Date()
      const alertSchedules = schedules?.filter((schedule: MaintenanceSchedule) => {
        const dueDate = new Date(schedule.next_due_date)
        const hoursUntilDue = (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60)
        
        return hoursUntilDue <= 48 && hoursUntilDue > 0 && 
               schedule.status === 'scheduled'
      })

      if (alertSchedules && alertSchedules.length > 0) {
        toast.success(`Generated ${alertSchedules.length} maintenance alerts`)
      } else {
        toast(`No alerts needed at this time`, { icon: 'ℹ️' })
      }
    } catch (_error) {
      console.error('Failed to generate alerts:', _error)
      toast.error('Failed to generate alerts')
    }
  }

  const renderCalendarView = () => {
    const currentMonth = selectedDate.getMonth()
    const currentYear = selectedDate.getFullYear()
    const firstDay = new Date(currentYear, currentMonth, 1).getDay()
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
    
    const calendarDays = []
    
    // Empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      calendarDays.push(<div key={`empty-${i}`} className="h-24 border border-gray-200" />)
    }
    
    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dayEvents = events?.filter(event => {
        const eventDate = new Date(event.start_time)
        return eventDate.getDate() === day && 
               eventDate.getMonth() === currentMonth && 
               eventDate.getFullYear() === currentYear
      }) || []
      
      calendarDays.push(
        <div key={day} className="h-24 border border-gray-200 p-1 overflow-hidden hover:bg-gray-50">
          <div className="font-medium text-sm mb-1">{day}</div>
          <div className="space-y-1">
            {dayEvents.slice(0, 2).map(event => (
              <div
                key={event.id}
                className={`text-xs p-1 rounded truncate cursor-pointer ${getStatusColor(event.status)}`}
                onClick={() => {
                  const schedule = schedules?.find((s: MaintenanceSchedule) => s.id === event.schedule_id)
                  if (schedule) console.log('Selected schedule:', schedule)
                }}
                title={event.title}
              >
                {event.title}
              </div>
            ))}
            {dayEvents.length > 2 && (
              <div className="text-xs text-gray-500">+{dayEvents.length - 2} more</div>
            )}
          </div>
        </div>
      )
    }
    
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold">
            {selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </h3>
          <div className="flex items-center gap-4">
            <div className="flex gap-2">
              <button
                onClick={() => setCalendarView('month')}
                className={`px-3 py-1 rounded text-sm ${calendarView === 'month' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
              >
                Month
              </button>
              <button
                onClick={() => setCalendarView('week')}
                className={`px-3 py-1 rounded text-sm ${calendarView === 'week' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
              >
                Week
              </button>
            </div>
            <button
              onClick={generateAutomaticAlerts}
              className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
            >
              <Bell className="h-4 w-4" />
              Generate Alerts
            </button>
          </div>
        </div>
        
        {/* Calendar Header */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="p-2 text-center font-medium text-gray-600 text-sm">
              {day}
            </div>
          ))}
        </div>
        
        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays}
        </div>
      </div>
    )
  }

  const renderSchedulesList = () => {
    const sortedSchedules = schedules?.sort((a, b) => {
      const statusPriority = { 'overdue': 1, 'due': 2, 'in_progress': 3, 'scheduled': 4 }
      return (statusPriority[a.status as keyof typeof statusPriority] || 5) - 
             (statusPriority[b.status as keyof typeof statusPriority] || 5)
    })

    return (
      <div className="space-y-4">
        {sortedSchedules?.map((schedule, index) => (
          <motion.div
            key={schedule.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-lg shadow-md p-6"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold">{schedule.title}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(schedule.status)}`}>
                    {schedule.status.replace('_', ' ').toUpperCase()}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(schedule.priority)}`}>
                    {schedule.priority.toUpperCase()}
                  </span>
                </div>
                <p className="text-gray-600 mb-2">{schedule.asset?.name} - {schedule.asset?.location}</p>
                <p className="text-sm text-gray-500">{schedule.maintenance_type}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Due Date</p>
                <p className="font-medium">
                  {new Date(schedule.next_due_date).toLocaleDateString()}
                </p>
                <p className="text-sm text-gray-500">
                  {schedule.estimated_duration}h estimated
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <span className="text-sm text-gray-500">Assigned To:</span>
                <p className="font-medium">{schedule.assigned_technician || 'Unassigned'}</p>
              </div>
              <div>
                <span className="text-sm text-gray-500">Interval:</span>
                <p className="font-medium">{schedule.interval_value} {schedule.interval_type}</p>
              </div>
              <div>
                <span className="text-sm text-gray-500">Last Completed:</span>
                <p className="font-medium">
                  {schedule.last_completed_date 
                    ? new Date(schedule.last_completed_date).toLocaleDateString()
                    : 'Never'
                  }
                </p>
              </div>
            </div>

            <div className="flex justify-between items-center pt-4 border-t">
              <div className="flex gap-2">
                <button
                  onClick={() => console.log('Selected schedule:', schedule)}
                  className="px-3 py-1 text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  View Details
                </button>
                <button
                  onClick={() => { void rescheduleMaintenanceItem(schedule.id, new Date(Date.now() + 24 * 60 * 60 * 1000)) }}
                  className="px-3 py-1 text-sm text-green-600 hover:text-green-700 font-medium"
                >
                  Reschedule
                </button>
              </div>
              <div className="flex gap-2">
                {schedule.status === 'scheduled' && (
                  <button
                    onClick={() => { void updateScheduleStatus(schedule.id, 'in_progress') }}
                    className="px-3 py-1 text-sm bg-yellow-500 text-white rounded hover:bg-yellow-600"
                  >
                    Start
                  </button>
                )}
                {schedule.status === 'in_progress' && (
                  <button
                    onClick={() => { void updateScheduleStatus(schedule.id, 'completed') }}
                    className="px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600"
                  >
                    Complete
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    )
  }

  const renderTemplatesList = () => {
    const activeTemplates = templates?.filter(template => template.is_active)

    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Maintenance Templates</h3>
          <button
            onClick={() => console.log('Create new template')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            New Template
          </button>
        </div>

        {activeTemplates?.map((template: MaintenanceTemplate, index: number) => (
          <motion.div
            key={template.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-lg shadow-md p-6"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h4 className="text-lg font-semibold">{template.name}</h4>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(template.priority)}`}>
                    {template.priority.toUpperCase()}
                  </span>
                  <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800">
                    {template.category}
                  </span>
                </div>
                <p className="text-gray-600 mb-2">{template.description}</p>
                <p className="text-sm text-gray-500">{template.maintenance_type}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div>
                <span className="text-sm text-gray-500">Interval:</span>
                <p className="font-medium">{template.interval_value} {template.interval_type}</p>
              </div>
              <div>
                <span className="text-sm text-gray-500">Duration:</span>
                <p className="font-medium">{template.estimated_duration}h</p>
              </div>
              <div>
                <span className="text-sm text-gray-500">Required Parts:</span>
                <p className="font-medium">{template.required_parts?.length || 0} items</p>
              </div>
              <div>
                <span className="text-sm text-gray-500">Required Tools:</span>
                <p className="font-medium">{template.required_tools?.length || 0} items</p>
              </div>
            </div>

            {template.safety_notes && (
              <div className="mb-4 p-3 bg-yellow-50 border-l-4 border-yellow-400">
                <div className="flex items-center">
                  <AlertTriangle className="h-4 w-4 text-yellow-600 mr-2" />
                  <span className="text-sm font-medium text-yellow-800">Safety Notes:</span>
                </div>
                <p className="text-sm text-yellow-700 mt-1">{template.safety_notes}</p>
              </div>
            )}

            <div className="flex justify-between items-center pt-4 border-t">
              <button
                onClick={() => {/* Open template details modal */}}
                className="px-3 py-1 text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Edit Template
              </button>
              <button
                onClick={() => console.log('Create schedule from template')}
                className="px-4 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700"
              >
                Create Schedule
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    )
  }

  if (templatesLoading || schedulesLoading || eventsLoading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row gap-4 justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Maintenance Scheduler</h1>
          <p className="text-gray-600">Advanced maintenance planning and automation</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex rounded-lg border border-gray-300 overflow-hidden">
            <button
              onClick={() => setActiveTab('calendar')}
              className={`px-4 py-2 text-sm font-medium flex items-center gap-2 ${
                activeTab === 'calendar' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Calendar className="h-4 w-4" />
              Calendar
            </button>
            <button
              onClick={() => setActiveTab('schedules')}
              className={`px-4 py-2 text-sm font-medium flex items-center gap-2 ${
                activeTab === 'schedules' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Clock className="h-4 w-4" />
              Schedules
            </button>
            <button
              onClick={() => setActiveTab('templates')}
              className={`px-4 py-2 text-sm font-medium flex items-center gap-2 ${
                activeTab === 'templates' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Wrench className="h-4 w-4" />
              Templates
            </button>
          </div>
          
          <button
            onClick={() => console.log('Schedule new maintenance')}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <Plus className="h-4 w-4" />
            Schedule Maintenance
          </button>
        </div>
      </div>

      {/* Content */}
      {activeTab === 'calendar' && renderCalendarView()}
      {activeTab === 'schedules' && renderSchedulesList()}
      {activeTab === 'templates' && renderTemplatesList()}
    </div>
  )
}
