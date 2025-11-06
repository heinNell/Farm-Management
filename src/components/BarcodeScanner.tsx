
import React, { useState, useRef, useCallback, useEffect } from 'react'
import {Camera, Upload, Type, X, CheckCircle, AlertCircle} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface BarcodeScannerProps {
  isOpen: boolean
  onClose: () => void
  onScan: (result: ScanResult) => void
  title?: string
}

interface ScanResult {
  type: 'barcode' | 'qr' | 'manual'
  value: string
  format?: string
}

type ScanMode = 'camera' | 'upload' | 'manual'

export const BarcodeScanner: React.FC<BarcodeScannerProps> = ({
  isOpen,
  onClose,
  onScan,
  title = "Scan Asset Code"
}) => {
  const [scanMode, setScanMode] = useState<ScanMode>('camera')
  const [isScanning, setIsScanning] = useState(false)
  const [manualInput, setManualInput] = useState('')
  const [scanResult, setScanResult] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  // Initialize camera when scanner opens in camera mode
  useEffect(() => {
    if (isOpen && scanMode === 'camera') {
      initializeCamera()
    }
    
    return () => {
      stopCamera()
    }
  }, [isOpen, scanMode])

  const initializeCamera = async () => {
    try {
      setError(null)
      setIsScanning(true)

      const constraints = {
        video: {
          facingMode: 'environment', // Use back camera if available
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      }

      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      streamRef.current = stream
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()
      }
    } catch (err) {
      console.error('Camera initialization failed:', err)
      setError('Unable to access camera. Please check permissions.')
      setIsScanning(false)
    }
  }

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    setIsScanning(false)
  }

  const captureFrame = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return null

    const video = videoRef.current
    const canvas = canvasRef.current
    const context = canvas.getContext('2d')

    if (!context) return null

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    context.drawImage(video, 0, 0)

    return canvas.toDataURL('image/jpeg', 0.8)
  }, [])

  // Simulate barcode/QR code detection (in real implementation, use a library like jsQR or QuaggaJS)
  const processImage = useCallback((imageData: string) => {
    // This is a simulation - replace with actual barcode/QR detection library
    const simulatedResults = [
      'ASSET-TRC-001',
      'ASSET-HRV-003', 
      'ASSET-SPR-005',
      'QR-FUEL-STATION-A',
      'BC-MAINTENANCE-TOOL-42',
      'ID-OPERATOR-JD-2024'
    ]
    
    const randomResult = simulatedResults[Math.floor(Math.random() * simulatedResults.length)]
    
    // Simulate processing delay
    setTimeout(() => {
      setScanResult(randomResult)
      const result: ScanResult = {
        type: randomResult.startsWith('QR-') ? 'qr' : 'barcode',
        value: randomResult,
        format: randomResult.startsWith('QR-') ? 'QR_CODE' : 'CODE_128'
      }
      onScan(result)
    }, 1000)
  }, [onScan])

  const handleCameraCapture = () => {
    const imageData = captureFrame()
    if (imageData) {
      processImage(imageData)
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file')
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const imageData = e.target?.result as string
      if (imageData) {
        processImage(imageData)
      }
    }
    reader.readAsDataURL(file)
  }

  const handleManualSubmit = () => {
    if (!manualInput.trim()) {
      setError('Please enter a valid code')
      return
    }

    const result: ScanResult = {
      type: 'manual',
      value: manualInput.trim(),
      format: 'MANUAL_INPUT'
    }
    
    setScanResult(manualInput.trim())
    onScan(result)
  }

  const handleClose = () => {
    stopCamera()
    setScanResult(null)
    setError(null)
    setManualInput('')
    onClose()
  }

  const renderCameraMode = () => (
    <div className="relative">
      <video
        ref={videoRef}
        className="w-full h-64 bg-gray-900 rounded-lg object-cover"
        playsInline
        muted
      />
      <canvas ref={canvasRef} className="hidden" />
      
      {/* Scanning overlay */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="border-2 border-white border-dashed w-48 h-32 rounded-lg opacity-75">
          <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-blue-500"></div>
          <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-blue-500"></div>
          <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-blue-500"></div>
          <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-blue-500"></div>
        </div>
      </div>

      <div className="mt-4 text-center">
        <p className="text-sm text-gray-600 mb-4">
          Position the barcode or QR code within the frame
        </p>
        <button
          onClick={handleCameraCapture}
          disabled={!isScanning}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isScanning ? 'Capture' : 'Starting Camera...'}
        </button>
      </div>
    </div>
  )

  const renderUploadMode = () => (
    <div className="text-center">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept="image/*"
        className="hidden"
      />
      
      <div 
        onClick={() => fileInputRef.current?.click()}
        className="border-2 border-dashed border-gray-300 rounded-lg p-8 hover:border-blue-500 cursor-pointer transition-colors"
      >
        <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-lg font-medium text-gray-900 mb-2">
          Upload Image
        </p>
        <p className="text-sm text-gray-600">
          Select an image containing a barcode or QR code
        </p>
      </div>
    </div>
  )

  const renderManualMode = () => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Enter Code Manually
      </label>
      <input
        type="text"
        value={manualInput}
        onChange={(e) => setManualInput(e.target.value)}
        placeholder="Enter asset ID, barcode, or QR code"
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        onKeyPress={(e) => e.key === 'Enter' && handleManualSubmit()}
      />
      <div className="mt-4 text-center">
        <button
          onClick={handleManualSubmit}
          disabled={!manualInput.trim()}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Submit Code
        </button>
      </div>
    </div>
  )

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto"
        >
          <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Mode Selector */}
            <div className="flex space-x-2 mb-6">
              <button
                onClick={() => setScanMode('camera')}
                className={`flex-1 flex items-center justify-center px-3 py-2 rounded-lg text-sm font-medium ${
                  scanMode === 'camera'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Camera className="h-4 w-4 mr-2" />
                Camera
              </button>
              <button
                onClick={() => setScanMode('upload')}
                className={`flex-1 flex items-center justify-center px-3 py-2 rounded-lg text-sm font-medium ${
                  scanMode === 'upload'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload
              </button>
              <button
                onClick={() => setScanMode('manual')}
                className={`flex-1 flex items-center justify-center px-3 py-2 rounded-lg text-sm font-medium ${
                  scanMode === 'manual'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Type className="h-4 w-4 mr-2" />
                Manual
              </button>
            </div>

            {/* Content */}
            <div className="mb-6">
              {scanMode === 'camera' && renderCameraMode()}
              {scanMode === 'upload' && renderUploadMode()}
              {scanMode === 'manual' && renderManualMode()}
            </div>

            {/* Error Display */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            )}

            {/* Success Display */}
            {scanResult && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  <div>
                    <p className="text-sm font-medium text-green-900">Scan Successful</p>
                    <p className="text-sm text-green-700">{scanResult}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Tips */}
            <div className="bg-blue-50 p-3 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Scanning Tips:</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Ensure good lighting for better results</li>
                <li>• Hold the device steady when capturing</li>
                <li>• Try different angles if scanning fails</li>
                <li>• Use manual input as a fallback option</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

export default BarcodeScanner
