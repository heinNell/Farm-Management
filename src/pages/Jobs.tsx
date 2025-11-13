
import { motion } from 'framer-motion'
import { AlertTriangle, Clock, MapPin, Plus, Search, User } from 'lucide-react'
import { useEffect, useState } from 'react'
import JobKanban from '../components/JobKanban'
import JobModal from '../components/modals/JobModal'
import { useSupabaseCRUD } from '../hooks/useSupabaseCRUD'
import type { JobCard, JobFormData } from '../types/database'

const columns = [
  { id: 'todo', title: 'To Do', color: 'bg-gray-100' },
  { id: 'in_progress', title: 'In Progress', color: 'bg-blue-100' },
  { id: 'review', title: 'Review', color: 'bg-yellow-100' },
  { id: 'completed', title: 'Completed', color: 'bg-green-100' }
]

export default function Jobs() {
  const { items: jobs, loading, create, update, delete: deleteJob, refresh } = useSupabaseCRUD<JobCard>('job_cards')
  const [searchTerm, setSearchTerm] = useState('')
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'low' | 'medium' | 'high'>('all')
  const [assigneeFilter, setAssigneeFilter] = useState('all')
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban')
  const [showModal, setShowModal] = useState(false)
  const [editingJob, setEditingJob] = useState<JobCard | null>(null)

  useEffect(() => {
    void refresh()
  }, [refresh])

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.location.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesPriority = priorityFilter === 'all' || job.priority === priorityFilter
    const matchesAssignee = assigneeFilter === 'all' || job.assigned_to === assigneeFilter
    return matchesSearch && matchesPriority && matchesAssignee
  })

  const assignees = Array.from(new Set(jobs.map(job => job.assigned_to)))

  // Handler functions for CRUD operations
  const handleDeleteJob = async (id: string) => {
    if (confirm('Are you sure you want to delete this job?')) {
      await deleteJob(id)
    }
  }

  const handleUpdateStatus = async (id: string, newStatus: JobCard['status']) => {
    await update(id, { status: newStatus })
  }

  const handleCreateOrUpdateJob = async (data: JobFormData) => {
    if (editingJob) {
      await update(editingJob.id, {
        ...data,
        asset_id: data.asset_id ?? null,
        hour_meter_reading: data.hour_meter_reading ?? null
      })
    } else {
      await create({
        ...data,
        status: 'todo',
        actual_hours: data.actual_hours ?? null,
        notes: data.notes ?? null,
        completed_date: null,
        asset_id: data.asset_id ?? null,
        hour_meter_reading: data.hour_meter_reading ?? null
      })
    }
    await refresh()
  }

  const handleEditJob = (job: JobCard) => {
    setEditingJob(job)
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingJob(null)
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

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col lg:flex-row gap-4 justify-between">
        <div className="flex-1 max-w-lg">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search jobs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
        </div>
        
        <div className="flex gap-2">
          <div className="flex rounded-lg border border-gray-300 overflow-hidden">
            <button
              onClick={() => setViewMode('kanban')}
              className={`px-4 py-2 text-sm font-medium ${
                viewMode === 'kanban' 
                  ? 'bg-green-600 text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Kanban
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-4 py-2 text-sm font-medium ${
                viewMode === 'list' 
                  ? 'bg-green-600 text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              List
            </button>
          </div>
          <button 
            onClick={() => setShowModal(true)}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Plus className="h-5 w-5 mr-2" />
            New Job
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value as typeof priorityFilter)}
          className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
        >
          <option value="all">All Priorities</option>
          <option value="low">Low Priority</option>
          <option value="medium">Medium Priority</option>
          <option value="high">High Priority</option>
        </select>

        <select
          value={assigneeFilter}
          onChange={(e) => setAssigneeFilter(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
        >
          <option value="all">All Assignees</option>
          {assignees.map(assignee => (
            <option key={assignee} value={assignee}>{assignee}</option>
          ))}
        </select>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading jobs...</p>
          </div>
        </div>
      ) : filteredJobs.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-md">
          <p className="text-gray-500 text-lg">No jobs found</p>
          <p className="text-gray-400 text-sm mt-2">
            {searchTerm || priorityFilter !== 'all' || assigneeFilter !== 'all'
              ? 'Try adjusting your filters'
              : 'Create your first job to get started'}
          </p>
        </div>
      ) : viewMode === 'kanban' ? (
        <JobKanban 
          jobs={filteredJobs.map(job => ({
            id: job.id,
            title: job.title,
            description: job.description,
            priority: job.priority,
            status: job.status,
            assignedTo: job.assigned_to,
            location: job.location,
            estimatedHours: job.estimated_hours,
            dueDate: job.due_date,
            tags: job.tags
          }))} 
          columns={columns} 
        />
      ) : (
        <div className="space-y-4">
          {filteredJobs.map((job, index) => (
            <motion.div
              key={job.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{job.title}</h3>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(job.priority)}`}>
                      {job.priority}
                    </div>
                    {isOverdue(job.due_date) && job.status !== 'completed' && (
                      <div className="flex items-center px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Overdue
                      </div>
                    )}
                  </div>
                  <p className="text-gray-600 mb-3">{job.description}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div className="flex items-center">
                  <User className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-sm text-gray-600">{job.assigned_to}</span>
                </div>
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-sm text-gray-600">{job.location}</span>
                </div>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-sm text-gray-600">{job.estimated_hours}h estimated</span>
                </div>
                <div className="flex items-center">
                  <span className="text-sm text-gray-600">
                    Due: {new Date(job.due_date).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                {job.tags.map(tag => (
                  <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                    {tag}
                  </span>
                ))}
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                <div className="text-sm text-gray-500">
                  Status: <span className="font-medium capitalize">{job.status.replace('_', ' ')}</span>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleEditJob(job)}
                    className="px-3 py-1 text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => {
                      const nextStatus = job.status === 'todo' ? 'in_progress' : 
                                       job.status === 'in_progress' ? 'review' : 
                                       job.status === 'review' ? 'completed' : 'todo'
                      void handleUpdateStatus(job.id, nextStatus)
                    }}
                    className="px-3 py-1 text-sm text-green-600 hover:text-green-700 font-medium"
                  >
                    Update Status
                  </button>
                  <button 
                    onClick={() => { void handleDeleteJob(job.id) }}
                    className="px-3 py-1 text-sm text-red-600 hover:text-red-700 font-medium"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Job Modal */}
      <JobModal
        isOpen={showModal}
        onClose={handleCloseModal}
        onSubmit={handleCreateOrUpdateJob}
        item={editingJob}
        loading={loading}
      />
    </div>
  )
}
