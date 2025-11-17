import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Supabase configuration - use environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.')
}

// Singleton pattern to prevent multiple instances
let supabaseInstance: SupabaseClient | null = null

function getSupabaseClient(): SupabaseClient {
  if (!supabaseInstance) {
    console.log('Initializing Supabase client...')
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storageKey: 'sb-auth-token' // Ensure consistent storage key
      },
      realtime: {
        params: {
          eventsPerSecond: 10
        }
      }
    })
  }
  return supabaseInstance
}

export const supabase = getSupabaseClient()

// Database table names
export const TABLES = {
  INVENTORY_ITEMS: 'inventory_items',
  REPAIR_ITEMS: 'repair_items', 
  JOB_CARDS: 'job_cards',
  INSPECTIONS: 'inspections',
  MAINTENANCE_SCHEDULES: 'maintenance_schedules',
  MAINTENANCE_ALERTS: 'maintenance_alerts',
  ASSETS: 'assets',
  FUEL_RECORDS: 'fuel_records',
  FUEL_PRICES: 'fuel_prices',
  OPERATING_SESSIONS: 'operating_sessions',
  FUEL_BUNKERS: 'fuel_bunkers',
  FUEL_BUNKER_TRANSACTIONS: 'fuel_bunker_transactions'
} as const

// Type definitions for database tables
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
  last_updated: string
  created_at: string
  updated_at: string
}

export interface RepairItem {
  id: string
  equipment_name: string
  defect_tag: string
  priority: 'low' | 'medium' | 'high'
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
  description: string
  estimated_cost: number
  assigned_technician: string
  photo_urls: string[]
  warranty_status: 'in_warranty' | 'out_of_warranty' | 'extended'
  estimated_completion: string
  created_at: string
  updated_at: string
}

export interface JobCard {
  id: string
  title: string
  description: string
  priority: 'low' | 'medium' | 'high'
  status: 'todo' | 'in_progress' | 'review' | 'completed'
  assigned_to: string
  location: string
  estimated_hours: number
  due_date: string
  tags: string[]
  created_at: string
  updated_at: string
}

export interface Inspection {
  id: string
  title: string
  type: 'safety' | 'pre_season' | 'compliance' | 'maintenance'
  inspector: string
  status: 'scheduled' | 'in_progress' | 'completed' | 'overdue'
  progress: number
  score: number
  scheduled_date: string
  completed_date?: string
  checklist_items: Array<{
    id: string
    description: string
    completed: boolean
    notes?: string
  }>
  created_at: string
  updated_at: string
}

export interface MaintenanceSchedule {
  id: string
  equipment_name: string
  maintenance_type: string
  interval_type: 'hours' | 'calendar'
  interval_value: number
  current_hours?: number
  next_due_date: string
  priority: 'low' | 'medium' | 'high'
  assigned_technician: string
  status: 'scheduled' | 'overdue' | 'in_progress' | 'completed'
  failure_probability: number
  created_at: string
  updated_at: string
}

export interface Asset {
  id: string
  name: string
  type: string
  model: string
  year: number
  status: 'active' | 'maintenance' | 'retired'
  location: string
  purchase_date: string
  created_at: string
  updated_at: string
}

export interface FuelRecord {
  id: string
  asset_id: string
  fuel_type: string
  quantity: number
  cost_per_liter: number
  total_cost: number
  odometer_reading?: number
  location: string
  date: string
  created_at: string
  updated_at: string
}
