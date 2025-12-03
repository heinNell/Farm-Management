import * as XLSX from 'xlsx';
import { InventoryItem } from '../types/database';

export interface ParsedInventoryItem {
  sku: string;
  name: string;
  category: string;
  current_stock: number;
  min_stock: number;
  max_stock: number;
  unit: string;
  location: string;
  supplier?: string;
  unit_cost?: number;
  status: 'in_stock' | 'low_stock' | 'out_of_stock';
  last_updated: string;
}

export interface ParseResult {
  records: ParsedInventoryItem[];
  errors: Array<{ row: number; field: string; message: string }>;
}

// Define the expected shape of Excel row data
interface ExcelRowData {
  [key: string]: unknown;
}

export const parseInventoryFromExcel = async (file: File): Promise<ParseResult> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        if (!sheetName) {
          throw new Error('No sheets found in workbook');
        }
        const worksheet = workbook.Sheets[sheetName];
        if (!worksheet) {
          throw new Error('Worksheet not found');
        }
        const jsonData: ExcelRowData[] = XLSX.utils.sheet_to_json(worksheet, { raw: false });

        const records: ParsedInventoryItem[] = [];
        const errors: Array<{ row: number; field: string; message: string }> = [];

        jsonData.forEach((row, index) => {
          const rowNumber = index + 2; // +2 because Excel is 1-indexed and has header row
          const errors_for_row: string[] = [];

          // Helper to safely get string value
          const getString = (key: string): string => {
            const val: unknown = row[key];
            if (typeof val === 'string') return val;
            if (val === null || val === undefined) return '';
            if (typeof val === 'number' || typeof val === 'boolean') return String(val);
            return '';
          };

          // Required fields validation
          const sku = getString('SKU');
          if (!sku || sku.trim() === '') {
            errors.push({ row: rowNumber, field: 'SKU', message: 'SKU is required' });
            errors_for_row.push('SKU');
          }

          const name = getString('Name');
          if (!name || name.trim() === '') {
            errors.push({ row: rowNumber, field: 'Name', message: 'Name is required' });
            errors_for_row.push('Name');
          }

          const category = getString('Category');
          if (!category || category.trim() === '') {
            errors.push({ row: rowNumber, field: 'Category', message: 'Category is required' });
            errors_for_row.push('Category');
          }

          const unit = getString('Unit');
          if (!unit || unit.trim() === '') {
            errors.push({ row: rowNumber, field: 'Unit', message: 'Unit is required' });
            errors_for_row.push('Unit');
          }

          const location = getString('Location');
          if (!location || location.trim() === '') {
            errors.push({ row: rowNumber, field: 'Location', message: 'Location is required' });
            errors_for_row.push('Location');
          }

          // Parse numeric fields
          const current_stock = parseFloat(getString('Current Stock') || '0');
          const min_stock = parseFloat(getString('Min Stock') || '0');
          const max_stock = parseFloat(getString('Max Stock') || '0');
          const unitCostStr = getString('Unit Cost');
          const unit_cost = unitCostStr ? parseFloat(unitCostStr) : undefined;

          // Validate numeric fields
          if (isNaN(current_stock)) {
            errors.push({ row: rowNumber, field: 'Current Stock', message: 'Must be a valid number' });
            errors_for_row.push('Current Stock');
          }

          if (isNaN(min_stock)) {
            errors.push({ row: rowNumber, field: 'Min Stock', message: 'Must be a valid number' });
            errors_for_row.push('Min Stock');
          }

          if (isNaN(max_stock)) {
            errors.push({ row: rowNumber, field: 'Max Stock', message: 'Must be a valid number' });
            errors_for_row.push('Max Stock');
          }

          if (unitCostStr && unit_cost !== undefined && isNaN(unit_cost)) {
            errors.push({ row: rowNumber, field: 'Unit Cost', message: 'Must be a valid number' });
            errors_for_row.push('Unit Cost');
          }

          // Stock level validation
          if (max_stock < min_stock) {
            errors.push({ row: rowNumber, field: 'Max Stock', message: 'Max stock must be greater than min stock' });
            errors_for_row.push('Max Stock');
          }

          // If no errors for this row, create record
          if (errors_for_row.length === 0) {
            // Calculate status based on stock levels
            const status = current_stock === 0 ? 'out_of_stock' as const: 
                          current_stock <= min_stock ? 'low_stock' as const : 'in_stock' as const;

            const supplier = getString('Supplier');
            const trimmedSupplier = supplier && supplier.trim() ? supplier.trim() : undefined;

            records.push({
              sku: sku.trim(),
              name: name.trim(),
              category: category.trim(),
              current_stock,
              min_stock,
              max_stock,
              unit: unit.trim(),
              location: location.trim(),
              ...(trimmedSupplier ? { supplier: trimmedSupplier } : {}),
              ...(unit_cost !== undefined ? { unit_cost } : {}),
              status,
              last_updated: new Date().toISOString()
            });
          }
        });

        resolve({ records, errors });
      } catch (error) {
        reject(error instanceof Error ? error : new Error(String(error)));
      }
    };

    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsArrayBuffer(file);
  });
};

export const generateInventoryTemplate = (): void => {
  const template = [
    {
      'SKU': 'ITEM-001',
      'Name': 'Sample Item',
      'Category': 'Raw Materials',
      'Current Stock': '100',
      'Min Stock': '20',
      'Max Stock': '200',
      'Unit': 'pieces',
      'Location': 'Warehouse A',
      'Supplier': 'ABC Suppliers',
      'Unit Cost': '15.50'
    },
    {
      'SKU': 'ITEM-002',
      'Name': 'Another Item',
      'Category': 'Spare Parts',
      'Current Stock': '50',
      'Min Stock': '10',
      'Max Stock': '100',
      'Unit': 'units',
      'Location': 'Warehouse B',
      'Supplier': 'XYZ Company',
      'Unit Cost': '25.00'
    }
  ];

  const worksheet = XLSX.utils.json_to_sheet(template);
  
  // Set column widths
  worksheet['!cols'] = [
    { wch: 12 },  // SKU
    { wch: 25 },  // Name
    { wch: 15 },  // Category
    { wch: 15 },  // Current Stock
    { wch: 12 },  // Min Stock
    { wch: 12 },  // Max Stock
    { wch: 10 },  // Unit
    { wch: 15 },  // Location
    { wch: 20 },  // Supplier
    { wch: 12 }   // Unit Cost
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Inventory Items');
  
  XLSX.writeFile(workbook, 'inventory_upload_template.xlsx');
};

export const exportInventoryToExcel = (items: InventoryItem[]): void => {
  const exportData = items.map(item => ({
    'SKU': item.sku,
    'Name': item.name,
    'Category': item.category,
    'Current Stock': item.current_stock,
    'Min Stock': item.min_stock,
    'Max Stock': item.max_stock,
    'Unit': item.unit,
    'Location': item.location,
    'Status': item.status,
    'Supplier': item.supplier || '',
    'Unit Cost': item.unit_cost || '',
    'Last Updated': new Date(item.last_updated).toLocaleDateString()
  }));

  const worksheet = XLSX.utils.json_to_sheet(exportData);
  
  // Set column widths
  worksheet['!cols'] = [
    { wch: 12 },  // SKU
    { wch: 25 },  // Name
    { wch: 15 },  // Category
    { wch: 15 },  // Current Stock
    { wch: 12 },  // Min Stock
    { wch: 12 },  // Max Stock
    { wch: 10 },  // Unit
    { wch: 15 },  // Location
    { wch: 12 },  // Status
    { wch: 20 },  // Supplier
    { wch: 12 },  // Unit Cost
    { wch: 15 }   // Last Updated
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Inventory');
  
  const filename = `inventory_export_${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(workbook, filename);
};