
import { useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

interface ExportOptions {
  format: 'csv' | 'excel' | 'pdf'
  dateRange?: {
    start: string
    end: string
  }
  assetIds?: string[]
  includeImages?: boolean
  groupBy?: 'asset' | 'date' | 'type' | 'none'
  filters?: Record<string, any>
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
  const generateCSV = useCallback((data: any[], headers: string[]): string => {
    const csvHeaders = headers.join(',')
    const csvRows = data.map(row => 
      headers.map(header => {
        const value = row[header]
        // Handle special characters and quotes
        if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
          return `"${value.replace(/"/g, '""')}"`
        }
        return value || ''
      }).join(',')
    )
    
    return [csvHeaders, ...csvRows].join('\n')
  }, [])

  // Generate Excel content (simplified - in real implementation use a library like xlsx)
  const generateExcel = useCallback(async (data: any[], headers: string[], sheetName: string): Promise<Blob> => {
    // This is a simplified implementation
    // In production, use libraries like xlsx or exceljs for proper Excel generation
    const csvContent = generateCSV(data, headers)
    
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
    `<Cell><Data ss:Type="String">${row[header] || ''}</Data></Cell>`
  ).join('')}</Row>`
).join('')}
</Table>
</Worksheet>
</Workbook>`
    
    return new Blob([excelContent], { type: 'application/vnd.ms-excel' })
  }, [generateCSV])

  // Generate PDF content (simplified - in real implementation use a library like jsPDF)
  const generatePDF = useCallback(async (data: any[], headers: string[], title: string): Promise<Blob> => {
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
        `<tr>${headers.map(header => `<td>${row[header] || ''}</td>`).join('')}</tr>`
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
      
      // Transform data for export
      const exportData = data?.map(record => ({
        'Date': new Date(record.date).toLocaleDateString(),
        'Asset Name': record.assets?.name,
        'Asset Type': record.assets?.type,
        'Location': record.assets?.location,
        'Fuel Type': record.fuel_type || 'N/A',
        'Quantity (L)': record.quantity,
        'Price per Liter': record.price_per_liter?.toFixed(2),
        'Total Cost': record.cost?.toFixed(2),
        'Receipt Number': record.receipt_number || 'N/A',
        'Fuel Grade': record.fuel_grade || 'N/A',
        'Odometer Reading': record.odometer_reading || 'N/A',
        'Notes': record.notes || ''
      })) || []
      
      const headers = Object.keys(exportData[0] || {})
      
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
          blob = await generateExcel(exportData, headers, 'Fuel Records')
          break
        case 'pdf':
          filename = `fuel-records-${timestamp}.pdf`
          blob = await generatePDF(exportData, headers, 'Fuel Records Report')
          break
        default:
          throw new Error('Unsupported export format')
      }
      
      updateProgress('complete', 100, 'Download ready!')
      
      downloadFile(blob, filename)
      toast.success(`Fuel records exported successfully as ${options.format.toUpperCase()}`)
      
    } catch (err: any) {
      console.error('Export error:', err)
      setError(err.message || 'Export failed')
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
      
      // Fetch maintenance data (using mock data structure)
      updateProgress('fetching', 30, 'Fetching maintenance records...')
      
      // This would be replaced with actual Supabase query
      const mockMaintenanceData = [
        {
          'Date': '2024-01-15',
          'Asset Name': 'John Deere 8370R Tractor',
          'Maintenance Type': 'Oil Change',
          'Status': 'Completed',
          'Priority': 'High',
          'Assigned To': 'Mike Johnson',
          'Duration (hours)': '2',
          'Cost': '250.00',
          'Next Due': '2024-04-15'
        },
        {
          'Date': '2024-01-20',
          'Asset Name': 'Case IH 8250 Combine',
          'Maintenance Type': 'Belt Inspection',
          'Status': 'In Progress',
          'Priority': 'Medium',
          'Assigned To': 'Sarah Wilson',
          'Duration (hours)': '1',
          'Cost': '150.00',
          'Next Due': '2024-02-20'
        }
      ]
      
      updateProgress('processing', 60, 'Processing maintenance data...')
      
      const headers = Object.keys(mockMaintenanceData[0] || {})
      
      updateProgress('generating', 80, 'Generating export file...')
      
      const timestamp = new Date().toISOString().split('T')[0]
      let filename: string
      let blob: Blob
      
      switch (options.format) {
        case 'csv':
          filename = `maintenance-records-${timestamp}.csv`
          blob = new Blob([generateCSV(mockMaintenanceData, headers)], { type: 'text/csv' })
          break
        case 'excel':
          filename = `maintenance-records-${timestamp}.xlsx`
          blob = await generateExcel(mockMaintenanceData, headers, 'Maintenance Records')
          break
        case 'pdf':
          filename = `maintenance-records-${timestamp}.pdf`
          blob = await generatePDF(mockMaintenanceData, headers, 'Maintenance Records Report')
          break
        default:
          throw new Error('Unsupported export format')
      }
      
      updateProgress('complete', 100, 'Download ready!')
      
      downloadFile(blob, filename)
      toast.success(`Maintenance records exported successfully as ${options.format.toUpperCase()}`)
      
    } catch (err: any) {
      console.error('Export error:', err)
      setError(err.message || 'Export failed')
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
      
      let query = supabase
        .from('inventory')
        .select('*')
      
      updateProgress('fetching', 30, 'Fetching inventory data...')
      
      const { data, error: fetchError } = await query.order('name')
      
      if (fetchError) throw fetchError
      
      updateProgress('processing', 60, 'Processing inventory data...')
      
      const exportData = data?.map(item => ({
        'Item Name': item.name,
        'Category': item.category,
        'Quantity': item.quantity,
        'Unit': item.unit,
        'Location': item.location,
        'Status': item.status,
        'Minimum Stock': item.min_stock,
        'Cost per Unit': item.cost_per_unit?.toFixed(2),
        'Total Value': (item.quantity * (item.cost_per_unit || 0)).toFixed(2),
        'Last Updated': new Date(item.updated_at).toLocaleDateString()
      })) || []
      
      const headers = Object.keys(exportData[0] || {})
      
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
          blob = await generateExcel(exportData, headers, 'Inventory')
          break
        case 'pdf':
          filename = `inventory-${timestamp}.pdf`
          blob = await generatePDF(exportData, headers, 'Inventory Report')
          break
        default:
          throw new Error('Unsupported export format')
      }
      
      updateProgress('complete', 100, 'Download ready!')
      
      downloadFile(blob, filename)
      toast.success(`Inventory exported successfully as ${options.format.toUpperCase()}`)
      
    } catch (err: any) {
      console.error('Export error:', err)
      setError(err.message || 'Export failed')
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
      
      let query = supabase
        .from('assets')
        .select('*')
      
      updateProgress('fetching', 30, 'Fetching asset data...')
      
      const { data, error: fetchError } = await query.order('name')
      
      if (fetchError) throw fetchError
      
      updateProgress('processing', 60, 'Processing asset data...')
      
      const exportData = data?.map(asset => ({
        'Asset Name': asset.name,
        'Type': asset.type,
        'Model': asset.model,
        'Serial Number': asset.serial_number,
        'Location': asset.location,
        'Status': asset.status,
        'Purchase Date': asset.purchase_date ? new Date(asset.purchase_date).toLocaleDateString() : 'N/A',
        'Purchase Cost': asset.purchase_cost?.toFixed(2) || 'N/A',
        'Operating Hours': asset.operating_hours || 0,
        'Last Maintenance': asset.last_maintenance ? new Date(asset.last_maintenance).toLocaleDateString() : 'N/A',
        'Created': new Date(asset.created_at).toLocaleDateString()
      })) || []
      
      const headers = Object.keys(exportData[0] || {})
      
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
          blob = await generateExcel(exportData, headers, 'Assets')
          break
        case 'pdf':
          filename = `assets-${timestamp}.pdf`
          blob = await generatePDF(exportData, headers, 'Assets Report')
          break
        default:
          throw new Error('Unsupported export format')
      }
      
      updateProgress('complete', 100, 'Download ready!')
      
      downloadFile(blob, filename)
      toast.success(`Assets exported successfully as ${options.format.toUpperCase()}`)
      
    } catch (err: any) {
      console.error('Export error:', err)
      setError(err.message || 'Export failed')
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
      
      // This would combine multiple data sources
      updateProgress('fetching', 30, 'Fetching all data sources...')
      
      // Simulate comprehensive data
      const comprehensiveData = [
        {
          'Report Section': 'Assets Summary',
          'Total Assets': '12',
          'Active Assets': '10',
          'Maintenance Due': '3',
          'High Risk Assets': '2'
        },
        {
          'Report Section': 'Fuel Consumption',
          'Total Fuel Used (L)': '2,450',
          'Total Cost': '¥16,825',
          'Average Price/L': '¥6.87',
          'Efficiency Trend': 'Improving'
        },
        {
          'Report Section': 'Maintenance',
          'Completed Tasks': '28',
          'Pending Tasks': '5',
          'Overdue Tasks': '2',
          'Average Completion Time': '3.2 hours'
        }
      ]
      
      updateProgress('processing', 60, 'Processing comprehensive data...')
      
      const headers = Object.keys(comprehensiveData[0] || {})
      
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
          blob = await generateExcel(comprehensiveData, headers, 'Comprehensive Report')
          break
        case 'pdf':
          filename = `comprehensive-report-${timestamp}.pdf`
          blob = await generatePDF(comprehensiveData, headers, 'Comprehensive Farm Management Report')
          break
        default:
          throw new Error('Unsupported export format')
      }
      
      updateProgress('complete', 100, 'Download ready!')
      
      downloadFile(blob, filename)
      toast.success(`Comprehensive report exported successfully as ${options.format.toUpperCase()}`)
      
    } catch (err: any) {
      console.error('Export error:', err)
      setError(err.message || 'Export failed')
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
