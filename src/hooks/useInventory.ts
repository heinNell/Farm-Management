import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'

interface InventoryItem {
  id: string
  sku: string
  name: string
  category: string
  currentStock: number
  minStock: number
  maxStock: number
  unit: string
  location: string
  lastUpdated: string
  status: string
}

interface QueueItem {
  type: 'update' | 'create'
  data: Partial<InventoryItem> | Omit<InventoryItem, 'id'>
}

// Mock API functions - replace with actual API calls
const fetchInventoryItems = async (): Promise<InventoryItem[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  // Return mock data
  return [
    {
      id: '1',
      sku: 'HYD-001',
      name: 'Hydraulic Fluid - Premium Grade',
      category: 'Fluids',
      currentStock: 45,
      minStock: 20,
      maxStock: 100,
      unit: 'Liters',
      location: 'Warehouse A-1',
      lastUpdated: '2024-01-15T10:30:00Z',
      status: 'in_stock'
    }
  ]
}

const updateInventoryItem = async (item: Partial<InventoryItem>): Promise<InventoryItem> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500))
  
  // Return updated item
  return item as InventoryItem
}

const createInventoryItem = async (item: Omit<InventoryItem, 'id'>): Promise<InventoryItem> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500))
  
  // Return new item with generated ID
  return {
    ...item,
    id: Math.random().toString(36).substr(2, 9)
  }
}

export function useInventory() {
  const queryClient = useQueryClient()
  const [offlineQueue, setOfflineQueue] = useState<QueueItem[]>([])

  const {
    data: inventoryItems,
    isLoading,
    error
  } = useQuery({
    queryKey: ['inventory'],
    queryFn: fetchInventoryItems,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
  })

  const updateItemMutation = useMutation({
    mutationFn: updateInventoryItem,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['inventory'] })
    },
    onError: (_error, variables) => {
      // Add to offline queue if network error
      if (!navigator.onLine) {
        setOfflineQueue(prev => [...prev, { type: 'update', data: variables }])
      }
    }
  })

  const createItemMutation = useMutation({
    mutationFn: createInventoryItem,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['inventory'] })
    },
    onError: (_error, variables) => {
      // Add to offline queue if network error
      if (!navigator.onLine) {
        setOfflineQueue(prev => [...prev, { type: 'create', data: variables }])
      }
    }
  })

  const syncOfflineQueue = async () => {
    if (navigator.onLine && offlineQueue.length > 0) {
      for (const queueItem of offlineQueue) {
        try {
          if (queueItem.type === 'update') {
            await updateInventoryItem(queueItem.data as Partial<InventoryItem>)
          } else if (queueItem.type === 'create') {
            await createInventoryItem(queueItem.data as Omit<InventoryItem, 'id'>)
          }
        } catch (error) {
          console.error('Failed to sync offline item:', error)
        }
      }
      setOfflineQueue([])
      void queryClient.invalidateQueries({ queryKey: ['inventory'] })
    }
  }

  return {
    inventoryItems,
    isLoading,
    error,
    updateItem: updateItemMutation.mutate,
    createItem: createItemMutation.mutate,
    offlineQueue,
    syncOfflineQueue
  }
}
