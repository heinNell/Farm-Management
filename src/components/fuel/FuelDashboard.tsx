
import React from 'react'
import { useFuelData } from '../../hooks/useFuelData'
import {Fuel, TrendingUp, DollarSign, Clock, Activity, BarChart3, Users, Calendar} from 'lucide-react'
import { formatConsumption, formatCurrency, formatPercentage, formatHours } from '../../utils/fuelCalculations'

const FuelDashboard: React.FC = () => {
  const { kpis, assets, loading } = useFuelData()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        <span className="ml-3 text-gray-600">Loading fuel analytics...</span>
      </div>
    )
  }

  if (!kpis) {
    return (
      <div className="text-center py-12">
        <Fuel className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No fuel data available</h3>
        <p className="text-gray-500">Add assets and fuel records to see analytics.</p>
      </div>
    )
  }

  const equipmentCounts = assets.reduce((acc, asset) => {
    acc[asset.type] = (acc[asset.type] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Fuel Management Dashboard</h1>
        <p className="text-gray-600 mt-1">Comprehensive fuel consumption and cost analytics</p>
      </div>

      {/* Primary KPIs - Consumption Rates */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <Fuel className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Fleet Fuel Consumption</p>
              <p className="text-2xl font-semibold text-gray-900">
                {formatConsumption(kpis.consumption.averageFleetConsumption)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <DollarSign className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Fuel Cost per Hour</p>
              <p className="text-2xl font-semibold text-gray-900">
                {formatCurrency(kpis.cost.fuelCostPerHour)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Fuel Cost</p>
              <p className="text-2xl font-semibold text-gray-900">
                {formatCurrency(kpis.totalFuelCost)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Secondary KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="flex items-center">
            <Clock className="h-6 w-6 text-orange-600" />
            <div className="ml-3">
              <p className="text-xs font-medium text-gray-500">Total Operating Hours</p>
              <p className="text-lg font-semibold text-gray-900">
                {formatHours(kpis.totalOperatingHours)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="flex items-center">
            <Activity className="h-6 w-6 text-red-600" />
            <div className="ml-3">
              <p className="text-xs font-medium text-gray-500">Total Fuel Consumed</p>
              <p className="text-lg font-semibold text-gray-900">
                {kpis.totalFuelConsumed.toFixed(1)} L
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="flex items-center">
            <BarChart3 className="h-6 w-6 text-indigo-600" />
            <div className="ml-3">
              <p className="text-xs font-medium text-gray-500">Fuel Cost %</p>
              <p className="text-lg font-semibold text-gray-900">
                {formatPercentage(kpis.cost.fuelCostPercentage)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="flex items-center">
            <Users className="h-6 w-6 text-cyan-600" />
            <div className="ml-3">
              <p className="text-xs font-medium text-gray-500">Active Assets</p>
              <p className="text-lg font-semibold text-gray-900">
                {assets.filter(a => a.status === 'active').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Equipment Type Analysis */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Equipment Type Fuel Efficiency</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(kpis.consumption.equipmentTypeAverages).map(([type, consumption]) => (
            <div key={type} className="border rounded-lg p-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-gray-600 capitalize">{type}s</p>
                  <p className="text-xl font-bold text-gray-900">{formatConsumption(consumption)}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">Count</p>
                  <p className="text-lg font-semibold text-blue-600">{equipmentCounts[type] || 0}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Task-Specific Consumption */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Task-Specific Fuel Consumption</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {Object.entries(kpis.performance.taskSpecificConsumption).map(([task, consumption]) => (
            <div key={task} className="text-center p-4 border rounded-lg">
              <p className="text-sm font-medium text-gray-600 capitalize mb-2">{task}</p>
              <p className="text-lg font-bold text-gray-900">{formatConsumption(consumption)}</p>
              <div className="mt-2 bg-blue-100 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${Math.min((consumption / Math.max(...Object.values(kpis.performance.taskSpecificConsumption))) * 100, 100)}%` 
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Operator Efficiency */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Operator Fuel Efficiency</h3>
        <div className="space-y-3">
          {Object.entries(kpis.performance.operatorEfficiency)
            .sort(([,a], [,b]) => a - b) // Sort by efficiency (lower is better)
            .map(([operator, efficiency]) => (
              <div key={operator} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                    {operator.charAt(0).toUpperCase()}
                  </div>
                  <span className="ml-3 font-medium text-gray-900">{operator}</span>
                </div>
                <div className="text-right">
                  <span className="text-lg font-semibold text-gray-900">
                    {formatConsumption(efficiency)}
                  </span>
                  <div className="text-xs text-gray-500">
                    {efficiency <= Math.min(...Object.values(kpis.performance.operatorEfficiency)) * 1.1 ? 
                      'Most Efficient' : 'Needs Improvement'}
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Monthly Trends */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Fuel Trends</h3>
        {kpis.performance.monthlyTrends.length > 0 ? (
          <div className="space-y-4">
            {kpis.performance.monthlyTrends.map((trend, index) => (
              <div key={trend.month} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 text-gray-400 mr-3" />
                  <span className="font-medium text-gray-900">
                    {new Date(trend.month + '-01').toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long' 
                    })}
                  </span>
                </div>
                <div className="flex space-x-6">
                  <div className="text-center">
                    <p className="text-sm text-gray-500">Consumption</p>
                    <p className="text-lg font-semibold text-blue-600">
                      {formatConsumption(trend.consumption)}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-500">Cost</p>
                    <p className="text-lg font-semibold text-green-600">
                      {formatCurrency(trend.cost)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No monthly trend data available yet.</p>
        )}
      </div>
    </div>
  )
}

export default FuelDashboard
