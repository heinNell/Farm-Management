import { AlertTriangle, Camera, Check, ChevronDown, ChevronUp, FileText, Pencil, Save, X } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { supabase } from '../../lib/supabase'
import type { Asset, ChecklistItem, Inspection, InspectionSignature } from '../../types/database'
import Modal from '../ui/Modal'

interface InspectionExecutionModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: Partial<Inspection>) => Promise<void>
  inspection: Inspection | null
}

interface CategoryGroup {
  name: string
  items: ChecklistItem[]
  weight: number
}

export default function InspectionExecutionModal({
  isOpen,
  onClose,
  onSave,
  inspection
}: InspectionExecutionModalProps) {
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([])
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())
  const [findings, setFindings] = useState('')
  const [recommendations, setRecommendations] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [asset, setAsset] = useState<Asset | null>(null)
  const [activeTab, setActiveTab] = useState<'checklist' | 'summary' | 'signature'>('checklist')
  
  // Signature canvas
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [signature, setSignature] = useState<InspectionSignature | null>(null)
  const [hasSignature, setHasSignature] = useState(false)

  // Photo upload state
  const [uploadingPhoto, setUploadingPhoto] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [currentItemForPhoto, setCurrentItemForPhoto] = useState<string | null>(null)

  // Load inspection data
  useEffect(() => {
    if (inspection && isOpen) {
      setChecklistItems(inspection.checklist_items || [])
      setFindings(inspection.findings || '')
      setRecommendations(inspection.recommendations || '')
      setSignature(inspection.signature || null)
      setHasSignature(!!inspection.signature)
      
      // Expand all categories by default
      const categories = new Set(
        inspection.checklist_items
          ?.map(item => item.category || 'General')
          .filter((v, i, a) => a.indexOf(v) === i) || []
      )
      setExpandedCategories(categories)

      // Load asset info
      if (inspection.asset_id) {
        void loadAsset(inspection.asset_id)
      }
    }
  }, [inspection, isOpen])

  const loadAsset = async (assetId: string) => {
    const response = await supabase
      .from('assets')
      .select('*')
      .eq('id', assetId)
      .single()
    
    if (!response.error && response.data) {
      setAsset(response.data as Asset)
    }
  }

  // Group items by category
  const groupedItems = useCallback((): CategoryGroup[] => {
    const groups: Record<string, ChecklistItem[]> = {}
    
    checklistItems.forEach(item => {
      const category = item.category || 'General'
      if (!groups[category]) {
        groups[category] = []
      }
      groups[category].push(item)
    })

    return Object.entries(groups).map(([name, items]) => ({
      name,
      items,
      weight: items[0]?.weight || 100 / Object.keys(groups).length
    }))
  }, [checklistItems])

  // Calculate progress and score
  const calculateProgress = useCallback(() => {
    if (checklistItems.length === 0) return 0
    const answered = checklistItems.filter(item => 
      item.status && item.status !== 'pending'
    ).length
    return Math.round((answered / checklistItems.length) * 100)
  }, [checklistItems])

  const calculateScore = useCallback(() => {
    if (checklistItems.length === 0) return 0
    
    let totalWeight = 0
    let earnedScore = 0

    checklistItems.forEach(item => {
      const weight = item.weight || 1
      totalWeight += weight
      
      if (item.status === 'good') {
        earnedScore += weight * 100
      } else if (item.status === 'repair') {
        earnedScore += weight * 0 // 0% for repair
      } else if (item.status === 'replace') {
        earnedScore += weight * 0 // 0% for replace
      }
    })

    return totalWeight > 0 ? Math.round(earnedScore / totalWeight) : 0
  }, [checklistItems])

  // Update item status
  const updateItemStatus = (itemId: string, status: 'good' | 'repair' | 'replace') => {
    setChecklistItems(prev => prev.map(item => {
      if (item.id === itemId) {
        return {
          ...item,
          status,
          completed: status === 'good'
        }
      }
      return item
    }))
  }

  // Update item notes
  const updateItemNotes = (itemId: string, notes: string) => {
    setChecklistItems(prev => prev.map(item => {
      if (item.id === itemId) {
        return { ...item, notes }
      }
      return item
    }))
  }

  // Photo handling
  const handlePhotoClick = (itemId: string) => {
    setCurrentItemForPhoto(itemId)
    fileInputRef.current?.click()
  }

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !currentItemForPhoto) return

    setUploadingPhoto(currentItemForPhoto)

    try {
      // Create a base64 data URL for now (in production, upload to Supabase Storage)
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64 = reader.result as string
        setChecklistItems(prev => prev.map(item => {
          if (item.id === currentItemForPhoto) {
            const existingPhotos = item.photo_urls || []
            return {
              ...item,
              photo_urls: [...existingPhotos, base64]
            }
          }
          return item
        }))
        setUploadingPhoto(null)
        setCurrentItemForPhoto(null)
      }
      reader.readAsDataURL(file)
    } catch (err) {
      console.error('Failed to upload photo:', err)
      setUploadingPhoto(null)
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const removePhoto = (itemId: string, photoIndex: number) => {
    setChecklistItems(prev => prev.map(item => {
      if (item.id === itemId && item.photo_urls) {
        const newPhotos = [...item.photo_urls]
        newPhotos.splice(photoIndex, 1)
        return { ...item, photo_urls: newPhotos }
      }
      return item
    }))
  }

  // Signature handling
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    setIsDrawing(true)
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const rect = canvas.getBoundingClientRect()
    let x: number, y: number

    if ('touches' in e && e.touches[0]) {
      x = e.touches[0].clientX - rect.left
      y = e.touches[0].clientY - rect.top
    } else if ('clientX' in e) {
      x = e.clientX - rect.left
      y = e.clientY - rect.top
    } else {
      return
    }

    ctx.beginPath()
    ctx.moveTo(x, y)
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const rect = canvas.getBoundingClientRect()
    let x: number, y: number

    if ('touches' in e && e.touches[0]) {
      e.preventDefault()
      x = e.touches[0].clientX - rect.left
      y = e.touches[0].clientY - rect.top
    } else if ('clientX' in e) {
      x = e.clientX - rect.left
      y = e.clientY - rect.top
    } else {
      return
    }

    ctx.lineWidth = 2
    ctx.lineCap = 'round'
    ctx.strokeStyle = '#000'
    ctx.lineTo(x, y)
    ctx.stroke()
    setHasSignature(true)
  }

  const stopDrawing = () => {
    setIsDrawing(false)
  }

  const clearSignature = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    setHasSignature(false)
    setSignature(null)
  }

  const saveSignature = () => {
    const canvas = canvasRef.current
    if (!canvas || !hasSignature) return

    const signatureData = canvas.toDataURL('image/png')
    const newSignature: InspectionSignature = {
      inspector_name: inspection?.inspector || '',
      signature_data: signatureData,
      signed_at: new Date().toISOString()
    }
    setSignature(newSignature)
  }

  // Toggle category expansion
  const toggleCategory = (categoryName: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev)
      if (newSet.has(categoryName)) {
        newSet.delete(categoryName)
      } else {
        newSet.add(categoryName)
      }
      return newSet
    })
  }

  // Check if item needs photo/note
  const needsPhoto = (item: ChecklistItem) => {
    if (!item.require_photo_on || !item.status) return false
    return item.require_photo_on.includes(item.status) && (!item.photo_urls || item.photo_urls.length === 0)
  }

  const needsNote = (item: ChecklistItem) => {
    if (!item.require_note_on || !item.status) return false
    return item.require_note_on.includes(item.status) && !item.notes?.trim()
  }

  // Validate before completion
  const canComplete = () => {
    // All items must be answered
    const allAnswered = checklistItems.every(item => item.status && item.status !== 'pending')
    if (!allAnswered) return false

    // All required photos must be provided
    const allPhotosProvided = checklistItems.every(item => !needsPhoto(item))
    if (!allPhotosProvided) return false

    // All required notes must be provided
    const allNotesProvided = checklistItems.every(item => !needsNote(item))
    if (!allNotesProvided) return false

    // Signature required
    if (!signature && !hasSignature) return false

    return true
  }

  // Save inspection
  const handleSave = async (complete = false) => {
    if (!inspection) return

    setLoading(true)
    setError('')

    try {
      // Save signature if drawn but not yet saved
      let finalSignature = signature
      if (hasSignature && !signature) {
        saveSignature()
        const canvas = canvasRef.current
        if (canvas) {
          finalSignature = {
            inspector_name: inspection.inspector,
            signature_data: canvas.toDataURL('image/png'),
            signed_at: new Date().toISOString()
          }
        }
      }

      const updateData: Partial<Inspection> = {
        checklist_items: checklistItems,
        findings: findings || null,
        recommendations: recommendations || null,
        progress: calculateProgress(),
        score: calculateScore(),
        signature: finalSignature,
        status: complete ? 'completed' : 'in_progress',
        completed_date: complete ? new Date().toISOString() : null
      }

      await onSave(updateData)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save inspection')
    } finally {
      setLoading(false)
    }
  }

  // Count issues
  const issueCount = checklistItems.filter(item => item.status === 'repair' || item.status === 'replace').length

  if (!inspection) return null

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center justify-between w-full pr-8">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{inspection.title}</h2>
            <p className="text-sm text-gray-500">
              {asset?.name || 'Loading asset...'} • {inspection.type.replace('_', ' ')}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900">{calculateScore()}%</div>
              <div className="text-xs text-gray-500">Score</div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">{calculateProgress()}%</div>
              <div className="text-xs text-gray-500">Progress</div>
            </div>
          </div>
        </div>
      }
      size="xl"
    >
      <div className="flex flex-col h-[70vh]">
        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        {/* Hidden file input for photos */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handlePhotoUpload}
          className="hidden"
        />

        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-4">
          <button
            onClick={() => setActiveTab('checklist')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'checklist'
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Checklist ({checklistItems.length})
          </button>
          <button
            onClick={() => setActiveTab('summary')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'summary'
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Summary & Findings
            {issueCount > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs">
                {issueCount} issues
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('signature')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'signature'
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Signature
            {(signature || hasSignature) && (
              <Check className="inline-block ml-1 h-4 w-4 text-green-500" />
            )}
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto">
          {/* Checklist Tab */}
          {activeTab === 'checklist' && (
            <div className="space-y-4">
              {groupedItems().map(group => (
                <div key={group.name} className="border border-gray-200 rounded-lg overflow-hidden">
                  {/* Category Header */}
                  <button
                    onClick={() => toggleCategory(group.name)}
                    className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-gray-900">{group.name}</span>
                      <span className="text-sm text-gray-500">
                        ({group.items.filter(i => i.status && i.status !== 'pending').length}/{group.items.length} completed)
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      {/* Category progress */}
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-500 h-2 rounded-full transition-all"
                          style={{
                            width: `${(group.items.filter(i => i.status === 'good').length / group.items.length) * 100}%`
                          }}
                        />
                      </div>
                      {expandedCategories.has(group.name) ? (
                        <ChevronUp className="h-5 w-5 text-gray-500" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-gray-500" />
                      )}
                    </div>
                  </button>

                  {/* Category Items */}
                  {expandedCategories.has(group.name) && (
                    <div className="divide-y divide-gray-100">
                      {group.items.map((item, index) => (
                        <div key={item.id} className="p-4 bg-white">
                          <div className="flex items-start gap-4">
                            {/* Item number */}
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm font-medium text-gray-600">
                              {index + 1}
                            </div>

                            {/* Item content */}
                            <div className="flex-1 min-w-0">
                              <p className="text-gray-900 font-medium">{item.description}</p>
                              
                              {/* Status buttons */}
                              <div className="flex gap-2 mt-3">
                                <button
                                  onClick={() => updateItemStatus(item.id, 'good')}
                                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                    item.status === 'good'
                                      ? 'bg-green-500 text-white'
                                      : 'bg-green-100 text-green-700 hover:bg-green-200'
                                  }`}
                                >
                                  <Check className="inline-block h-4 w-4 mr-1" />
                                  Good
                                </button>
                                <button
                                  onClick={() => updateItemStatus(item.id, 'repair')}
                                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                    item.status === 'repair'
                                      ? 'bg-orange-500 text-white'
                                      : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                                  }`}
                                >
                                  <AlertTriangle className="inline-block h-4 w-4 mr-1" />
                                  Repair
                                </button>
                                <button
                                  onClick={() => updateItemStatus(item.id, 'replace')}
                                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                    item.status === 'replace'
                                      ? 'bg-red-500 text-white'
                                      : 'bg-red-100 text-red-700 hover:bg-red-200'
                                  }`}
                                >
                                  <X className="inline-block h-4 w-4 mr-1" />
                                  Replace
                                </button>
                              </div>

                              {/* Photo and Notes section for failed items */}
                              {(item.status === 'repair' || item.status === 'replace') && (
                                <div className="mt-4 space-y-3 p-3 bg-gray-50 rounded-lg">
                                  {/* Photos */}
                                  <div>
                                    <div className="flex items-center justify-between mb-2">
                                      <label className="text-sm font-medium text-gray-700 flex items-center">
                                        <Camera className="h-4 w-4 mr-1" />
                                        Photos
                                        {needsPhoto(item) && (
                                          <span className="ml-2 text-red-500 text-xs">* Required</span>
                                        )}
                                      </label>
                                      <button
                                        onClick={() => handlePhotoClick(item.id)}
                                        disabled={uploadingPhoto === item.id}
                                        className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                                      >
                                        {uploadingPhoto === item.id ? 'Uploading...' : '+ Add Photo'}
                                      </button>
                                    </div>
                                    {item.photo_urls && item.photo_urls.length > 0 && (
                                      <div className="flex gap-2 flex-wrap">
                                        {item.photo_urls.map((photo, photoIndex) => (
                                          <div key={photoIndex} className="relative">
                                            <img
                                              src={photo}
                                              alt={`Evidence ${photoIndex + 1}`}
                                              className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                                            />
                                            <button
                                              onClick={() => removePhoto(item.id, photoIndex)}
                                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                                            >
                                              <X className="h-3 w-3" />
                                            </button>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </div>

                                  {/* Notes */}
                                  <div>
                                    <label className="text-sm font-medium text-gray-700 flex items-center mb-1">
                                      <Pencil className="h-4 w-4 mr-1" />
                                      Notes
                                      {needsNote(item) && (
                                        <span className="ml-2 text-red-500 text-xs">* Required</span>
                                      )}
                                    </label>
                                    <textarea
                                      value={item.notes || ''}
                                      onChange={(e) => updateItemNotes(item.id, e.target.value)}
                                      placeholder="Describe the issue..."
                                      rows={2}
                                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    />
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {checklistItems.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <FileText className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p>No checklist items found</p>
                </div>
              )}
            </div>
          )}

          {/* Summary Tab */}
          {activeTab === 'summary' && (
            <div className="space-y-6">
              {/* Issues Summary */}
              {issueCount > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h4 className="font-semibold text-red-800 mb-3">Issues Found ({issueCount})</h4>
                  <div className="space-y-2">
                    {checklistItems
                      .filter(item => item.status === 'repair' || item.status === 'replace')
                      .map(item => (
                        <div key={item.id} className="flex items-start gap-3 p-2 bg-white rounded-lg">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            item.status === 'repair' ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {item.status?.toUpperCase()}
                          </span>
                          <div className="flex-1">
                            <p className="text-sm text-gray-900">{item.description}</p>
                            {item.notes && (
                              <p className="text-xs text-gray-500 mt-1">{item.notes}</p>
                            )}
                          </div>
                          {item.photo_urls && item.photo_urls.length > 0 && (
                            <span className="text-xs text-gray-500">
                              {item.photo_urls.length} photo(s)
                            </span>
                          )}
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Findings */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Findings
                </label>
                <textarea
                  value={findings}
                  onChange={(e) => setFindings(e.target.value)}
                  placeholder="Document your overall findings from this inspection..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              {/* Recommendations */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Recommendations
                </label>
                <textarea
                  value={recommendations}
                  onChange={(e) => setRecommendations(e.target.value)}
                  placeholder="Provide recommendations for repairs, maintenance, or follow-up actions..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              {/* Score Summary */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold text-gray-900">{calculateScore()}%</div>
                  <div className="text-sm text-gray-500">Overall Score</div>
                </div>
                <div className="bg-green-50 rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold text-green-600">
                    {checklistItems.filter(i => i.status === 'good').length}
                  </div>
                  <div className="text-sm text-gray-500">Good Items</div>
                </div>
                <div className="bg-red-50 rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold text-red-600">{issueCount}</div>
                  <div className="text-sm text-gray-500">Issues Found</div>
                </div>
              </div>
            </div>
          )}

          {/* Signature Tab */}
          {activeTab === 'signature' && (
            <div className="space-y-6">
              <div className="text-center">
                <h4 className="font-semibold text-gray-900 mb-2">Inspector Signature</h4>
                <p className="text-sm text-gray-500 mb-4">
                  Sign below to confirm the inspection has been completed accurately
                </p>
              </div>

              {/* Existing signature display */}
              {signature && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-green-800">
                      Signed by: {signature.inspector_name}
                    </span>
                    <span className="text-xs text-green-600">
                      {new Date(signature.signed_at).toLocaleString()}
                    </span>
                  </div>
                  <img
                    src={signature.signature_data}
                    alt="Signature"
                    className="max-h-24 mx-auto"
                  />
                  <button
                    onClick={clearSignature}
                    className="mt-2 text-sm text-red-600 hover:text-red-700"
                  >
                    Clear and re-sign
                  </button>
                </div>
              )}

              {/* Signature canvas */}
              {!signature && (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                  <div className="text-sm text-gray-500 mb-2 text-center">
                    Draw your signature below
                  </div>
                  <div className="flex justify-center">
                    <canvas
                      ref={canvasRef}
                      width={500}
                      height={150}
                      onMouseDown={startDrawing}
                      onMouseMove={draw}
                      onMouseUp={stopDrawing}
                      onMouseLeave={stopDrawing}
                      onTouchStart={startDrawing}
                      onTouchMove={draw}
                      onTouchEnd={stopDrawing}
                      className="border border-gray-200 rounded-lg bg-white cursor-crosshair touch-none max-w-full"
                      style={{ width: '100%', maxWidth: '500px' }}
                    />
                  </div>
                  <div className="flex justify-center gap-4 mt-4">
                    <button
                      onClick={clearSignature}
                      className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      Clear
                    </button>
                    <button
                      onClick={saveSignature}
                      disabled={!hasSignature}
                      className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Confirm Signature
                    </button>
                  </div>
                </div>
              )}

              {/* Inspector info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Inspector:</span>
                    <span className="ml-2 font-medium">{inspection.inspector}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Date:</span>
                    <span className="ml-2 font-medium">{new Date().toLocaleDateString()}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Asset:</span>
                    <span className="ml-2 font-medium">{asset?.name || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Type:</span>
                    <span className="ml-2 font-medium">{inspection.type.replace('_', ' ')}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex justify-between items-center pt-4 border-t border-gray-200 mt-4">
          <div className="text-sm text-gray-500">
            {calculateProgress()}% complete • {issueCount} issue{issueCount !== 1 ? 's' : ''} found
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              onClick={() => { void handleSave(false) }}
              className="px-4 py-2 text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100"
              disabled={loading}
            >
              <Save className="inline-block h-4 w-4 mr-1" />
              Save Progress
            </button>
            <button
              onClick={() => { void handleSave(true) }}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading || !canComplete()}
              title={!canComplete() ? 'Complete all items, add required photos/notes, and sign to finish' : ''}
            >
              {loading ? 'Saving...' : 'Complete Inspection'}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  )
}
