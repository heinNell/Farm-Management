import { supabase } from '../lib/supabase';
import type { MaintenanceAlert, MaintenanceAlertInsert, MaintenanceSchedule } from '../types/database';

export class MaintenanceAlertService {
  /**
   * Generate alerts for maintenance schedules that are due soon or overdue
   */
  static async generateAlerts(): Promise<{ created: number; errors: string[] }> {
    try {
      const now = new Date()
      const errors: string[] = []
      let created = 0

      // Fetch all scheduled and in-progress maintenance
      const { data: schedules, error: fetchError } = await supabase
        .from('maintenance_schedules')
        .select('*')
        .in('status', ['scheduled', 'in_progress'])

      if (fetchError) throw fetchError

      if (!schedules || schedules.length === 0) {
        return { created: 0, errors: [] }
      }

      // Check existing alerts to avoid duplicates
      const { data: existingAlerts, error: alertsFetchError } = await supabase
        .from('maintenance_alerts')
        .select('schedule_id')
        .eq('acknowledged', false)

      if (alertsFetchError) {
        errors.push(`Failed to fetch existing alerts: ${alertsFetchError.message}`)
      }

      const existingScheduleIds = new Set(
        (existingAlerts ?? []).map((alert: { schedule_id: string }) => alert.schedule_id)
      )

      // Generate alerts for schedules
      const alertsToCreate: MaintenanceAlertInsert[] = []

      for (const schedule of schedules as MaintenanceSchedule[]) {
        // Skip if alert already exists
        if (existingScheduleIds.has(schedule.id)) {
          continue
        }

        const dueDate = new Date(schedule.next_due_date)
        const msUntilDue = dueDate.getTime() - now.getTime()
        const hoursUntilDue = msUntilDue / (1000 * 60 * 60)
        const daysUntilDue = msUntilDue / (1000 * 60 * 60 * 24)

        let alertType: 'upcoming' | 'overdue' | 'critical'
        let message: string

        if (hoursUntilDue < 0) {
          // Overdue
          const daysOverdue = Math.abs(Math.floor(daysUntilDue))
          alertType = 'overdue'
          message = `OVERDUE: ${schedule.equipment_name} - ${schedule.maintenance_type} is ${daysOverdue} day${daysOverdue !== 1 ? 's' : ''} overdue`
        } else if (hoursUntilDue <= 24) {
          // Critical - due within 24 hours
          alertType = 'critical'
          message = `CRITICAL: ${schedule.equipment_name} - ${schedule.maintenance_type} due in ${Math.round(hoursUntilDue)} hours`
        } else if (daysUntilDue <= 7) {
          // Upcoming - due within 7 days
          alertType = 'upcoming'
          message = `Upcoming: ${schedule.equipment_name} - ${schedule.maintenance_type} due in ${Math.ceil(daysUntilDue)} days`
        } else {
          // Not urgent enough for an alert
          continue
        }

        alertsToCreate.push({
          schedule_id: schedule.id,
          alert_type: alertType,
          message,
          hours_until_due: Math.round(hoursUntilDue * 10) / 10,
          days_until_due: Math.round(daysUntilDue * 10) / 10,
          acknowledged: false,
          acknowledged_by: null,
          acknowledged_at: null
        })
      }

      // Batch insert alerts
      if (alertsToCreate.length > 0) {
        const { error: insertError } = await supabase
          .from('maintenance_alerts')
          .insert(alertsToCreate)

        if (insertError) {
          errors.push(`Failed to create alerts: ${insertError.message}`)
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
   * Get all unacknowledged alerts
   */
  static async getUnacknowledgedAlerts(): Promise<MaintenanceAlert[]> {
    const { data, error } = await supabase
      .from('maintenance_alerts')
      .select('*')
      .eq('acknowledged', false)
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data as MaintenanceAlert[]) ?? []
  }

  /**
   * Acknowledge an alert
   */
  static async acknowledgeAlert(
    alertId: string,
    acknowledgedBy: string
  ): Promise<MaintenanceAlert> {
    const response = await supabase
      .from('maintenance_alerts')
      .update({
        acknowledged: true,
        acknowledged_by: acknowledgedBy,
        acknowledged_at: new Date().toISOString()
      })
      .eq('id', alertId)
      .select()
      .single()

    if (response.error) throw response.error
    if (!response.data) throw new Error('No data returned from acknowledgment')
    return response.data as MaintenanceAlert
  }

  /**
   * Get alerts for a specific maintenance schedule
   */
  static async getAlertsForSchedule(scheduleId: string): Promise<MaintenanceAlert[]> {
    const { data, error } = await supabase
      .from('maintenance_alerts')
      .select('*')
      .eq('schedule_id', scheduleId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data as MaintenanceAlert[]) ?? []
  }

  /**
   * Delete old acknowledged alerts (cleanup)
   */
  static async cleanupOldAlerts(daysOld = 30): Promise<number> {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - daysOld)

    const { data, error } = await supabase
      .from('maintenance_alerts')
      .delete()
      .eq('acknowledged', true)
      .lt('acknowledged_at', cutoffDate.toISOString())
      .select()

    if (error) throw error
    return (data ?? []).length
  }

  /**
   * Get alert statistics
   */
  static async getAlertStats(): Promise<{
    total: number
    critical: number
    overdue: number
    upcoming: number
    acknowledged: number
  }> {
    const { data: alerts, error } = await supabase
      .from('maintenance_alerts')
      .select('alert_type, acknowledged')

    if (error) throw error

    const stats = {
      total: alerts?.length ?? 0,
      critical: 0,
      overdue: 0,
      upcoming: 0,
      acknowledged: 0
    }

    if (alerts) {
      for (const alert of alerts) {
        if (alert.acknowledged) stats.acknowledged++
        if (alert.alert_type === 'critical') stats.critical++
        if (alert.alert_type === 'overdue') stats.overdue++
        if (alert.alert_type === 'upcoming') stats.upcoming++
      }
    }

    return stats
  }
}
