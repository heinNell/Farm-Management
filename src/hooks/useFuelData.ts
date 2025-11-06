
import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { Asset, FuelRecord, OperatingSession, FuelPrice, ComprehensiveFuelKPI } from '../types/fuel'
import { FuelKPICalculator } from '../utils/fuelCalculations'
import toast from 'react-hot-toast'

export const useFuelData = () => {
  const [assets, setAssets] = useState<Asset[]>([])
  const [fuelRecords, setFuelRecords] = useState<FuelRecord[]>([])
  const [operatingSessions, setOperatingSessions] = useState<OperatingSession[]>([])
  const [fuelPrices, setFuelPrices] = useState<FuelPrice[]>([])
  const [loading, setLoading] = useState(true)
  const [kpis, setKPIs] = useState<ComprehensiveFuelKPI | null>(null)

  // Fetch all data
  const fetchAllData = useCallback(async () => {
    setLoading(true)
    try {
      const [assetsResponse, recordsResponse, sessionsResponse, pricesResponse] = await Promise.all([
        lumi.entities.assets.list({ sort: { created_at: -1 } }),
        lumi.entities.fuel_records.list({ sort: { created_at: -1 } }),
        lumi.entities.operating_sessions.list({ sort: { created_at: -1 } }),
        lumi.entities.fuel_prices.list({ sort: { effective_date: -1 } })
      ])

      const assetsData = assetsResponse.list || []
      const recordsData = recordsResponse.list || []
      const sessionsData = sessionsResponse.list || []
      const pricesData = pricesResponse.list || []

      setAssets(assetsData)
      setFuelRecords(recordsData)
      setOperatingSessions(sessionsData)
      setFuelPrices(pricesData)

      // Calculate KPIs
      if (assetsData.length > 0 || recordsData.length > 0 || sessionsData.length > 0) {
        const calculator = new FuelKPICalculator(assetsData, recordsData, sessionsData)
        const calculatedKPIs = calculator.calculateAllKPIs()
        setKPIs(calculatedKPIs)
      }
    } catch (error) {
      console.error('Failed to fetch fuel data:', error)
      toast.error('Failed to load fuel data')
    } finally {
      setLoading(false)
    }
  }, [])

  // Asset CRUD operations
  const createAsset = async (assetData: Omit<Asset, '_id'>) => {
    try {
      const newAsset = await lumi.entities.assets.create({
        ...assetData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      setAssets(prev => [newAsset, ...prev])
      toast.success('Asset created successfully')
      return newAsset
    } catch (error) {
      console.error('Failed to create asset:', error)
      toast.error('Failed to create asset')
      throw error
    }
  }

  const updateAsset = async (assetId: string, updates: Partial<Asset>) => {
    try {
      const updatedAsset = await lumi.entities.assets.update(assetId, {
        ...updates,
        updated_at: new Date().toISOString()
      })
      setAssets(prev => prev.map(a => a._id === assetId ? updatedAsset : a))
      toast.success('Asset updated successfully')
      return updatedAsset
    } catch (error) {
      console.error('Failed to update asset:', error)
      toast.error('Failed to update asset')
      throw error
    }
  }

  const deleteAsset = async (assetId: string) => {
    try {
      await lumi.entities.assets.delete(assetId)
      setAssets(prev => prev.filter(a => a._id !== assetId))
      toast.success('Asset deleted successfully')
    } catch (error) {
      console.error('Failed to delete asset:', error)
      toast.error('Failed to delete asset')
      throw error
    }
  }

  // Fuel Record CRUD operations
  const createFuelRecord = async (recordData: Omit<FuelRecord, '_id'>) => {
    try {
      const newRecord = await lumi.entities.fuel_records.create({
        ...recordData,
        created_at: new Date().toISOString()
      })
      setFuelRecords(prev => [newRecord, ...prev])
      toast.success('Fuel record created successfully')
      await fetchAllData() // Refresh to recalculate KPIs
      return newRecord
    } catch (error) {
      console.error('Failed to create fuel record:', error)
      toast.error('Failed to create fuel record')
      throw error
    }
  }

  const updateFuelRecord = async (recordId: string, updates: Partial<FuelRecord>) => {
    try {
      const updatedRecord = await lumi.entities.fuel_records.update(recordId, updates)
      setFuelRecords(prev => prev.map(r => r._id === recordId ? updatedRecord : r))
      toast.success('Fuel record updated successfully')
      await fetchAllData() // Refresh to recalculate KPIs
      return updatedRecord
    } catch (error) {
      console.error('Failed to update fuel record:', error)
      toast.error('Failed to update fuel record')
      throw error
    }
  }

  const deleteFuelRecord = async (recordId: string) => {
    try {
      await lumi.entities.fuel_records.delete(recordId)
      setFuelRecords(prev => prev.filter(r => r._id !== recordId))
      toast.success('Fuel record deleted successfully')
      await fetchAllData() // Refresh to recalculate KPIs
    } catch (error) {
      console.error('Failed to delete fuel record:', error)
      toast.error('Failed to delete fuel record')
      throw error
    }
  }

  // Operating Session CRUD operations
  const createOperatingSession = async (sessionData: Omit<OperatingSession, '_id'>) => {
    try {
      const newSession = await lumi.entities.operating_sessions.create({
        ...sessionData,
        created_at: new Date().toISOString()
      })
      setOperatingSessions(prev => [newSession, ...prev])
      toast.success('Operating session created successfully')
      await fetchAllData() // Refresh to recalculate KPIs
      return newSession
    } catch (error) {
      console.error('Failed to create operating session:', error)
      toast.error('Failed to create operating session')
      throw error
    }
  }

  const updateOperatingSession = async (sessionId: string, updates: Partial<OperatingSession>) => {
    try {
      const updatedSession = await lumi.entities.operating_sessions.update(sessionId, updates)
      setOperatingSessions(prev => prev.map(s => s._id === sessionId ? updatedSession : s))
      toast.success('Operating session updated successfully')
      await fetchAllData() // Refresh to recalculate KPIs
      return updatedSession
    } catch (error) {
      console.error('Failed to update operating session:', error)
      toast.error('Failed to update operating session')
      throw error
    }
  }

  const deleteOperatingSession = async (sessionId: string) => {
    try {
      await lumi.entities.operating_sessions.delete(sessionId)
      setOperatingSessions(prev => prev.filter(s => s._id !== sessionId))
      toast.success('Operating session deleted successfully')
      await fetchAllData() // Refresh to recalculate KPIs
    } catch (error) {
      console.error('Failed to delete operating session:', error)
      toast.error('Failed to delete operating session')
      throw error
    }
  }

  // Fuel Price operations
  const createFuelPrice = async (priceData: Omit<FuelPrice, '_id'>) => {
    try {
      const newPrice = await lumi.entities.fuel_prices.create({
        ...priceData,
        created_at: new Date().toISOString()
      })
      setFuelPrices(prev => [newPrice, ...prev])
      toast.success('Fuel price record created successfully')
      return newPrice
    } catch (error) {
      console.error('Failed to create fuel price:', error)
      toast.error('Failed to create fuel price')
      throw error
    }
  }

  // Get filtered data
  const getAssetsByType = (type: string) => assets.filter(asset => asset.type === type)
  const getActiveAssets = () => assets.filter(asset => asset.status === 'active')
  const getFuelRecordsByAsset = (assetId: string) => fuelRecords.filter(record => record.asset_id === assetId)
  const getSessionsByAsset = (assetId: string) => operatingSessions.filter(session => session.asset_id === assetId)

  useEffect(() => {
    fetchAllData()
  }, [fetchAllData])

  return {
    // Data
    assets,
    fuelRecords,
    operatingSessions,
    fuelPrices,
    kpis,
    loading,

    // CRUD operations
    createAsset,
    updateAsset,
    deleteAsset,
    createFuelRecord,
    updateFuelRecord,
    deleteFuelRecord,
    createOperatingSession,
    updateOperatingSession,
    deleteOperatingSession,
    createFuelPrice,

    // Utility functions
    fetchAllData,
    getAssetsByType,
    getActiveAssets,
    getFuelRecordsByAsset,
    getSessionsByAsset
  }
}
