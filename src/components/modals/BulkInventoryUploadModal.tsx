import { AlertCircle, CheckCircle, Download, Upload, X } from 'lucide-react';
import React, { useState } from 'react';
import { generateInventoryTemplate, ParsedInventoryItem, parseInventoryFromExcel } from '../../utils/inventoryExcelUtils';

interface BulkInventoryUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (items: ParsedInventoryItem[]) => Promise<void>;
}

const BulkInventoryUploadModal: React.FC<BulkInventoryUploadModalProps> = ({
  isOpen,
  onClose,
  onUpload
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [parsing, setParsing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [parsedItems, setParsedItems] = useState<ParsedInventoryItem[]>([]);
  const [errors, setErrors] = useState<Array<{ row: number; field: string; message: string }>>([]);
  const [uploadComplete, setUploadComplete] = useState(false);

  if (!isOpen) return null;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setParsedItems([]);
      setErrors([]);
      setUploadComplete(false);
    }
  };

  const handleParse = async () => {
    if (!file) return;

    setParsing(true);
    try {
      const result = await parseInventoryFromExcel(file);
      setParsedItems(result.records);
      setErrors(result.errors);
    } catch (error) {
      console.error('Failed to parse file:', error);
      setErrors([{ row: 0, field: 'File', message: 'Failed to parse Excel file. Please check the file format.' }]);
    } finally {
      setParsing(false);
    }
  };

  const handleUpload = async () => {
    if (parsedItems.length === 0) return;

    setUploading(true);
    try {
      await onUpload(parsedItems);
      setUploadComplete(true);
    } catch (error) {
      console.error('Failed to upload items:', error);
      setErrors([{ row: 0, field: 'Upload', message: 'Failed to upload items. Please try again.' }]);
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setParsedItems([]);
    setErrors([]);
    setUploadComplete(false);
    onClose();
  };

  const handleDownloadTemplate = () => {
    generateInventoryTemplate();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Upload className="h-6 w-6 text-white" />
            <h2 className="text-xl font-bold text-white">Bulk Inventory Upload</h2>
          </div>
          <button
            onClick={handleClose}
            className="text-white hover:text-gray-200 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {uploadComplete ? (
            <div className="text-center py-12">
              <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Upload Complete!</h3>
              <p className="text-gray-600 mb-6">
                Successfully uploaded {parsedItems.length} inventory item{parsedItems.length !== 1 ? 's' : ''}.
              </p>
              <button
                onClick={handleClose}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Close
              </button>
            </div>
          ) : (
            <>
              {/* Instructions */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-blue-900 mb-2">How to use bulk upload:</h3>
                <ol className="list-decimal list-inside space-y-1 text-sm text-blue-800">
                  <li>Download the Excel template using the button below</li>
                  <li>Fill in your inventory items following the template format</li>
                  <li>Required fields: SKU, Name, Category, Current Stock, Min Stock, Max Stock, Unit, Location</li>
                  <li>Optional fields: Supplier, Unit Cost</li>
                  <li>Upload the completed file and click "Parse File"</li>
                  <li>Review the parsed data and fix any errors</li>
                  <li>Click "Upload Items" to save to database</li>
                </ol>
              </div>

              {/* Download Template Button */}
              <div className="mb-6">
                <button
                  onClick={handleDownloadTemplate}
                  className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Download className="h-5 w-5" />
                  Download Excel Template
                </button>
              </div>

              {/* File Upload */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Excel File
                </label>
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileSelect}
                  className="block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-lg file:border-0
                    file:text-sm file:font-semibold
                    file:bg-blue-50 file:text-blue-700
                    hover:file:bg-blue-100
                    cursor-pointer"
                />
                {file && (
                  <p className="mt-2 text-sm text-gray-600">
                    Selected: {file.name}
                  </p>
                )}
              </div>

              {/* Parse Button */}
              {file && !parsedItems.length && !errors.length && (
                <button
                  onClick={() => void handleParse()}
                  disabled={parsing}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors mb-6"
                >
                  {parsing ? 'Parsing...' : 'Parse File'}
                </button>
              )}

              {/* Errors */}
              {errors.length > 0 && (
                <div className="mb-6">
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-start gap-2 mb-3">
                      <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-red-900">
                          {errors.length} Error{errors.length !== 1 ? 's' : ''} Found
                        </h4>
                        <p className="text-sm text-red-700">
                          Please fix the following errors in your Excel file and try again:
                        </p>
                      </div>
                    </div>
                    <div className="max-h-60 overflow-y-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-red-100">
                          <tr>
                            <th className="px-3 py-2 text-left text-red-900">Row</th>
                            <th className="px-3 py-2 text-left text-red-900">Field</th>
                            <th className="px-3 py-2 text-left text-red-900">Error</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-red-200">
                          {errors.map((error, idx) => (
                            <tr key={idx} className="hover:bg-red-50">
                              <td className="px-3 py-2 text-red-800">{error.row}</td>
                              <td className="px-3 py-2 text-red-800">{error.field}</td>
                              <td className="px-3 py-2 text-red-700">{error.message}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* Parsed Items Preview */}
              {parsedItems.length > 0 && (
                <div className="mb-6">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <p className="font-semibold text-green-900">
                        Successfully parsed {parsedItems.length} item{parsedItems.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>

                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className="overflow-x-auto max-h-96">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-100 sticky top-0">
                          <tr>
                            <th className="px-3 py-2 text-left text-gray-900">SKU</th>
                            <th className="px-3 py-2 text-left text-gray-900">Name</th>
                            <th className="px-3 py-2 text-left text-gray-900">Category</th>
                            <th className="px-3 py-2 text-left text-gray-900">Current</th>
                            <th className="px-3 py-2 text-left text-gray-900">Min</th>
                            <th className="px-3 py-2 text-left text-gray-900">Max</th>
                            <th className="px-3 py-2 text-left text-gray-900">Unit</th>
                            <th className="px-3 py-2 text-left text-gray-900">Location</th>
                            <th className="px-3 py-2 text-left text-gray-900">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {parsedItems.map((item, idx) => (
                            <tr key={idx} className="hover:bg-gray-50">
                              <td className="px-3 py-2 text-gray-900 font-medium">{item.sku}</td>
                              <td className="px-3 py-2 text-gray-900">{item.name}</td>
                              <td className="px-3 py-2 text-gray-700">{item.category}</td>
                              <td className="px-3 py-2 text-gray-700">{item.current_stock}</td>
                              <td className="px-3 py-2 text-gray-700">{item.min_stock}</td>
                              <td className="px-3 py-2 text-gray-700">{item.max_stock}</td>
                              <td className="px-3 py-2 text-gray-700">{item.unit}</td>
                              <td className="px-3 py-2 text-gray-700">{item.location}</td>
                              <td className="px-3 py-2">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  item.status === 'in_stock' ? 'bg-green-100 text-green-800' :
                                  item.status === 'low_stock' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-red-100 text-red-800'
                                }`}>
                                  {item.status.replace('_', ' ')}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        {!uploadComplete && parsedItems.length > 0 && errors.length === 0 && (
          <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 flex justify-end gap-3">
            <button
              onClick={handleClose}
              disabled={uploading}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={() => void handleUpload()}
              disabled={uploading}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {uploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  Upload {parsedItems.length} Item{parsedItems.length !== 1 ? 's' : ''}
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BulkInventoryUploadModal;
