import { useCallback, useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { supabase, TABLES } from '../lib/supabase'
import type {
  Asset,
  ComprehensiveFuelKPI,
  FuelPrice,
  FuelRecord,
  Numeric,
  OperatingSession,
  SupabaseAssetRow,
  SupabaseFuelPriceRow,
  SupabaseFuelRecordRow,
  SupabaseOperatingSessionRow,
} from '../types/database'
import { FuelKPICalculator } from '../utils/fuelCalculations'

type AssetInput = Omit<Asset, 'id' | 'created_at' | 'updated_at'>
type FuelRecordInput = Omit<FuelRecord, 'id' | 'created_at' | 'updated_at'>
type OperatingSessionInput = Omit<OperatingSession, 'id' | 'created_at' | 'updated_at'>

// Extend SupabaseAssetRow to include purchase_cost
type ExtendedSupabaseAssetRow = SupabaseAssetRow & { purchase_cost?: Numeric }
type FuelPriceInput = Omit<FuelPrice, 'id' | 'created_at' | 'updated_at'>

const parseNumeric = (value: Numeric): number => {
  if (value === null || value === undefined) return 0
  if (typeof value === 'number') return value
  const parsed = Number(value)
  return Number.isNaN(parsed) ? 0 : parsed
}

const parseNullableNumeric = (value: Numeric): number | null => {
  if (value === null || value === undefined) return null
  return parseNumeric(value)
}

const toNullable = <T,>(value: T | null | undefined): T | null => (value ?? null)

const mapAssetRow = (row: ExtendedSupabaseAssetRow): Asset => ({
  id: row.id,
  name: row.name,
  type: row.type,
  model: toNullable(row.model),
  serial_number: toNullable(row.serial_number),
  purchase_date: toNullable(row.purchase_date),
  status: row.status,
  location: toNullable(row.location),
  current_hours: toNullable(row.current_hours),
  fuel_capacity: parseNullableNumeric(row.fuel_capacity),
  fuel_type: toNullable(row.fuel_type),
  barcode: toNullable(row.barcode),
  qr_code: toNullable(row.qr_code),
  notes: toNullable(row.notes),
  purchase_cost: parseNullableNumeric(row.purchase_cost ?? null),
  created_at: row.created_at,
  updated_at: row.updated_at,
})

const mapFuelRecordRow = (row: SupabaseFuelRecordRow): FuelRecord => ({
  id: row.id,
  asset_id: row.asset_id,
  date: row.date,
  filling_date: row.filling_date || row.date,
  quantity: parseNumeric(row.quantity),
  price_per_liter: parseNumeric(row.price_per_liter),
  cost: parseNumeric(row.cost),
  fuel_type: row.fuel_type,
  location: row.location,
  odometer_reading: toNullable(row.odometer_reading),
  receipt_number: toNullable(row.receipt_number),
  fuel_grade: toNullable(row.fuel_grade),
  notes: toNullable(row.notes),
  weather_conditions: toNullable(row.weather_conditions),
  operator_id: toNullable(row.operator_id),
  driver_name: toNullable(row.driver_name),
  attendant_name: toNullable(row.attendant_name),
  current_hours: toNullable(row.current_hours),
  previous_hours: toNullable(row.previous_hours),
  consumption_rate: row.consumption_rate ? parseNumeric(row.consumption_rate) : null,
  hour_difference: toNullable(row.hour_difference),
  created_at: row.created_at,
  updated_at: row.updated_at,
})

const mapOperatingSessionRow = (row: SupabaseOperatingSessionRow): OperatingSession => ({
  id: row.id,
  asset_id: row.asset_id,
  session_start: row.session_start,
  session_end: toNullable(row.session_end),
  initial_fuel_level: parseNullableNumeric(row.initial_fuel_level),
  final_fuel_level: parseNullableNumeric(row.final_fuel_level),
  fuel_consumed: parseNullableNumeric(row.fuel_consumed),
  distance_traveled: parseNullableNumeric(row.distance_traveled),
  operating_hours: parseNullableNumeric(row.operating_hours),
  efficiency_rating: parseNullableNumeric(row.efficiency_rating),
  operator_notes: toNullable(row.operator_notes),
  created_at: row.created_at,
  updated_at: row.updated_at,
})

const mapFuelPriceRow = (row: SupabaseFuelPriceRow): FuelPrice => ({
  id: row.id,
  fuel_type: row.fuel_type,
  price_per_liter: parseNumeric(row.price_per_liter),
  effective_date: row.effective_date,
  location: toNullable(row.location),
  supplier: toNullable(row.supplier),
  created_at: row.created_at,
  updated_at: row.updated_at,
})

const prepareAssetPayload = (asset: Partial<AssetInput>) => ({
  name: asset.name,
  type: asset.type,
  model: toNullable(asset.model),
  serial_number: toNullable(asset.serial_number),
  purchase_date: toNullable(asset.purchase_date),
  status: asset.status,
  location: toNullable(asset.location),
  current_hours: asset.current_hours ?? null,
  fuel_capacity: asset.fuel_capacity ?? null,
  fuel_type: toNullable(asset.fuel_type),
  barcode: toNullable(asset.barcode),
  qr_code: toNullable(asset.qr_code),
  notes: toNullable(asset.notes),
})

const prepareFuelRecordPayload = (record: Partial<FuelRecordInput>) => ({
  asset_id: record.asset_id,
  date: record.date,
  filling_date: record.filling_date || record.date,
  quantity: record.quantity,
  cost: record.cost ?? 0,
  price_per_liter: record.price_per_liter,
  fuel_type: record.fuel_type,
  location: record.location,
  odometer_reading: record.odometer_reading ?? null,
  receipt_number: toNullable(record.receipt_number),
  fuel_grade: toNullable(record.fuel_grade),
  notes: toNullable(record.notes),
  weather_conditions: toNullable(record.weather_conditions),
  operator_id: toNullable(record.operator_id),
  driver_name: toNullable(record.driver_name),
  attendant_name: toNullable(record.attendant_name),
  current_hours: record.current_hours ?? null,
  previous_hours: record.previous_hours ?? null,
  consumption_rate: record.consumption_rate ?? null,
  hour_difference: record.hour_difference ?? null,
})

const prepareOperatingSessionPayload = (session: Partial<OperatingSessionInput>) => ({
  asset_id: session.asset_id,
  session_start: session.session_start,
  session_end: toNullable(session.session_end),
  initial_fuel_level: session.initial_fuel_level ?? null,
  final_fuel_level: session.final_fuel_level ?? null,
  fuel_consumed: session.fuel_consumed ?? null,
  distance_traveled: session.distance_traveled ?? null,
  operating_hours: session.operating_hours ?? null,
  efficiency_rating: session.efficiency_rating ?? null,
  operator_notes: toNullable(session.operator_notes),
})

const prepareFuelPricePayload = (price: Partial<FuelPriceInput>) => ({
  fuel_type: price.fuel_type,
  price_per_liter: price.price_per_liter,
  effective_date: price.effective_date,
  location: toNullable(price.location),
  supplier: toNullable(price.supplier),
})

export const useFuelData = () => {
  console.log('useFuelData: Hook initialized')
  
  const [assets, setAssets] = useState<Asset[]>([])
  const [fuelRecords, setFuelRecords] = useState<FuelRecord[]>([])
  const [operatingSessions, setOperatingSessions] = useState<OperatingSession[]>([])
  const [fuelPrices, setFuelPrices] = useState<FuelPrice[]>([])
  const [loading, setLoading] = useState(true)
  const [kpis, setKPIs] = useState<ComprehensiveFuelKPI | null>(null)

  const fetchAllData = useCallback(async () => {
    setLoading(true)
    try {
      console.log('useFuelData: Starting to fetch all data...')
      
      const [assetsResponse, recordsResponse, sessionsResponse, pricesResponse] = await Promise.all([
        supabase.from(TABLES.ASSETS).select('*').order('created_at', { ascending: false }),
        supabase.from(TABLES.FUEL_RECORDS).select('*').order('date', { ascending: false }),
        supabase.from(TABLES.OPERATING_SESSIONS).select('*').order('session_start', { ascending: false }),
        supabase.from(TABLES.FUEL_PRICES).select('*').order('effective_date', { ascending: false }),
      ])

      console.log('useFuelData: Assets response:', assetsResponse.error || `${assetsResponse.data?.length} assets`)
      console.log('useFuelData: Records response:', recordsResponse.error || `${recordsResponse.data?.length} records`)
      console.log('useFuelData: Sessions response:', sessionsResponse.error || `${sessionsResponse.data?.length} sessions`)
      console.log('useFuelData: Prices response:', pricesResponse.error || `${pricesResponse.data?.length} prices`)

      if (assetsResponse.error) throw assetsResponse.error
      if (recordsResponse.error) throw recordsResponse.error
      if (sessionsResponse.error) throw sessionsResponse.error
      if (pricesResponse.error) throw pricesResponse.error

      const assetRows = (assetsResponse.data ?? []) as SupabaseAssetRow[]
      const recordRows = (recordsResponse.data ?? []) as SupabaseFuelRecordRow[]
      const sessionRows = (sessionsResponse.data ?? []) as SupabaseOperatingSessionRow[]
      const priceRows = (pricesResponse.data ?? []) as SupabaseFuelPriceRow[]

      const mappedAssets = assetRows.map(mapAssetRow)
      const mappedRecords = recordRows.map(mapFuelRecordRow)
      const mappedSessions = sessionRows.map(mapOperatingSessionRow)
      const mappedPrices = priceRows.map(mapFuelPriceRow)

      console.log('useFuelData: Setting assets:', mappedAssets.length)
      setAssets(mappedAssets)
      setFuelRecords(mappedRecords)
      setOperatingSessions(mappedSessions)
      setFuelPrices(mappedPrices)

      if (mappedAssets.length || mappedRecords.length || mappedSessions.length) {
        const calculator = new FuelKPICalculator(mappedAssets, mappedRecords, mappedSessions)
        setKPIs(calculator.calculateAllKPIs())
      } else {
        setKPIs(null)
      }
    } catch (error) {
      console.error('Failed to fetch fuel data:', error)
      toast.error('Failed to load fuel data')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void fetchAllData()
  }, [fetchAllData])

  const createAsset = useCallback(async (assetData: AssetInput) => {
    const response = await supabase
      .from(TABLES.ASSETS)
      .insert([prepareAssetPayload(assetData)])
      .select('*')
      .single()

    if (response.error) {
      console.error('Failed to create asset:', response.error)
      toast.error('Failed to create asset')
      throw response.error
    }

    const mapped = mapAssetRow(response.data as SupabaseAssetRow)
    setAssets(prev => [mapped, ...prev])
    toast.success('Asset created successfully')
    return mapped
  }, [])

  const updateAsset = useCallback(async (assetId: string, updates: Partial<AssetInput>) => {
    const response = await supabase
      .from(TABLES.ASSETS)
      .update({
        ...prepareAssetPayload(updates),
        updated_at: new Date().toISOString(),
      })
      .eq('id', assetId)
      .select('*')
      .single()

    if (response.error) {
      console.error('Failed to update asset:', response.error)
      toast.error('Failed to update asset')
      throw response.error
    }

    const mapped = mapAssetRow(response.data as SupabaseAssetRow)
    setAssets(prev => prev.map(asset => (asset.id === assetId ? mapped : asset)))
    toast.success('Asset updated successfully')
    return mapped
  }, [])

  const deleteAsset = useCallback(async (assetId: string) => {
    const { error } = await supabase.from(TABLES.ASSETS).delete().eq('id', assetId)

    if (error) {
      console.error('Failed to delete asset:', error)
      toast.error('Failed to delete asset')
      throw error
    }

    setAssets(prev => prev.filter(asset => asset.id !== assetId))
    toast.success('Asset deleted successfully')
  }, [])

  const createFuelRecord = useCallback(
    async (recordData: FuelRecordInput) => {
      const response = await supabase
        .from(TABLES.FUEL_RECORDS)
        .insert([prepareFuelRecordPayload(recordData)])
        .select('*')
        .single()

      if (response.error) {
        console.error('Failed to create fuel record:', response.error)
        toast.error('Failed to create fuel record')
        throw response.error
      }

      const mapped = mapFuelRecordRow(response.data as SupabaseFuelRecordRow)
      setFuelRecords(prev => [mapped, ...prev])
      toast.success('Fuel record created successfully')
      await fetchAllData()
      return mapped
    },
    [fetchAllData],
  )

  const updateFuelRecord = useCallback(
    async (recordId: string, updates: Partial<FuelRecordInput>) => {
      const response = await supabase
        .from(TABLES.FUEL_RECORDS)
        .update({
          ...prepareFuelRecordPayload(updates),
          updated_at: new Date().toISOString(),
        })
        .eq('id', recordId)
        .select('*')
        .single()

      if (response.error) {
        console.error('Failed to update fuel record:', response.error)
        toast.error('Failed to update fuel record')
        throw response.error
      }

      const mapped = mapFuelRecordRow(response.data as SupabaseFuelRecordRow)
      setFuelRecords(prev => prev.map(record => (record.id === recordId ? mapped : record)))
      toast.success('Fuel record updated successfully')
      await fetchAllData()
      return mapped
    },
    [fetchAllData],
  )

  const deleteFuelRecord = useCallback(
    async (recordId: string) => {
      const { error } = await supabase.from(TABLES.FUEL_RECORDS).delete().eq('id', recordId)

      if (error) {
        console.error('Failed to delete fuel record:', error)
        toast.error('Failed to delete fuel record')
        throw error
      }

      setFuelRecords(prev => prev.filter(record => record.id !== recordId))
      toast.success('Fuel record deleted successfully')
      await fetchAllData()
    },
    [fetchAllData],
  )

  const createOperatingSession = useCallback(
    async (sessionData: OperatingSessionInput) => {
      const response = await supabase
        .from(TABLES.OPERATING_SESSIONS)
        .insert([prepareOperatingSessionPayload(sessionData)])
        .select('*')
        .single()

      if (response.error) {
        console.error('Failed to create operating session:', response.error)
        toast.error('Failed to create operating session')
        throw response.error
      }

      const mapped = mapOperatingSessionRow(response.data as SupabaseOperatingSessionRow)
      setOperatingSessions(prev => [mapped, ...prev])
      toast.success('Operating session created successfully')
      await fetchAllData()
      return mapped
    },
    [fetchAllData],
  )

  const updateOperatingSession = useCallback(
    async (sessionId: string, updates: Partial<OperatingSessionInput>) => {
      const response = await supabase
        .from(TABLES.OPERATING_SESSIONS)
        .update({
          ...prepareOperatingSessionPayload(updates),
          updated_at: new Date().toISOString(),
        })
        .eq('id', sessionId)
        .select('*')
        .single()

      if (response.error) {
        console.error('Failed to update operating session:', response.error)
        toast.error('Failed to update operating session')
        throw response.error
      }

      const mapped = mapOperatingSessionRow(response.data as SupabaseOperatingSessionRow)
      setOperatingSessions(prev => prev.map(session => (session.id === sessionId ? mapped : session)))
      toast.success('Operating session updated successfully')
      await fetchAllData()
      return mapped
    },
    [fetchAllData],
  )

  const deleteOperatingSession = useCallback(
    async (sessionId: string) => {
      const { error } = await supabase.from(TABLES.OPERATING_SESSIONS).delete().eq('id', sessionId)

      if (error) {
        console.error('Failed to delete operating session:', error)
        toast.error('Failed to delete operating session')
        throw error
      }

      setOperatingSessions(prev => prev.filter(session => session.id !== sessionId))
      toast.success('Operating session deleted successfully')
      await fetchAllData()
    },
    [fetchAllData],
  )

  const createFuelPrice = useCallback(async (priceData: FuelPriceInput) => {
    const response = await supabase
      .from(TABLES.FUEL_PRICES)
      .insert([prepareFuelPricePayload(priceData)])
      .select('*')
      .single()

    if (response.error) {
      console.error('Failed to create fuel price:', response.error)
      toast.error('Failed to create fuel price')
      throw response.error
    }

    const mapped = mapFuelPriceRow(response.data as SupabaseFuelPriceRow)
    setFuelPrices(prev => [mapped, ...prev])
    toast.success('Fuel price record created successfully')
    return mapped
  }, [])

  const getAssetsByType = useCallback((type: string) => assets.filter(asset => asset.type === type), [assets])

  const getActiveAssets = useCallback(() => assets.filter(asset => asset.status === 'active'), [assets])

  const getFuelRecordsByAsset = useCallback(
    (assetId: string) => fuelRecords.filter(record => record.asset_id === assetId),
    [fuelRecords],
  )

  const getSessionsByAsset = useCallback(
    (assetId: string) => operatingSessions.filter(session => session.asset_id === assetId),
    [operatingSessions],
  )

  const getPreviousFuelFill = useCallback(
    (assetId: string, currentFillingDate: string) => {
      const assetRecords = fuelRecords
        .filter(record => record.asset_id === assetId)
        .filter(record => new Date(record.filling_date || record.date) < new Date(currentFillingDate))
        .sort((a, b) => new Date(b.filling_date || b.date).getTime() - new Date(a.filling_date || a.date).getTime())
      
      return assetRecords[0] || null
    },
    [fuelRecords],
  )

  const stats = useMemo(
    () => ({
      assetCount: assets.length,
      fuelRecordCount: fuelRecords.length,
      sessionCount: operatingSessions.length,
      fuelPriceCount: fuelPrices.length,
    }),
    [assets.length, fuelPrices.length, fuelRecords.length, operatingSessions.length],
  )

  return {
    assets,
    fuelRecords,
    operatingSessions,
    fuelPrices,
    kpis,
    loading,
    stats,
    fetchAllData,
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
    getAssetsByType,
    getActiveAssets,
    getFuelRecordsByAsset,
    getSessionsByAsset,
    getPreviousFuelFill,
  }
}
