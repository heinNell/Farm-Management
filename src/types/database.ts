
import type { ReactNode } from 'react'

// ============================================================================
// INVENTORY MANAGEMENT
// ============================================================================
export interface InventoryItem {
  id: string
  sku: string
  name: string
  category: string
  current_stock: number
  min_stock: number
  max_stock: number
  unit: string
  location: string
  status: 'in_stock' | 'low_stock' | 'out_of_stock'
  supplier: string | null
  unit_cost: number | null
  last_updated: string
  created_at: string
  updated_at: string
}

export type InventoryItemInsert = Omit<InventoryItem, 'id' | 'created_at' | 'updated_at'>
export type InventoryItemUpdate = Partial<Omit<InventoryItem, 'id' | 'created_at' | 'updated_at'>>

export interface InventoryFormData {
  sku: string
  name: string
  category: string
  current_stock: number
  min_stock: number
  max_stock: number
  unit: string
  location: string
  supplier?: string
  unit_cost?: number
}

// ============================================================================
// STOCK MANAGEMENT
// ============================================================================
export interface StockItem {
  id: string
  item_name: string
  category: 'raw_materials' | 'finished_goods' | 'spare_parts' | 'consumables' | 'tools' | null
  quantity: number
  unit: 'pieces' | 'kg' | 'liters' | 'boxes' | 'pallets' | 'meters' | null
  location: string
  status: 'available' | 'reserved' | 'low_stock' | 'out_of_stock' | null
  reorder_point: number
  reorder_quantity: number
  unit_price: number
  supplier: string
  last_restocked: string | null
  expiry_date: string | null
  created_at: string
  updated_at: string
}

export type StockItemInsert = Omit<StockItem, 'id' | 'created_at' | 'updated_at'>
export type StockItemUpdate = Partial<Omit<StockItem, 'id' | 'created_at' | 'updated_at'>>

export interface StockFormData {
  item_name: string
  category: 'raw_materials' | 'finished_goods' | 'spare_parts' | 'consumables' | 'tools'
  quantity: number
  unit: 'pieces' | 'kg' | 'liters' | 'boxes' | 'pallets' | 'meters'
  location: string
  status: 'available' | 'reserved' | 'low_stock' | 'out_of_stock'
  reorder_point: number
  reorder_quantity: number
  unit_price: number
  supplier: string
}

// ============================================================================
// REPAIR MANAGEMENT
// ============================================================================
export interface RepairItem {
  id: string
  equipment_name: string
  defect_tag: string
  priority: 'low' | 'medium' | 'high'
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'on_hold'
  description: string
  estimated_cost: number
  actual_cost: number | null
  assigned_technician: string
  photo_urls: string[]
  warranty_status: 'in_warranty' | 'out_of_warranty' | 'extended'
  estimated_completion: string
  completed_date: string | null
  created_at: string
  updated_at: string
}

export type RepairItemInsert = Omit<RepairItem, 'id' | 'created_at' | 'updated_at'>
export type RepairItemUpdate = Partial<Omit<RepairItem, 'id' | 'created_at' | 'updated_at'>>

export interface RepairFormData {
  equipment_name: string
  defect_tag: string
  priority: 'low' | 'medium' | 'high'
  description: string
  estimated_cost: number
  actual_cost?: number
  assigned_technician: string
  warranty_status: 'in_warranty' | 'out_of_warranty' | 'extended'
  estimated_completion: string
}

// ============================================================================
// JOB MANAGEMENT
// ============================================================================
export interface JobCard {
  id: string
  title: string
  description: string
  priority: 'low' | 'medium' | 'high'
  status: 'todo' | 'in_progress' | 'review' | 'completed' | 'urgent' | 'cancelled'
  assigned_to: string
  location: string
  estimated_hours: number
  actual_hours: number | null
  due_date: string
  completed_date: string | null
  tags: string[]
  notes: string | null
  asset_id: string | null
  hour_meter_reading: number | null
  created_at: string
  updated_at: string
}

export interface JobFormData {
  title: string
  description: string
  priority: 'low' | 'medium' | 'high'
  assigned_to: string
  location: string
  estimated_hours: number
  actual_hours?: number
  due_date: string
  tags: string[]
  notes?: string
  asset_id?: string
  hour_meter_reading?: number | undefined
}

export type JobCardInsert = Omit<JobCard, 'id' | 'created_at' | 'updated_at'>
export type JobCardUpdate = Partial<Omit<JobCard, 'id' | 'created_at' | 'updated_at'>>

// ============================================================================
// INSPECTION MANAGEMENT
// ============================================================================
export interface Inspection {
  id: string
  title: string
  type: 'safety' | 'pre_season' | 'compliance' | 'maintenance'
  inspector: string
  status: 'scheduled' | 'in_progress' | 'completed' | 'overdue' | 'cancelled'
  progress: number
  score: number
  scheduled_date: string
  completed_date: string | null
  checklist_items: ChecklistItem[]
  findings: string | null
  recommendations: string | null
  asset_id: string | null
  created_at: string
  updated_at: string
}

export type InspectionInsert = Omit<Inspection, 'id' | 'created_at' | 'updated_at'>
export type InspectionUpdate = Partial<Omit<Inspection, 'id' | 'created_at' | 'updated_at'>>

export interface ChecklistItem {
  id: string
  description: string
  completed: boolean
  notes?: string
}

// ============================================================================
// MAINTENANCE MANAGEMENT
// ============================================================================
export interface MaintenanceSchedule {
  id: string
  equipment_name: string
  maintenance_type: string
  interval_type: 'hours' | 'calendar'
  interval_value: number
  current_hours: number | null
  next_due_date: string
  last_completed: string | null
  priority: 'low' | 'medium' | 'high'
  assigned_technician: string
  status: 'scheduled' | 'overdue' | 'in_progress' | 'completed' | 'skipped'
  failure_probability: number
  estimated_cost: number | null
  notes: string | null
  created_at: string
  updated_at: string
}

export type MaintenanceScheduleInsert = Omit<MaintenanceSchedule, 'id' | 'created_at' | 'updated_at'>
export type MaintenanceScheduleUpdate = Partial<Omit<MaintenanceSchedule, 'id' | 'created_at' | 'updated_at'>>

// ============================================================================
// ASSET & FUEL MANAGEMENT
// ============================================================================
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

export type AssetInsert = Omit<Asset, 'id' | 'created_at' | 'updated_at'>
export type AssetUpdate = Partial<Omit<Asset, 'id' | 'created_at' | 'updated_at'>>

export interface AssetFormData {
  name: string
  type: string
  model?: string
  serial_number?: string
  purchase_date?: string
  status: 'active' | 'maintenance' | 'retired' | 'out_of_service'
  location?: string
  current_hours?: number
  fuel_capacity?: number
  fuel_type?: string
  barcode?: string
  qr_code?: string
  notes?: string
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

export type FuelRecordInsert = Omit<FuelRecord, 'id' | 'created_at' | 'updated_at'>
export type FuelRecordUpdate = Partial<Omit<FuelRecord, 'id' | 'created_at' | 'updated_at'>>

export interface FuelRecordFormData {
  asset_id: string
  date: string
  quantity: number
  price_per_liter: number
  cost: number
  fuel_type: string
  location: string
  odometer_reading?: number
  receipt_number?: string
  fuel_grade?: string
  notes?: string
  weather_conditions?: string
  operator_id?: string
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

export type OperatingSessionInsert = Omit<OperatingSession, 'id' | 'created_at' | 'updated_at'>
export type OperatingSessionUpdate = Partial<Omit<OperatingSession, 'id' | 'created_at' | 'updated_at'>>

export interface OperatingSessionFormData {
  asset_id: string
  session_start: string
  session_end?: string
  initial_fuel_level?: number
  final_fuel_level?: number
  fuel_consumed?: number
  distance_traveled?: number
  operating_hours?: number
  efficiency_rating?: number
  operator_notes?: string
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

export type FuelPriceInsert = Omit<FuelPrice, 'id' | 'created_at' | 'updated_at'>
export type FuelPriceUpdate = Partial<Omit<FuelPrice, 'id' | 'created_at' | 'updated_at'>>

// ============================================================================
// FUEL KPI & ANALYTICS
// ============================================================================
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

// ============================================================================
// UTILITY TYPES
// ============================================================================
export type Numeric = number | string | null

export type EntityType = 'inventory' | 'inventory_items' | 'repairs' | 'repair_items' | 'jobs' | 'job_cards' | 'inspections' | 'maintenance' | 'maintenance_schedules' | 'assets' | 'fuel_records' | 'stock' | 'stock_items'

// Supabase Row Interfaces (direct database mappings for numeric field handling)
export interface SupabaseAssetRow {
  id: string
  name: string
  type: string
  model: string | null
  serial_number: string | null
  purchase_date: string | null
  status: 'active' | 'maintenance' | 'retired' | 'out_of_service'
  location: string | null
  current_hours: number | null
  fuel_capacity: Numeric
  fuel_type: string | null
  barcode: string | null
  qr_code: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface SupabaseFuelRecordRow {
  id: string
  asset_id: string
  date: string
  quantity: Numeric
  price_per_liter: Numeric
  cost: Numeric
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

export interface SupabaseOperatingSessionRow {
  id: string
  asset_id: string
  session_start: string
  session_end: string | null
  initial_fuel_level: Numeric
  final_fuel_level: Numeric
  fuel_consumed: Numeric
  distance_traveled: Numeric
  operating_hours: Numeric
  efficiency_rating: Numeric
  operator_notes: string | null
  created_at: string
  updated_at: string
}

export interface SupabaseFuelPriceRow {
  id: string
  fuel_type: string
  price_per_liter: Numeric
  effective_date: string
  location: string | null
  supplier: string | null
  created_at: string
  updated_at: string
}

export interface FormFieldProps {
  label: string
  name: string
  type?: 'text' | 'email' | 'password' | 'number' | 'date' | 'datetime-local'
  placeholder?: string
  required?: boolean
  error?: string | undefined
  value?: string | number | undefined
  onChange?: (value: string | number) => void
  className?: string
  step?: string
}

export interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
}
