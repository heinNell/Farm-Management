
import React, { useState } from 'react'
import {Plus, Search, Filter, MapPin, Clock, User, AlertTriangle} from 'lucide-react'
import { motion } from 'framer-motion'
import JobKanban from '../components/JobKanban'

const mockJobs = [
  {
    id: '1',
    title: 'Irrigation System Maintenance',
    description: 'Check and clean all irrigation nozzles in Field A',
    priority: 'high',
    status: 'todo',
    assignedTo: 'John Smith',
    location: 'Field A - North Section',
    estimatedHours: 4,
    dueDate: '2024-01-20T17:00:00Z',
    createdAt: '2024-01-15T09:00:00Z',
    tags: ['maintenance', 'irrigation']
  },
  {
    id: '2',
    title: 'Soil pH Testing',
    description: 'Conduct comprehensive soil pH testing across all fields',
    priority: 'medium',
    status: 'in_progress',
    assignedTo: 'Sarah Wilson',
    location: 'Multiple Fields',
    estimatedHours: 6,
    dueDate: '2024-01-22T17:00:00Z',
    createdAt: '2024-01-14T10:30:00Z',
    tags: ['testing', 'soil']
  },
  {
    id: '3',
    title: 'Equipment Safety Inspection',
    description: 'Monthly safety inspection for all tractors and harvesters',
    priority: 'high',
    status: 'in_progress',
    assignedTo: 'Mike Johnson',
    location: 'Equipment Yard',
    estimatedHours: 8,
    dueDate: '2024-01-18T17:00:00Z',
    createdAt: '2024-01-12T08:00:00Z',
    tags: ['inspection', 'safety']
  },
  {
    id: '4',
    title: 'Fertilizer Application',
    description: 'Apply nitrogen fertilizer to corn fields',
    priority: 'medium',
    status: 'completed',
    assignedTo: 'David Brown',
    location: 'Fields C, D, E',
    estimatedHours: 12,
    dueDate: '2024-01-16T17:00:00Z',
    createdAt: '2024-01-10T07:00:00Z',
    tags: ['fertilizer', 'crop-care']
  },
  {
    id: '5',
    title: 'Fence Repair',
    description: 'Repair damaged fence sections along the north boundary',
    priority: 'low',
    status: 'review',
    assignedTo: 'Tom Anderson',
    location: 'North Boundary',
    estimatedHours: 3,
    dueDate: '2024-01-25T17:00:00Z',
    createdAt: '2024-01-13T11:00:00Z',
    tags: ['maintenance', 'infrastructure']
  }
]

const columns = [
  { id: 'todo', title: 'To Do', color: 'bg-gray-100' },
  { id: 'in_progress', title: 'In Progress', color: 'bg-blue-100' },
  { id: 'review', title: 'Review', color: 'bg-yellow-100' },
  { id: 'completed', title: 'Completed', color: 'bg-green-100' }
]

export default function Jobs() {
  const [searchTerm, setSearchTerm] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [assigneeFilter, setAssigneeFilter] = useState('all')
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban')

  const filteredJobs = mockJobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.location.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesPriority = priorityFilter === 'all' || job.priority === priorityFilter
    const matchesAssignee = assigneeFilter === 'all' || job.assignedTo === assigneeFilter
    return matchesSearch && matchesPriority && matchesAssignee
  })

  const assignees = Array.from(new Set(mockJobs.map(job => job.assignedTo)))

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
          <button className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
            <Plus className="h-5 w-5 mr-2" />
            New Job
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
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
      {viewMode === 'kanban' ? (
        <JobKanban jobs={filteredJobs} columns={columns} />
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
                    {isOverdue(job.dueDate) && job.status !== 'completed' && (
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
                  <span className="text-sm text-gray-600">{job.assignedTo}</span>
                </div>
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-sm text-gray-600">{job.location}</span>
                </div>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-sm text-gray-600">{job.estimatedHours}h estimated</span>
                </div>
                <div className="flex items-center">
                  <span className="text-sm text-gray-600">
                    Due: {new Date(job.dueDate).toLocaleDateString()}
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
                  <button className="px-3 py-1 text-sm text-blue-600 hover:text-blue-700 font-medium">
                    View Details
                  </button>
                  <button className="px-3 py-1 text-sm text-green-600 hover:text-green-700 font-medium">
                    Update Status
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
