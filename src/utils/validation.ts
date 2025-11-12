import { z, ZodError, ZodIssue } from 'zod'
import type { InventoryFormData, JobFormData, RepairFormData } from '../types/database'

const numericField = (field: string) =>
  z.coerce.number().min(0, `${field} must be 0 or greater`)

export const inventorySchema: z.ZodSchema<InventoryFormData> = z.object({
  sku: z.string().trim().min(1, 'SKU is required'),
  name: z.string().trim().min(1, 'Item name is required'),
  category: z.string().trim().min(1, 'Category is required'),
  current_stock: numericField('Current stock'),
  min_stock: numericField('Minimum stock'),
  max_stock: numericField('Maximum stock'),
  unit: z.string().trim().min(1, 'Unit is required'),
  location: z.string().trim().min(1, 'Location is required')
})

export const jobSchema: z.ZodSchema<JobFormData> = z.object({
  title: z.string().trim().min(1, 'Title is required'),
  description: z.string().trim().min(1, 'Description is required'),
  priority: z.enum(['low', 'medium', 'high']),
  assigned_to: z.string().trim().min(1, 'Assigned to is required'),
  location: z.string().trim().min(1, 'Location is required'),
  estimated_hours: z.coerce.number().min(1, 'Estimated hours must be at least 1'),
  due_date: z.string().min(1, 'Due date is required'),
  tags: z.array(z.string()).default([])
})

export const repairSchema: z.ZodSchema<RepairFormData> = z.object({
  equipment_name: z.string().trim().min(1, 'Equipment name is required'),
  defect_tag: z.string().trim().min(1, 'Defect tag is required'),
  priority: z.enum(['low', 'medium', 'high']),
  description: z.string().trim().min(1, 'Description is required'),
  estimated_cost: z.coerce.number().min(0, 'Estimated cost must be 0 or greater'),
  assigned_technician: z.string().trim().min(1, 'Assigned technician is required'),
  warranty_status: z.enum(['in_warranty', 'out_of_warranty', 'extended']),
  estimated_completion: z.string().min(1, 'Estimated completion date is required')
})

export const validateForm = <T>(schema: z.ZodSchema<T>, data: unknown): { 
  success: boolean
  data?: T
  errors?: Record<string, string>
} => {
  try {
    const validData = schema.parse(data)
    return { success: true, data: validData }
  } catch (error) {
    if (error instanceof ZodError) {
      const errors = error.issues.reduce((acc: Record<string, string>, err: ZodIssue) => {
        const path = err.path.join('.')
        acc[path] = err.message
        return acc
      }, {})

      return { success: false, errors }
    }
    return { success: false, errors: { general: 'Validation failed' } }
  }
}