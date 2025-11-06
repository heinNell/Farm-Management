
import React, { useState, useEffect } from 'react'
import { useSupabaseRealtime } from '../hooks/useSupabaseRealtime'
import { useSupabaseCRUD } from '../hooks/useSupabaseCRUD'
import { TABLES, type JobCard } from '../lib/supabase'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'
import { Users, Clock, MapPin, AlertCircle, Plus } from 'lucide-react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'

const columns = [
  { id: 'todo', title: 'To Do', color: 'bg-gray-100' },
  { id: 'in_progress', title: 'In Progress', color: 'bg-blue-100' },
  { id: 'review', title: 'Review', color: 'bg-yellow-100' },
  { id: 'completed', title: 'Completed', color: 'bg-green-100' }
]

export const CollaborativeJobBoard: React.FC = () => {
  const [activeUsers, setActiveUsers] = useState<string[]>([])
  const [selectedJob, setSelectedJob] = useState<JobCard | null>(null)

  const { data: jobs, loading } = useSupabaseRealtime<JobCard>({
    table: TABLES.JOB_CARDS,
    onInsert: (payload) => {
      toast.success(`🆕 New job added: ${payload.new.title}`, {
        duration: 4000,
        icon: '👷'
      })
    },
    onUpdate: (payload) => {
      const oldStatus = payload.old.status
      const newStatus = payload.new.status
      const jobTitle = payload.new.title

      if (oldStatus !== newStatus) {
        toast.success(`📋 ${jobTitle} moved to ${newStatus.replace('_', ' ')}`, {
          duration: 3000,
          icon: '🔄'
        })
      }
    }
  })

  const { update } = useSupabaseCRUD({
    table: TABLES.JOB_CARDS
  })

  // Simulate active users (in real implementation, track via presence)
  useEffect(() => {
    const users = ['John Smith', 'Sarah Wilson', 'Mike Johnson', 'David Brown']
    setActiveUsers(users.slice(0, Math.floor(Math.random() * 4) + 1))
  }, [])

  const handleDragEnd = async (result: any) => {
    if (!result.destination) return

    const { draggableId, destination } = result
    const job = jobs.find(j => j.id === draggableId)
    
    if (!job || job.status === destination.droppableId) return

    try {
      await update(draggableId, {
        status: destination.droppableId,
        updated_at: new Date().toISOString()
      })
    } catch (error) {
      toast.error('Failed to update job status')
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'text-green-600 bg-green-100'
      case 'medium': return 'text-yellow-600 bg-yellow-100'
      case 'high': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date()
  }

  const getJobsByStatus = (status: string) => {
    return jobs.filter(job => job.status === status)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading collaborative job board...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with Active Users */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Collaborative Job Board</h1>
          <p className="text-gray-600 mt-1">Real-time team collaboration on farm tasks</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-gray-500" />
            <span className="text-sm text-gray-600">Active now:</span>
            <div className="flex -space-x-2">
              {activeUsers.map((user, index) => (
                <div
                  key={user}
                  className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center text-white text-xs font-medium border-2 border-white"
                  title={user}
                >
                  {user.split(' ').map(n => n[0]).join('')}
                </div>
              ))}
            </div>
          </div>
          
          <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Plus className="h-5 w-5 mr-2" />
            Add Job
          </button>
        </div>
      </div>

      {/* Real-time Stats */}
      <div className="grid grid-cols-4 gap-4">
        {columns.map(column => (
          <div key={column.id} className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-gray-900">{column.title}</h3>
              <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-sm">
                {getJobsByStatus(column.id).length}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Kanban Board */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {columns.map(column => (
            <div key={column.id} className={`rounded-lg ${column.color} p-4`}>
              <h3 className="font-semibold text-gray-800 mb-4 flex items-center justify-between">
                {column.title}
                <span className="bg-white text-gray-600 px-2 py-1 rounded-full text-sm">
                  {getJobsByStatus(column.id).length}
                </span>
              </h3>

              <Droppable droppableId={column.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`space-y-3 min-h-[400px] transition-colors ${
                      snapshot.isDraggingOver ? 'bg-white bg-opacity-50 rounded-lg' : ''
                    }`}
                  >
                    {getJobsByStatus(column.id).map((job, index) => (
                      <Draggable key={job.id} draggableId={job.id} index={index}>
                        {(provided, snapshot) => (
                          <motion.div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-all cursor-pointer ${
                              snapshot.isDragging ? 'rotate-3 shadow-lg' : ''
                            }`}
                            onClick={() => setSelectedJob(job)}
                          >
                            <div className="space-y-3">
                              <div className="flex justify-between items-start">
                                <h4 className="font-medium text-gray-900 text-sm leading-tight">
                                  {job.title}
                                </h4>
                                <div className="flex items-center space-x-1">
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(job.priority)}`}>
                                    {job.priority}
                                  </span>
                                  {isOverdue(job.due_date) && job.status !== 'completed' && (
                                    <AlertCircle className="h-4 w-4 text-red-500" />
                                  )}
                                </div>
                              </div>

                              <p className="text-gray-600 text-xs line-clamp-2">
                                {job.description}
                              </p>

                              <div className="space-y-2">
                                <div className="flex items-center text-xs text-gray-500">
                                  <Users className="h-3 w-3 mr-1" />
                                  {job.assigned_to}
                                </div>
                                
                                <div className="flex items-center text-xs text-gray-500">
                                  <MapPin className="h-3 w-3 mr-1" />
                                  {job.location}
                                </div>
                                
                                <div className="flex items-center text-xs text-gray-500">
                                  <Clock className="h-3 w-3 mr-1" />
                                  {job.estimated_hours}h • Due: {new Date(job.due_date).toLocaleDateString()}
                                </div>
                              </div>

                              {job.tags && job.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                  {job.tags.slice(0, 2).map(tag => (
                                    <span key={tag} className="px-1.5 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                                      {tag}
                                    </span>
                                  ))}
                                  {job.tags.length > 2 && (
                                    <span className="text-xs text-gray-400">+{job.tags.length - 2}</span>
                                  )}
                                </div>
                              )}

                              {/* Real-time activity indicator */}
                              <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                                <div className="text-xs text-gray-400">
                                  Updated {new Date(job.updated_at).toLocaleTimeString()}
                                </div>
                                <div className="flex -space-x-1">
                                  {/* Show avatars of users currently viewing/editing */}
                                  <div className="w-5 h-5 rounded-full bg-green-400 border border-white flex items-center justify-center">
                                    <div className="w-2 h-2 rounded-full bg-white animate-pulse"></div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>

      {/* Job Detail Modal */}
      {selectedJob && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-bold text-gray-900">{selectedJob.title}</h2>
                <button
                  onClick={() => setSelectedJob(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-4">
                <p className="text-gray-600">{selectedJob.description}</p>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Priority:</span>
                    <span className={`ml-2 px-2 py-1 rounded-full text-xs ${getPriorityColor(selectedJob.priority)}`}>
                      {selectedJob.priority}
                    </span>
                  </div>
                  
                  <div>
                    <span className="font-medium text-gray-700">Status:</span>
                    <span className="ml-2 capitalize">{selectedJob.status.replace('_', ' ')}</span>
                  </div>
                  
                  <div>
                    <span className="font-medium text-gray-700">Assigned to:</span>
                    <span className="ml-2">{selectedJob.assigned_to}</span>
                  </div>
                  
                  <div>
                    <span className="font-medium text-gray-700">Location:</span>
                    <span className="ml-2">{selectedJob.location}</span>
                  </div>
                  
                  <div>
                    <span className="font-medium text-gray-700">Estimated Hours:</span>
                    <span className="ml-2">{selectedJob.estimated_hours}h</span>
                  </div>
                  
                  <div>
                    <span className="font-medium text-gray-700">Due Date:</span>
                    <span className="ml-2">{new Date(selectedJob.due_date).toLocaleDateString()}</span>
                  </div>
                </div>
                
                {selectedJob.tags && selectedJob.tags.length > 0 && (
                  <div>
                    <span className="font-medium text-gray-700 block mb-2">Tags:</span>
                    <div className="flex flex-wrap gap-2">
                      {selectedJob.tags.map(tag => (
                        <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CollaborativeJobBoard
