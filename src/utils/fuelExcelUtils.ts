import * as XLSX from 'xlsx';
import { FuelRecord } from '../types/database';

export interface FuelRecordExcelRow {
  'Asset Name': string;
  'Filling Date': string;
  'Fuel Type': string;
  'Quantity (L)': number;
  'Price per Liter': number;
  'Total Cost': number;
  'Current Hours': number | string;
  'Location': string;
  'Driver Name': string;
  'Attendant Name': string;
  'Receipt Number': string;
  'Odometer Reading': number | string;
  'Notes': string;
}

/**
 * Download a template Excel file for bulk fuel record upload
 */
export const downloadFuelTemplate = () => {
  const template: FuelRecordExcelRow[] = [
    {
      'Asset Name': 'BVTR5 - TRACTOR',
      'Filling Date': '2025-11-14',
      'Fuel Type': 'Diesel',
      'Quantity (L)': 50,
      'Price per Liter': 1.48,
      'Total Cost': 74.00,
      'Current Hours': 525,
      'Location': 'Main Depot',
      'Driver Name': 'John Smith',
      'Attendant Name': 'Jane Doe',
      'Receipt Number': 'SH-20251114-001',
      'Odometer Reading': '',
      'Notes': 'Regular refill'
    },
    {
      'Asset Name': 'FL3 - FORKLIFT',
      'Filling Date': '2025-11-14',
      'Fuel Type': 'Diesel',
      'Quantity (L)': 30,
      'Price per Liter': 1.48,
      'Total Cost': 44.40,
      'Current Hours': 1250,
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
    { wch: 15 }, // Current Hours
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
    ['Filling Date', 'REQUIRED - Format: YYYY-MM-DD (e.g., 2025-11-14)'],
    ['Fuel Type', 'REQUIRED - Diesel, Petrol, or other fuel type'],
    ['Quantity (L)', 'REQUIRED - Fuel quantity in liters (numbers only)'],
    ['Price per Liter', 'REQUIRED - Price per liter (e.g., 1.48)'],
    ['Total Cost', 'REQUIRED - Total cost (auto-calculated if blank)'],
    ['Current Hours', 'REQUIRED - Current hour meter reading for consumption calculation'],
    ['Location', 'REQUIRED - Refueling location (e.g., Main Depot, Shell Station)'],
    ['Driver Name', 'OPTIONAL - Name of the driver'],
    ['Attendant Name', 'OPTIONAL - Name of the filling attendant'],
    ['Receipt Number', 'OPTIONAL - Receipt/transaction number'],
    ['Odometer Reading', 'OPTIONAL - Vehicle odometer reading'],
    ['Notes', 'OPTIONAL - Additional notes or comments'],
    [''],
    ['Important Notes:'],
    ['1. Asset names must match exactly (including spaces and hyphens)'],
    ['2. Dates must be in YYYY-MM-DD format'],
    ['3. Current Hours must be greater than the asset\'s last recorded hours'],
    ['4. Required fields cannot be empty'],
    ['5. Remove example rows before uploading your data'],
    ['6. Maximum 100 records per upload'],
  ];

  const instructionsSheet = XLSX.utils.aoa_to_sheet(instructions);
  instructionsSheet['!cols'] = [{ wch: 25 }, { wch: 70 }];
  XLSX.utils.book_append_sheet(workbook, instructionsSheet, 'Instructions');

  // Generate and download file
  XLSX.writeFile(workbook, `Fuel_Upload_Template_${new Date().toISOString().split('T')[0]}.xlsx`);
};

/**
 * Export fuel records to Excel
 */
export const exportFuelRecordsToExcel = (
  records: FuelRecord[],
  assets: Array<{ id: string; name: string }>
) => {
  const excelData: FuelRecordExcelRow[] = records.map(record => {
    const asset = assets.find(a => a.id === record.asset_id);
    const fillingDate = (record.filling_date 
      ? new Date(record.filling_date).toISOString().split('T')[0]
      : new Date(record.date).toISOString().split('T')[0]) as string;
    
    return {
      'Asset Name': asset?.name || 'Unknown',
      'Filling Date': fillingDate,
      'Fuel Type': record.fuel_type,
      'Quantity (L)': record.quantity,
      'Price per Liter': record.price_per_liter,
      'Total Cost': record.cost,
      'Current Hours': record.current_hours ?? '',
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
    { wch: 12 }, { wch: 15 }, { wch: 20 }, { wch: 20 }, { wch: 20 },
    { wch: 20 }, { wch: 18 }, { wch: 30 }
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Fuel Records');

  // Add summary sheet
  const totalQuantity = records.reduce((sum, r) => sum + r.quantity, 0);
  const totalCost = records.reduce((sum, r) => sum + r.cost, 0);
  const avgConsumption = records
    .filter(r => r.consumption_rate && r.consumption_rate > 0)
    .reduce((sum, r) => sum + (r.consumption_rate || 0), 0) / 
    records.filter(r => r.consumption_rate && r.consumption_rate > 0).length;

  const summary = [
    ['Fuel Records Export Summary'],
    ['Export Date', new Date().toISOString()],
    [''],
    ['Total Records', records.length],
    ['Total Fuel Quantity (L)', totalQuantity.toFixed(2)],
    ['Total Cost', `$${totalCost.toFixed(2)}`],
    ['Average Consumption Rate (L/h)', avgConsumption ? avgConsumption.toFixed(2) : 'N/A'],
    [''],
    ['Fuel Type Breakdown'],
    ...Object.entries(
      records.reduce((acc, r) => {
        acc[r.fuel_type] = (acc[r.fuel_type] || 0) + r.quantity;
        return acc;
      }, {} as Record<string, number>)
    ).map(([type, qty]) => [type, `${qty.toFixed(2)} L`])
  ];

  const summarySheet = XLSX.utils.aoa_to_sheet(summary);
  summarySheet['!cols'] = [{ wch: 30 }, { wch: 25 }];
  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');

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

          // Validate Filling Date
          const fillingDate = row['Filling Date'];
          if (!fillingDate) {
            rowErrors.push({ row: rowNumber, field: 'Filling Date', message: 'Filling Date is required' });
          } else if (!/^\d{4}-\d{2}-\d{2}$/.test(fillingDate)) {
            rowErrors.push({ row: rowNumber, field: 'Filling Date', message: 'Date must be in YYYY-MM-DD format' });
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
          if (rowErrors.length === 0 && asset) {
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
