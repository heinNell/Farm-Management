import React, { useState, useMemo } from 'react'
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, BarChart, Bar, ReferenceLine, TooltipProps } from 'recharts'
import { TrendingUp, Target, AlertTriangle } from 'lucide-react'

interface EfficiencyData {
  id: string
  asset_name: string
  asset_type: string
  date: string
  fuel_consumed: number
  distance_traveled: number
  operating_hours: number
  efficiency_rating: number
  fuel_per_km?: number
  fuel_per_hour?: number
}

interface FuelEfficiencyChartProps {
  data: EfficiencyData[]
  title?: string
  height?: number
}

type AnalysisType = 'scatter' | 'trend' | 'comparison' | 'benchmark'
type AssetTypeKey = 'Tractor' | 'Combine' | 'Sprayer' | 'default'
type BenchmarkStatus = 'excellent' | 'good' | 'average' | 'poor'

interface BenchmarkThresholds {
  excellent: number
  good: number
  average: number
  poor: number
}

interface ProcessedEfficiencyData extends EfficiencyData {
  fuel_per_hour: number
  efficiency_score: number
  benchmark_status: BenchmarkStatus
}

interface TrendDataItem {
  date: string
  avgFuelPerHour: number
  avgEfficiencyRating: number
  recordCount: number
}

interface ComparisonDataItem {
  asset_name: string
  asset_type: string
  avgFuelPerHour: number
  avgEfficiencyRating: number
  recordCount: number
  benchmark_status: BenchmarkStatus
}

interface BenchmarkDataItem {
  status: string
  count: number
  percentage: number
}

// Industry benchmarks (liters per hour by asset type)
const BENCHMARKS: Record<AssetTypeKey, BenchmarkThresholds> = {
  'Tractor': { excellent: 12, good: 15, average: 18, poor: 22 },
  'Combine': { excellent: 25, good: 30, average: 35, poor: 42 },
  'Sprayer': { excellent: 8, good: 12, average: 16, poor: 20 },
  'default': { excellent: 15, good: 20, average: 25, poor: 30 }
}

export const FuelEfficiencyChart: React.FC<FuelEfficiencyChartProps> = ({ 
  data, 
  title = "Fuel Efficiency Analysis",
  height = 400 
}) => {
  const [analysisType, setAnalysisType] = useState<AnalysisType>('scatter')
  const [selectedAssetType, setSelectedAssetType] = useState<string>('all')
  const [timeRange, setTimeRange] = useState<number>(30) // days

  // Get benchmark for asset type
  const getBenchmarkForAssetType = (assetType: string): BenchmarkThresholds => {
    if (assetType in BENCHMARKS) {
      return BENCHMARKS[assetType as AssetTypeKey]
    }
    return BENCHMARKS.default
  }

  // Get benchmark status
  const getBenchmarkStatus = (assetType: string, fuelPerHour: number): BenchmarkStatus => {
    const benchmark = getBenchmarkForAssetType(assetType)
    if (fuelPerHour <= benchmark.excellent) return 'excellent'
    if (fuelPerHour <= benchmark.good) return 'good'
    if (fuelPerHour <= benchmark.average) return 'average'
    return 'poor'
  }

  // Process data with efficiency calculations
  const processedData = useMemo((): ProcessedEfficiencyData[] => {
    if (!data || data.length === 0) return []

    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - timeRange)

    return data
      .filter(record => {
        const recordDate = new Date(record.date)
        const typeMatch = selectedAssetType === 'all' || record.asset_type === selectedAssetType
        const dateMatch = recordDate >= cutoffDate
        return typeMatch && dateMatch && record.fuel_consumed > 0
      })
      .map(record => {
        const fuelPerHour = record.operating_hours > 0 ? record.fuel_consumed / record.operating_hours : 0
        return {
          ...record,
          fuel_per_km: record.distance_traveled > 0 ? record.fuel_consumed / record.distance_traveled : undefined,
          fuel_per_hour: fuelPerHour,
          efficiency_score: record.efficiency_rating || 3,
          benchmark_status: getBenchmarkStatus(record.asset_type, fuelPerHour)
        }
      })
      .filter((record): record is ProcessedEfficiencyData => record.fuel_per_hour > 0)
  }, [data, selectedAssetType, timeRange])

  // Get unique asset types
  const assetTypes = useMemo(() => {
    const types = new Set(data.map(record => record.asset_type))
    return Array.from(types)
  }, [data])

  // Trend data (daily averages)
  const trendData = useMemo((): TrendDataItem[] => {
    if (analysisType !== 'trend') return []

    interface DailyAccumulator {
      [key: string]: {
        date: string
        totalFuelPerHour: number
        totalEfficiencyRating: number
        count: number
      }
    }

    const dailyData = processedData.reduce((acc: DailyAccumulator, record) => {
      const date = record.date.split('T')[0]
      if (!acc[date]) {
        acc[date] = {
          date,
          totalFuelPerHour: 0,
          totalEfficiencyRating: 0,
          count: 0
        }
      }
      
      acc[date].totalFuelPerHour += record.fuel_per_hour
      acc[date].totalEfficiencyRating += record.efficiency_score
      acc[date].count += 1

      return acc
    }, {})

    return Object.values(dailyData)
      .map(day => ({
        date: day.date,
        avgFuelPerHour: day.totalFuelPerHour / day.count,
        avgEfficiencyRating: day.totalEfficiencyRating / day.count,
        recordCount: day.count
      }))
      .sort((a, b) => a.date.localeCompare(b.date))
  }, [processedData, analysisType])

  // Comparison data (by asset)
  const comparisonData = useMemo((): ComparisonDataItem[] => {
    if (analysisType !== 'comparison') return []

    interface AssetAccumulator {
      [key: string]: {
        asset_name: string
        asset_type: string
        totalFuelPerHour: number
        totalEfficiencyRating: number
        count: number
      }
    }

    const assetData = processedData.reduce((acc: AssetAccumulator, record) => {
      const key = record.asset_name
      if (!acc[key]) {
        acc[key] = {
          asset_name: key,
          asset_type: record.asset_type,
          totalFuelPerHour: 0,
          totalEfficiencyRating: 0,
          count: 0
        }
      }
      
      acc[key].totalFuelPerHour += record.fuel_per_hour
      acc[key].totalEfficiencyRating += record.efficiency_score
      acc[key].count += 1

      return acc
    }, {})

    return Object.values(assetData)
      .map(asset => ({
        asset_name: asset.asset_name,
        asset_type: asset.asset_type,
        avgFuelPerHour: asset.totalFuelPerHour / asset.count,
        avgEfficiencyRating: asset.totalEfficiencyRating / asset.count,
        recordCount: asset.count,
        benchmark_status: getBenchmarkStatus(asset.asset_type, asset.totalFuelPerHour / asset.count)
      }))
      .sort((a, b) => a.avgFuelPerHour - b.avgFuelPerHour)
  }, [processedData, analysisType])

  // Benchmark data
  const benchmarkData = useMemo((): BenchmarkDataItem[] => {
    if (analysisType !== 'benchmark') return []

    const statusCounts = processedData.reduce((acc: Record<BenchmarkStatus, number>, record) => {
      acc[record.benchmark_status] = (acc[record.benchmark_status] || 0) + 1
      return acc
    }, {} as Record<BenchmarkStatus, number>)

    return Object.entries(statusCounts).map(([status, count]) => ({
      status: status.charAt(0).toUpperCase() + status.slice(1),
      count,
      percentage: (count / processedData.length) * 100
    }))
  }, [processedData, analysisType])

  const getStatusColor = (status: string): string => {
    switch (status.toLowerCase()) {
      case 'excellent': return '#10B981'
      case 'good': return '#3B82F6'
      case 'average': return '#F59E0B'
      case 'poor': return '#EF4444'
      default: return '#6B7280'
    }
  }

  interface CustomTooltipPayload {
    payload: ProcessedEfficiencyData
  }

  const CustomTooltip: React.FC<TooltipProps<number, string>> = ({ active, payload }) => {
    if (!active || !payload || payload.length === 0) return null

    const data = (payload[0] as CustomTooltipPayload).payload
    
    return (
      <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
        <p className="font-semibold text-gray-900">{data.asset_name}</p>
        <p className="text-sm text-gray-600">{data.asset_type}</p>
        {data.fuel_per_hour && (
          <p className="text-blue-600">
            Fuel Rate: <span className="font-bold">{data.fuel_per_hour.toFixed(2)}L/h</span>
          </p>
        )}
        {data.operating_hours && (
          <p className="text-green-600">
            Hours: <span className="font-bold">{data.operating_hours.toFixed(1)}h</span>
          </p>
        )}
        {data.efficiency_score && (
          <p className="text-orange-600">
            Rating: <span className="font-bold">{data.efficiency_score.toFixed(1)}/5</span>
          </p>
        )}
        {data.benchmark_status && (
          <p className="font-medium" style={{ color: getStatusColor(data.benchmark_status) }}>
            Performance: {data.benchmark_status.charAt(0).toUpperCase() + data.benchmark_status.slice(1)}
          </p>
        )}
        {data.date && (
          <p className="text-xs text-gray-500 mt-2">
            {new Date(data.date).toLocaleDateString()}
          </p>
        )}
      </div>
    )
  }

  const renderChart = (): React.ReactElement | null => {
    switch (analysisType) {
      case 'scatter':
        return (
          <ScatterChart data={processedData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="operating_hours" 
              name="Operating Hours"
              label={{ value: 'Operating Hours', position: 'insideBottom', offset: -5 }}
            />
            <YAxis 
              dataKey="fuel_per_hour" 
              name="Fuel per Hour (L/h)"
              label={{ value: 'Fuel per Hour (L/h)', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Scatter 
              data={processedData.filter(d => d.benchmark_status === 'excellent')}
              fill="#10B981" 
              name="Excellent"
            />
            <Scatter 
              data={processedData.filter(d => d.benchmark_status === 'good')}
              fill="#3B82F6" 
              name="Good"
            />
            <Scatter 
              data={processedData.filter(d => d.benchmark_status === 'average')}
              fill="#F59E0B" 
              name="Average"
            />
            <Scatter 
              data={processedData.filter(d => d.benchmark_status === 'poor')}
              fill="#EF4444" 
              name="Poor"
            />
            {selectedAssetType !== 'all' && (
              <ReferenceLine 
                y={getBenchmarkForAssetType(selectedAssetType).good} 
                stroke="#3B82F6" 
                strokeDasharray="5 5"
                label="Good Benchmark"
              />
            )}
          </ScatterChart>
        )

      case 'trend':
        return (
          <LineChart data={trendData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="date" 
              tickFormatter={(date: string) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            />
            <YAxis />
            <Tooltip 
              labelFormatter={(date: string) => new Date(date).toLocaleDateString()}
              formatter={(value: unknown, name: string) => {
                if (typeof value !== 'number') return [String(value), name]
                return name === 'avgFuelPerHour' ? [`${value.toFixed(2)}L/h`, 'Avg Fuel Rate'] : [value.toFixed(2), 'Avg Efficiency Rating']
              }}
            />
            <Line 
              type="monotone" 
              dataKey="avgFuelPerHour" 
              stroke="#0088FE" 
              strokeWidth={3}
              dot={{ fill: '#0088FE', strokeWidth: 2, r: 4 }}
              name="Avg Fuel Rate (L/h)"
            />
            <Line 
              type="monotone" 
              dataKey="avgEfficiencyRating" 
              stroke="#00C49F" 
              strokeWidth={2}
              dot={{ fill: '#00C49F', strokeWidth: 2, r: 3 }}
              name="Avg Efficiency Rating"
              yAxisId="right"
            />
          </LineChart>
        )

      case 'comparison':
        return (
          <BarChart data={comparisonData} layout="horizontal">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis 
              dataKey="asset_name" 
              type="category" 
              width={120}
              tickFormatter={(name: string) => name.length > 15 ? `${name.slice(0, 12)}...` : name}
            />
            <Tooltip 
              formatter={(value: unknown) => {
                if (typeof value !== 'number') return [String(value), 'Avg Fuel Rate']
                return [`${value.toFixed(2)}L/h`, 'Avg Fuel Rate']
              }}
              labelFormatter={(name: string) => `Asset: ${name}`}
            />
            <Bar 
              dataKey="avgFuelPerHour" 
              fill="#8884d8"
              name="Avg Fuel Rate (L/h)"
            />
          </BarChart>
        )

      case 'benchmark':
        return (
          <BarChart data={benchmarkData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="status" />
            <YAxis />
            <Tooltip 
              formatter={(value: unknown, name: string) => {
                if (typeof value !== 'number') return [String(value), name]
                return name === 'count' ? [value, 'Records'] : [`${value.toFixed(1)}%`, 'Percentage']
              }}
            />
            <Bar dataKey="count" fill="#8884d8" name="Records" />
            <Bar dataKey="percentage" fill="#82ca9d" name="Percentage" />
          </BarChart>
        )

      default:
        return null
    }
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 lg:mb-0">{title}</h3>
        
        <div className="flex flex-wrap gap-3">
          {/* Analysis Type */}
          <select
            value={analysisType}
            onChange={(e) => setAnalysisType(e.target.value as AnalysisType)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="scatter">Scatter Plot</option>
            <option value="trend">Trend Analysis</option>
            <option value="comparison">Asset Comparison</option>
            <option value="benchmark">Benchmark Status</option>
          </select>

          {/* Asset Type Filter */}
          <select
            value={selectedAssetType}
            onChange={(e) => setSelectedAssetType(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Types</option>
            {assetTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>

          {/* Time Range */}
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(parseInt(e.target.value))}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
            <option value={365}>Last year</option>
          </select>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={height}>
        {renderChart()}
      </ResponsiveContainer>

      {/* Performance Summary */}
      <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
        {benchmarkData.map(({ status, count, percentage }) => (
          <div key={status} className="text-center">
            <div className="flex items-center justify-center mb-2">
              <div 
                className="w-4 h-4 rounded-full mr-2"
                style={{ backgroundColor: getStatusColor(status) }}
              />
              <span className="text-sm font-medium text-gray-700">{status}</span>
            </div>
            <p className="text-xl font-bold" style={{ color: getStatusColor(status) }}>
              {count}
            </p>
            <p className="text-xs text-gray-500">{percentage.toFixed(1)}%</p>
          </div>
        ))}
      </div>

      {/* Benchmark Legend */}
      {selectedAssetType !== 'all' && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">
            {selectedAssetType} Benchmarks (L/h)
          </h4>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 text-sm">
            {Object.entries(getBenchmarkForAssetType(selectedAssetType)).map(([level, value]) => (
              <div key={level} className="flex items-center">
                <div 
                  className="w-3 h-3 rounded-full mr-2"
                  style={{ backgroundColor: getStatusColor(level) }}
                />
                <span className="capitalize">{level}: ≤{value}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default FuelEfficiencyChart