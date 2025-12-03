import type { Asset, ChecklistItem, Inspection, InspectionSignature } from '../types/database'

interface InspectionPDFOptions {
  inspection: Inspection
  assetName?: string | undefined
  asset?: Asset | null | undefined
}

/**
 * Get status color for inspection status
 */
function getStatusColor(status: string): string {
  switch (status) {
    case 'completed': return '#059669'
    case 'in_progress': return '#2563EB'
    case 'scheduled': return '#6B7280'
    case 'overdue': return '#DC2626'
    case 'cancelled': return '#9CA3AF'
    default: return '#6B7280'
  }
}

/**
 * Get color for checklist item status
 */
function getItemStatusColor(status?: string): string {
  switch (status) {
    case 'good': return '#059669'
    case 'repair': return '#D97706'
    case 'replace': return '#DC2626'
    default: return '#6B7280'
  }
}

/**
 * Get background color for checklist item status
 */
function getItemStatusBgColor(status?: string): string {
  switch (status) {
    case 'good': return '#D1FAE5'
    case 'repair': return '#FEF3C7'
    case 'replace': return '#FEE2E2'
    default: return '#F3F4F6'
  }
}

/**
 * Get score color based on percentage
 */
function getScoreColor(score: number): string {
  if (score >= 80) return '#059669'
  if (score >= 60) return '#D97706'
  return '#DC2626'
}

/**
 * Group checklist items by category
 */
function groupByCategory(items: ChecklistItem[]): Record<string, ChecklistItem[]> {
  const groups: Record<string, ChecklistItem[]> = {}
  
  items.forEach(item => {
    const category = item.category || 'General'
    if (!groups[category]) {
      groups[category] = []
    }
    groups[category].push(item)
  })
  
  return groups
}

/**
 * Generate HTML for photos
 */
function generatePhotoHTML(photoUrls: string[]): string {
  if (!photoUrls || photoUrls.length === 0) return ''
  
  return `
    <div class="photos-grid">
      ${photoUrls.map((url, idx) => `
        <img src="${url}" alt="Evidence photo ${idx + 1}" class="evidence-photo" />
      `).join('')}
    </div>
  `
}

/**
 * Generate HTML for signature
 */
function generateSignatureHTML(signature: InspectionSignature | null | undefined): string {
  if (!signature) return '<p class="no-signature">Not yet signed</p>'
  
  return `
    <div class="signature-box">
      <img src="${signature.signature_data}" alt="Inspector Signature" class="signature-image" />
      <div class="signature-info">
        <span class="signature-name">${signature.inspector_name}</span>
        <span class="signature-date">${new Date(signature.signed_at).toLocaleString()}</span>
      </div>
    </div>
  `
}

/**
 * Generate checklist HTML
 */
function generateChecklistHTML(items: ChecklistItem[]): string {
  const grouped = groupByCategory(items)
  
  let html = ''
  
  for (const [category, categoryItems] of Object.entries(grouped)) {
    const goodCount = categoryItems.filter(i => i.status === 'good').length
    const repairCount = categoryItems.filter(i => i.status === 'repair').length
    const replaceCount = categoryItems.filter(i => i.status === 'replace').length
    const pendingCount = categoryItems.filter(i => !i.status || i.status === 'pending').length
    
    html += `
      <div class="category-section">
        <div class="category-header">
          <span class="category-name">${category}</span>
          <span class="category-stats">
            <span class="stat good">${goodCount} Good</span>
            <span class="stat repair">${repairCount} Repair</span>
            <span class="stat replace">${replaceCount} Replace</span>
            ${pendingCount > 0 ? `<span class="stat pending">${pendingCount} Pending</span>` : ''}
          </span>
        </div>
        <table class="checklist-table">
          <thead>
            <tr>
              <th class="col-num">#</th>
              <th class="col-desc">Description</th>
              <th class="col-status">Status</th>
              <th class="col-notes">Notes</th>
            </tr>
          </thead>
          <tbody>
            ${categoryItems.map((item, idx) => `
              <tr class="checklist-row ${item.status || 'pending'}">
                <td class="col-num">${idx + 1}</td>
                <td class="col-desc">${item.description}</td>
                <td class="col-status">
                  <span class="status-badge" style="background-color: ${getItemStatusBgColor(item.status)}; color: ${getItemStatusColor(item.status)}">
                    ${item.status ? item.status.toUpperCase() : 'PENDING'}
                  </span>
                </td>
                <td class="col-notes">${item.notes || '-'}</td>
              </tr>
              ${item.photo_urls && item.photo_urls.length > 0 ? `
                <tr class="photo-row">
                  <td colspan="4">
                    ${generatePhotoHTML(item.photo_urls)}
                  </td>
                </tr>
              ` : ''}
            `).join('')}
          </tbody>
        </table>
      </div>
    `
  }
  
  return html
}

/**
 * Generate issues summary HTML
 */
function generateIssuesSummaryHTML(items: ChecklistItem[]): string {
  const issues = items.filter(i => i.status === 'repair' || i.status === 'replace')
  
  if (issues.length === 0) {
    return '<p class="no-issues">No issues found during this inspection.</p>'
  }
  
  return `
    <div class="issues-list">
      ${issues.map(item => `
        <div class="issue-item ${item.status}">
          <div class="issue-header">
            <span class="issue-status" style="background-color: ${getItemStatusBgColor(item.status)}; color: ${getItemStatusColor(item.status)}">
              ${item.status?.toUpperCase()}
            </span>
            <span class="issue-category">${item.category || 'General'}</span>
          </div>
          <p class="issue-desc">${item.description}</p>
          ${item.notes ? `<p class="issue-notes">${item.notes}</p>` : ''}
          ${item.photo_urls && item.photo_urls.length > 0 ? generatePhotoHTML(item.photo_urls) : ''}
        </div>
      `).join('')}
    </div>
  `
}

/**
 * Generate a PDF document for an inspection
 */
export function generateInspectionPDF({ inspection, assetName, asset }: InspectionPDFOptions): Blob {
  const items = inspection.checklist_items || []
  const goodCount = items.filter(i => i.status === 'good').length
  const repairCount = items.filter(i => i.status === 'repair').length
  const replaceCount = items.filter(i => i.status === 'replace').length
  const pendingCount = items.filter(i => !i.status || i.status === 'pending').length
  const totalItems = items.length
  const answeredItems = items.filter(i => i.status && i.status !== 'pending').length

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Inspection Report - ${inspection.title}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: Arial, sans-serif; 
      padding: 40px;
      color: #1F2937;
      line-height: 1.5;
      font-size: 12px;
    }
    
    /* Header */
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 3px solid #059669;
      padding-bottom: 20px;
      margin-bottom: 24px;
    }
    .header-left h1 {
      font-size: 24px;
      color: #059669;
      margin-bottom: 6px;
    }
    .header-left .subtitle {
      color: #6B7280;
      font-size: 12px;
    }
    .header-right {
      text-align: right;
    }
    .inspection-id {
      font-size: 10px;
      color: #9CA3AF;
      margin-bottom: 6px;
    }
    .status-badge {
      display: inline-block;
      padding: 6px 16px;
      border-radius: 20px;
      font-weight: bold;
      font-size: 12px;
      text-transform: uppercase;
      color: white;
      background-color: ${getStatusColor(inspection.status)};
    }
    .type-badge {
      display: inline-block;
      padding: 4px 10px;
      border-radius: 10px;
      font-size: 11px;
      text-transform: uppercase;
      color: #374151;
      background-color: #E5E7EB;
      margin-top: 6px;
    }
    
    /* Score Summary */
    .score-summary {
      display: flex;
      gap: 16px;
      margin-bottom: 24px;
      padding: 16px;
      background-color: #F9FAFB;
      border-radius: 8px;
    }
    .score-box {
      flex: 1;
      text-align: center;
      padding: 12px;
      background: white;
      border-radius: 8px;
      border: 1px solid #E5E7EB;
    }
    .score-value {
      font-size: 28px;
      font-weight: bold;
    }
    .score-label {
      font-size: 11px;
      color: #6B7280;
      margin-top: 4px;
    }
    .score-good { color: #059669; }
    .score-warning { color: #D97706; }
    .score-danger { color: #DC2626; }
    
    /* Info Grid */
    .info-section {
      margin-bottom: 24px;
    }
    .section-title {
      font-size: 13px;
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
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
    }
    .info-item {
      padding: 10px;
      background: #F9FAFB;
      border-radius: 6px;
    }
    .info-label {
      font-size: 10px;
      color: #6B7280;
      margin-bottom: 3px;
    }
    .info-value {
      font-size: 12px;
      font-weight: 500;
      color: #1F2937;
    }
    
    /* Status Stats */
    .stats-grid {
      display: flex;
      gap: 12px;
      margin-bottom: 24px;
    }
    .stat-box {
      flex: 1;
      padding: 12px;
      border-radius: 8px;
      text-align: center;
    }
    .stat-box.good { background: #D1FAE5; }
    .stat-box.repair { background: #FEF3C7; }
    .stat-box.replace { background: #FEE2E2; }
    .stat-box.pending { background: #F3F4F6; }
    .stat-count {
      font-size: 24px;
      font-weight: bold;
    }
    .stat-box.good .stat-count { color: #059669; }
    .stat-box.repair .stat-count { color: #D97706; }
    .stat-box.replace .stat-count { color: #DC2626; }
    .stat-box.pending .stat-count { color: #6B7280; }
    .stat-label {
      font-size: 11px;
      color: #374151;
    }
    
    /* Checklist */
    .category-section {
      margin-bottom: 20px;
      page-break-inside: avoid;
    }
    .category-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 12px;
      background: #E5E7EB;
      border-radius: 6px 6px 0 0;
    }
    .category-name {
      font-weight: bold;
      color: #374151;
    }
    .category-stats {
      display: flex;
      gap: 10px;
    }
    .category-stats .stat {
      font-size: 10px;
      padding: 2px 8px;
      border-radius: 10px;
    }
    .stat.good { background: #D1FAE5; color: #059669; }
    .stat.repair { background: #FEF3C7; color: #D97706; }
    .stat.replace { background: #FEE2E2; color: #DC2626; }
    .stat.pending { background: #F3F4F6; color: #6B7280; }
    
    .checklist-table {
      width: 100%;
      border-collapse: collapse;
      border: 1px solid #E5E7EB;
      border-top: none;
    }
    .checklist-table th {
      background: #F9FAFB;
      padding: 8px 10px;
      text-align: left;
      font-size: 10px;
      font-weight: 600;
      color: #6B7280;
      text-transform: uppercase;
      border-bottom: 1px solid #E5E7EB;
    }
    .checklist-table td {
      padding: 10px;
      border-bottom: 1px solid #E5E7EB;
      vertical-align: top;
    }
    .col-num { width: 40px; text-align: center; }
    .col-desc { width: 40%; }
    .col-status { width: 100px; text-align: center; }
    .col-notes { width: 35%; }
    
    .checklist-row.good { background: #F0FDF4; }
    .checklist-row.repair { background: #FFFBEB; }
    .checklist-row.replace { background: #FEF2F2; }
    .checklist-row.pending { background: #F9FAFB; }
    
    .status-badge {
      display: inline-block;
      padding: 3px 10px;
      border-radius: 12px;
      font-size: 10px;
      font-weight: 600;
    }
    
    .photo-row td {
      padding: 8px 10px;
      background: #FAFAFA;
    }
    .photos-grid {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
    .evidence-photo {
      width: 120px;
      height: 90px;
      object-fit: cover;
      border-radius: 6px;
      border: 1px solid #E5E7EB;
    }
    
    /* Issues Summary */
    .issues-section {
      margin-bottom: 24px;
      page-break-inside: avoid;
    }
    .issues-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .issue-item {
      padding: 12px;
      border-radius: 8px;
      border-left: 4px solid;
    }
    .issue-item.repair {
      background: #FFFBEB;
      border-left-color: #D97706;
    }
    .issue-item.replace {
      background: #FEF2F2;
      border-left-color: #DC2626;
    }
    .issue-header {
      display: flex;
      gap: 10px;
      margin-bottom: 8px;
    }
    .issue-status {
      padding: 3px 10px;
      border-radius: 12px;
      font-size: 10px;
      font-weight: 600;
    }
    .issue-category {
      font-size: 10px;
      color: #6B7280;
      padding: 3px 8px;
      background: #F3F4F6;
      border-radius: 10px;
    }
    .issue-desc {
      font-weight: 500;
      margin-bottom: 6px;
    }
    .issue-notes {
      font-size: 11px;
      color: #6B7280;
      font-style: italic;
      margin-bottom: 8px;
    }
    .no-issues {
      padding: 16px;
      background: #D1FAE5;
      color: #059669;
      border-radius: 8px;
      text-align: center;
    }
    
    /* Findings & Recommendations */
    .text-box {
      padding: 16px;
      background: #F9FAFB;
      border-radius: 8px;
      border-left: 4px solid #059669;
      margin-bottom: 16px;
    }
    .text-box.warning {
      border-left-color: #D97706;
      background: #FFFBEB;
    }
    .text-box p {
      white-space: pre-wrap;
    }
    
    /* Signature */
    .signature-section {
      margin-top: 30px;
      padding-top: 20px;
      border-top: 2px solid #E5E7EB;
    }
    .signature-box {
      display: inline-block;
      padding: 16px;
      border: 1px solid #E5E7EB;
      border-radius: 8px;
      background: white;
    }
    .signature-image {
      max-width: 300px;
      max-height: 100px;
      display: block;
      margin-bottom: 10px;
    }
    .signature-info {
      display: flex;
      justify-content: space-between;
      gap: 20px;
      font-size: 11px;
      color: #6B7280;
      border-top: 1px solid #E5E7EB;
      padding-top: 8px;
    }
    .signature-name { font-weight: 600; color: #374151; }
    .no-signature {
      padding: 16px;
      background: #FEF3C7;
      color: #D97706;
      border-radius: 8px;
      text-align: center;
    }
    
    /* Footer */
    .footer {
      margin-top: 40px;
      padding-top: 16px;
      border-top: 1px solid #E5E7EB;
      font-size: 10px;
      color: #9CA3AF;
      text-align: center;
    }
    
    /* Print Styles */
    @media print {
      body { padding: 20px; }
      .header { page-break-after: avoid; }
      .category-section { page-break-inside: avoid; }
      .issue-item { page-break-inside: avoid; }
    }
  </style>
</head>
<body>
  <!-- Header -->
  <div class="header">
    <div class="header-left">
      <h1>Inspection Report</h1>
      <div class="subtitle">Farm Management System</div>
    </div>
    <div class="header-right">
      <div class="inspection-id">ID: ${String(inspection.id).substring(0, 8).toUpperCase()}</div>
      <div class="status-badge">${inspection.status.replace('_', ' ')}</div>
      <div class="type-badge">${inspection.type.replace('_', ' ')} Inspection</div>
    </div>
  </div>
  
  <!-- Title -->
  <h2 style="font-size: 20px; margin-bottom: 20px;">${inspection.title}</h2>
  
  <!-- Score Summary -->
  <div class="score-summary">
    <div class="score-box">
      <div class="score-value" style="color: ${getScoreColor(inspection.score)}">${inspection.score}%</div>
      <div class="score-label">Overall Score</div>
    </div>
    <div class="score-box">
      <div class="score-value" style="color: #2563EB">${inspection.progress}%</div>
      <div class="score-label">Progress</div>
    </div>
    <div class="score-box">
      <div class="score-value">${answeredItems}/${totalItems}</div>
      <div class="score-label">Items Checked</div>
    </div>
  </div>
  
  <!-- Info Grid -->
  <div class="info-section">
    <div class="section-title">Inspection Details</div>
    <div class="info-grid">
      <div class="info-item">
        <div class="info-label">Inspector</div>
        <div class="info-value">${inspection.inspector}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Asset/Equipment</div>
        <div class="info-value">${assetName || asset?.name || 'Not specified'}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Scheduled Date</div>
        <div class="info-value">${new Date(inspection.scheduled_date).toLocaleDateString()}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Created</div>
        <div class="info-value">${new Date(inspection.created_at).toLocaleString()}</div>
      </div>
      ${inspection.completed_date ? `
      <div class="info-item">
        <div class="info-label">Completed</div>
        <div class="info-value">${new Date(inspection.completed_date).toLocaleString()}</div>
      </div>
      ` : ''}
      ${asset ? `
      <div class="info-item">
        <div class="info-label">Asset Type</div>
        <div class="info-value">${asset.type || 'N/A'}</div>
      </div>
      ` : ''}
    </div>
  </div>
  
  <!-- Status Stats -->
  <div class="stats-grid">
    <div class="stat-box good">
      <div class="stat-count">${goodCount}</div>
      <div class="stat-label">Good</div>
    </div>
    <div class="stat-box repair">
      <div class="stat-count">${repairCount}</div>
      <div class="stat-label">Need Repair</div>
    </div>
    <div class="stat-box replace">
      <div class="stat-count">${replaceCount}</div>
      <div class="stat-label">Need Replace</div>
    </div>
    ${pendingCount > 0 ? `
    <div class="stat-box pending">
      <div class="stat-count">${pendingCount}</div>
      <div class="stat-label">Pending</div>
    </div>
    ` : ''}
  </div>
  
  <!-- Issues Summary -->
  ${repairCount + replaceCount > 0 ? `
  <div class="issues-section">
    <div class="section-title">Issues Found (${repairCount + replaceCount})</div>
    ${generateIssuesSummaryHTML(items)}
  </div>
  ` : ''}
  
  <!-- Checklist Details -->
  <div class="info-section">
    <div class="section-title">Checklist Details</div>
    ${generateChecklistHTML(items)}
  </div>
  
  <!-- Findings -->
  ${inspection.findings ? `
  <div class="info-section">
    <div class="section-title">Findings</div>
    <div class="text-box">
      <p>${inspection.findings}</p>
    </div>
  </div>
  ` : ''}
  
  <!-- Recommendations -->
  ${inspection.recommendations ? `
  <div class="info-section">
    <div class="section-title">Recommendations</div>
    <div class="text-box warning">
      <p>${inspection.recommendations}</p>
    </div>
  </div>
  ` : ''}
  
  <!-- Signature -->
  <div class="signature-section">
    <div class="section-title">Inspector Signature</div>
    ${generateSignatureHTML(inspection.signature)}
  </div>
  
  <!-- Footer -->
  <div class="footer">
    <p>Generated on ${new Date().toLocaleString()} | Farm Management System</p>
    <p>This document is for internal use only.</p>
  </div>
</body>
</html>`

  return new Blob([htmlContent], { type: 'text/html' })
}

/**
 * Download an inspection as PDF (opens print dialog for PDF save)
 */
export function downloadInspectionPDF(options: InspectionPDFOptions): void {
  const blob = generateInspectionPDF(options)
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
 * Download inspection as a direct file (HTML that can be saved/printed as PDF)
 */
export function downloadInspectionAsFile(options: InspectionPDFOptions): void {
  const blob = generateInspectionPDF(options)
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `inspection-${options.inspection.title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}-${String(options.inspection.id).substring(0, 8)}.html`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Open inspection report in a new tab for viewing
 */
export function viewInspectionReport(options: InspectionPDFOptions): void {
  const blob = generateInspectionPDF(options)
  const url = URL.createObjectURL(blob)
  window.open(url, '_blank')
  
  // Cleanup URL after a delay
  setTimeout(() => URL.revokeObjectURL(url), 30000)
}
