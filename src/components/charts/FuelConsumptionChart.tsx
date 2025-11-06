
import React, { useState, useMemo } from 'react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell } from 'recharts'
import { BarChart3, TrendingUp, PieChart as PieChartIcon } from 'lucide-react'

interface FuelRecord {
  id: string
  date: string
  quantity: number
  cost: number
  asset_id: string
  asset_name?: string
  fuel_type?: string
}

interface FuelConsumptionChartProps {
  data: FuelRecord[]
  title?: string
  height?: number
}

type ChartType = 'area' | 'bar' | 'line' | 'pie'
type TimeGrouping = 'day' | 'week' | 'month' | 'quarter'

interface ProcessedDataItem {
  period: string
  totalQuantity: number
  totalCost: number
  averagePrice: number
  recordCount: number
  assetCount: number
  assets: string[]
}

interface PieDataItem {
  name: string
  value: number
}

interface TooltipProps {
  active?: boolean
  payload?: Array<{ payload: ProcessedDataItem }>
  label?: string
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D']

export const FuelConsumptionChart: React.FC<FuelConsumptionChartProps> = ({ 
  data, 
  title = "Fuel Consumption Analysis",
  height = 400 
}) => {
  const [chartType, setChartType] = useState<ChartType>('area')
  const [timeGrouping, setTimeGrouping] = useState<TimeGrouping>('week')
  const [selectedAssets, setSelectedAssets] = useState<string[]>([])

  // Process and group data based on time period
  const processedData = useMemo((): ProcessedDataItem[] => {
    if (!data || data.length === 0) return []

    // Filter by selected assets if any
    const filteredData = selectedAssets.length > 0 
      ? data.filter(record => selectedAssets.includes(record.asset_id))
      : data

    // Group by time period
    interface GroupedItem {
      period: string
      totalQuantity: number
      totalCost: number
      averagePrice: number
      recordCount: number
      assets: Set<string>
    }

    const grouped = filteredData.reduce((acc, record) => {
      const date = new Date(record.date)
      let key: string

      let weekStart: Date
      let quarter: number
      
      switch (timeGrouping) {
        case 'day':
          key = date.toISOString().split('T')[0]
          break
        case 'week':
          weekStart = new Date(date)
          weekStart.setDate(date.getDate() - date.getDay())
          key = weekStart.toISOString().split('T')[0]
          break
        case 'month':
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
          break
        case 'quarter':
          quarter = Math.floor(date.getMonth() / 3) + 1
          key = `${date.getFullYear()}-Q${quarter}`
          break
        default:
          key = date.toISOString().split('T')[0]
      }

      if (!acc[key]) {
        acc[key] = {
          period: key,
          totalQuantity: 0,
          totalCost: 0,
          averagePrice: 0,
          recordCount: 0,
          assets: new Set<string>()
        }
      }

      acc[key].totalQuantity += record.quantity
      acc[key].totalCost += record.cost
      acc[key].recordCount += 1
      if (record.asset_name) {
        acc[key].assets.add(record.asset_name)
      }

      return acc
    }, {} as Record<string, GroupedItem>)

    // Convert to array and calculate averages
    return Object.values(grouped).map((item) => ({
      period: item.period,
      totalQuantity: item.totalQuantity,
      totalCost: item.totalCost,
      averagePrice: item.totalCost / item.totalQuantity,
      recordCount: item.recordCount,
      assetCount: item.assets.size,
      assets: Array.from(item.assets)
    })).sort((a, b) => a.period.localeCompare(b.period))
  }, [data, timeGrouping, selectedAssets])

  // Get unique assets for filtering
  const uniqueAssets = useMemo(() => {
    const assets = new Map<string, string>()
    data.forEach(record => {
      if (record.asset_name) {
        assets.set(record.asset_id, record.asset_name)
      }
    })
    return Array.from(assets.entries()).map(([id, name]) => ({ id, name }))
  }, [data])

  // Prepare pie chart data (by asset)
  const pieData = useMemo(() => {
    if (chartType !== 'pie') return []
    
    const assetTotals = data.reduce((acc, record) => {
      const assetName = record.asset_name || `Asset ${record.asset_id.slice(-4)}`
      acc[assetName] = (acc[assetName] || 0) + record.quantity
      return acc
    }, {} as Record<string, number>)

    return Object.entries(assetTotals)
      .map(([name, quantity]) => ({ name, value: quantity }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8) // Top 8 assets
  }, [data, chartType])

  const formatPeriod = (period: string) => {
    if (timeGrouping === 'quarter') {
      return period
    }
    if (timeGrouping === 'month') {
      const [year, month] = period.split('-')
      return new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short' 
      })
    }
    return new Date(period).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    })
  }

  const CustomTooltip: React.FC<TooltipProps> = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900">{formatPeriod(label || '')}</p>
          <p className="text-blue-600">
            Total Fuel: <span className="font-bold">{data.totalQuantity.toFixed(1)}L</span>
          </p>
          <p className="text-green-600">
            Total Cost: <span className="font-bold">¥{data.totalCost.toFixed(2)}</span>
          </p>
          <p className="text-orange-600">
            Avg Price: <span className="font-bold">¥{data.averagePrice.toFixed(2)}/L</span>
          </p>
          <p className="text-gray-600">
            Records: {data.recordCount} | Assets: {data.assetCount}
          </p>
          {data.assets && data.assets.length > 0 && (
            <div className="mt-2 pt-2 border-t border-gray-100">
              <p className="text-xs text-gray-500">Assets:</p>
              <p className="text-xs text-gray-700">{data.assets.slice(0, 3).join(', ')}</p>
              {data.assets.length > 3 && (
                <p className="text-xs text-gray-500">+{data.assets.length - 3} more...</p>
              )}
            </div>
          )}
        </div>
      )
    }
    return null
  }

  const renderChart = (): React.ReactElement => {
    switch (chartType) {
      case 'area':
        return (
          <AreaChart data={processedData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="period" tickFormatter={formatPeriod} />
            <YAxis />
            <Tooltip content={<CustomTooltip />} />
            <Area 
              type="monotone" 
              dataKey="totalQuantity" 
              stroke="#0088FE" 
              fill="#0088FE" 
              fillOpacity={0.6}
              name="Fuel Consumed (L)"
            />
          </AreaChart>
        )

      case 'bar':
        return (
          <BarChart data={processedData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="period" tickFormatter={formatPeriod} />
            <YAxis />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="totalQuantity" fill="#00C49F" name="Fuel Consumed (L)" />
          </BarChart>
        )

      case 'line':
        return (
          <LineChart data={processedData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="period" tickFormatter={formatPeriod} />
            <YAxis />
            <Tooltip content={<CustomTooltip />} />
            <Line 
              type="monotone" 
              dataKey="totalQuantity" 
              stroke="#FFBB28" 
              strokeWidth={3}
              dot={{ fill: '#FFBB28', strokeWidth: 2, r: 4 }}
              name="Fuel Consumed (L)"
            />
          </LineChart>
        )

      case 'pie':
        return (
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={120}
              fill="#8884d8"
              dataKey="value"
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value: number, name: string) => [
                `${value.toFixed(1)}L`, 
                name
              ]}
            />
          </PieChart>
        )

      default:
        return (
          <AreaChart data={processedData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="period" tickFormatter={formatPeriod} />
            <YAxis />
            <Tooltip content={<CustomTooltip />} />
            <Area 
              type="monotone" 
              dataKey="totalQuantity" 
              stroke="#0088FE" 
              fill="#0088FE" 
              fillOpacity={0.6}
              name="Fuel Consumed (L)"
            />
          </AreaChart>
        )
    }
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 lg:mb-0">{title}</h3>
        
        <div className="flex flex-wrap gap-3">
          {/* Chart Type Selector */}
          <div className="flex rounded-lg border border-gray-300 overflow-hidden">
            <button
              onClick={() => setChartType('area')}
              className={`px-3 py-2 text-sm font-medium ${
                chartType === 'area' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <TrendingUp className="h-4 w-4" />
            </button>
            <button
              onClick={() => setChartType('bar')}
              className={`px-3 py-2 text-sm font-medium ${
                chartType === 'bar' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <BarChart3 className="h-4 w-4" />
            </button>
            <button
              onClick={() => setChartType('line')}
              className={`px-3 py-2 text-sm font-medium ${
                chartType === 'line' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              📈
            </button>
            <button
              onClick={() => setChartType('pie')}
              className={`px-3 py-2 text-sm font-medium ${
                chartType === 'pie' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <PieChartIcon className="h-4 w-4" />
            </button>
          </div>

          {/* Time Grouping Selector */}
          {chartType !== 'pie' && (
            <select
              value={timeGrouping}
              onChange={(e) => setTimeGrouping(e.target.value as TimeGrouping)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="day">Daily</option>
              <option value="week">Weekly</option>
              <option value="month">Monthly</option>
              <option value="quarter">Quarterly</option>
            </select>
          )}

          {/* Asset Filter */}
          {uniqueAssets.length > 0 && (
            <select
              multiple
              value={selectedAssets}
              onChange={(e) => {
                const values = Array.from(e.target.selectedOptions, option => option.value)
                setSelectedAssets(values)
              }}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-[150px]"
            >
              <option value="">All Assets</option>
              {uniqueAssets.map(asset => (
                <option key={asset.id} value={asset.id}>
                  {asset.name}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={height}>
        {renderChart()}
      </ResponsiveContainer>

      {/* Summary Stats */}
      <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
        <div className="text-center">
          <p className="text-2xl font-bold text-blue-600">
            {processedData.reduce((sum, item) => sum + item.totalQuantity, 0).toFixed(1)}L
          </p>
          <p className="text-sm text-gray-600">Total Fuel</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-green-600">
            ¥{processedData.reduce((sum, item) => sum + item.totalCost, 0).toFixed(2)}
          </p>
          <p className="text-sm text-gray-600">Total Cost</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-orange-600">
            ¥{processedData.length > 0 
              ? (processedData.reduce((sum, item) => sum + item.averagePrice, 0) / processedData.length).toFixed(2)
              : '0.00'
            }
          </p>
          <p className="text-sm text-gray-600">Avg Price/L</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-purple-600">
            {processedData.reduce((sum, item) => sum + item.recordCount, 0)}
          </p>
          <p className="text-sm text-gray-600">Records</p>
        </div>
      </div>
    </div>
  )
}

export default FuelConsumptionChart
