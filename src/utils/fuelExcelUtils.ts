import * as XLSX from 'xlsx';
import { FuelRecord } from '../types/database';

export interface FuelRecordExcelRow {
  'Asset Name': string;
  'Filling Date': string;
  'Fuel Type': string;
  'Quantity (L)': number;
  'Price per Liter': number;
  'Total Cost': number;
  'Previous Hours': number | string;
  'Current Hours': number | string;
  'Hours Worked': number | string;
  'Consumption Rate (L/H)': number | string;
  'Location': string;
  'Driver Name': string;
  'Attendant Name': string;
  'Receipt Number': string;
  'Odometer Reading': number | string;
  'Notes': string;
}

/**
 * Parse date from dd/mm/yyyy or yyyy-mm-dd format to yyyy-mm-dd
 */
const parseDate = (dateStr: string): string | null => {
  if (!dateStr) return null;
  
  // Trim whitespace
  const trimmed = dateStr.trim();
  
  // Check if already in yyyy-mm-dd format
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return trimmed;
  }
  
  // Check for dd/mm/yyyy format
  const ddmmyyyy = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (ddmmyyyy) {
    const day = ddmmyyyy[1]!.padStart(2, '0');
    const month = ddmmyyyy[2]!.padStart(2, '0');
    const year = ddmmyyyy[3];
    return `${year}-${month}-${day}`;
  }
  
  // Check for dd-mm-yyyy format
  const ddmmyyyyDash = trimmed.match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/);
  if (ddmmyyyyDash) {
    const day = ddmmyyyyDash[1]!.padStart(2, '0');
    const month = ddmmyyyyDash[2]!.padStart(2, '0');
    const year = ddmmyyyyDash[3];
    return `${year}-${month}-${day}`;
  }
  
  // Check for Excel serial number (number of days since 1900-01-01)
  const num = Number(trimmed);
  if (!isNaN(num) && num > 0) {
    // Excel uses 1900-01-01 as day 1 (with a bug where 1900 is treated as a leap year)
    const excelEpoch = new Date(1899, 11, 30); // Dec 30, 1899
    const date = new Date(excelEpoch.getTime() + num * 24 * 60 * 60 * 1000);
    const isoDate = date.toISOString().split('T')[0];
    return isoDate ?? null;
  }
  
  return null;
};

/**
 * Format date to dd/mm/yyyy for display
 */
const formatDateForDisplay = (dateStr: string): string => {
  const [year, month, day] = dateStr.split('-');
  return `${day}/${month}/${year}`;
};

/**
 * Download a template Excel file for bulk fuel record upload
 */
export const downloadFuelTemplate = () => {
  const template: FuelRecordExcelRow[] = [
    {
      'Asset Name': 'BVTR5 - TRACTOR',
      'Filling Date': '14/11/2025',
      'Fuel Type': 'Diesel',
      'Quantity (L)': 50,
      'Price per Liter': 1.48,
      'Total Cost': 74.00,
      'Previous Hours': 500,
      'Current Hours': 525,
      'Hours Worked': 25,
      'Consumption Rate (L/H)': 2.0,
      'Location': 'Main Depot',
      'Driver Name': 'John Smith',
      'Attendant Name': 'Jane Doe',
      'Receipt Number': 'SH-20251114-001',
      'Odometer Reading': '',
      'Notes': 'Regular refill'
    },
    {
      'Asset Name': 'FL3 - FORKLIFT',
      'Filling Date': '14/11/2025',
      'Fuel Type': 'Diesel',
      'Quantity (L)': 30,
      'Price per Liter': 1.48,
      'Total Cost': 44.40,
      'Previous Hours': 1230,
      'Current Hours': 1250,
      'Hours Worked': 20,
      'Consumption Rate (L/H)': 1.5,
      'Location': 'Shell Station',
      'Driver Name': 'Mike Johnson',
      'Attendant Name': 'Sarah Williams',
      'Receipt Number': 'SH-20251114-002',
      'Odometer Reading': '',
      'Notes': ''
    }
  ];

  const worksheet = XLSX.utils.json_to_sheet(template);
  
  // Set column widths
  worksheet['!cols'] = [
    { wch: 20 }, // Asset Name
    { wch: 15 }, // Filling Date
    { wch: 12 }, // Fuel Type
    { wch: 12 }, // Quantity
    { wch: 15 }, // Price per Liter
    { wch: 12 }, // Total Cost
    { wch: 15 }, // Previous Hours
    { wch: 15 }, // Current Hours
    { wch: 15 }, // Hours Worked
    { wch: 20 }, // Consumption Rate (L/H)
    { wch: 20 }, // Location
    { wch: 20 }, // Driver Name
    { wch: 20 }, // Attendant Name
    { wch: 20 }, // Receipt Number
    { wch: 18 }, // Odometer Reading
    { wch: 30 }  // Notes
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Fuel Records Template');

  // Add instructions sheet
  const instructions = [
    ['Bulk Fuel Upload Template Instructions'],
    [''],
    ['Column Descriptions:'],
    ['Asset Name', 'REQUIRED - Must match an existing asset name (e.g., BVTR5 - TRACTOR)'],
    ['Filling Date', 'REQUIRED - Format: DD/MM/YYYY (e.g., 14/11/2025)'],
    ['Fuel Type', 'REQUIRED - Diesel, Petrol, or other fuel type'],
    ['Quantity (L)', 'REQUIRED - Fuel quantity in liters (numbers only)'],
    ['Price per Liter', 'REQUIRED - Price per liter (e.g., 1.48)'],
    ['Total Cost', 'REQUIRED - Total cost (auto-calculated if blank)'],
    ['Previous Hours', 'AUTO - Previous hour meter reading (calculated from last record)'],
    ['Current Hours', 'REQUIRED - Current hour meter reading for consumption calculation'],
    ['Hours Worked', 'AUTO - Hours worked since last fill (Current - Previous)'],
    ['Consumption Rate (L/H)', 'AUTO - Fuel consumption rate in liters per hour'],
    ['Location', 'REQUIRED - Refueling location (e.g., Main Depot, Shell Station)'],
    ['Driver Name', 'OPTIONAL - Name of the driver'],
    ['Attendant Name', 'OPTIONAL - Name of the filling attendant'],
    ['Receipt Number', 'OPTIONAL - Receipt/transaction number'],
    ['Odometer Reading', 'OPTIONAL - Vehicle odometer reading'],
    ['Notes', 'OPTIONAL - Additional notes or comments'],
    [''],
    ['Important Notes:'],
    ['1. Asset names must match exactly (including spaces and hyphens)'],
    ['2. Dates must be in DD/MM/YYYY format (e.g., 14/11/2025)'],
    ['3. Current Hours must be greater than the asset\'s last recorded hours'],
    ['4. Required fields cannot be empty'],
    ['5. Remove example rows before uploading your data'],
    ['6. Maximum 100 records per upload'],
    ['7. Consumption Rate (L/H) = Quantity / Hours Worked'],
  ];

  const instructionsSheet = XLSX.utils.aoa_to_sheet(instructions);
  instructionsSheet['!cols'] = [{ wch: 25 }, { wch: 70 }];
  XLSX.utils.book_append_sheet(workbook, instructionsSheet, 'Instructions');

  // Generate and download file
  XLSX.writeFile(workbook, `Fuel_Upload_Template_${new Date().toISOString().split('T')[0]}.xlsx`);
};

/**
 * Export fuel records to Excel with L/H and hours worked
 */
export const exportFuelRecordsToExcel = (
  records: FuelRecord[],
  assets: Array<{ id: string; name: string }>
) => {
  const excelData: FuelRecordExcelRow[] = records.map(record => {
    const asset = assets.find(a => a.id === record.asset_id);
    const isoDate = record.filling_date 
      ? new Date(record.filling_date).toISOString().split('T')[0]
      : new Date(record.date).toISOString().split('T')[0];
    // Convert to dd/mm/yyyy format for export
    const fillingDate = isoDate ? formatDateForDisplay(isoDate) : '';
    
    return {
      'Asset Name': asset?.name || 'Unknown',
      'Filling Date': fillingDate,
      'Fuel Type': record.fuel_type,
      'Quantity (L)': record.quantity,
      'Price per Liter': record.price_per_liter,
      'Total Cost': record.cost,
      'Previous Hours': record.previous_hours ?? '',
      'Current Hours': record.current_hours ?? '',
      'Hours Worked': record.hour_difference ?? '',
      'Consumption Rate (L/H)': record.consumption_rate ? Number(record.consumption_rate.toFixed(2)) : '',
      'Location': record.location,
      'Driver Name': record.driver_name || '',
      'Attendant Name': record.attendant_name || '',
      'Receipt Number': record.receipt_number || '',
      'Odometer Reading': record.odometer_reading ?? '',
      'Notes': record.notes || ''
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(excelData);
  
  // Set column widths
  worksheet['!cols'] = [
    { wch: 20 }, { wch: 15 }, { wch: 12 }, { wch: 12 }, { wch: 15 },
    { wch: 12 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 20 },
    { wch: 20 }, { wch: 20 }, { wch: 20 }, { wch: 20 }, { wch: 18 }, { wch: 30 }
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Fuel Records');

  // Calculate overall summary statistics
  const totalQuantity = records.reduce((sum, r) => sum + r.quantity, 0);
  const totalCost = records.reduce((sum, r) => sum + r.cost, 0);
  const totalHoursWorked = records
    .filter(r => r.hour_difference && r.hour_difference > 0)
    .reduce((sum, r) => sum + (r.hour_difference || 0), 0);
  const recordsWithConsumption = records.filter(r => r.consumption_rate && r.consumption_rate > 0);
  const avgConsumption = recordsWithConsumption.length > 0
    ? recordsWithConsumption.reduce((sum, r) => sum + (r.consumption_rate || 0), 0) / recordsWithConsumption.length
    : 0;

  // Calculate per-asset statistics
  const assetStats: Record<string, {
    name: string;
    totalQuantity: number;
    totalCost: number;
    totalHours: number;
    recordCount: number;
    consumptionRates: number[];
  }> = {};

  records.forEach(record => {
    const asset = assets.find(a => a.id === record.asset_id);
    const assetName = asset?.name || 'Unknown';
    const assetId = record.asset_id || 'unknown';

    if (!assetStats[assetId]) {
      assetStats[assetId] = {
        name: assetName,
        totalQuantity: 0,
        totalCost: 0,
        totalHours: 0,
        recordCount: 0,
        consumptionRates: []
      };
    }

    assetStats[assetId].totalQuantity += record.quantity;
    assetStats[assetId].totalCost += record.cost;
    assetStats[assetId].recordCount += 1;
    
    if (record.hour_difference && record.hour_difference > 0) {
      assetStats[assetId].totalHours += record.hour_difference;
    }
    
    if (record.consumption_rate && record.consumption_rate > 0) {
      assetStats[assetId].consumptionRates.push(record.consumption_rate);
    }
  });

  // Build summary sheet
  const summary = [
    ['Fuel Records Export Summary'],
    ['Export Date', new Date().toLocaleDateString('en-GB')],
    [''],
    ['OVERALL STATISTICS'],
    ['Total Records', records.length],
    ['Total Fuel Consumed (L)', totalQuantity.toFixed(2)],
    ['Total Cost', `$${totalCost.toFixed(2)}`],
    ['Total Hours Worked', totalHoursWorked.toFixed(1)],
    ['Average Consumption Rate (L/H)', avgConsumption > 0 ? avgConsumption.toFixed(2) : 'N/A'],
    ['Overall Consumption (Total L / Total H)', totalHoursWorked > 0 ? (totalQuantity / totalHoursWorked).toFixed(2) : 'N/A'],
    [''],
    ['FUEL TYPE BREAKDOWN'],
    ...Object.entries(
      records.reduce((acc, r) => {
        acc[r.fuel_type] = (acc[r.fuel_type] || 0) + r.quantity;
        return acc;
      }, {} as Record<string, number>)
    ).map(([type, qty]) => [type, `${qty.toFixed(2)} L`]),
    [''],
    ['PER-ASSET CONSUMPTION ANALYSIS'],
    ['Asset Name', 'Total Fuel (L)', 'Total Cost', 'Hours Worked', 'Avg L/H', 'Records'],
    ...Object.values(assetStats)
      .sort((a, b) => b.totalQuantity - a.totalQuantity)
      .map(stat => {
        const avgRate = stat.consumptionRates.length > 0
          ? stat.consumptionRates.reduce((a, b) => a + b, 0) / stat.consumptionRates.length
          : (stat.totalHours > 0 ? stat.totalQuantity / stat.totalHours : 0);
        return [
          stat.name,
          stat.totalQuantity.toFixed(2),
          `$${stat.totalCost.toFixed(2)}`,
          stat.totalHours.toFixed(1),
          avgRate > 0 ? avgRate.toFixed(2) : 'N/A',
          stat.recordCount
        ];
      })
  ];

  const summarySheet = XLSX.utils.aoa_to_sheet(summary);
  summarySheet['!cols'] = [{ wch: 35 }, { wch: 18 }, { wch: 15 }, { wch: 15 }, { wch: 12 }, { wch: 10 }];
  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');

  // Add per-asset detail sheets for assets with multiple records
  const assetRecords: Record<string, FuelRecord[]> = {};
  records.forEach(record => {
    const assetId = record.asset_id || 'unknown';
    if (!assetRecords[assetId]) {
      assetRecords[assetId] = [];
    }
    assetRecords[assetId].push(record);
  });

  // Create Asset Analysis sheet
  const assetAnalysisData: Array<{
    'Asset Name': string;
    'Period Start': string;
    'Period End': string;
    'Total Fuel (L)': number;
    'Total Cost': number;
    'Total Hours Worked': number;
    'Average L/H': number | string;
    'Min L/H': number | string;
    'Max L/H': number | string;
    'Fill Count': number;
  }> = [];

  Object.entries(assetRecords).forEach(([assetId, assetRecs]) => {
    const asset = assets.find(a => a.id === assetId);
    const sortedRecs = [...assetRecs].sort((a, b) => 
      new Date(a.filling_date || a.date).getTime() - new Date(b.filling_date || b.date).getTime()
    );
    
    const firstDate = sortedRecs[0]?.filling_date || sortedRecs[0]?.date;
    const lastDate = sortedRecs[sortedRecs.length - 1]?.filling_date || sortedRecs[sortedRecs.length - 1]?.date;
    
    const totalFuel = assetRecs.reduce((sum, r) => sum + r.quantity, 0);
    const totalCostAsset = assetRecs.reduce((sum, r) => sum + r.cost, 0);
    const totalHours = assetRecs
      .filter(r => r.hour_difference && r.hour_difference > 0)
      .reduce((sum, r) => sum + (r.hour_difference || 0), 0);
    
    const consumptionRates = assetRecs
      .filter(r => r.consumption_rate && r.consumption_rate > 0)
      .map(r => r.consumption_rate as number);
    
    const avgLH = consumptionRates.length > 0
      ? consumptionRates.reduce((a, b) => a + b, 0) / consumptionRates.length
      : (totalHours > 0 ? totalFuel / totalHours : 0);
    
    assetAnalysisData.push({
      'Asset Name': asset?.name || 'Unknown',
      'Period Start': firstDate ? formatDateForDisplay(new Date(firstDate).toISOString().split('T')[0] || '') : '',
      'Period End': lastDate ? formatDateForDisplay(new Date(lastDate).toISOString().split('T')[0] || '') : '',
      'Total Fuel (L)': Number(totalFuel.toFixed(2)),
      'Total Cost': Number(totalCostAsset.toFixed(2)),
      'Total Hours Worked': Number(totalHours.toFixed(1)),
      'Average L/H': avgLH > 0 ? Number(avgLH.toFixed(2)) : 'N/A',
      'Min L/H': consumptionRates.length > 0 ? Number(Math.min(...consumptionRates).toFixed(2)) : 'N/A',
      'Max L/H': consumptionRates.length > 0 ? Number(Math.max(...consumptionRates).toFixed(2)) : 'N/A',
      'Fill Count': assetRecs.length
    });
  });

  // Sort by total fuel consumed (descending)
  assetAnalysisData.sort((a, b) => b['Total Fuel (L)'] - a['Total Fuel (L)']);

  const assetAnalysisSheet = XLSX.utils.json_to_sheet(assetAnalysisData);
  assetAnalysisSheet['!cols'] = [
    { wch: 25 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 12 },
    { wch: 18 }, { wch: 12 }, { wch: 10 }, { wch: 10 }, { wch: 12 }
  ];
  XLSX.utils.book_append_sheet(workbook, assetAnalysisSheet, 'Asset Analysis');

  XLSX.writeFile(workbook, `Fuel_Records_Export_${new Date().toISOString().split('T')[0]}.xlsx`);
};

/**
 * Parse uploaded Excel file and validate data
 */
export const parseFuelRecordsFromExcel = async (
  file: File,
  assets: Array<{ id: string; name: string; current_hours: number | null }>
): Promise<{
  records: Array<Partial<FuelRecord>>;
  errors: Array<{ row: number; field: string; message: string }>;
}> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        if (!data) {
          reject(new Error('Failed to read file data'));
          return;
        }
        const workbook = XLSX.read(data, { type: 'binary' });
        const firstSheetName = workbook.SheetNames[0];
        if (!firstSheetName) {
          reject(new Error('No sheets found in workbook'));
          return;
        }
        const worksheet = workbook.Sheets[firstSheetName];
        if (!worksheet) {
          reject(new Error('Failed to read worksheet'));
          return;
        }
        const jsonData = XLSX.utils.sheet_to_json<FuelRecordExcelRow>(worksheet);

        const records: Array<Partial<FuelRecord>> = [];
        const errors: Array<{ row: number; field: string; message: string }> = [];

        jsonData.forEach((row, index) => {
          const rowNumber = index + 2; // +2 for header row and 0-based index
          const rowErrors: typeof errors = [];

          // Validate Asset Name
          const asset = assets.find(a => a.name === row['Asset Name']?.trim());
          if (!row['Asset Name']) {
            rowErrors.push({ row: rowNumber, field: 'Asset Name', message: 'Asset Name is required' });
          } else if (!asset) {
            rowErrors.push({ row: rowNumber, field: 'Asset Name', message: `Asset "${row['Asset Name']}" not found` });
          }

          // Validate Filling Date - accepts dd/mm/yyyy or yyyy-mm-dd format
          const fillingDateRaw = String(row['Filling Date'] || '');
          const fillingDate = parseDate(fillingDateRaw);
          if (!fillingDateRaw) {
            rowErrors.push({ row: rowNumber, field: 'Filling Date', message: 'Filling Date is required' });
          } else if (!fillingDate) {
            rowErrors.push({ row: rowNumber, field: 'Filling Date', message: 'Date must be in DD/MM/YYYY format (e.g., 14/11/2025)' });
          }

          // Validate Fuel Type
          if (!row['Fuel Type']) {
            rowErrors.push({ row: rowNumber, field: 'Fuel Type', message: 'Fuel Type is required' });
          }

          // Validate Quantity
          const quantity = Number(row['Quantity (L)']);
          if (!row['Quantity (L)'] || isNaN(quantity) || quantity <= 0) {
            rowErrors.push({ row: rowNumber, field: 'Quantity (L)', message: 'Quantity must be a positive number' });
          }

          // Validate Price per Liter
          const pricePerLiter = Number(row['Price per Liter']);
          if (!row['Price per Liter'] || isNaN(pricePerLiter) || pricePerLiter <= 0) {
            rowErrors.push({ row: rowNumber, field: 'Price per Liter', message: 'Price per Liter must be a positive number' });
          }

          // Validate Current Hours
          const currentHours = row['Current Hours'] ? Number(row['Current Hours']) : null;
          if (currentHours !== null) {
            if (isNaN(currentHours) || currentHours < 0) {
              rowErrors.push({ row: rowNumber, field: 'Current Hours', message: 'Current Hours must be a non-negative number' });
            } else if (asset && asset.current_hours && currentHours <= asset.current_hours) {
              rowErrors.push({ 
                row: rowNumber, 
                field: 'Current Hours', 
                message: `Current Hours (${currentHours}) must be greater than asset's last recorded hours (${asset.current_hours})` 
              });
            }
          }

          // Validate Location
          if (!row['Location']) {
            rowErrors.push({ row: rowNumber, field: 'Location', message: 'Location is required' });
          }

          // If no errors, add record
          if (rowErrors.length === 0 && asset && fillingDate) {
            const totalCost = row['Total Cost'] ? Number(row['Total Cost']) : quantity * pricePerLiter;
            const previousHours = asset.current_hours;
            const hourDifference = currentHours && previousHours ? currentHours - previousHours : null;
            const consumptionRate = hourDifference && hourDifference > 0 ? quantity / hourDifference : null;

            records.push({
              asset_id: asset.id,
              filling_date: fillingDate,
              date: new Date().toISOString(),
              fuel_type: row['Fuel Type'].trim(),
              quantity,
              price_per_liter: pricePerLiter,
              cost: totalCost,
              current_hours: currentHours,
              previous_hours: previousHours,
              hour_difference: hourDifference,
              consumption_rate: consumptionRate,
              location: row['Location'].trim(),
              driver_name: row['Driver Name']?.trim() || null,
              attendant_name: row['Attendant Name']?.trim() || null,
              receipt_number: row['Receipt Number']?.trim() || null,
              odometer_reading: row['Odometer Reading'] ? Number(row['Odometer Reading']) : null,
              notes: row['Notes']?.trim() || null,
              operator_id: null,
              fuel_grade: null,
              weather_conditions: null
            });
          } else {
            errors.push(...rowErrors);
          }
        });

        resolve({ records, errors });
      } catch (error) {
        reject(error instanceof Error ? error : new Error(String(error)));
      }
    };

    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsBinaryString(file);
  });
};
