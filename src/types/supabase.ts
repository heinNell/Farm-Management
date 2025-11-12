export type Numeric = number | string | null

// Supabase Row Interfaces (direct database mappings)
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

// Application Interfaces (for frontend use)
export interface StockItem {
  id: string
  name: string
  category: string
  quantity: number
  unit: string
  cost_per_unit: number
  supplier: string
  location: string
  created_at: string
  updated_at: string
}

export interface FuelPrice {
  id: string
  fuel_type: string
  price_per_liter: number
  effective_date: string
  location: string
  created_at: string
  updated_at: string
}

export interface OperatingSession {
  id: string
  asset_id: string
  operator: string
  start_time: string
  end_time?: string
  start_hours: number
  end_hours?: number
  location: string
  notes?: string
  created_at: string
  updated_at: string
}

// Type aliases for consistency (if you want to use the Supabase row types directly)
export type Asset = SupabaseAssetRow
export type FuelRecord = SupabaseFuelRecordRow
export type OperatingSessionRecord = SupabaseOperatingSessionRow
export type FuelPriceRecord = SupabaseFuelPriceRow

// Utility types for CRUD operations
export type CreateAsset = Omit<SupabaseAssetRow, 'id' | 'created_at' | 'updated_at'>
export type UpdateAsset = Partial<Omit<SupabaseAssetRow, 'id' | 'created_at' | 'updated_at'>>

export type CreateFuelRecord = Omit<SupabaseFuelRecordRow, 'id' | 'created_at' | 'updated_at'>
export type UpdateFuelRecord = Partial<Omit<SupabaseFuelRecordRow, 'id' | 'created_at' | 'updated_at'>>

export type CreateOperatingSession = Omit<SupabaseOperatingSessionRow, 'id' | 'created_at' | 'updated_at'>
export type UpdateOperatingSession = Partial<Omit<SupabaseOperatingSessionRow, 'id' | 'created_at' | 'updated_at'>>

export type CreateFuelPrice = Omit<SupabaseFuelPriceRow, 'id' | 'created_at' | 'updated_at'>
export type UpdateFuelPrice = Partial<Omit<SupabaseFuelPriceRow, 'id' | 'created_at' | 'updated_at'>>

export type CreateStockItem = Omit<StockItem, 'id' | 'created_at' | 'updated_at'>
export type UpdateStockItem = Partial<Omit<StockItem, 'id' | 'created_at' | 'updated_at'>>

// Enums for better type safety
export enum AssetStatus {
  ACTIVE = 'active',
  MAINTENANCE = 'maintenance',
  RETIRED = 'retired',
  OUT_OF_SERVICE = 'out_of_service'
}

// Type guards for runtime type checking
export function isSupabaseAssetRow(item: unknown): item is SupabaseAssetRow {
  return (
    typeof item === 'object' &&
    item !== null &&
    'id' in item &&
    'name' in item &&
    'type' in item &&
    'status' in item
  )
}

export function isSupabaseFuelRecordRow(item: unknown): item is SupabaseFuelRecordRow {
  return (
    typeof item === 'object' &&
    item !== null &&
    'id' in item &&
    'asset_id' in item &&
    'date' in item &&
    'quantity' in item
  )
}
