
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
// REPAIR MANAGEMENT
// ============================================================================
export interface RepairItem {
  id: string
  asset_id: string | null
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
  asset_id: string
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
  extended_data: JobExtendedData | null
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

// Job Card Extended Data (stored as JSONB)
export interface JobRepairItem {
  id: string
  description: string
  type: 'repair' | 'replace'
  status: 'pending' | 'in_progress' | 'completed'
  completed_date: string | null
  completed_by: string | null
  notes: string | null
  cost: number
}

export interface JobSpareAllocation {
  id: string
  inventory_item_id: string
  item_name: string
  item_sku: string
  quantity: number
  unit_cost: number
  total_cost: number
  allocated_date: string
  allocated_by: string
}

export interface JobIRRequest {
  id: string
  item_description: string
  quantity: number
  urgency: 'low' | 'medium' | 'high' | 'critical'
  status: 'pending' | 'approved' | 'ordered' | 'received' | 'cancelled'
  estimated_cost: number | null
  actual_cost: number | null
  supplier: string | null
  requested_date: string
  requested_by: string
  notes: string | null
}

export interface JobThirdPartyService {
  id: string
  service_provider: string
  service_description: string
  status: 'requested' | 'quoted' | 'approved' | 'in_progress' | 'completed' | 'cancelled'
  quoted_cost: number | null
  actual_cost: number | null
  contact_person: string | null
  contact_phone: string | null
  requested_date: string
  scheduled_date: string | null
  completed_date: string | null
  notes: string | null
}

export interface JobExtendedData {
  repair_items: JobRepairItem[]
  spare_allocations: JobSpareAllocation[]
  ir_requests: JobIRRequest[]
  third_party_services: JobThirdPartyService[]
  total_parts_cost: number
  total_service_cost: number
  total_labor_cost: number
}

// ============================================================================
// INSPECTION MANAGEMENT
// ============================================================================
export interface Inspection {
  id: string
  title: string
  type: 'safety' | 'pre_season' | 'compliance' | 'maintenance'
  inspector: string
  creator: string
  status: 'scheduled' | 'in_progress' | 'completed' | 'overdue' | 'cancelled'
  progress: number
  score: number
  scheduled_date: string
  completed_date: string | null
  checklist_items: ChecklistItem[]
  findings: string | null
  recommendations: string | null
  asset_id: string | null
  signature?: InspectionSignature | null
  created_at: string
  updated_at: string
}

export type InspectionInsert = Omit<Inspection, 'id' | 'created_at' | 'updated_at'>
export type InspectionUpdate = Partial<Omit<Inspection, 'id' | 'created_at' | 'updated_at'>>

export interface InspectionTemplate {
  id: string
  name: string
  description: string | null
  type: 'safety' | 'pre_season' | 'compliance' | 'maintenance'
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annual' | 'as_needed'
  checklist_items: ChecklistItemTemplate[]
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface ChecklistItemTemplate {
  id: string
  description: string
  order: number
  category?: string
  weight?: number
  input_type?: 'checkbox' | 'select'
  options?: ChecklistItemOption[]
  require_photo_on?: string[]
  require_note_on?: string[]
}

export interface ChecklistItemOption {
  label: string
  value: string
  score_percent: number
  color: string
}

export type InspectionTemplateInsert = Omit<InspectionTemplate, 'id' | 'created_at' | 'updated_at'>
export type InspectionTemplateUpdate = Partial<Omit<InspectionTemplate, 'id' | 'created_at' | 'updated_at'>>

export interface ChecklistItem {
  id: string
  description: string
  completed: boolean
  notes?: string
  category?: string
  weight?: number
  status?: 'pending' | 'good' | 'repair' | 'replace'
  photo_urls?: string[]
  input_type?: 'checkbox' | 'select'
  options?: ChecklistItemOption[]
  require_photo_on?: string[]
  require_note_on?: string[]
}

export interface InspectionSignature {
  inspector_name: string
  signature_data: string // Base64 encoded signature image
  signed_at: string
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

export interface MaintenanceAlert {
  id: string
  schedule_id: string
  alert_type: 'upcoming' | 'overdue' | 'critical'
  message: string
  hours_until_due: number | null
  days_until_due: number | null
  acknowledged: boolean
  acknowledged_by: string | null
  acknowledged_at: string | null
  created_at: string
  updated_at: string
}

export type MaintenanceAlertInsert = Omit<MaintenanceAlert, 'id' | 'created_at' | 'updated_at'>
export type MaintenanceAlertUpdate = Partial<Omit<MaintenanceAlert, 'id' | 'created_at' | 'updated_at'>>

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
  purchase_cost: number | null
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
  asset_id: string | null
  date: string
  filling_date: string
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
  driver_name: string | null
  attendant_name: string | null
  current_hours: number | null
  previous_hours: number | null
  consumption_rate: number | null
  hour_difference: number | null
  created_at: string
  updated_at: string
}

export type FuelRecordInsert = Omit<FuelRecord, 'id' | 'created_at' | 'updated_at'>
export type FuelRecordUpdate = Partial<Omit<FuelRecord, 'id' | 'created_at' | 'updated_at'>>

export interface FuelRecordFormData {
  asset_id: string
  date: string
  filling_date: string
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
  driver_name?: string
  attendant_name?: string
}

export interface OperatingSession {
  id: string
  asset_id: string | null
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

export type EntityType = 'inventory' | 'inventory_items' | 'repairs' | 'repair_items' | 'jobs' | 'job_cards' | 'inspections' | 'maintenance' | 'maintenance_schedules' | 'assets' | 'fuel_records' | 'fuel_bunkers' | 'fuel_bunker_transactions'

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
  filling_date: string
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
  driver_name: string | null
  attendant_name: string | null
  current_hours: number | null
  previous_hours: number | null
  consumption_rate: Numeric | null
  hour_difference: number | null
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

// ============================================================================
// FARM MANAGEMENT
// ============================================================================
export interface Farm {
  id: string
  name: string
  location: string | null
  description: string | null
  area_hectares: number | null
  manager_name: string | null
  contact_phone: string | null
  contact_email: string | null
  status: 'active' | 'inactive'
  created_at: string
  updated_at: string
}

export type FarmInsert = Omit<Farm, 'id' | 'created_at' | 'updated_at'>
export type FarmUpdate = Partial<Omit<Farm, 'id' | 'created_at' | 'updated_at'>>

// ============================================================================
// FUEL BUNKER MANAGEMENT
// ============================================================================
export interface FuelBunker {
  id: string
  tank_id: string
  tank_name: string
  location: string | null
  description: string | null
  tank_type: 'stationary' | 'mobile'
  capacity: number
  current_level: number
  min_level: number | null
  fuel_type: string | null
  last_filled_date: string | null
  status: 'active' | 'inactive' | 'maintenance'
  farm_id: string | null
  created_at: string
  updated_at: string
}

export type FuelBunkerInsert = Omit<FuelBunker, 'id' | 'created_at' | 'updated_at'>
export type FuelBunkerUpdate = Partial<Omit<FuelBunker, 'id' | 'created_at' | 'updated_at'>>

export interface FuelBunkerFormData {
  tank_id: string
  tank_name: string
  location?: string
  description?: string
  tank_type: 'stationary' | 'mobile'
  capacity: number
  current_level: number
  min_level?: number
  fuel_type?: string
  status: 'active' | 'inactive' | 'maintenance'
  farm_id?: string
}

export interface FuelBunkerTransaction {
  id: string
  bunker_id: string
  transaction_type: 'addition' | 'withdrawal' | 'adjustment' | 'transfer_in' | 'transfer_out'
  quantity: number
  previous_level: number | null
  new_level: number | null
  reference_number: string | null
  notes: string | null
  performed_by: string | null
  related_bunker_id: string | null
  related_transaction_id: string | null
  transaction_date: string
  created_at: string
}

export type FuelBunkerTransactionInsert = Omit<FuelBunkerTransaction, 'id' | 'created_at'>
export type FuelBunkerTransactionUpdate = Partial<Omit<FuelBunkerTransaction, 'id' | 'created_at'>>

export interface FuelBunkerTransactionFormData {
  bunker_id: string
  transaction_type: 'addition' | 'withdrawal' | 'adjustment' | 'transfer_in' | 'transfer_out'
  quantity: number
  reference_number?: string
  notes?: string
  performed_by?: string
}

export interface FuelBunkerTransferFormData {
  source_bunker_id: string
  destination_bunker_id: string
  quantity: number
  notes?: string
  performed_by?: string
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
