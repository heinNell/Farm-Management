import { AlertTriangle, Trash2 } from 'lucide-react'
import Modal from '../ui/Modal'
import LoadingSpinner from '../ui/LoadingSpinner'

interface ConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => Promise<void> | void
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  type?: 'danger' | 'warning' | 'info'
  loading?: boolean
}

export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'danger',
  loading = false
}: ConfirmationModalProps) {
  
  const handleConfirm = () => {
    void (async () => {
      try {
        await onConfirm()
        onClose()
      } catch (error) {
        console.error('Confirmation action failed:', error)
      }
    })()
  }

  const getIcon = () => {
    switch (type) {
      case 'danger':
        return <Trash2 className="h-6 w-6 text-red-600" />
      case 'warning':
        return <AlertTriangle className="h-6 w-6 text-yellow-600" />
      default:
        return <AlertTriangle className="h-6 w-6 text-blue-600" />
    }
  }

  const getButtonStyles = () => {
    switch (type) {
      case 'danger':
        return 'bg-red-600 hover:bg-red-700'
      case 'warning':
        return 'bg-yellow-600 hover:bg-yellow-700'
      default:
        return 'bg-blue-600 hover:bg-blue-700'
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center">
          {getIcon()}
          <span className="ml-2">{title}</span>
        </div>
      }
      size="sm"
    >
      <div className="space-y-6">
        <p className="text-gray-600 leading-relaxed">
          {message}
        </p>

        <div className="flex justify-end space-x-3 pt-4 border-t">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={loading}
            className={`flex items-center px-4 py-2 text-sm font-medium text-white rounded-lg disabled:opacity-50 ${getButtonStyles()}`}
          >
            {loading && <LoadingSpinner size="sm" color="white" className="mr-2" />}
            {confirmText}
          </button>
        </div>
      </div>
    </Modal>
  )
}
