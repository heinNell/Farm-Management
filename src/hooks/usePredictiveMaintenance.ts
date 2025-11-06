
import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

interface PredictiveMaintenanceData {
  id: string
  asset_id: string
  asset_name?: string
  asset_type?: string
  component_name: string
  failure_probability: number
  predicted_failure_date: string
  confidence_level: number
  recommended_action: string
  maintenance_priority: number
  last_calculated: string
  created_at: string
  updated_at: string
}

interface MaintenanceKPI {
  totalAlerts: number
  criticalAlerts: number
  averageRisk: number
  upcomingMaintenance: number
  riskTrend: 'increasing' | 'decreasing' | 'stable'
}

interface UsePredictiveMaintenanceReturn {
  predictions: PredictiveMaintenanceData[]
  kpis: MaintenanceKPI
  loading: boolean
  error: string | null
  refreshPredictions: () => Promise<void>
  updatePredictiveModel: () => Promise<void>
  getAssetRiskLevel: (assetId: string) => 'low' | 'medium' | 'high' | 'critical'
  getMaintenanceRecommendations: (assetId: string) => PredictiveMaintenanceData[]
}

export const usePredictiveMaintenance = (): UsePredictiveMaintenanceReturn => {
  const [predictions, setPredictions] = useState<PredictiveMaintenanceData[]>([])
  const [kpis, setKpis] = useState<MaintenanceKPI>({
    totalAlerts: 0,
    criticalAlerts: 0,
    averageRisk: 0,
    upcomingMaintenance: 0,
    riskTrend: 'stable'
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch predictive maintenance data
  const fetchPredictions = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch predictive maintenance data with asset information
      const { data: predictiveData, error: predictiveError } = await supabase
        .from('predictive_maintenance')
        .select(`
          *,
          assets!inner(
            id,
            name,
            type
          )
        `)
        .order('failure_probability', { ascending: false })

      if (predictiveError) throw predictiveError

      // Transform data to include asset information
      const transformedData = predictiveData?.map(item => ({
        ...item,
        asset_name: item.assets?.name,
        asset_type: item.assets?.type
      })) || []

      setPredictions(transformedData)
      
      // Calculate KPIs
      calculateKPIs(transformedData)

    } catch (err: any) {
      console.error('Error fetching predictive maintenance data:', err)
      setError(err.message || 'Failed to fetch predictive maintenance data')
      toast.error('Failed to load predictive maintenance data')
    } finally {
      setLoading(false)
    }
  }, [])

  // Calculate maintenance KPIs
  const calculateKPIs = useCallback((data: PredictiveMaintenanceData[]) => {
    if (!data || data.length === 0) {
      setKpis({
        totalAlerts: 0,
        criticalAlerts: 0,
        averageRisk: 0,
        upcomingMaintenance: 0,
        riskTrend: 'stable'
      })
      return
    }

    const totalAlerts = data.length
    const criticalAlerts = data.filter(item => item.failure_probability >= 0.7).length
    const averageRisk = data.reduce((sum, item) => sum + item.failure_probability, 0) / data.length

    // Count upcoming maintenance (within next 30 days)
    const thirtyDaysFromNow = new Date()
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)
    
    const upcomingMaintenance = data.filter(item => {
      const predictedDate = new Date(item.predicted_failure_date)
      return predictedDate <= thirtyDaysFromNow
    }).length

    // Calculate risk trend (simplified - compare recent vs older predictions)
    const recentPredictions = data.filter(item => {
      const lastCalculated = new Date(item.last_calculated)
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
      return lastCalculated >= sevenDaysAgo
    })

    const olderPredictions = data.filter(item => {
      const lastCalculated = new Date(item.last_calculated)
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
      return lastCalculated < sevenDaysAgo
    })

    let riskTrend: 'increasing' | 'decreasing' | 'stable' = 'stable'
    
    if (recentPredictions.length > 0 && olderPredictions.length > 0) {
      const recentAvgRisk = recentPredictions.reduce((sum, item) => sum + item.failure_probability, 0) / recentPredictions.length
      const olderAvgRisk = olderPredictions.reduce((sum, item) => sum + item.failure_probability, 0) / olderPredictions.length
      
      const riskChange = recentAvgRisk - olderAvgRisk
      
      if (Math.abs(riskChange) > 0.05) { // 5% threshold
        riskTrend = riskChange > 0 ? 'increasing' : 'decreasing'
      }
    }

    setKpis({
      totalAlerts,
      criticalAlerts,
      averageRisk,
      upcomingMaintenance,
      riskTrend
    })
  }, [])

  // Update predictive maintenance model
  const updatePredictiveModel = useCallback(async () => {
    try {
      setLoading(true)
      
      // Call the database function to update predictive maintenance
      const { error } = await supabase.rpc('update_predictive_maintenance')
      
      if (error) throw error

      toast.success('Predictive maintenance model updated')
      
      // Refresh data after update
      await fetchPredictions()
      
    } catch (err: any) {
      console.error('Error updating predictive model:', err)
      setError(err.message || 'Failed to update predictive model')
      toast.error('Failed to update predictive model')
    } finally {
      setLoading(false)
    }
  }, [fetchPredictions])

  // Get asset risk level
  const getAssetRiskLevel = useCallback((assetId: string): 'low' | 'medium' | 'high' | 'critical' => {
    const assetPredictions = predictions.filter(p => p.asset_id === assetId)
    
    if (assetPredictions.length === 0) return 'low'
    
    const maxRisk = Math.max(...assetPredictions.map(p => p.failure_probability))
    
    if (maxRisk >= 0.8) return 'critical'
    if (maxRisk >= 0.6) return 'high'
    if (maxRisk >= 0.3) return 'medium'
    return 'low'
  }, [predictions])

  // Get maintenance recommendations for specific asset
  const getMaintenanceRecommendations = useCallback((assetId: string): PredictiveMaintenanceData[] => {
    return predictions
      .filter(p => p.asset_id === assetId)
      .sort((a, b) => b.failure_probability - a.failure_probability)
  }, [predictions])

  // Refresh predictions
  const refreshPredictions = useCallback(async () => {
    await fetchPredictions()
  }, [fetchPredictions])

  // Initialize data on mount
  useEffect(() => {
    fetchPredictions()
  }, [fetchPredictions])

  // Set up real-time subscription for predictive maintenance updates
  useEffect(() => {
    const subscription = supabase
      .channel('predictive_maintenance_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'predictive_maintenance'
        },
        () => {
          // Refresh data when changes occur
          fetchPredictions()
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [fetchPredictions])

  return {
    predictions,
    kpis,
    loading,
    error,
    refreshPredictions,
    updatePredictiveModel,
    getAssetRiskLevel,
    getMaintenanceRecommendations
  }
}

export default usePredictiveMaintenance
