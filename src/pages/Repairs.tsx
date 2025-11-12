import { motion } from 'framer-motion';
import { AlertCircle, Camera, CheckCircle, Clock, Plus, Search, Wrench } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useSupabaseCRUD } from '../hooks/useSupabaseCRUD';
import type { RepairItem } from '../types/database';

export default function Repairs() {
  const { items: repairs, refresh } = useSupabaseCRUD<RepairItem>('repairs');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'in_progress' | 'completed' | 'cancelled'>('all');
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'low' | 'medium' | 'high'>('all');

  // TODO: Add loading state, update and delete handlers when needed
  // const { items: repairs, loading, update, delete: deleteRepair, refresh } = useSupabaseCRUD<RepairItem>('repairs');

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const filteredRepairs = repairs.filter(repair => {
    const matchesSearch = repair.equipment_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          repair.defect_tag.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          repair.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || repair.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || repair.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'in_progress': return 'text-blue-600 bg-blue-100';
      case 'completed': return 'text-green-600 bg-green-100';
      case 'cancelled': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'in_progress': return <Wrench className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'cancelled': return <AlertCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex-1 max-w-lg">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search repairs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
        </div>

        <button className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
          <Plus className="h-5 w-5 mr-2" />
          New Repair
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
          className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
        >
          <option value="all">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>

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
      </div>

      {/* Repairs List */}
      <div className="space-y-4">
        {filteredRepairs.map((repair, index) => (
          <motion.div
            key={repair.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">{repair.equipment_name}</h3>
                  <span className="text-sm text-gray-500">#{repair.defect_tag}</span>
                  {repair.warranty_status === 'in_warranty' && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                      Under Warranty
                    </span>
                  )}
                </div>
                <p className="text-gray-600 mb-3">{repair.description}</p>
              </div>

              <div className="flex flex-wrap gap-2">
                <div className={`flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(repair.status)}`}>
                  {getStatusIcon(repair.status)}
                  <span className="ml-1 capitalize">{repair.status.replace('_', ' ')}</span>
                </div>
                <div className={`flex items-center px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(repair.priority)}`}>
                  <span className="capitalize">{repair.priority}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <span className="text-sm text-gray-500">Assigned To:</span>
                <p className="font-medium">{repair.assigned_technician || 'Unassigned'}</p>
              </div>
              <div>
                <span className="text-sm text-gray-500">Created:</span>
                <p className="font-medium">
                  {new Date(repair.created_at).toLocaleDateString()}
                </p>
              </div>
              <div>
                <span className="text-sm text-gray-500">Est. Completion:</span>
                <p className="font-medium">
                  {repair.estimated_completion 
                    ? new Date(repair.estimated_completion).toLocaleDateString()
                    : 'TBD'
                  }
                </p>
              </div>
            </div>

            {repair.photo_urls && repair.photo_urls.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Photos:</h4>
                <div className="flex gap-2">
                  {repair.photo_urls.map((photo, photoIndex) => (
                    <img
                      key={photoIndex}
                      src={photo}
                      alt={`Repair photo ${photoIndex + 1}`}
                      className="h-16 w-16 object-cover rounded-lg border border-gray-200"
                    />
                  ))}
                  <button className="h-16 w-16 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center hover:border-gray-400 transition-colors">
                    <Camera className="h-6 w-6 text-gray-400" />
                  </button>
                </div>
              </div>
            )}

            <div className="flex justify-between items-center pt-4 border-t border-gray-200">
              <div className="text-sm text-gray-500">
                {repair.estimated_cost > 0 && (
                  <span>Estimated Cost: <span className="font-medium text-gray-900">${repair.estimated_cost.toFixed(2)}</span></span>
                )}
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
    </div>
  );
}