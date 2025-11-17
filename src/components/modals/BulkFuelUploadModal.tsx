import { AlertCircle, CheckCircle, Upload, X } from 'lucide-react';
import React, { useState } from 'react';
import { Asset, FuelRecord } from '../../types/database';
import { parseFuelRecordsFromExcel } from '../../utils/fuelExcelUtils';

interface BulkFuelUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (records: Array<Partial<FuelRecord>>) => Promise<void>;
  assets: Asset[];
}

const BulkFuelUploadModal: React.FC<BulkFuelUploadModalProps> = ({
  isOpen,
  onClose,
  onUpload,
  assets
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [parsing, setParsing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [parsedRecords, setParsedRecords] = useState<Array<Partial<FuelRecord>>>([]);
  const [errors, setErrors] = useState<Array<{ row: number; field: string; message: string }>>([]);
  const [uploadComplete, setUploadComplete] = useState(false);

  if (!isOpen) return null;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setParsedRecords([]);
      setErrors([]);
      setUploadComplete(false);
    }
  };

  const handleParse = async () => {
    if (!file) return;

    setParsing(true);
    try {
      const result = await parseFuelRecordsFromExcel(file, assets);
      setParsedRecords(result.records);
      setErrors(result.errors);
    } catch (error) {
      console.error('Failed to parse file:', error);
      setErrors([{ row: 0, field: 'File', message: 'Failed to parse Excel file. Please check the file format.' }]);
    } finally {
      setParsing(false);
    }
  };

  const handleUpload = async () => {
    if (parsedRecords.length === 0) return;

    setUploading(true);
    try {
      await onUpload(parsedRecords);
      setUploadComplete(true);
    } catch (error) {
      console.error('Failed to upload records:', error);
      setErrors([{ row: 0, field: 'Upload', message: 'Failed to upload records. Please try again.' }]);
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setParsedRecords([]);
    setErrors([]);
    setUploadComplete(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Upload className="h-6 w-6 text-white" />
            <h2 className="text-xl font-bold text-white">Bulk Fuel Upload</h2>
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
                Successfully uploaded {parsedRecords.length} fuel records.
              </p>
              <button
                onClick={handleClose}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
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
                  <li>Fill in your fuel records following the template format</li>
                  <li>Upload the completed file</li>
                  <li>Review the parsed data and fix any errors</li>
                  <li>Click "Upload Records" to save to database</li>
                </ol>
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
                    file:bg-green-50 file:text-green-700
                    hover:file:bg-green-100
                    cursor-pointer"
                />
                {file && (
                  <p className="mt-2 text-sm text-gray-600">
                    Selected: {file.name}
                  </p>
                )}
              </div>

              {/* Parse Button */}
              {file && !parsedRecords.length && !errors.length && (
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
                          Please fix the following errors and try again:
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

              {/* Parsed Records Preview */}
              {parsedRecords.length > 0 && (
                <div className="mb-6">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <h4 className="font-semibold text-green-900">
                        {parsedRecords.length} Record{parsedRecords.length !== 1 ? 's' : ''} Ready to Upload
                      </h4>
                    </div>
                  </div>

                  <div className="max-h-80 overflow-auto border rounded-lg">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 sticky top-0">
                        <tr>
                          <th className="px-3 py-2 text-left text-gray-700">#</th>
                          <th className="px-3 py-2 text-left text-gray-700">Date</th>
                          <th className="px-3 py-2 text-left text-gray-700">Asset</th>
                          <th className="px-3 py-2 text-left text-gray-700">Quantity</th>
                          <th className="px-3 py-2 text-left text-gray-700">Cost</th>
                          <th className="px-3 py-2 text-left text-gray-700">Hours</th>
                          <th className="px-3 py-2 text-left text-gray-700">L/h</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {parsedRecords.map((record, idx) => {
                          const asset = assets.find(a => a.id === record.asset_id);
                          return (
                            <tr key={idx} className="hover:bg-gray-50">
                              <td className="px-3 py-2 text-gray-600">{idx + 1}</td>
                              <td className="px-3 py-2 text-gray-900">
                                {record.filling_date ? new Date(record.filling_date).toLocaleDateString() : 'N/A'}
                              </td>
                              <td className="px-3 py-2 text-gray-900">{asset?.name || 'Unknown'}</td>
                              <td className="px-3 py-2 text-gray-900">{record.quantity}L</td>
                              <td className="px-3 py-2 text-gray-900">${record.cost?.toFixed(2)}</td>
                              <td className="px-3 py-2 text-gray-900">
                                {record.current_hours ?? 'N/A'}
                                {record.hour_difference && (
                                  <span className="text-green-600 ml-1">+{record.hour_difference}h</span>
                                )}
                              </td>
                              <td className="px-3 py-2 text-gray-900">
                                {record.consumption_rate ? record.consumption_rate.toFixed(2) : '-'}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        {!uploadComplete && (
          <div className="border-t bg-gray-50 px-6 py-4 flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-600">
                {parsedRecords.length > 0 && `${parsedRecords.length} records ready`}
                {errors.length > 0 && ` • ${errors.length} errors`}
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleClose}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
              {parsedRecords.length > 0 && errors.length === 0 && (
                <button
                  onClick={() => void handleUpload()}
                  disabled={uploading}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {uploading ? 'Uploading...' : 'Upload Records'}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BulkFuelUploadModal;
