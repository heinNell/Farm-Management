
import React, { useEffect, useRef, useState } from 'react'
import {X, Camera, AlertCircle} from 'lucide-react'
import { Html5QrcodeScanner } from 'html5-qrcode'

interface ScanModalProps {
  isOpen: boolean
  onClose: () => void
  onScan: (result: string) => void
}

export default function ScanModal({ isOpen, onClose, onScan }: ScanModalProps) {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen && !scannerRef.current) {
      const scanner = new Html5QrcodeScanner(
        'qr-reader',
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
        },
        false
      )

      scanner.render(
        (decodedText) => {
          onScan(decodedText)
          cleanup()
        },
        (error) => {
          console.warn('QR Code scan error:', error)
          setError('Unable to scan. Please try again or check camera permissions.')
        }
      )

      scannerRef.current = scanner
    }

    return () => {
      cleanup()
    }
  }, [isOpen, onScan])

  const cleanup = () => {
    if (scannerRef.current) {
      scannerRef.current.clear().catch(console.error)
      scannerRef.current = null
    }
    setError(null)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose} />

        <div className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Camera className="h-6 w-6 text-green-600 mr-2" />
              <h3 className="text-lg font-medium text-gray-900">Scan Item</h3>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Position the QR code or barcode within the camera view to scan.
            </p>

            {error && (
              <div className="flex items-center p-3 text-sm text-red-700 bg-red-100 rounded-lg">
                <AlertCircle className="h-4 w-4 mr-2" />
                {error}
              </div>
            )}

            <div id="qr-reader" className="w-full"></div>

            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
