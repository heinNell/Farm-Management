
export interface Asset {
  id: string
  name: string
  type: string
  model: string | null
  serial_number: string | null
  purchase_date: string | null
  status: 'active' | 'maintenance' | 'retired' | 'out_of_service'
  location: string | null
  current_hours: number | null
  fuel_capacity: number | null
  fuel_type: string | null
  barcode: string | null
  qr_code: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface FuelRecord {
  id: string
  asset_id: string
  date: string
  quantity: number
  price_per_liter: number
  cost: number
  fuel_type: string
  location: string
  odometer_reading: number | null
  receipt_number: string | null
  fuel_grade: string | null
  notes: string | null
  weather_conditions: string | null
  operator_id: string | null
  created_at: string
  updated_at: string
}

export interface OperatingSession {
  id: string
  asset_id: string
  session_start: string
  session_end: string | null
  initial_fuel_level: number | null
  final_fuel_level: number | null
  fuel_consumed: number | null
  distance_traveled: number | null
  operating_hours: number | null
  efficiency_rating: number | null
  operator_notes: string | null
  created_at: string
  updated_at: string
}

export interface FuelPrice {
  id: string
  fuel_type: string
  price_per_liter: number
  effective_date: string
  location: string | null
  supplier: string | null
  created_at: string
  updated_at: string
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
