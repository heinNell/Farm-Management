import { useCallback, useState } from 'react'
import toast from 'react-hot-toast'
import { supabase } from '../lib/supabase'
import type { Asset, FuelRecord, InventoryItem } from '../types/database'

interface ExportOptions {
  format: 'csv' | 'excel' | 'pdf'
  dateRange?: {
    start?: string
    end?: string
  } | undefined
  assetIds?: string[]
  includeImages?: boolean
  groupBy?: 'asset' | 'date' | 'type' | 'none'
  filters?: Record<string, unknown>
}

// Add type definitions for export data
interface ExportRecord {
  [key: string]: string | number
}

interface FuelRecordExport extends ExportRecord {
  'Date': string
  'Asset Name': string
  'Asset Type': string
  'Location': string
  'Fuel Type': string
  'Quantity (L)': number
  'Price per Liter': string
  'Total Cost': string
  'Receipt Number': string
  'Fuel Grade': string
  'Odometer Reading': string
  'Notes': string
}

interface InventoryExport extends ExportRecord {
  'Item Name': string
  'Category': string
  'Quantity': number
  'Unit': string
  'Location': string
  'Status': string
  'Minimum Stock': number
  'Cost per Unit': string
  'Total Value': string
  'Last Updated': string
}

interface AssetExport extends ExportRecord {
  'Asset Name': string
  'Type': string
  'Model': string
  'Serial Number': string
  'Location': string
  'Status': string
  'Purchase Date': string
  'Purchase Cost': string
  'Operating Hours': number
  'Last Maintenance': string
  'Created': string
}

interface ExportProgress {
  stage: 'preparing' | 'fetching' | 'processing' | 'generating' | 'complete'
  progress: number
  message: string
}

interface UseExportDataReturn {
  exportFuelRecords: (options: ExportOptions) => Promise<void>
  exportMaintenanceRecords: (options: ExportOptions) => Promise<void>
  exportInventoryData: (options: ExportOptions) => Promise<void>
  exportAssetData: (options: ExportOptions) => Promise<void>
  exportComprehensiveReport: (options: ExportOptions) => Promise<void>
  isExporting: boolean
  progress: ExportProgress | null
  error: string | null
}

export const useExportData = (): UseExportDataReturn => {
  const [isExporting, setIsExporting] = useState(false)
  const [progress, setProgress] = useState<ExportProgress | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Update progress
  const updateProgress = useCallback((stage: ExportProgress['stage'], progress: number, message: string) => {
    setProgress({ stage, progress, message })
  }, [])

  // Generate CSV content
  const generateCSV = useCallback((data: ExportRecord[], headers: string[]): string => {
    const csvHeaders = headers.join(',')
    const csvRows = data.map(row => 
      headers.map(header => {
        const value = row[header]
        // Handle special characters and quotes
        if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
          return `"${value.replace(/"/g, '""')}"`
        }
        return value ?? ''
      }).join(',')
    )
    
    return [csvHeaders, ...csvRows].join('\n')
  }, [])

  // Generate Excel content (simplified - in real implementation use a library like xlsx)
  const generateExcel = useCallback((data: ExportRecord[], headers: string[], sheetName: string): Blob => {
    // This is a simplified implementation
    // In production, use libraries like xlsx or exceljs for proper Excel generation
    
    // Convert to Excel-like format (basic implementation)
    const excelContent = `<?xml version="1.0"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
<Worksheet ss:Name="${sheetName}">
<Table>
${headers.map(header => `<Row><Cell><Data ss:Type="String">${header}</Data></Cell></Row>`).join('')}
${data.map(row => 
  `<Row>${headers.map(header => 
    `<Cell><Data ss:Type="String">${row[header] ?? ''}</Data></Cell>`
  ).join('')}</Row>`
).join('')}
</Table>
</Worksheet>
</Workbook>`
    
    return new Blob([excelContent], { type: 'application/vnd.ms-excel' })
  }, [])

  // Generate PDF content (simplified - in real implementation use a library like jsPDF)
  const generatePDF = useCallback((data: ExportRecord[], headers: string[], title: string): Blob => {
    // This is a simplified implementation
    // In production, use libraries like jsPDF or puppeteer for proper PDF generation
    
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <title>${title}</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    h1 { color: #333; border-bottom: 2px solid #333; padding-bottom: 10px; }
    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
    th { background-color: #f2f2f2; font-weight: bold; }
    tr:nth-child(even) { background-color: #f9f9f9; }
    .export-info { color: #666; font-size: 12px; margin-bottom: 20px; }
  </style>
</head>
<body>
  <h1>${title}</h1>
  <div class="export-info">
    Generated on: ${new Date().toLocaleString()}<br>
    Total Records: ${data.length}
  </div>
  <table>
    <thead>
      <tr>${headers.map(header => `<th>${header}</th>`).join('')}</tr>
    </thead>
    <tbody>
      ${data.map(row => 
        `<tr>${headers.map(header => `<td>${row[header] ?? ''}</td>`).join('')}</tr>`
      ).join('')}
    </tbody>
  </table>
</body>
</html>`
    
    return new Blob([htmlContent], { type: 'text/html' })
  }, [])

  // Download file
  const downloadFile = useCallback((blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }, [])

  // Export fuel records
  const exportFuelRecords = useCallback(async (options: ExportOptions) => {
    try {
      setIsExporting(true)
      setError(null)
      
      updateProgress('preparing', 10, 'Preparing fuel records export...')
      
      // Build query
      let query = supabase
        .from('fuel_records')
        .select(`
          *,
          assets!inner(
            id,
            name,
            type,
            location
          )
        `)
      
      // Apply filters
      if (options.dateRange) {
        query = query
          .gte('date', options.dateRange.start)
          .lte('date', options.dateRange.end)
      }
      
      if (options.assetIds && options.assetIds.length > 0) {
        query = query.in('asset_id', options.assetIds)
      }
      
      updateProgress('fetching', 30, 'Fetching fuel records...')
      
      const { data, error: fetchError } = await query.order('date', { ascending: false })
      
      if (fetchError) throw fetchError
      
      updateProgress('processing', 60, 'Processing data...')
      
      // Transform data for export with proper typing
      type FuelRecordWithAsset = FuelRecord & {
        assets: {
          id: string
          name: string
          type: string
          location: string | null
        }
      }
      
      const exportData: FuelRecordExport[] = (data as FuelRecordWithAsset[])?.map(record => ({
        'Date': new Date(record.date).toLocaleDateString(),
        'Asset Name': record.assets?.name ?? 'N/A',
        'Asset Type': record.assets?.type ?? 'N/A',
        'Location': record.assets?.location ?? 'N/A',
        'Fuel Type': record.fuel_type ?? 'N/A',
        'Quantity (L)': record.quantity,
        'Price per Liter': record.price_per_liter?.toFixed(2) ?? 'N/A',
        'Total Cost': record.cost?.toFixed(2) ?? 'N/A',
        'Receipt Number': record.receipt_number ?? 'N/A',
        'Fuel Grade': record.fuel_grade ?? 'N/A',
        'Odometer Reading': record.odometer_reading?.toString() ?? 'N/A',
        'Notes': record.notes ?? ''
      })) ?? []
      
      const headers = Object.keys(exportData[0] ?? {})
      
      updateProgress('generating', 80, 'Generating export file...')
      
      // Generate file based on format
      const timestamp = new Date().toISOString().split('T')[0]
      let filename: string
      let blob: Blob
      
      switch (options.format) {
        case 'csv':
          filename = `fuel-records-${timestamp}.csv`
          blob = new Blob([generateCSV(exportData, headers)], { type: 'text/csv' })
          break
        case 'excel':
          filename = `fuel-records-${timestamp}.xlsx`
          blob = generateExcel(exportData, headers, 'Fuel Records')
          break
        case 'pdf':
          filename = `fuel-records-${timestamp}.pdf`
          blob = generatePDF(exportData, headers, 'Fuel Records Report')
          break
        default:
          throw new Error('Unsupported export format')
      }
      
      updateProgress('complete', 100, 'Download ready!')
      
      downloadFile(blob, filename)
      toast.success(`Fuel records exported successfully as ${options.format.toUpperCase()}`)
      
    } catch (err) {
      const error = err as Error
      console.error('Export error:', error)
      setError(error.message ?? 'Export failed')
      toast.error('Failed to export fuel records')
    } finally {
      setIsExporting(false)
      setTimeout(() => setProgress(null), 3000)
    }
  }, [updateProgress, generateCSV, generateExcel, generatePDF, downloadFile])

  // Export maintenance records
  const exportMaintenanceRecords = useCallback(async (options: ExportOptions) => {
    try {
      setIsExporting(true)
      setError(null)
      
      updateProgress('preparing', 10, 'Preparing maintenance records export...')
      
      // Fetch maintenance data from Supabase
      updateProgress('fetching', 30, 'Fetching maintenance records...')
      
      const { data: maintenanceData, error: fetchError } = await supabase
        .from('maintenance_schedules')
        .select('*')
        .order('next_due_date', { ascending: false })
      
      if (fetchError) throw fetchError
      
      updateProgress('processing', 60, 'Processing maintenance data...')
      
      const exportData: ExportRecord[] = (maintenanceData ?? []).map(schedule => ({
        'Date': schedule.last_completed 
          ? new Date(schedule.last_completed).toLocaleDateString() 
          : 'Not yet completed',
        'Equipment': schedule.equipment_name,
        'Maintenance Type': schedule.maintenance_type,
        'Status': schedule.status,
        'Priority': schedule.priority,
        'Assigned To': schedule.assigned_technician,
        'Current Hours': schedule.current_hours?.toString() ?? 'N/A',
        'Interval Type': schedule.interval_type,
        'Interval Value': schedule.interval_value.toString(),
        'Next Due Date': new Date(schedule.next_due_date).toLocaleDateString(),
        'Estimated Cost': schedule.estimated_cost?.toFixed(2) ?? 'N/A',
        'Failure Probability': `${(schedule.failure_probability * 100).toFixed(1)}%`,
        'Notes': schedule.notes ?? ''
      }))
      
      const headers = Object.keys(exportData[0] ?? {})
      
      updateProgress('generating', 80, 'Generating export file...')
      
      const timestamp = new Date().toISOString().split('T')[0]
      let filename: string
      let blob: Blob
      
      switch (options.format) {
        case 'csv':
          filename = `maintenance-records-${timestamp}.csv`
          blob = new Blob([generateCSV(exportData, headers)], { type: 'text/csv' })
          break
        case 'excel':
          filename = `maintenance-records-${timestamp}.xlsx`
          blob = generateExcel(exportData, headers, 'Maintenance Records')
          break
        case 'pdf':
          filename = `maintenance-records-${timestamp}.pdf`
          blob = generatePDF(exportData, headers, 'Maintenance Records Report')
          break
        default:
          throw new Error('Unsupported export format')
      }
      
      updateProgress('complete', 100, 'Download ready!')
      
      downloadFile(blob, filename)
      toast.success(`Maintenance records exported successfully as ${options.format.toUpperCase()}`)
      
    } catch (err) {
      const error = err as Error
      console.error('Export error:', error)
      setError(error.message ?? 'Export failed')
      toast.error('Failed to export maintenance records')
    } finally {
      setIsExporting(false)
      setTimeout(() => setProgress(null), 3000)
    }
  }, [updateProgress, generateCSV, generateExcel, generatePDF, downloadFile])

  // Export inventory data
  const exportInventoryData = useCallback(async (options: ExportOptions) => {
    try {
      setIsExporting(true)
      setError(null)
      
      updateProgress('preparing', 10, 'Preparing inventory export...')
      
      const query = supabase
        .from('inventory')
        .select('*')
      
      updateProgress('fetching', 30, 'Fetching inventory data...')
      
      const { data, error: fetchError } = await query.order('name')
      
      if (fetchError) throw fetchError
      
      updateProgress('processing', 60, 'Processing inventory data...')
      
      const exportData: InventoryExport[] = (data as InventoryItem[])?.map(item => ({
        'Item Name': item.name,
        'Category': item.category,
        'Quantity': item.current_stock,
        'Unit': item.unit,
        'Location': item.location,
        'Status': item.status,
        'Minimum Stock': item.min_stock,
        'Cost per Unit': 'N/A', // Not in InventoryItem type
        'Total Value': 'N/A', // Not in InventoryItem type
        'Last Updated': new Date(item.updated_at).toLocaleDateString()
      })) ?? []
      
      const headers = Object.keys(exportData[0] ?? {})
      
      updateProgress('generating', 80, 'Generating export file...')
      
      const timestamp = new Date().toISOString().split('T')[0]
      let filename: string
      let blob: Blob
      
      switch (options.format) {
        case 'csv':
          filename = `inventory-${timestamp}.csv`
          blob = new Blob([generateCSV(exportData, headers)], { type: 'text/csv' })
          break
        case 'excel':
          filename = `inventory-${timestamp}.xlsx`
          blob = generateExcel(exportData, headers, 'Inventory')
          break
        case 'pdf':
          filename = `inventory-${timestamp}.pdf`
          blob = generatePDF(exportData, headers, 'Inventory Report')
          break
        default:
          throw new Error('Unsupported export format')
      }
      
      updateProgress('complete', 100, 'Download ready!')
      
      downloadFile(blob, filename)
      toast.success(`Inventory exported successfully as ${options.format.toUpperCase()}`)
      
    } catch (err) {
      const error = err as Error
      console.error('Export error:', error)
      setError(error.message ?? 'Export failed')
      toast.error('Failed to export inventory')
    } finally {
      setIsExporting(false)
      setTimeout(() => setProgress(null), 3000)
    }
  }, [updateProgress, generateCSV, generateExcel, generatePDF, downloadFile])

  // Export asset data
  const exportAssetData = useCallback(async (options: ExportOptions) => {
    try {
      setIsExporting(true)
      setError(null)
      
      updateProgress('preparing', 10, 'Preparing asset export...')
      
      const query = supabase
        .from('assets')
        .select('*')
      
      updateProgress('fetching', 30, 'Fetching asset data...')
      
      const { data, error: fetchError } = await query.order('name')
      
      if (fetchError) throw fetchError
      
      updateProgress('processing', 60, 'Processing asset data...')
      
      const exportData: AssetExport[] = (data as Asset[])?.map(asset => ({
        'Asset Name': asset.name,
        'Type': asset.type,
        'Model': asset.model ?? 'N/A',
        'Serial Number': asset.serial_number ?? 'N/A',
        'Location': asset.location ?? 'N/A',
        'Status': asset.status,
        'Purchase Date': asset.purchase_date ? new Date(asset.purchase_date).toLocaleDateString() : 'N/A',
        'Purchase Cost': asset.purchase_cost?.toFixed(2) ?? 'N/A',
        'Operating Hours': asset.current_hours ?? 0,
        'Last Maintenance': 'N/A', // Not in Asset type
        'Created': new Date(asset.created_at).toLocaleDateString()
      })) ?? []
      
      const headers = Object.keys(exportData[0] ?? {})
      
      updateProgress('generating', 80, 'Generating export file...')
      
      const timestamp = new Date().toISOString().split('T')[0]
      let filename: string
      let blob: Blob
      
      switch (options.format) {
        case 'csv':
          filename = `assets-${timestamp}.csv`
          blob = new Blob([generateCSV(exportData, headers)], { type: 'text/csv' })
          break
        case 'excel':
          filename = `assets-${timestamp}.xlsx`
          blob = generateExcel(exportData, headers, 'Assets')
          break
        case 'pdf':
          filename = `assets-${timestamp}.pdf`
          blob = generatePDF(exportData, headers, 'Assets Report')
          break
        default:
          throw new Error('Unsupported export format')
      }
      
      updateProgress('complete', 100, 'Download ready!')
      
      downloadFile(blob, filename)
      toast.success(`Assets exported successfully as ${options.format.toUpperCase()}`)
      
    } catch (err) {
      const error = err as Error
      console.error('Export error:', error)
      setError(error.message ?? 'Export failed')
      toast.error('Failed to export assets')
    } finally {
      setIsExporting(false)
      setTimeout(() => setProgress(null), 3000)
    }
  }, [updateProgress, generateCSV, generateExcel, generatePDF, downloadFile])

  // Export comprehensive report
  const exportComprehensiveReport = useCallback(async (options: ExportOptions) => {
    try {
      setIsExporting(true)
      setError(null)
      
      updateProgress('preparing', 10, 'Preparing comprehensive report...')
      
      // Fetch data from multiple sources
      updateProgress('fetching', 30, 'Fetching all data sources...')
      
      const [assetsResult, fuelResult, maintenanceResult, inventoryResult] = await Promise.all([
        supabase.from('assets').select('*'),
        supabase.from('fuel_records').select('quantity, cost'),
        supabase.from('maintenance_schedules').select('*'),
        supabase.from('inventory_items').select('*')
      ])
      
      if (assetsResult.error) throw assetsResult.error
      if (fuelResult.error) throw fuelResult.error
      if (maintenanceResult.error) throw maintenanceResult.error
      if (inventoryResult.error) throw inventoryResult.error
      
      updateProgress('processing', 60, 'Processing comprehensive data...')
      
      const assets = assetsResult.data ?? []
      const fuelRecords = fuelResult.data ?? []
      const maintenance = maintenanceResult.data ?? []
      const inventory = inventoryResult.data ?? []
      
      const totalFuel = fuelRecords.reduce((sum, r) => sum + (r.quantity ?? 0), 0)
      const totalFuelCost = fuelRecords.reduce((sum, r) => sum + (r.cost ?? 0), 0)
      const avgFuelPrice = totalFuel > 0 ? totalFuelCost / totalFuel : 0
      
      const comprehensiveData: ExportRecord[] = [
        {
          'Report Section': 'Assets Summary',
          'Total Assets': assets.length.toString(),
          'Active Assets': assets.filter(a => a.status === 'active').length.toString(),
          'In Maintenance': assets.filter(a => a.status === 'maintenance').length.toString(),
          'Retired': assets.filter(a => a.status === 'retired').length.toString(),
          'Total Purchase Cost': assets.reduce((sum, a) => sum + (a.purchase_cost ?? 0), 0).toFixed(2)
        },
        {
          'Report Section': 'Fuel Consumption',
          'Total Records': fuelRecords.length.toString(),
          'Total Fuel Used (L)': totalFuel.toFixed(2),
          'Total Cost': totalFuelCost.toFixed(2),
          'Average Price/L': avgFuelPrice.toFixed(2),
          'Avg Fuel per Record': (totalFuel / Math.max(fuelRecords.length, 1)).toFixed(2)
        },
        {
          'Report Section': 'Maintenance',
          'Total Schedules': maintenance.length.toString(),
          'Scheduled': maintenance.filter(m => m.status === 'scheduled').length.toString(),
          'In Progress': maintenance.filter(m => m.status === 'in_progress').length.toString(),
          'Completed': maintenance.filter(m => m.status === 'completed').length.toString(),
          'Overdue': maintenance.filter(m => m.status === 'overdue').length.toString(),
          'High Priority': maintenance.filter(m => m.priority === 'high').length.toString()
        },
        {
          'Report Section': 'Inventory',
          'Total Items': inventory.length.toString(),
          'In Stock': inventory.filter(i => i.status === 'in_stock').length.toString(),
          'Low Stock': inventory.filter(i => i.status === 'low_stock').length.toString(),
          'Out of Stock': inventory.filter(i => i.status === 'out_of_stock').length.toString(),
          'Total Value': inventory.reduce((sum, i) => sum + ((i.unit_cost ?? 0) * i.current_stock), 0).toFixed(2)
        }
      ]
      
      const headers = Object.keys(comprehensiveData[0] ?? {})
      
      updateProgress('generating', 80, 'Generating comprehensive report...')
      
      const timestamp = new Date().toISOString().split('T')[0]
      let filename: string
      let blob: Blob
      
      switch (options.format) {
        case 'csv':
          filename = `comprehensive-report-${timestamp}.csv`
          blob = new Blob([generateCSV(comprehensiveData, headers)], { type: 'text/csv' })
          break
        case 'excel':
          filename = `comprehensive-report-${timestamp}.xlsx`
          blob = generateExcel(comprehensiveData, headers, 'Comprehensive Report')
          break
        case 'pdf':
          filename = `comprehensive-report-${timestamp}.pdf`
          blob = generatePDF(comprehensiveData, headers, 'Comprehensive Farm Management Report')
          break
        default:
          throw new Error('Unsupported export format')
      }
      
      updateProgress('complete', 100, 'Download ready!')
      
      downloadFile(blob, filename)
      toast.success(`Comprehensive report exported successfully as ${options.format.toUpperCase()}`)
      
    } catch (err) {
      const error = err as Error
      console.error('Export error:', error)
      setError(error.message ?? 'Export failed')
      toast.error('Failed to export comprehensive report')
    } finally {
      setIsExporting(false)
      setTimeout(() => setProgress(null), 3000)
    }
  }, [updateProgress, generateCSV, generateExcel, generatePDF, downloadFile])

  return {
    exportFuelRecords,
    exportMaintenanceRecords,
    exportInventoryData,
    exportAssetData,
    exportComprehensiveReport,
    isExporting,
    progress,
    error
  }
}

export default useExportData
