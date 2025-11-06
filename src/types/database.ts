
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
  checklist_items: ChecklistItem[]
  created_at: string
  updated_at: string
}

export interface ChecklistItem {
  id: string
  description: string
  completed: boolean
  notes?: string
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

export type EntityType = 'inventory' | 'repairs' | 'jobs' | 'inspections' | 'maintenance'

export interface FormFieldProps {
  label: string
  name: string
  type?: 'text' | 'email' | 'password' | 'number' | 'date' | 'datetime-local'
  placeholder?: string
  required?: boolean
  error?: string
  value?: string | number
  onChange?: (value: string | number) => void
  className?: string
}

export interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
}
