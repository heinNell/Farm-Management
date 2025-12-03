import type { JobCard } from '../types/database'
import type { CurrencyCode } from './currency'
import { getCurrencySymbol, getCurrentCurrency } from './currency'

/**
 * Generate a PDF document for a single job card
 */
export function generateJobCardPDF(job: JobCard, assetName?: string, currencyCode?: CurrencyCode): Blob {
  // Use the currency from settings if not explicitly provided
  const effectiveCurrency = currencyCode ?? getCurrentCurrency()
  // Calculate duration
  const createdDate = new Date(job.created_at)
  const endDate = job.status === 'completed' && job.completed_date 
    ? new Date(job.completed_date) 
    : new Date()
  const durationMs = endDate.getTime() - createdDate.getTime()
  const durationDays = Math.floor(durationMs / (1000 * 60 * 60 * 24))
  const durationHours = Math.floor((durationMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  
  const currencySymbol = getCurrencySymbol(effectiveCurrency)

  const getPriorityColor = (priority: string): string => {
    switch (priority) {
      case 'high': return '#DC2626'
      case 'medium': return '#D97706'
      case 'low': return '#059669'
      default: return '#6B7280'
    }
  }

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'completed': return '#059669'
      case 'in_progress': return '#2563EB'
      case 'review': return '#D97706'
      case 'urgent': return '#DC2626'
      case 'cancelled': return '#6B7280'
      default: return '#6B7280'
    }
  }

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Job Card - ${job.title}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: Arial, sans-serif; 
      padding: 40px;
      color: #1F2937;
      line-height: 1.5;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 3px solid #059669;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    .header-left h1 {
      font-size: 28px;
      color: #059669;
      margin-bottom: 8px;
    }
    .header-left .subtitle {
      color: #6B7280;
      font-size: 14px;
    }
    .header-right {
      text-align: right;
    }
    .job-number {
      font-size: 12px;
      color: #6B7280;
      margin-bottom: 8px;
    }
    .status-badge {
      display: inline-block;
      padding: 6px 16px;
      border-radius: 20px;
      font-weight: bold;
      font-size: 14px;
      text-transform: uppercase;
      color: white;
      background-color: ${getStatusColor(job.status)};
    }
    .priority-badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 12px;
      font-weight: 600;
      font-size: 12px;
      text-transform: uppercase;
      color: white;
      background-color: ${getPriorityColor(job.priority)};
      margin-top: 8px;
    }
    .section {
      margin-bottom: 24px;
    }
    .section-title {
      font-size: 14px;
      font-weight: bold;
      color: #059669;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 12px;
      padding-bottom: 6px;
      border-bottom: 1px solid #E5E7EB;
    }
    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }
    .info-item {
      margin-bottom: 12px;
    }
    .info-label {
      font-size: 12px;
      color: #6B7280;
      margin-bottom: 4px;
    }
    .info-value {
      font-size: 14px;
      font-weight: 500;
      color: #1F2937;
    }
    .description-box {
      background-color: #F9FAFB;
      padding: 16px;
      border-radius: 8px;
      border-left: 4px solid #059669;
    }
    .tags {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
    .tag {
      background-color: #E5E7EB;
      color: #374151;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 12px;
    }
    .duration-box {
      background-color: #EFF6FF;
      padding: 12px 16px;
      border-radius: 8px;
      display: inline-block;
    }
    .duration-label {
      font-size: 12px;
      color: #3B82F6;
    }
    .duration-value {
      font-size: 18px;
      font-weight: bold;
      color: #1E40AF;
    }
    .notes-box {
      background-color: #FEF3C7;
      padding: 16px;
      border-radius: 8px;
      border-left: 4px solid #D97706;
    }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #E5E7EB;
      font-size: 11px;
      color: #9CA3AF;
      text-align: center;
    }
    @media print {
      body { padding: 20px; }
      .header { page-break-after: avoid; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="header-left">
      <h1>Job Card</h1>
      <div class="subtitle">Farm Management System</div>
    </div>
    <div class="header-right">
      <div class="job-number">ID: ${String(job.id).substring(0, 8).toUpperCase()}</div>
      <div class="status-badge">${job.status.replace('_', ' ')}</div>
      <div><span class="priority-badge">${job.priority} Priority</span></div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Job Details</div>
    <h2 style="font-size: 22px; margin-bottom: 16px;">${job.title}</h2>
    <div class="description-box">
      <p>${job.description || 'No description provided.'}</p>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Assignment Information</div>
    <div class="info-grid">
      <div class="info-item">
        <div class="info-label">Assigned To</div>
        <div class="info-value">${job.assigned_to}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Location</div>
        <div class="info-value">${job.location}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Asset/Equipment</div>
        <div class="info-value">${assetName || 'Not assigned'}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Hour Meter Reading</div>
        <div class="info-value">${job.hour_meter_reading ? `${job.hour_meter_reading} hrs` : 'N/A'}</div>
      </div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Timeline</div>
    <div class="info-grid">
      <div class="info-item">
        <div class="info-label">Created</div>
        <div class="info-value">${new Date(job.created_at).toLocaleString()}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Due Date</div>
        <div class="info-value">${job.due_date ? new Date(job.due_date).toLocaleDateString() : 'Not set'}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Estimated Hours</div>
        <div class="info-value">${job.estimated_hours} hours</div>
      </div>
      <div class="info-item">
        <div class="info-label">Actual Hours</div>
        <div class="info-value">${job.actual_hours ? `${job.actual_hours} hours` : 'Not recorded'}</div>
      </div>
      ${job.completed_date ? `
      <div class="info-item">
        <div class="info-label">Completed</div>
        <div class="info-value">${new Date(job.completed_date).toLocaleString()}</div>
      </div>
      ` : ''}
    </div>
    <div style="margin-top: 16px;">
      <div class="duration-box">
        <div class="duration-label">${job.status === 'completed' ? 'Total Duration' : 'Time Active'}</div>
        <div class="duration-value">${durationDays} days, ${durationHours} hours</div>
      </div>
    </div>
  </div>

  ${job.tags && job.tags.length > 0 ? `
  <div class="section">
    <div class="section-title">Tags</div>
    <div class="tags">
      ${job.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
    </div>
  </div>
  ` : ''}

  ${job.notes ? `
  <div class="section">
    <div class="section-title">Notes</div>
    <div class="notes-box">
      <p>${job.notes}</p>
    </div>
  </div>
  ` : ''}

  ${job.extended_data && job.extended_data.repair_items && job.extended_data.repair_items.length > 0 ? `
  <div class="section">
    <div class="section-title">Repair & Replacement Items</div>
    <table style="width: 100%; border-collapse: collapse; margin-top: 12px;">
      <thead>
        <tr style="background: #F9FAFB;">
          <th style="padding: 8px; text-align: left; border: 1px solid #E5E7EB; font-size: 12px;">#</th>
          <th style="padding: 8px; text-align: left; border: 1px solid #E5E7EB; font-size: 12px;">Description</th>
          <th style="padding: 8px; text-align: center; border: 1px solid #E5E7EB; font-size: 12px;">Type</th>
          <th style="padding: 8px; text-align: center; border: 1px solid #E5E7EB; font-size: 12px;">Status</th>
          <th style="padding: 8px; text-align: right; border: 1px solid #E5E7EB; font-size: 12px;">Cost</th>
        </tr>
      </thead>
      <tbody>
        ${job.extended_data.repair_items.map((item, idx) => `
          <tr style="background: ${item.status === 'completed' ? '#F0FDF4' : '#FFFFFF'};">
            <td style="padding: 8px; border: 1px solid #E5E7EB; font-size: 12px;">${idx + 1}</td>
            <td style="padding: 8px; border: 1px solid #E5E7EB; font-size: 12px;">${item.description}</td>
            <td style="padding: 8px; text-align: center; border: 1px solid #E5E7EB; font-size: 12px;">
              <span style="padding: 2px 8px; border-radius: 10px; font-size: 10px; background: ${item.type === 'replace' ? '#FEE2E2' : '#DBEAFE'}; color: ${item.type === 'replace' ? '#DC2626' : '#2563EB'};">
                ${item.type.toUpperCase()}
              </span>
            </td>
            <td style="padding: 8px; text-align: center; border: 1px solid #E5E7EB; font-size: 12px;">
              <span style="padding: 2px 8px; border-radius: 10px; font-size: 10px; background: ${item.status === 'completed' ? '#D1FAE5' : '#FEF3C7'}; color: ${item.status === 'completed' ? '#059669' : '#D97706'};">
                ${item.status.toUpperCase()}
              </span>
            </td>
            <td style="padding: 8px; text-align: right; border: 1px solid #E5E7EB; font-size: 12px;">${currencySymbol}${item.cost.toFixed(2)}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  </div>
  ` : ''}

  ${job.extended_data && job.extended_data.spare_allocations && job.extended_data.spare_allocations.length > 0 ? `
  <div class="section">
    <div class="section-title">Spare Parts Used</div>
    <table style="width: 100%; border-collapse: collapse; margin-top: 12px;">
      <thead>
        <tr style="background: #F9FAFB;">
          <th style="padding: 8px; text-align: left; border: 1px solid #E5E7EB; font-size: 12px;">Item</th>
          <th style="padding: 8px; text-align: left; border: 1px solid #E5E7EB; font-size: 12px;">SKU</th>
          <th style="padding: 8px; text-align: center; border: 1px solid #E5E7EB; font-size: 12px;">Qty</th>
          <th style="padding: 8px; text-align: right; border: 1px solid #E5E7EB; font-size: 12px;">Unit Cost</th>
          <th style="padding: 8px; text-align: right; border: 1px solid #E5E7EB; font-size: 12px;">Total</th>
        </tr>
      </thead>
      <tbody>
        ${job.extended_data.spare_allocations.map(item => `
          <tr>
            <td style="padding: 8px; border: 1px solid #E5E7EB; font-size: 12px;">${item.item_name}</td>
            <td style="padding: 8px; border: 1px solid #E5E7EB; font-size: 12px;">${item.item_sku}</td>
            <td style="padding: 8px; text-align: center; border: 1px solid #E5E7EB; font-size: 12px;">${item.quantity}</td>
            <td style="padding: 8px; text-align: right; border: 1px solid #E5E7EB; font-size: 12px;">${currencySymbol}${item.unit_cost.toFixed(2)}</td>
            <td style="padding: 8px; text-align: right; border: 1px solid #E5E7EB; font-size: 12px; font-weight: 600;">${currencySymbol}${item.total_cost.toFixed(2)}</td>
          </tr>
        `).join('')}
      </tbody>
      <tfoot>
        <tr style="background: #F9FAFB;">
          <td colspan="4" style="padding: 8px; text-align: right; border: 1px solid #E5E7EB; font-size: 12px; font-weight: 600;">Total Parts:</td>
          <td style="padding: 8px; text-align: right; border: 1px solid #E5E7EB; font-size: 12px; font-weight: 700;">${currencySymbol}${job.extended_data.spare_allocations.reduce((sum, i) => sum + i.total_cost, 0).toFixed(2)}</td>
        </tr>
      </tfoot>
    </table>
  </div>
  ` : ''}

  ${job.extended_data && job.extended_data.ir_requests && job.extended_data.ir_requests.length > 0 ? `
  <div class="section">
    <div class="section-title">IR Requests</div>
    <table style="width: 100%; border-collapse: collapse; margin-top: 12px;">
      <thead>
        <tr style="background: #F9FAFB;">
          <th style="padding: 8px; text-align: left; border: 1px solid #E5E7EB; font-size: 12px;">Description</th>
          <th style="padding: 8px; text-align: center; border: 1px solid #E5E7EB; font-size: 12px;">Qty</th>
          <th style="padding: 8px; text-align: center; border: 1px solid #E5E7EB; font-size: 12px;">Status</th>
          <th style="padding: 8px; text-align: right; border: 1px solid #E5E7EB; font-size: 12px;">Est. Cost</th>
          <th style="padding: 8px; text-align: right; border: 1px solid #E5E7EB; font-size: 12px;">Actual Cost</th>
        </tr>
      </thead>
      <tbody>
        ${job.extended_data.ir_requests.map(item => `
          <tr>
            <td style="padding: 8px; border: 1px solid #E5E7EB; font-size: 12px;">${item.item_description}</td>
            <td style="padding: 8px; text-align: center; border: 1px solid #E5E7EB; font-size: 12px;">${item.quantity}</td>
            <td style="padding: 8px; text-align: center; border: 1px solid #E5E7EB; font-size: 12px;">
              <span style="padding: 2px 8px; border-radius: 10px; font-size: 10px; background: ${item.status === 'received' ? '#D1FAE5' : '#FEF3C7'}; color: ${item.status === 'received' ? '#059669' : '#D97706'};">
                ${item.status.toUpperCase()}
              </span>
            </td>
            <td style="padding: 8px; text-align: right; border: 1px solid #E5E7EB; font-size: 12px;">${currencySymbol}${(item.estimated_cost || 0).toFixed(2)}</td>
            <td style="padding: 8px; text-align: right; border: 1px solid #E5E7EB; font-size: 12px; font-weight: 600;">${currencySymbol}${(item.actual_cost || 0).toFixed(2)}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  </div>
  ` : ''}

  ${job.extended_data && job.extended_data.third_party_services && job.extended_data.third_party_services.length > 0 ? `
  <div class="section">
    <div class="section-title">Third-Party Services</div>
    <table style="width: 100%; border-collapse: collapse; margin-top: 12px;">
      <thead>
        <tr style="background: #F9FAFB;">
          <th style="padding: 8px; text-align: left; border: 1px solid #E5E7EB; font-size: 12px;">Provider</th>
          <th style="padding: 8px; text-align: left; border: 1px solid #E5E7EB; font-size: 12px;">Service</th>
          <th style="padding: 8px; text-align: center; border: 1px solid #E5E7EB; font-size: 12px;">Status</th>
          <th style="padding: 8px; text-align: right; border: 1px solid #E5E7EB; font-size: 12px;">Quoted</th>
          <th style="padding: 8px; text-align: right; border: 1px solid #E5E7EB; font-size: 12px;">Actual</th>
        </tr>
      </thead>
      <tbody>
        ${job.extended_data.third_party_services.map(item => `
          <tr>
            <td style="padding: 8px; border: 1px solid #E5E7EB; font-size: 12px;">${item.service_provider}</td>
            <td style="padding: 8px; border: 1px solid #E5E7EB; font-size: 12px;">${item.service_description}</td>
            <td style="padding: 8px; text-align: center; border: 1px solid #E5E7EB; font-size: 12px;">
              <span style="padding: 2px 8px; border-radius: 10px; font-size: 10px; background: ${item.status === 'completed' ? '#D1FAE5' : '#FEF3C7'}; color: ${item.status === 'completed' ? '#059669' : '#D97706'};">
                ${item.status.toUpperCase()}
              </span>
            </td>
            <td style="padding: 8px; text-align: right; border: 1px solid #E5E7EB; font-size: 12px;">${currencySymbol}${(item.quoted_cost || 0).toFixed(2)}</td>
            <td style="padding: 8px; text-align: right; border: 1px solid #E5E7EB; font-size: 12px; font-weight: 600;">${currencySymbol}${(item.actual_cost || 0).toFixed(2)}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  </div>
  ` : ''}

  ${job.extended_data ? `
  <div class="section">
    <div class="section-title">Cost Summary</div>
    <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-top: 12px;">
      <div style="padding: 16px; background: #EFF6FF; border-radius: 8px; text-align: center;">
        <div style="font-size: 20px; font-weight: bold; color: #2563EB;">${currencySymbol}${(job.extended_data.total_parts_cost || 0).toFixed(2)}</div>
        <div style="font-size: 11px; color: #6B7280; margin-top: 4px;">Parts & Materials</div>
      </div>
      <div style="padding: 16px; background: #FEF3C7; border-radius: 8px; text-align: center;">
        <div style="font-size: 20px; font-weight: bold; color: #D97706;">${currencySymbol}${(job.extended_data.total_service_cost || 0).toFixed(2)}</div>
        <div style="font-size: 11px; color: #6B7280; margin-top: 4px;">Services</div>
      </div>
      <div style="padding: 16px; background: #F3F4F6; border-radius: 8px; text-align: center;">
        <div style="font-size: 20px; font-weight: bold; color: #374151;">${currencySymbol}${(job.extended_data.total_labor_cost || 0).toFixed(2)}</div>
        <div style="font-size: 11px; color: #6B7280; margin-top: 4px;">Labor</div>
      </div>
      <div style="padding: 16px; background: #D1FAE5; border-radius: 8px; text-align: center;">
        <div style="font-size: 20px; font-weight: bold; color: #059669;">${currencySymbol}${((job.extended_data.total_parts_cost || 0) + (job.extended_data.total_service_cost || 0) + (job.extended_data.total_labor_cost || 0)).toFixed(2)}</div>
        <div style="font-size: 11px; color: #6B7280; margin-top: 4px;">TOTAL</div>
      </div>
    </div>
  </div>
  ` : ''}

  <div class="footer">
    <p>Generated on ${new Date().toLocaleString()} | Farm Management System</p>
    <p>This document is for internal use only.</p>
  </div>
</body>
</html>`

  return new Blob([htmlContent], { type: 'text/html' })
}

/**
 * Download a job card as PDF (opens print dialog for PDF save)
 */
export function downloadJobCardPDF(job: JobCard, assetName?: string, currencyCode?: CurrencyCode): void {
  // Use the currency from settings if not explicitly provided
  const effectiveCurrency = currencyCode ?? getCurrentCurrency()
  const blob = generateJobCardPDF(job, assetName, effectiveCurrency)
  const url = URL.createObjectURL(blob)
  
  // Open in new window for printing/PDF save
  const printWindow = window.open(url, '_blank')
  if (printWindow) {
    printWindow.onload = () => {
      printWindow.print()
    }
  }
  
  // Cleanup URL after a delay
  setTimeout(() => URL.revokeObjectURL(url), 10000)
}

/**
 * Download job card as a direct file (HTML that can be saved/printed as PDF)
 */
export function downloadJobCardAsFile(job: JobCard, assetName?: string, currencyCode?: CurrencyCode): void {
  // Use the currency from settings if not explicitly provided
  const effectiveCurrency = currencyCode ?? getCurrentCurrency()
  const blob = generateJobCardPDF(job, assetName, effectiveCurrency)
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `job-card-${job.title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}-${String(job.id).substring(0, 8)}.html`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
