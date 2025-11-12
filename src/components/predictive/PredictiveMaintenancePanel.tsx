import { motion } from 'framer-motion'
import { AlertTriangle, Bell, Calendar, RefreshCw, Target, TrendingDown, TrendingUp, Wrench } from 'lucide-react'
import React, { useState } from 'react'
import usePredictiveMaintenance from '../../hooks/usePredictiveMaintenance'

interface PredictiveMaintenancePanelProps {
  className?: string
}

export const PredictiveMaintenancePanel: React.FC<PredictiveMaintenancePanelProps> = ({ 
  className = "" 
}) => {
  const {
    predictions,
    kpis,
    loading,
    error,
    refreshPredictions,
    updatePredictiveModel
  } = usePredictiveMaintenance()

  const [viewMode, setViewMode] = useState<'overview' | 'detailed' | 'recommendations'>('overview')

  const getRiskColor = (probability: number) => {
    if (probability >= 0.8) return 'text-red-600 bg-red-100'
    if (probability >= 0.6) return 'text-orange-600 bg-orange-100'
    if (probability >= 0.4) return 'text-yellow-600 bg-yellow-100'
    return 'text-green-600 bg-green-100'
  }

  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 1: return 'text-red-600 bg-red-100'
      case 2: return 'text-orange-600 bg-orange-100'
      case 3: return 'text-yellow-600 bg-yellow-100'
      case 4: return 'text-blue-600 bg-blue-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing':
        return <TrendingUp className="h-4 w-4 text-red-500" />
      case 'decreasing':
        return <TrendingDown className="h-4 w-4 text-green-500" />
      default:
        return <Target className="h-4 w-4 text-gray-500" />
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const criticalPredictions = predictions.filter(p => p.failure_probability >= 0.7)
  const upcomingPredictions = predictions.filter(p => {
    const predictedDate = new Date(p.predicted_failure_date)
    const thirtyDaysFromNow = new Date()
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)
    return predictedDate <= thirtyDaysFromNow
  })

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Loading predictive maintenance data...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
        <div className="text-center text-red-600">
          <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
          <p>{error}</p>
          <button
            onClick={() => void refreshPredictions()}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-white rounded-lg shadow-md ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between">
          <div className="flex items-center mb-4 lg:mb-0">
            <AlertTriangle className="h-6 w-6 text-orange-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Predictive Maintenance</h3>
            {getTrendIcon(kpis.riskTrend)}
          </div>
          
          <div className="flex flex-wrap gap-2">
            <div className="flex rounded-lg border border-gray-300 overflow-hidden">
              <button
                onClick={() => setViewMode('overview')}
                className={`px-3 py-2 text-sm font-medium ${
                  viewMode === 'overview' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setViewMode('detailed')}
                className={`px-3 py-2 text-sm font-medium ${
                  viewMode === 'detailed' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Detailed
              </button>
              <button
                onClick={() => setViewMode('recommendations')}
                className={`px-3 py-2 text-sm font-medium ${
                  viewMode === 'recommendations' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Recommendations
              </button>
            </div>
            
            <button
              onClick={() => void updatePredictiveModel()}
              className="flex items-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              Update Model
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="p-6 border-b border-gray-200">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-blue-900">Total Alerts</h4>
              <Bell className="h-5 w-5 text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-blue-600">{kpis.totalAlerts}</p>
            <p className="text-sm text-blue-700">Active predictions</p>
          </div>

          <div className="bg-red-50 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-red-900">Critical Alerts</h4>
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <p className="text-2xl font-bold text-red-600">{kpis.criticalAlerts}</p>
            <p className="text-sm text-red-700">High risk components</p>
          </div>

          <div className="bg-orange-50 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-orange-900">Average Risk</h4>
              <Target className="h-5 w-5 text-orange-600" />
            </div>
            <p className="text-2xl font-bold text-orange-600">
              {(kpis.averageRisk * 100).toFixed(0)}%
            </p>
            <p className="text-sm text-orange-700">Failure probability</p>
          </div>

          <div className="bg-yellow-50 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-yellow-900">Upcoming</h4>
              <Calendar className="h-5 w-5 text-yellow-600" />
            </div>
            <p className="text-2xl font-bold text-yellow-600">{kpis.upcomingMaintenance}</p>
            <p className="text-sm text-yellow-700">Next 30 days</p>
          </div>
        </div>
      </div>

      {/* Content based on view mode */}
      <div className="p-6">
        {viewMode === 'overview' && (
          <div className="space-y-6">
            {/* Critical Alerts */}
            {criticalPredictions.length > 0 && (
              <div>
                <h4 className="font-medium text-red-900 mb-3 flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2" />
                  Critical Alerts Requiring Immediate Attention
                </h4>
                <div className="space-y-3">
                  {criticalPredictions.slice(0, 3).map((prediction, index) => (
                    <motion.div
                      key={prediction.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-red-50 border border-red-200 rounded-lg p-4"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h5 className="font-medium text-red-900">
                            {prediction.asset_name} - {prediction.component_name}
                          </h5>
                          <p className="text-sm text-red-700 mt-1">
                            {prediction.recommended_action}
                          </p>
                          <div className="flex items-center mt-2 space-x-4">
                            <span className="text-xs text-red-600">
                              Risk: {(prediction.failure_probability * 100).toFixed(0)}%
                            </span>
                            <span className="text-xs text-red-600">
                              Predicted: {formatDate(prediction.predicted_failure_date)}
                            </span>
                          </div>
                        </div>
                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(prediction.maintenance_priority)}`}>
                          Priority {prediction.maintenance_priority}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Upcoming Maintenance */}
            {upcomingPredictions.length > 0 && (
              <div>
                <h4 className="font-medium text-yellow-900 mb-3 flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  Upcoming Maintenance (Next 30 Days)
                </h4>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                  {upcomingPredictions.slice(0, 4).map((prediction, index) => (
                    <motion.div
                      key={prediction.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-yellow-50 border border-yellow-200 rounded-lg p-4"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="font-medium text-yellow-900">
                          {prediction.asset_name}
                        </h5>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(prediction.failure_probability)}`}>
                          {(prediction.failure_probability * 100).toFixed(0)}%
                        </span>
                      </div>
                      <p className="text-sm text-yellow-700">{prediction.component_name}</p>
                      <p className="text-xs text-yellow-600 mt-1">
                        Due: {formatDate(prediction.predicted_failure_date)}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Risk Trend */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-900">Risk Trend Analysis</h4>
                {getTrendIcon(kpis.riskTrend)}
              </div>
              <p className="text-sm text-gray-700">
                Overall maintenance risk is currently{' '}
                <span className={`font-medium ${
                  kpis.riskTrend === 'increasing' 
                    ? 'text-red-600' 
                    : kpis.riskTrend === 'decreasing' 
                    ? 'text-green-600' 
                    : 'text-gray-600'
                }`}>
                  {kpis.riskTrend}
                </span>
                {' '}based on recent equipment usage patterns and maintenance history.
              </p>
              {kpis.riskTrend === 'increasing' && (
                <div className="mt-2 p-2 bg-red-100 rounded text-sm text-red-800">
                  <strong>Recommendation:</strong> Consider scheduling additional preventive maintenance 
                  and reviewing operating procedures for high-risk assets.
                </div>
              )}
            </div>
          </div>
        )}

        {viewMode === 'detailed' && (
          <div className="space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left p-3">Asset</th>
                    <th className="text-left p-3">Component</th>
                    <th className="text-left p-3">Risk</th>
                    <th className="text-left p-3">Predicted Date</th>
                    <th className="text-left p-3">Confidence</th>
                    <th className="text-left p-3">Priority</th>
                    <th className="text-left p-3">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {predictions.map((prediction) => (
                    <tr key={prediction.id} className="hover:bg-gray-50">
                      <td className="p-3">
                        <div>
                          <div className="font-medium text-gray-900">{prediction.asset_name}</div>
                          <div className="text-xs text-gray-500">{prediction.asset_type}</div>
                        </div>
                      </td>
                      <td className="p-3 text-gray-700">{prediction.component_name}</td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(prediction.failure_probability)}`}>
                          {(prediction.failure_probability * 100).toFixed(0)}%
                        </span>
                      </td>
                      <td className="p-3 text-gray-700">{formatDate(prediction.predicted_failure_date)}</td>
                      <td className="p-3 text-gray-700">{(prediction.confidence_level * 100).toFixed(0)}%</td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(prediction.maintenance_priority)}`}>
                          {prediction.maintenance_priority}
                        </span>
                      </td>
                      <td className="p-3 text-gray-700 text-xs">{prediction.recommended_action}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {viewMode === 'recommendations' && (
          <div className="space-y-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-3 flex items-center">
                <Wrench className="h-5 w-5 mr-2" />
                Maintenance Recommendations
              </h4>
              
              <div className="space-y-4">
                <div className="bg-white rounded-lg p-4 border border-blue-200">
                  <h5 className="font-medium text-gray-900 mb-2">Immediate Actions (Next 7 Days)</h5>
                  <ul className="space-y-2 text-sm text-gray-700">
                    {criticalPredictions.slice(0, 3).map((prediction) => (
                      <li key={prediction.id} className="flex items-start">
                        <span className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        <div>
                          <strong>{prediction.asset_name}:</strong> {prediction.recommended_action}
                          <div className="text-xs text-gray-500 mt-1">
                            Component: {prediction.component_name} | Risk: {(prediction.failure_probability * 100).toFixed(0)}%
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-white rounded-lg p-4 border border-blue-200">
                  <h5 className="font-medium text-gray-900 mb-2">Preventive Measures</h5>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-yellow-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <div>
                        Schedule regular inspections for high-risk components
                        <div className="text-xs text-gray-500 mt-1">
                          Frequency: Weekly for critical assets, monthly for others
                        </div>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-yellow-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <div>
                        Implement condition-based monitoring for hydraulic systems
                        <div className="text-xs text-gray-500 mt-1">
                          Focus on assets with failure probability &gt; 40%
                        </div>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-yellow-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <div>
                        Review and update maintenance schedules based on usage patterns
                        <div className="text-xs text-gray-500 mt-1">
                          Adjust intervals for high-utilization equipment
                        </div>
                      </div>
                    </li>
                  </ul>
                </div>

                <div className="bg-white rounded-lg p-4 border border-blue-200">
                  <h5 className="font-medium text-gray-900 mb-2">Long-term Strategy</h5>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <div>
                        Consider asset replacement for equipment with consistently high failure risk
                        <div className="text-xs text-gray-500 mt-1">
                          Evaluate ROI of replacement vs. continued maintenance
                        </div>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <div>
                        Invest in operator training to reduce equipment stress
                        <div className="text-xs text-gray-500 mt-1">
                          Focus on proper operation techniques and early problem detection
                        </div>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default PredictiveMaintenancePanel
