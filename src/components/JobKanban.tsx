import { motion } from 'framer-motion'
import { AlertTriangle, Clock, MapPin, User } from 'lucide-react'

interface Job {
  id: string
  title: string
  description: string
  priority: string
  status: string
  assignedTo: string
  location: string
  estimatedHours: number
  dueDate: string
  tags: string[]
}

interface Column {
  id: string
  title: string
  color: string
}

interface JobKanbanProps {
  jobs: Job[]
  columns: Column[]
}

export default function JobKanban({ jobs, columns }: JobKanbanProps) {
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

  const getJobsForColumn = (columnId: string) => {
    return jobs.filter(job => job.status === columnId)
  }

  return (
    <div className="flex gap-6 overflow-x-auto pb-4">
      {columns.map((column, columnIndex) => {
        const columnJobs = getJobsForColumn(column.id)
        
        return (
          <motion.div
            key={column.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: columnIndex * 0.1 }}
            className="flex-shrink-0 w-80"
          >
            <div className={`rounded-lg p-4 ${column.color}`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">{column.title}</h3>
                <span className="px-2 py-1 bg-white bg-opacity-70 text-gray-700 text-sm rounded-full">
                  {columnJobs.length}
                </span>
              </div>

              <div className="space-y-3">
                {columnJobs.map((job, jobIndex) => (
                  <motion.div
                    key={job.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: (columnIndex * 0.1) + (jobIndex * 0.05) }}
                    className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="font-medium text-gray-900 text-sm leading-tight">
                        {job.title}
                      </h4>
                      <div className="flex gap-1">
                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(job.priority)}`}>
                          {job.priority}
                        </div>
                        {isOverdue(job.dueDate) && job.status !== 'completed' && (
                          <div className="flex items-center px-1 py-1 bg-red-100 text-red-800 rounded-full">
                            <AlertTriangle className="h-3 w-3" />
                          </div>
                        )}
                      </div>
                    </div>

                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {job.description}
                    </p>

                    <div className="space-y-2 mb-3">
                      <div className="flex items-center text-xs text-gray-500">
                        <User className="h-3 w-3 mr-1" />
                        {job.assignedTo}
                      </div>
                      <div className="flex items-center text-xs text-gray-500">
                        <MapPin className="h-3 w-3 mr-1" />
                        {job.location}
                      </div>
                      <div className="flex items-center text-xs text-gray-500">
                        <Clock className="h-3 w-3 mr-1" />
                        {job.estimatedHours}h • Due {new Date(job.dueDate).toLocaleDateString()}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {job.tags.slice(0, 2).map(tag => (
                        <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                          {tag}
                        </span>
                      ))}
                      {job.tags.length > 2 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                          +{job.tags.length - 2}
                        </span>
                      )}
                    </div>
                  </motion.div>
                ))}

                {columnJobs.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <p className="text-sm">No jobs in this column</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}
