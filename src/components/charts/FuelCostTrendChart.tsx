
import React, { useState, useMemo } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, ComposedChart, Bar } from 'recharts'
import {TrendingUp, TrendingDown, DollarSign, AlertCircle} from 'lucide-react'

interface FuelPrice {
  id: string
  fuel_type: string
  price_per_liter: number
  effective_date: string
  location?: string
  supplier?: string
}

interface FuelRecord {
  id: string
  date: string
  quantity: number
  cost: number
  price_per_liter: number
  fuel_type?: string
}

interface FuelCostTrendChartProps {
  priceData: FuelPrice[]
  consumptionData: FuelRecord[]
  title?: string
  height?: number
}

type ViewType = 'price_trend' | 'cost_analysis' | 'supplier_comparison' | 'forecast'

export const FuelCostTrendChart: React.FC<FuelCostTrendChartProps> = ({ 
  priceData, 
  consumptionData,
  title = "Fuel Cost Trend Analysis",
  height = 400 
}) => {
  const [viewType, setViewType] = useState<ViewType>('price_trend')
  const [selectedFuelType, setSelectedFuelType] = useState<string>('all')
  const [timeRange, setTimeRange] = useState<number>(90) // days

  // Process price trend data
  const priceTrendData = useMemo(() => {
    if (!priceData || priceData.length === 0) return []

    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - timeRange)

    const filteredData = priceData
      .filter(record => {
        const recordDate = new Date(record.effective_date)
        const typeMatch = selectedFuelType === 'all' || record.fuel_type === selectedFuelType
        const dateMatch = recordDate >= cutoffDate
        return typeMatch && dateMatch
      })
      .sort((a, b) => new Date(a.effective_date).getTime() - new Date(b.effective_date).getTime())

    // Group by date and fuel type
    const grouped = filteredData.reduce((acc, record) => {
      const key = `${record.effective_date}-${record.fuel_type}`
      if (!acc[key]) {
        acc[key] = {
          date: record.effective_date,
          fuel_type: record.fuel_type,
          price: record.price_per_liter,
          location: record.location,
          supplier: record.supplier
        }
      }
      return acc
    }, {} as Record<string, any>)

    return Object.values(grouped)
  }, [priceData, selectedFuelType, timeRange])

  // Process cost analysis data (combining price and consumption)
  const costAnalysisData = useMemo(() => {
    if (viewType !== 'cost_analysis' || !consumptionData || !priceData) return []

    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - timeRange)

    // Group consumption by month
    const monthlyData = consumptionData
      .filter(record => {
        const recordDate = new Date(record.date)
        return recordDate >= cutoffDate
      })
      .reduce((acc, record) => {
        const month = record.date.substring(0, 7) // YYYY-MM
        if (!acc[month]) {
          acc[month] = {
            month,
            totalQuantity: 0,
            totalCost: 0,
            avgPrice: 0,
            records: []
          }
        }
        
        acc[month].totalQuantity += record.quantity
        acc[month].totalCost += record.cost
        acc[month].records.push(record)
        
        return acc
      }, {} as Record<string, any>)

    return Object.values(monthlyData)
      .map((item: any) => ({
        ...item,
        avgPrice: item.totalCost / item.totalQuantity,
        costPerRecord: item.totalCost / item.records.length
      }))
      .sort((a, b) => a.month.localeCompare(b.month))
  }, [consumptionData, priceData, viewType, timeRange])

  // Process supplier comparison data
  const supplierComparisonData = useMemo(() => {
    if (viewType !== 'supplier_comparison') return []

    const supplierData = priceData.reduce((acc, record) => {
      const supplier = record.supplier || 'Unknown'
      if (!acc[supplier]) {
        acc[supplier] = {
          supplier,
          prices: [],
          avgPrice: 0,
          minPrice: Infinity,
          maxPrice: -Infinity,
          recordCount: 0
        }
      }
      
      acc[supplier].prices.push(record.price_per_liter)
      acc[supplier].minPrice = Math.min(acc[supplier].minPrice, record.price_per_liter)
      acc[supplier].maxPrice = Math.max(acc[supplier].maxPrice, record.price_per_liter)
      acc[supplier].recordCount += 1
      
      return acc
    }, {} as Record<string, any>)

    return Object.values(supplierData)
      .map((item: any) => ({
        ...item,
        avgPrice: item.prices.reduce((sum: number, price: number) => sum + price, 0) / item.prices.length,
        priceRange: item.maxPrice - item.minPrice
      }))
      .sort((a, b) => a.avgPrice - b.avgPrice)
  }, [priceData, viewType])

  // Generate forecast data (simple linear regression)
  const forecastData = useMemo(() => {
    if (viewType !== 'forecast' || priceTrendData.length < 3) return []

    const recentData = priceTrendData.slice(-30) // Last 30 data points
    if (recentData.length < 2) return []

    // Simple linear regression for price prediction
    const n = recentData.length
    const xValues = recentData.map((_, index) => index)
    const yValues = recentData.map(d => d.price)
    
    const sumX = xValues.reduce((sum, x) => sum + x, 0)
    const sumY = yValues.reduce((sum, y) => sum + y, 0)
    const sumXY = xValues.reduce((sum, x, i) => sum + x * yValues[i], 0)
    const sumXX = xValues.reduce((sum, x) => sum + x * x, 0)
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX)
    const intercept = (sumY - slope * sumX) / n
    
    // Generate forecast for next 30 days
    const forecastPoints = []
    const lastDate = new Date(recentData[recentData.length - 1].date)
    
    for (let i = 1; i <= 30; i++) {
      const futureDate = new Date(lastDate)
      futureDate.setDate(futureDate.getDate() + i)
      
      const predictedPrice = slope * (n + i - 1) + intercept
      forecastPoints.push({
        date: futureDate.toISOString().split('T')[0],
        price: Math.max(predictedPrice, 0), // Ensure non-negative price
        isForecast: true,
        confidence: Math.max(0.9 - (i * 0.02), 0.3) // Decreasing confidence
      })
    }
    
    // Combine historical and forecast data
    return [
      ...recentData.map(d => ({ ...d, isForecast: false, confidence: 1 })),
      ...forecastPoints
    ]
  }, [priceTrendData, viewType])

  // Get unique fuel types
  const fuelTypes = useMemo(() => {
    const types = new Set(priceData.map(record => record.fuel_type))
    return Array.from(types)
  }, [priceData])

  // Calculate trend indicators
  const trendIndicators = useMemo(() => {
    if (priceTrendData.length < 2) return { trend: 'stable', change: 0, changePercent: 0 }

    const recent = priceTrendData.slice(-7) // Last 7 data points
    if (recent.length < 2) return { trend: 'stable', change: 0, changePercent: 0 }

    const firstPrice = recent[0].price
    const lastPrice = recent[recent.length - 1].price
    const change = lastPrice - firstPrice
    const changePercent = (change / firstPrice) * 100

    let trend = 'stable'
    if (Math.abs(changePercent) > 5) {
      trend = changePercent > 0 ? 'rising' : 'falling'
    }

    return { trend, change, changePercent }
  }, [priceTrendData])

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || payload.length === 0) return null

    const data = payload[0].payload
    
    return (
      <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
        <p className="font-semibold text-gray-900">
          {new Date(label).toLocaleDateString()}
        </p>
        {payload.map((entry: any, index: number) => (
          <div key={index}>
            <p style={{ color: entry.color }}>
              {entry.name}: <span className="font-bold">
                {entry.name.includes('Price') || entry.name.includes('Cost') 
                  ? `¥${entry.value.toFixed(2)}`
                  : entry.value.toFixed(2)
                }
              </span>
            </p>
          </div>
        ))}
        {data.supplier && (
          <p className="text-sm text-gray-600">Supplier: {data.supplier}</p>
        )}
        {data.isForecast && (
          <p className="text-sm text-orange-600">
            Forecast (Confidence: {(data.confidence * 100).toFixed(0)}%)
          </p>
        )}
      </div>
    )
  }

  const renderChart = () => {
    switch (viewType) {
      case 'price_trend':
        return (
          <LineChart data={priceTrendData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="date" 
              tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            />
            <YAxis 
              label={{ value: 'Price (¥/L)', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line 
              type="monotone" 
              dataKey="price" 
              stroke="#0088FE" 
              strokeWidth={3}
              dot={{ fill: '#0088FE', strokeWidth: 2, r: 4 }}
              name="Price per Liter"
            />
          </LineChart>
        )

      case 'cost_analysis':
        return (
          <ComposedChart data={costAnalysisData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="month" 
              tickFormatter={(month) => {
                const [year, monthNum] = month.split('-')
                return new Date(parseInt(year), parseInt(monthNum) - 1).toLocaleDateString('en-US', { 
                  year: '2-digit', 
                  month: 'short' 
                })
              }}
            />
            <YAxis yAxisId="left" label={{ value: 'Quantity (L)', angle: -90, position: 'insideLeft' }} />
            <YAxis yAxisId="right" orientation="right" label={{ value: 'Cost (¥)', angle: 90, position: 'insideRight' }} />
            <Tooltip 
              labelFormatter={(month) => {
                const [year, monthNum] = month.split('-')
                return new Date(parseInt(year), parseInt(monthNum) - 1).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long' 
                })
              }}
              formatter={(value: number, name: string) => [
                name.includes('Cost') ? `¥${value.toFixed(2)}` : `${value.toFixed(1)}L`,
                name
              ]}
            />
            <Bar yAxisId="left" dataKey="totalQuantity" fill="#82ca9d" name="Total Quantity" />
            <Line yAxisId="right" type="monotone" dataKey="totalCost" stroke="#ff7300" strokeWidth={3} name="Total Cost" />
            <Line yAxisId="right" type="monotone" dataKey="avgPrice" stroke="#8884d8" strokeWidth={2} name="Avg Price/L" />
          </ComposedChart>
        )

      case 'supplier_comparison':
        return (
          <LineChart data={supplierComparisonData} layout="horizontal">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" label={{ value: 'Price (¥/L)', position: 'insideBottom', offset: -5 }} />
            <YAxis 
              dataKey="supplier" 
              type="category" 
              width={100}
              tickFormatter={(name) => name.length > 12 ? `${name.slice(0, 10)}...` : name}
            />
            <Tooltip 
              formatter={(value: number, name: string) => [`¥${value.toFixed(2)}`, name]}
              labelFormatter={(supplier) => `Supplier: ${supplier}`}
            />
            <Line dataKey="avgPrice" stroke="#8884d8" strokeWidth={3} name="Avg Price" />
            <Line dataKey="minPrice" stroke="#82ca9d" strokeWidth={2} name="Min Price" />
            <Line dataKey="maxPrice" stroke="#ff7300" strokeWidth={2} name="Max Price" />
          </LineChart>
        )

      case 'forecast':
        return (
          <AreaChart data={forecastData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="date" 
              tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            />
            <YAxis label={{ value: 'Price (¥/L)', angle: -90, position: 'insideLeft' }} />
            <Tooltip content={<CustomTooltip />} />
            <Area 
              type="monotone" 
              dataKey="price" 
              stroke="#0088FE" 
              fill="#0088FE" 
              fillOpacity={0.6}
              name="Price per Liter"
            />
            <Line 
              type="monotone" 
              dataKey="price" 
              stroke="#FF8042" 
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
              connectNulls={false}
              name="Forecast"
            />
          </AreaChart>
        )

      default:
        return null
    }
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6">
        <div className="flex items-center mb-4 lg:mb-0">
          <h3 className="text-lg font-semibold text-gray-900 mr-4">{title}</h3>
          
          {/* Trend Indicator */}
          <div className={`flex items-center px-3 py-1 rounded-full text-sm font-medium ${
            trendIndicators.trend === 'rising' 
              ? 'bg-red-100 text-red-700' 
              : trendIndicators.trend === 'falling'
              ? 'bg-green-100 text-green-700'
              : 'bg-gray-100 text-gray-700'
          }`}>
            {trendIndicators.trend === 'rising' ? (
              <TrendingUp className="h-4 w-4 mr-1" />
            ) : trendIndicators.trend === 'falling' ? (
              <TrendingDown className="h-4 w-4 mr-1" />
            ) : (
              <DollarSign className="h-4 w-4 mr-1" />
            )}
            {Math.abs(trendIndicators.changePercent).toFixed(1)}%
          </div>
        </div>
        
        <div className="flex flex-wrap gap-3">
          {/* View Type */}
          <select
            value={viewType}
            onChange={(e) => setViewType(e.target.value as ViewType)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="price_trend">Price Trend</option>
            <option value="cost_analysis">Cost Analysis</option>
            <option value="supplier_comparison">Supplier Comparison</option>
            <option value="forecast">Price Forecast</option>
          </select>

          {/* Fuel Type Filter */}
          {fuelTypes.length > 1 && (
            <select
              value={selectedFuelType}
              onChange={(e) => setSelectedFuelType(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Fuel Types</option>
              {fuelTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          )}

          {/* Time Range */}
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(parseInt(e.target.value))}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
            <option value={180}>Last 6 months</option>
            <option value={365}>Last year</option>
          </select>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={height}>
        {renderChart()}
      </ResponsiveContainer>

      {/* Cost Insights */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium text-blue-900">Current Avg Price</h4>
            <DollarSign className="h-5 w-5 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-blue-600">
            ¥{priceTrendData.length > 0 
              ? (priceTrendData.reduce((sum, item) => sum + item.price, 0) / priceTrendData.length).toFixed(2)
              : '0.00'
            }
          </p>
          <p className="text-sm text-blue-700">per liter</p>
        </div>

        <div className={`p-4 rounded-lg ${
          trendIndicators.trend === 'rising' 
            ? 'bg-red-50' 
            : trendIndicators.trend === 'falling'
            ? 'bg-green-50'
            : 'bg-gray-50'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <h4 className={`font-medium ${
              trendIndicators.trend === 'rising' 
                ? 'text-red-900' 
                : trendIndicators.trend === 'falling'
                ? 'text-green-900'
                : 'text-gray-900'
            }`}>
              Price Trend
            </h4>
            {trendIndicators.trend === 'rising' ? (
              <TrendingUp className="h-5 w-5 text-red-600" />
            ) : trendIndicators.trend === 'falling' ? (
              <TrendingDown className="h-5 w-5 text-green-600" />
            ) : (
              <AlertCircle className="h-5 w-5 text-gray-600" />
            )}
          </div>
          <p className={`text-2xl font-bold ${
            trendIndicators.trend === 'rising' 
              ? 'text-red-600' 
              : trendIndicators.trend === 'falling'
              ? 'text-green-600'
              : 'text-gray-600'
          }`}>
            {trendIndicators.changePercent > 0 ? '+' : ''}{trendIndicators.changePercent.toFixed(1)}%
          </p>
          <p className={`text-sm ${
            trendIndicators.trend === 'rising' 
              ? 'text-red-700' 
              : trendIndicators.trend === 'falling'
              ? 'text-green-700'
              : 'text-gray-700'
          }`}>
            last 7 records
          </p>
        </div>

        <div className="bg-orange-50 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium text-orange-900">Cost Impact</h4>
            <AlertCircle className="h-5 w-5 text-orange-600" />
          </div>
          <p className="text-2xl font-bold text-orange-600">
            ¥{Math.abs(trendIndicators.change * 100).toFixed(0)}
          </p>
          <p className="text-sm text-orange-700">
            per 100L {trendIndicators.trend === 'rising' ? 'increase' : 'savings'}
          </p>
        </div>
      </div>

      {/* Forecast Warning */}
      {viewType === 'forecast' && (
        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-yellow-600 mr-2" />
            <p className="text-sm text-yellow-800">
              <strong>Forecast Disclaimer:</strong> Price predictions are based on historical trends and should be used for planning purposes only. 
              Actual prices may vary due to market conditions, supply chain factors, and external events.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default FuelCostTrendChart
