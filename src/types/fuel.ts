
export interface Asset {
  _id: string
  asset_id: string
  name: string
  type: 'tractor' | 'forklift' | 'motorbike' | 'generator'
  fuel_type: 'diesel' | 'petrol' | 'electric' | 'hybrid'
  tank_capacity: number
  manufacturer: string
  model: string
  year: number
  status: 'active' | 'maintenance' | 'retired'
  location: string
  created_at: string
  updated_at: string
}

export interface FuelRecord {
  _id: string
  asset_id: string
  fuel_amount: number
  fuel_cost: number
  fuel_price_per_liter: number
  record_type: 'purchase' | 'consumption' | 'refill'
  station_name?: string
  receipt_number?: string
  odometer_reading?: number
  notes?: string
  created_at: string
}

export interface OperatingSession {
  _id: string
  asset_id: string
  start_time: string
  end_time: string
  operating_hours: number
  task_type: 'plowing' | 'harvesting' | 'transport' | 'maintenance' | 'other'
  operator: string
  fuel_consumed: number
  location: string
  efficiency_rating: number
  notes?: string
  created_at: string
}

export interface FuelPrice {
  _id: string
  fuel_type: 'diesel' | 'petrol' | 'electric' | 'hybrid'
  price_per_liter: number
  station_name?: string
  location?: string
  effective_date: string
  created_at: string
}

// KPI Interfaces
export interface FuelConsumptionKPI {
  fuelConsumptionRate: number // L/H
  averageFleetConsumption: number // L/H
  equipmentTypeAverages: Record<string, number> // L/H by type
}

export interface CostKPI {
  fuelCostPerHour: number
  totalEquipmentFuelCost: number
  fuelCostPercentage: number
}

export interface PerformanceKPI {
  taskSpecificConsumption: Record<string, number> // L/H by task
  operatorEfficiency: Record<string, number> // L/H by operator
  monthlyTrends: Array<{
    month: string
    consumption: number
    cost: number
  }>
}

export interface ComprehensiveFuelKPI {
  consumption: FuelConsumptionKPI
  cost: CostKPI
  performance: PerformanceKPI
  totalOperatingHours: number
  totalFuelConsumed: number
  totalFuelCost: number
}
