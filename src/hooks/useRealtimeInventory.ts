import { useCallback, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { TABLES, type InventoryItem } from '../lib/supabase'
import { useSupabaseCRUD } from './useSupabaseCRUD'
import { useSupabaseRealtime } from './useSupabaseRealtime'

// Extend InventoryItem to satisfy DatabaseRecord constraint
interface ExtendedInventoryItem extends InventoryItem {
  [key: string]: unknown; // Index signature to satisfy DatabaseRecord constraint
}

export function useRealtimeInventory() {
  const [lowStockItems, setLowStockItems] = useState<InventoryItem[]>([])
  const [outOfStockItems, setOutOfStockItems] = useState<InventoryItem[]>([])

  const { data: inventoryItems, loading, error, refetch } = useSupabaseRealtime<ExtendedInventoryItem>({
    table: TABLES.INVENTORY_ITEMS,
    onInsert: (payload) => {
      if (payload.new) {
        checkStockLevels(payload.new as InventoryItem)
      }
    },
    onUpdate: (payload) => {
      if (payload.new) {
        checkStockLevels(payload.new as InventoryItem)
      }
    }
  })

  const { create, update, delete: deleteItem, loading: crudLoading } = useSupabaseCRUD<InventoryItem>('inventory')

  // Check stock levels and trigger alerts
  const checkStockLevels = useCallback((item: InventoryItem) => {
    if (item.current_stock === 0) {
      toast.error(`⚠️ ${item.name} is out of stock!`, { duration: 6000 })
    } else if (item.current_stock <= item.min_stock) {
      // Use toast() with custom styling instead of toast.warning()
      toast(`📦 ${item.name} is running low (${item.current_stock} ${item.unit || 'units'} left)`, {
        duration: 4000,
        icon: '⚠️',
        style: {
          background: '#FEF3C7',
          color: '#92400E',
          border: '1px solid #F59E0B'
        }
      })
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

    // Create a properly typed update object
    const updateData: Partial<InventoryItem> = {
      current_stock: newStock,
      status,
      last_updated: new Date().toISOString()
    }

    return await update(itemId, updateData)
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

    const newItemData: Omit<InventoryItem, 'id' | 'created_at' | 'updated_at'> = {
      ...itemData,
      status,
      last_updated: new Date().toISOString()
    }

    return await create(newItemData)
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

  // Safe error handling
  const safeError = (() => {
    const err = error as unknown
    if (!err) return null
    if (err instanceof Error) return err.message
    if (typeof err === 'string') return err
    if (typeof err === 'object' && err !== null && 'message' in err) {
      const errObj = err as { message: unknown }
      if (typeof errObj.message === 'string') {
        return errObj.message
      }
    }
    try {
      return JSON.stringify(err)
    } catch {
      return 'An unknown error occurred'
    }
  })()

  return {
    // Data
    inventoryItems: inventoryItems as InventoryItem[],
    lowStockItems,
    outOfStockItems,
    
    // Status
    loading: loading || crudLoading,
    error: safeError,
    
    // Operations
    addInventoryItem,
    updateStock,
    bulkUpdateStock,
    updateItem: update,
    removeItem: deleteItem, // Use delete instead of remove
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
