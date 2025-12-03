import { useEffect, useRef } from 'react'
import toast from 'react-hot-toast'
import { InspectionAlertService } from '../services/inspectionAlerts'
import { MaintenanceAlertService } from '../services/maintenanceAlerts'

interface AlertStats {
  maintenance: {
    created: number
    errors: string[]
  }
  inspections: {
    today: number
    overdue: number
    upcoming: number
  }
}

/**
 * Hook that automatically generates maintenance and inspection alerts
 * Runs on app load and periodically (every 30 minutes)
 */
export function useAutomatedAlerts(enabled = true) {
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const hasInitializedRef = useRef(false)

  useEffect(() => {
    if (!enabled) return

    const generateAlerts = async (): Promise<AlertStats> => {
      const stats: AlertStats = {
        maintenance: { created: 0, errors: [] },
        inspections: { today: 0, overdue: 0, upcoming: 0 }
      }

      try {
        // Generate maintenance alerts
        const maintenanceResult = await MaintenanceAlertService.generateAlerts()
        stats.maintenance = maintenanceResult

        if (maintenanceResult.created > 0) {
          console.log(`[AutoAlerts] Created ${maintenanceResult.created} maintenance alerts`)
        }

        // Get inspection stats (doesn't create DB entries, just calculates)
        const inspectionStats = await InspectionAlertService.getAlertStats()
        stats.inspections = inspectionStats

        return stats
      } catch (error) {
        console.error('[AutoAlerts] Error generating alerts:', error)
        return stats
      }
    }

    const showNotifications = (stats: AlertStats) => {
      // Show toast for critical issues
      if (stats.inspections.overdue > 0) {
        toast.error(
          `⚠️ ${stats.inspections.overdue} overdue inspection${stats.inspections.overdue > 1 ? 's' : ''} require attention`,
          { duration: 6000, id: 'overdue-inspections' }
        )
      }

      if (stats.inspections.today > 0) {
        toast(
          `📋 ${stats.inspections.today} inspection${stats.inspections.today > 1 ? 's' : ''} scheduled for today`,
          { duration: 5000, icon: '📋', id: 'today-inspections' }
        )
      }

      if (stats.maintenance.created > 0) {
        toast(
          `🔧 ${stats.maintenance.created} new maintenance alert${stats.maintenance.created > 1 ? 's' : ''} generated`,
          { duration: 5000, icon: '🔧', id: 'new-maintenance-alerts' }
        )
      }
    }

    const runAlertGeneration = async (showToasts = true) => {
      const stats = await generateAlerts()
      if (showToasts) {
        showNotifications(stats)
      }
    }

    // Initial run on mount (with slight delay to not block initial render)
    if (!hasInitializedRef.current) {
      hasInitializedRef.current = true
      setTimeout(() => {
        void runAlertGeneration(true)
      }, 2000)
    }

    // Set up periodic checks (every 30 minutes)
    intervalRef.current = setInterval(() => {
      void runAlertGeneration(false) // Don't show toasts for periodic checks
    }, 30 * 60 * 1000) // 30 minutes

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [enabled])
}

export default useAutomatedAlerts
