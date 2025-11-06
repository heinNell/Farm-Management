
import { z } from 'zod'

export const inventorySchema = z.object({
  sku: z.string().min(1, 'SKU is required').max(50, 'SKU too long'),
  name: z.string().min(1, 'Name is required').max(200, 'Name too long'),
  category: z.string().min(1, 'Category is required'),
  current_stock: z.number().min(0, 'Stock cannot be negative'),
  min_stock: z.number().min(0, 'Min stock cannot be negative'),
  max_stock: z.number().min(1, 'Max stock must be positive'),
  unit: z.string().min(1, 'Unit is required'),
  location: z.string().min(1, 'Location is required'),
})

export const repairSchema = z.object({
  equipment_name: z.string().min(1, 'Equipment name is required'),
  defect_tag: z.string().min(1, 'Defect tag is required'),
  priority: z.enum(['low', 'medium', 'high']),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  estimated_cost: z.number().min(0, 'Cost cannot be negative'),
  assigned_technician: z.string().min(1, 'Technician is required'),
  warranty_status: z.enum(['in_warranty', 'out_of_warranty', 'extended']),
  estimated_completion: z.string().min(1, 'Completion date is required'),
})

export const jobSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title too long'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  priority: z.enum(['low', 'medium', 'high']),
  assigned_to: z.string().min(1, 'Assignee is required'),
  location: z.string().min(1, 'Location is required'),
  estimated_hours: z.number().min(0.5, 'Minimum 0.5 hours').max(100, 'Maximum 100 hours'),
  due_date: z.string().min(1, 'Due date is required'),
  tags: z.array(z.string()).optional(),
})

export const inspectionSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  type: z.enum(['safety', 'pre_season', 'compliance', 'maintenance']),
  inspector: z.string().min(1, 'Inspector is required'),
  scheduled_date: z.string().min(1, 'Scheduled date is required'),
})

export const maintenanceSchema = z.object({
  equipment_name: z.string().min(1, 'Equipment name is required'),
  maintenance_type: z.string().min(1, 'Maintenance type is required'),
  interval_type: z.enum(['hours', 'calendar']),
  interval_value: z.number().min(1, 'Interval must be positive'),
  current_hours: z.number().min(0).optional(),
  next_due_date: z.string().min(1, 'Due date is required'),
  priority: z.enum(['low', 'medium', 'high']),
  assigned_technician: z.string().min(1, 'Technician is required'),
})

export type InventoryFormData = z.infer<typeof inventorySchema>
export type RepairFormData = z.infer<typeof repairSchema>
export type JobFormData = z.infer<typeof jobSchema>
export type InspectionFormData = z.infer<typeof inspectionSchema>
export type MaintenanceFormData = z.infer<typeof maintenanceSchema>

export const validateForm = <T>(schema: z.ZodSchema<T>, data: unknown): { 
  success: boolean
  data?: T
  errors?: Record<string, string>
} => {
  try {
    const validData = schema.parse(data)
    return { success: true, data: validData }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.errors.reduce((acc, err) => {
        const path = err.path.join('.')
        acc[path] = err.message
        return acc
      }, {} as Record<string, string>)
      return { success: false, errors }
    }
    return { success: false, errors: { general: 'Validation failed' } }
  }
}
