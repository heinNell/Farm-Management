import { supabase } from '../lib/supabase'
import type { Inspection } from '../types/database'

export interface InspectionAlert {
  id: string
  inspection_id: string
  alert_type: 'upcoming' | 'overdue' | 'today'
  message: string
  hours_until_due: number
  days_until_due: number
  acknowledged: boolean
  acknowledged_by: string | null
  acknowledged_at: string | null
  created_at: string
  updated_at: string
}

type InspectionAlertInsert = Omit<InspectionAlert, 'id' | 'created_at' | 'updated_at'>

export class InspectionAlertService {
  /**
   * Generate alerts for inspections that are due soon or overdue
   */
  static async generateAlerts(): Promise<{ created: number; errors: string[] }> {
    const now = new Date()
    const errors: string[] = []
    let created = 0

    try {
      // Fetch all scheduled and in-progress inspections
      const { data: inspections, error: fetchError } = await supabase
        .from('inspections')
        .select('*')
        .in('status', ['scheduled', 'in_progress'])

      if (fetchError) throw fetchError

      if (!inspections || inspections.length === 0) {
        return { created: 0, errors: [] }
      }

      // Check existing alerts to avoid duplicates
      const { data: existingAlerts, error: alertsFetchError } = await supabase
        .from('inspection_alerts')
        .select('inspection_id')
        .eq('acknowledged', false)

      if (alertsFetchError) {
        errors.push(`Failed to fetch existing alerts: ${alertsFetchError.message}`)
      }

      const existingInspectionIds = new Set(
        (existingAlerts ?? []).map((alert: { inspection_id: string }) => alert.inspection_id)
      )

      // Generate alerts for inspections
      const alertsToCreate: InspectionAlertInsert[] = []

      for (const inspection of inspections as Inspection[]) {
        // Skip if alert already exists
        if (existingInspectionIds.has(inspection.id)) {
          continue
        }

        const dueDate = new Date(inspection.scheduled_date)
        const msUntilDue = dueDate.getTime() - now.getTime()
        const hoursUntilDue = msUntilDue / (1000 * 60 * 60)
        const daysUntilDue = msUntilDue / (1000 * 60 * 60 * 24)

        let alertType: 'upcoming' | 'overdue' | 'today'
        let message: string

        if (hoursUntilDue < 0) {
          // Overdue
          const daysOverdue = Math.abs(Math.floor(daysUntilDue))
          alertType = 'overdue'
          message = `OVERDUE: ${inspection.title} (${inspection.type}) is ${daysOverdue} day${daysOverdue !== 1 ? 's' : ''} overdue. Inspector: ${inspection.inspector}`
        } else if (hoursUntilDue <= 24) {
          // Due today/within 24 hours
          alertType = 'today'
          message = `TODAY: ${inspection.title} (${inspection.type}) scheduled for ${dueDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}. Inspector: ${inspection.inspector}`
        } else if (daysUntilDue <= 7) {
          // Upcoming - due within 7 days
          alertType = 'upcoming'
          message = `Upcoming: ${inspection.title} (${inspection.type}) due in ${Math.ceil(daysUntilDue)} days on ${dueDate.toLocaleDateString()}. Inspector: ${inspection.inspector}`
        } else {
          // Not urgent enough for an alert
          continue
        }

        alertsToCreate.push({
          inspection_id: inspection.id,
          alert_type: alertType,
          message,
          hours_until_due: Math.round(hoursUntilDue * 10) / 10,
          days_until_due: Math.round(daysUntilDue * 10) / 10,
          acknowledged: false,
          acknowledged_by: null,
          acknowledged_at: null
        })
      }

      // Check if inspection_alerts table exists, if not we skip DB insertion
      // but still return the alerts for UI display
      if (alertsToCreate.length > 0) {
        const { error: insertError } = await supabase
          .from('inspection_alerts')
          .insert(alertsToCreate)

        if (insertError) {
          // Table might not exist yet, log but don't fail
          console.warn('Could not insert inspection alerts:', insertError.message)
          // Return generated alerts for in-memory use
          return { created: alertsToCreate.length, errors: [`DB insert failed: ${insertError.message}`] }
        } else {
          created = alertsToCreate.length
        }
      }

      return { created, errors }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      return { created: 0, errors: [message] }
    }
  }

  /**
   * Get upcoming inspections for dashboard display (doesn't require alerts table)
   */
  static async getUpcomingInspections(withinDays = 7): Promise<Inspection[]> {
    const now = new Date()
    const futureDate = new Date()
    futureDate.setDate(futureDate.getDate() + withinDays)

    const { data, error } = await supabase
      .from('inspections')
      .select('*')
      .in('status', ['scheduled', 'in_progress'])
      .gte('scheduled_date', now.toISOString())
      .lte('scheduled_date', futureDate.toISOString())
      .order('scheduled_date', { ascending: true })

    if (error) throw error
    return (data as Inspection[]) ?? []
  }

  /**
   * Get overdue inspections
   */
  static async getOverdueInspections(): Promise<Inspection[]> {
    const now = new Date()

    const { data, error } = await supabase
      .from('inspections')
      .select('*')
      .in('status', ['scheduled', 'in_progress'])
      .lt('scheduled_date', now.toISOString())
      .order('scheduled_date', { ascending: true })

    if (error) throw error
    return (data as Inspection[]) ?? []
  }

  /**
   * Get today's inspections
   */
  static async getTodaysInspections(): Promise<Inspection[]> {
    const today = new Date()
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)

    const { data, error } = await supabase
      .from('inspections')
      .select('*')
      .in('status', ['scheduled', 'in_progress'])
      .gte('scheduled_date', startOfDay.toISOString())
      .lt('scheduled_date', endOfDay.toISOString())
      .order('scheduled_date', { ascending: true })

    if (error) throw error
    return (data as Inspection[]) ?? []
  }

  /**
   * Get all unacknowledged alerts (requires alerts table)
   */
  static async getUnacknowledgedAlerts(): Promise<InspectionAlert[]> {
    const { data, error } = await supabase
      .from('inspection_alerts')
      .select('*')
      .eq('acknowledged', false)
      .order('created_at', { ascending: false })

    if (error) {
      console.warn('Could not fetch inspection alerts:', error.message)
      return []
    }
    return (data as InspectionAlert[]) ?? []
  }

  /**
   * Acknowledge an alert
   */
  static async acknowledgeAlert(
    alertId: string,
    acknowledgedBy: string
  ): Promise<InspectionAlert | null> {
    const response = await supabase
      .from('inspection_alerts')
      .update({
        acknowledged: true,
        acknowledged_by: acknowledgedBy,
        acknowledged_at: new Date().toISOString()
      })
      .eq('id', alertId)
      .select()
      .single()

    if (response.error) {
      console.warn('Could not acknowledge alert:', response.error.message)
      return null
    }
    return response.data as InspectionAlert
  }

  /**
   * Get inspection alert statistics (works without alerts table using inspections directly)
   */
  static async getAlertStats(): Promise<{
    total: number
    today: number
    overdue: number
    upcoming: number
  }> {
    const now = new Date()
    const today = new Date()
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)
    const weekFromNow = new Date()
    weekFromNow.setDate(weekFromNow.getDate() + 7)

    const { data: inspections, error } = await supabase
      .from('inspections')
      .select('scheduled_date, status')
      .in('status', ['scheduled', 'in_progress'])

    if (error) throw error

    const stats = {
      total: inspections?.length ?? 0,
      today: 0,
      overdue: 0,
      upcoming: 0
    }

    if (inspections) {
      for (const inspection of inspections as { scheduled_date: string; status: string }[]) {
        const scheduledDate = new Date(inspection.scheduled_date)
        
        if (scheduledDate < now) {
          stats.overdue++
        } else if (scheduledDate >= todayStart && scheduledDate < todayEnd) {
          stats.today++
        } else if (scheduledDate <= weekFromNow) {
          stats.upcoming++
        }
      }
    }

    return stats
  }

  /**
   * Get inspectors with scheduled inspections (for notification display)
   */
  static async getInspectorsWithUpcomingWork(): Promise<{ inspector: string; count: number }[]> {
    const weekFromNow = new Date()
    weekFromNow.setDate(weekFromNow.getDate() + 7)

    const { data, error } = await supabase
      .from('inspections')
      .select('inspector')
      .in('status', ['scheduled', 'in_progress'])
      .lte('scheduled_date', weekFromNow.toISOString())

    if (error) throw error

    // Count inspections per inspector
    const typedData = (data ?? []) as { inspector: string }[]
    const inspectorCounts = typedData.reduce<Record<string, number>>((acc, { inspector }) => {
      acc[inspector] = (acc[inspector] || 0) + 1
      return acc
    }, {})

    return Object.entries(inspectorCounts).map(([inspector, count]) => ({
      inspector,
      count
    }))
  }
}
