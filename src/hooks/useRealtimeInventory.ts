
import { useSupabaseRealtime } from './useSupabaseRealtime'
import { useSupabaseCRUD } from './useSupabaseCRUD'
import { TABLES, type InventoryItem } from '../lib/supabase'
import { useState, useEffect, useCallback } from 'react'
import toast from 'react-hot-toast'

export function useRealtimeInventory() {
  const [lowStockItems, setLowStockItems] = useState<InventoryItem[]>([])
  const [outOfStockItems, setOutOfStockItems] = useState<InventoryItem[]>([])

  const { data: inventoryItems, loading, error, refetch } = useSupabaseRealtime<InventoryItem>({
    table: TABLES.INVENTORY_ITEMS,
    onInsert: (payload) => {
      checkStockLevels(payload.new)
    },
    onUpdate: (payload) => {
      checkStockLevels(payload.new)
    }
  })

  const { create, update, remove, loading: crudLoading } = useSupabaseCRUD({
    table: TABLES.INVENTORY_ITEMS
  })

  // Check stock levels and trigger alerts
  const checkStockLevels = useCallback((item: InventoryItem) => {
    if (item.current_stock === 0) {
      toast.error(`⚠️ ${item.name} is out of stock!`, { duration: 6000 })
    } else if (item.current_stock <= item.min_stock) {
      toast.warning(`📦 ${item.name} is running low (${item.current_stock} ${item.unit} left)`, { duration: 4000 })
    }
  }, [])

  // Monitor stock levels
  useEffect(() => {
    const lowStock = inventoryItems.filter(item => 
      item.current_stock > 0 && item.current_stock <= item.min_stock
    )
    const outOfStock = inventoryItems.filter(item => item.current_stock === 0)

    setLowStockItems(lowStock)
    setOutOfStockItems(outOfStock)
  }, [inventoryItems])

  // Update stock levels
  const updateStock = useCallback(async (itemId: string, newStock: number) => {
    const item = inventoryItems.find(i => i.id === itemId)
    if (!item) return

    let status: InventoryItem['status'] = 'in_stock'
    if (newStock === 0) {
      status = 'out_of_stock'
    } else if (newStock <= item.min_stock) {
      status = 'low_stock'
    }

    return await update(itemId, {
      current_stock: newStock,
      status,
      last_updated: new Date().toISOString()
    })
  }, [inventoryItems, update])

  // Bulk stock update
  const bulkUpdateStock = useCallback(async (updates: Array<{ id: string; stock: number }>) => {
    const promises = updates.map(({ id, stock }) => updateStock(id, stock))
    return await Promise.all(promises)
  }, [updateStock])

  // Add new inventory item
  const addInventoryItem = useCallback(async (itemData: Omit<InventoryItem, 'id' | 'created_at' | 'updated_at' | 'last_updated'>) => {
    let status: InventoryItem['status'] = 'in_stock'
    if (itemData.current_stock === 0) {
      status = 'out_of_stock'
    } else if (itemData.current_stock <= itemData.min_stock) {
      status = 'low_stock'
    }

    return await create({
      ...itemData,
      status,
      last_updated: new Date().toISOString()
    })
  }, [create])

  // Search and filter functions
  const searchItems = useCallback((query: string) => {
    return inventoryItems.filter(item =>
      item.name.toLowerCase().includes(query.toLowerCase()) ||
      item.sku.toLowerCase().includes(query.toLowerCase()) ||
      item.category.toLowerCase().includes(query.toLowerCase())
    )
  }, [inventoryItems])

  const filterByCategory = useCallback((category: string) => {
    return inventoryItems.filter(item => item.category === category)
  }, [inventoryItems])

  const filterByLocation = useCallback((location: string) => {
    return inventoryItems.filter(item => item.location === location)
  }, [inventoryItems])

  const filterByStatus = useCallback((status: InventoryItem['status']) => {
    return inventoryItems.filter(item => item.status === status)
  }, [inventoryItems])

  return {
    // Data
    inventoryItems,
    lowStockItems,
    outOfStockItems,
    
    // Status
    loading: loading || crudLoading,
    error,
    
    // Operations
    addInventoryItem,
    updateStock,
    bulkUpdateStock,
    updateItem: update,
    removeItem: remove,
    refetch,
    
    // Search & Filter
    searchItems,
    filterByCategory,
    filterByLocation,
    filterByStatus,
    
    // Analytics
    totalItems: inventoryItems.length,
    totalLowStock: lowStockItems.length,
    totalOutOfStock: outOfStockItems.length,
    categories: [...new Set(inventoryItems.map(item => item.category))],
    locations: [...new Set(inventoryItems.map(item => item.location))]
  }
}
