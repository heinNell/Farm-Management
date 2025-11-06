
import { Asset, FuelRecord, OperatingSession, ComprehensiveFuelKPI } from '../types/fuel'

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
  calculateFuelConsumptionRate(assetId?: string): number {
    const sessions = assetId 
      ? this.operatingSessions.filter(s => s.asset_id === assetId)
      : this.operatingSessions

    const totalFuelConsumed = sessions.reduce((sum, session) => sum + session.fuel_consumed, 0)
    const totalHours = sessions.reduce((sum, session) => sum + session.operating_hours, 0)

    return totalHours > 0 ? totalFuelConsumed / totalHours : 0
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
      const assetIds = assetsOfType.map(a => a.asset_id)
      const sessions = this.operatingSessions.filter(s => assetIds.includes(s.asset_id))
      
      const totalFuel = sessions.reduce((sum, s) => sum + s.fuel_consumed, 0)
      const totalHours = sessions.reduce((sum, s) => sum + s.operating_hours, 0)
      
      typeAverages[type] = totalHours > 0 ? totalFuel / totalHours : 0
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

    return records.reduce((sum, record) => sum + record.fuel_cost, 0)
  }

  // 6. Fuel Cost as Percentage of Operating Costs
  calculateFuelCostPercentage(totalOperatingCosts: number): number {
    const totalFuelCost = this.calculateTotalEquipmentFuelCost()
    return totalOperatingCosts > 0 ? (totalFuelCost / totalOperatingCosts) * 100 : 0
  }

  // 7. Task-Specific Consumption (L/H)
  calculateTaskSpecificConsumption(): Record<string, number> {
    const taskConsumption: Record<string, number> = {}
    
    const taskTypes = [...new Set(this.operatingSessions.map(s => s.task_type))]
    
    taskTypes.forEach(taskType => {
      const sessions = this.operatingSessions.filter(s => s.task_type === taskType)
      const totalFuel = sessions.reduce((sum, s) => sum + s.fuel_consumed, 0)
      const totalHours = sessions.reduce((sum, s) => sum + s.operating_hours, 0)
      
      taskConsumption[taskType] = totalHours > 0 ? totalFuel / totalHours : 0
    })

    return taskConsumption
  }

  // 8. Operator Efficiency (L/H)
  calculateOperatorEfficiency(): Record<string, number> {
    const operatorEfficiency: Record<string, number> = {}
    
    const operators = [...new Set(this.operatingSessions.map(s => s.operator))]
    
    operators.forEach(operator => {
      const sessions = this.operatingSessions.filter(s => s.operator === operator)
      const totalFuel = sessions.reduce((sum, s) => sum + s.fuel_consumed, 0)
      const totalHours = sessions.reduce((sum, s) => sum + s.operating_hours, 0)
      
      operatorEfficiency[operator] = totalHours > 0 ? totalFuel / totalHours : 0
    })

    return operatorEfficiency
  }

  // 9. Trends in Fuel Consumption (L/H) - Monthly
  calculateMonthlyTrends(): Array<{ month: string; consumption: number; cost: number }> {
    const monthlyData: Record<string, { fuel: number; hours: number; cost: number }> = {}
    
    this.operatingSessions.forEach(session => {
      const month = new Date(session.created_at).toISOString().substring(0, 7) // YYYY-MM
      
      if (!monthlyData[month]) {
        monthlyData[month] = { fuel: 0, hours: 0, cost: 0 }
      }
      
      monthlyData[month].fuel += session.fuel_consumed
      monthlyData[month].hours += session.operating_hours
    })

    // Add cost data from fuel records
    this.fuelRecords.forEach(record => {
      const month = new Date(record.created_at).toISOString().substring(0, 7)
      
      if (monthlyData[month]) {
        monthlyData[month].cost += record.fuel_cost
      }
    })

    return Object.entries(monthlyData)
      .map(([month, data]) => ({
        month,
        consumption: data.hours > 0 ? data.fuel / data.hours : 0,
        cost: data.cost
      }))
      .sort((a, b) => a.month.localeCompare(b.month))
  }

  // Helper method to get average fuel price
  private getAverageFuelPrice(): number {
    if (this.fuelRecords.length === 0) return 0
    
    const totalCost = this.fuelRecords.reduce((sum, r) => sum + r.fuel_cost, 0)
    const totalAmount = this.fuelRecords.reduce((sum, r) => sum + r.fuel_amount, 0)
    
    return totalAmount > 0 ? totalCost / totalAmount : 0
  }

  // Comprehensive KPI calculation
  calculateAllKPIs(totalOperatingCosts: number = 1000000): ComprehensiveFuelKPI {
    const totalOperatingHours = this.operatingSessions.reduce((sum, s) => sum + s.operating_hours, 0)
    const totalFuelConsumed = this.operatingSessions.reduce((sum, s) => sum + s.fuel_consumed, 0)
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
