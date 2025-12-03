
import { Asset, ComprehensiveFuelKPI, FuelRecord, OperatingSession } from '../types/database'

export class FuelKPICalculator {
  private assets: Asset[]
  private fuelRecords: FuelRecord[]
  private operatingSessions: OperatingSession[]

  constructor(assets: Asset[], fuelRecords: FuelRecord[], operatingSessions: OperatingSession[]) {
    this.assets = assets
    this.fuelRecords = fuelRecords
    this.operatingSessions = operatingSessions
  }

  // 1. Fuel Consumption Rate (L/H) - Primary KPI
  // Uses operating_sessions first, falls back to fuel_records data
  calculateFuelConsumptionRate(assetId?: string): number {
    // First try operating sessions
    const sessions = assetId 
      ? this.operatingSessions.filter(s => s.asset_id === assetId)
      : this.operatingSessions

    const sessionFuelConsumed = sessions.reduce((sum, session) => sum + (session.fuel_consumed ?? 0), 0)
    const sessionHours = sessions.reduce((sum, session) => sum + (session.operating_hours ?? 0), 0)

    // If we have operating session data, use it
    if (sessionHours > 0) {
      return sessionFuelConsumed / sessionHours
    }

    // Fall back to fuel_records data (consumption_rate and hour_difference)
    const records = assetId 
      ? this.fuelRecords.filter(r => r.asset_id === assetId)
      : this.fuelRecords

    const totalFuelFromRecords = records.reduce((sum, r) => sum + r.quantity, 0)
    const totalHoursFromRecords = records.reduce((sum, r) => sum + (r.hour_difference ?? 0), 0)

    return totalHoursFromRecords > 0 ? totalFuelFromRecords / totalHoursFromRecords : 0
  }

  // Helper to get total operating hours from both sources
  getTotalOperatingHours(assetId?: string): number {
    // From operating sessions
    const sessions = assetId 
      ? this.operatingSessions.filter(s => s.asset_id === assetId)
      : this.operatingSessions
    const sessionHours = sessions.reduce((sum, s) => sum + (s.operating_hours ?? 0), 0)

    // From fuel records
    const records = assetId 
      ? this.fuelRecords.filter(r => r.asset_id === assetId)
      : this.fuelRecords
    const recordHours = records.reduce((sum, r) => sum + (r.hour_difference ?? 0), 0)

    // Return whichever is greater, or combine if both have data
    return Math.max(sessionHours, recordHours)
  }

  // Helper to get total fuel consumed from both sources
  getTotalFuelConsumed(assetId?: string): number {
    // From operating sessions
    const sessions = assetId 
      ? this.operatingSessions.filter(s => s.asset_id === assetId)
      : this.operatingSessions
    const sessionFuel = sessions.reduce((sum, s) => sum + (s.fuel_consumed ?? 0), 0)

    // From fuel records
    const records = assetId 
      ? this.fuelRecords.filter(r => r.asset_id === assetId)
      : this.fuelRecords
    const recordFuel = records.reduce((sum, r) => sum + r.quantity, 0)

    // Prefer fuel records as they track actual fill-ups
    return recordFuel > 0 ? recordFuel : sessionFuel
  }

  // 2. Average Fleet Fuel Consumption (L/H)
  calculateAverageFleetConsumption(): number {
    return this.calculateFuelConsumptionRate()
  }

  // 3. Equipment Type Average (L/H)
  calculateEquipmentTypeAverages(): Record<string, number> {
    const typeAverages: Record<string, number> = {}
    
    const equipmentTypes = [...new Set(this.assets.map(a => a.type))]
    
    equipmentTypes.forEach(type => {
      const assetsOfType = this.assets.filter(a => a.type === type)
      const assetIds = assetsOfType.map(a => a.id)
      
      // Try operating sessions first
      const sessions = this.operatingSessions.filter(s => s.asset_id && assetIds.includes(s.asset_id))
      const sessionFuel = sessions.reduce((sum, s) => sum + (s.fuel_consumed ?? 0), 0)
      const sessionHours = sessions.reduce((sum, s) => sum + (s.operating_hours ?? 0), 0)
      
      if (sessionHours > 0) {
        typeAverages[type] = sessionFuel / sessionHours
      } else {
        // Fall back to fuel records
        const records = this.fuelRecords.filter(r => r.asset_id && assetIds.includes(r.asset_id))
        const recordFuel = records.reduce((sum, r) => sum + r.quantity, 0)
        const recordHours = records.reduce((sum, r) => sum + (r.hour_difference ?? 0), 0)
        
        typeAverages[type] = recordHours > 0 ? recordFuel / recordHours : 0
      }
    })

    return typeAverages
  }

  // 4. Fuel Cost per Hour
  calculateFuelCostPerHour(assetId?: string): number {
    const consumptionRate = this.calculateFuelConsumptionRate(assetId)
    const averageFuelPrice = this.getAverageFuelPrice()
    
    return consumptionRate * averageFuelPrice
  }

  // 5. Total Equipment Fuel Cost
  calculateTotalEquipmentFuelCost(assetId?: string): number {
    const records = assetId 
      ? this.fuelRecords.filter(r => r.asset_id === assetId)
      : this.fuelRecords

    return records.reduce((sum, record) => sum + record.cost, 0)
  }

  // 6. Fuel Cost as Percentage of Operating Costs
  calculateFuelCostPercentage(totalOperatingCosts: number): number {
    const totalFuelCost = this.calculateTotalEquipmentFuelCost()
    return totalOperatingCosts > 0 ? (totalFuelCost / totalOperatingCosts) * 100 : 0
  }

  // 7. Task-Specific Consumption (L/H)
  calculateTaskSpecificConsumption(): Record<string, number> {
    const totals = new Map<string, { fuel: number; hours: number }>()

    this.operatingSessions.forEach(session => {
      const label = session.operator_notes?.split('-')[0]?.trim().toLowerCase() || 'general operations'
      const current = totals.get(label) ?? { fuel: 0, hours: 0 }

      totals.set(label, {
        fuel: current.fuel + (session.fuel_consumed ?? 0),
        hours: current.hours + (session.operating_hours ?? 0)
      })
    })

    const taskConsumption: Record<string, number> = {}
    totals.forEach((value, label) => {
      taskConsumption[label] = value.hours > 0 ? value.fuel / value.hours : 0
    })

    return taskConsumption
  }

  // 8. Operator Efficiency (L/H) - Per Asset
  calculateOperatorEfficiency(): Record<string, number> {
    const totals = new Map<string, { fuel: number; hours: number }>()

    // From operating sessions
    this.operatingSessions.forEach(session => {
      const asset = this.assets.find(a => a.id === session.asset_id)
      const label = asset ? asset.name : 'Unknown Asset'
      const current = totals.get(label) ?? { fuel: 0, hours: 0 }

      totals.set(label, {
        fuel: current.fuel + (session.fuel_consumed ?? 0),
        hours: current.hours + (session.operating_hours ?? 0)
      })
    })

    // If no operating sessions, use fuel records data
    if (totals.size === 0 && this.fuelRecords.length > 0) {
      this.fuelRecords.forEach(record => {
        const asset = this.assets.find(a => a.id === record.asset_id)
        const label = asset ? asset.name : 'Unknown Asset'
        const current = totals.get(label) ?? { fuel: 0, hours: 0 }

        totals.set(label, {
          fuel: current.fuel + record.quantity,
          hours: current.hours + (record.hour_difference ?? 0)
        })
      })
    }

    const operatorEfficiency: Record<string, number> = {}
    totals.forEach((value, label) => {
      operatorEfficiency[label] = value.hours > 0 ? value.fuel / value.hours : 0
    })

    return operatorEfficiency
  }

  // 9. Trends in Fuel Consumption (L/H) - Monthly
  // FIX: Updated to prevent data loss and correct date parsing
  calculateMonthlyTrends(): Array<{ month: string; consumption: number; cost: number }> {
    const monthlyData: Record<string, { 
      sessionFuel: number; 
      sessionHours: number; 
      recordFuel: number;
      recordHours: number;
      cost: number;
    }> = {}

    // Helper to generate safer YYYY-MM keys using UTC to avoid timezone shifts
    const getMonthKey = (dateStr: string | null | undefined) => {
      if (!dateStr) return 'Unknown'
      const d = new Date(dateStr)
      if (isNaN(d.getTime())) return 'Unknown'
      // Use UTC to ensure that "2023-11-01" stays in November
      return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`
    }
    
    // 1. Aggregate Operating Sessions
    this.operatingSessions.forEach(session => {
      const month = getMonthKey(session.session_start ?? session.created_at)
      if (month === 'Unknown') return

      if (!monthlyData[month]) {
        monthlyData[month] = { sessionFuel: 0, sessionHours: 0, recordFuel: 0, recordHours: 0, cost: 0 }
      }
      
      monthlyData[month].sessionFuel += session.fuel_consumed ?? 0
      monthlyData[month].sessionHours += session.operating_hours ?? 0
    })

    // 2. Aggregate Fuel Records
    this.fuelRecords.forEach(record => {
      const month = getMonthKey(record.filling_date || record.date)
      if (month === 'Unknown') return

      if (!monthlyData[month]) {
        monthlyData[month] = { sessionFuel: 0, sessionHours: 0, recordFuel: 0, recordHours: 0, cost: 0 }
      }
      
      monthlyData[month].cost += record.cost ?? 0
      monthlyData[month].recordFuel += record.quantity ?? 0
      monthlyData[month].recordHours += record.hour_difference ?? 0
    })

    // 3. Calculate Averages
    return Object.entries(monthlyData)
      .map(([month, data]) => {
        let consumptionRate = 0
        
        // Logic: Prefer Session data (calculated consumption), fallback to Record data (fill-ups)
        if (data.sessionHours > 0) {
          consumptionRate = data.sessionFuel / data.sessionHours
        } else if (data.recordHours > 0) {
          consumptionRate = data.recordFuel / data.recordHours
        }

        return {
          month,
          consumption: consumptionRate,
          cost: data.cost
        }
      })
      .sort((a, b) => b.month.localeCompare(a.month)) // Sort Descending (Newest first)
  }

  // Helper method to get average fuel price
  private getAverageFuelPrice(): number {
    if (this.fuelRecords.length === 0) return 0
    
    const totalCost = this.fuelRecords.reduce((sum, r) => sum + r.cost, 0)
    const totalAmount = this.fuelRecords.reduce((sum, r) => sum + r.quantity, 0)
    
    return totalAmount > 0 ? totalCost / totalAmount : 0
  }

  // Comprehensive KPI calculation
  calculateAllKPIs(totalOperatingCosts: number = 1000000): ComprehensiveFuelKPI {
    // Use hybrid methods that consider both operating_sessions and fuel_records
    const totalOperatingHours = this.getTotalOperatingHours()
    const totalFuelConsumed = this.getTotalFuelConsumed()
    const totalFuelCost = this.calculateTotalEquipmentFuelCost()

    return {
      consumption: {
        fuelConsumptionRate: this.calculateFuelConsumptionRate(),
        averageFleetConsumption: this.calculateAverageFleetConsumption(),
        equipmentTypeAverages: this.calculateEquipmentTypeAverages()
      },
      cost: {
        fuelCostPerHour: this.calculateFuelCostPerHour(),
        totalEquipmentFuelCost: totalFuelCost,
        fuelCostPercentage: this.calculateFuelCostPercentage(totalOperatingCosts)
      },
      performance: {
        taskSpecificConsumption: this.calculateTaskSpecificConsumption(),
        operatorEfficiency: this.calculateOperatorEfficiency(),
        monthlyTrends: this.calculateMonthlyTrends()
      },
      totalOperatingHours,
      totalFuelConsumed,
      totalFuelCost
    }
  }
}

// Utility functions for formatting
export const formatConsumption = (value: number): string => {
  return `${value.toFixed(2)} L/H`
}

export const formatCurrency = (value: number): string => {
  return `$${value.toFixed(2)}`
}

export const formatPercentage = (value: number): string => {
  return `${value.toFixed(1)}%`
}

export const formatHours = (value: number): string => {
  return `${value.toFixed(1)} hrs`
}
