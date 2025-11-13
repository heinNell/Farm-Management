import type { PostgrestError } from '@supabase/supabase-js'
import { useCallback, useEffect, useState } from 'react'
import { supabase, TABLES } from '../lib/supabase'
import { EntityType } from '../types/database'
import { useToast } from './useToast'

interface CRUDState<T> {
  items: T[]
  loading: boolean
  error: string | null
  creating: boolean
  updating: boolean
  deleting: boolean
}

interface CRUDOperations<T> {
  create: (data: Omit<T, 'id' | 'created_at' | 'updated_at'>) => Promise<T | null>
  update: (id: string, data: Partial<T>) => Promise<T | null>
  delete: (id: string) => Promise<boolean>
  refresh: () => Promise<void>
  getById: (id: string) => T | undefined
  search: (query: string, fields: (keyof T)[]) => T[]
  filter: (predicate: (item: T) => boolean) => T[]
}

export function useSupabaseCRUD<T extends { id: string; created_at: string; updated_at: string }>(
  entityType: EntityType,
  realtime = true
): CRUDState<T> & CRUDOperations<T> {
  const [state, setState] = useState<CRUDState<T>>({
    items: [],
    loading: true,
    error: null,
    creating: false,
    updating: false,
    deleting: false
  })

  const { success, error: showError } = useToast()

  const tableName = TABLES[entityType.toUpperCase() as keyof typeof TABLES] || entityType

  // Fetch all items
  const fetchItems = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }))
      
      console.log(`useSupabaseCRUD: Fetching items from table: ${tableName}`)
      
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error(`useSupabaseCRUD: Error fetching from ${tableName}:`, error)
        throw error
      }

      console.log(`useSupabaseCRUD: Fetched ${data?.length || 0} items from ${tableName}`, data)

      setState(prev => ({
        ...prev,
        items: (data as T[]) || [],
        loading: false
      }))
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch items'
      setState(prev => ({
        ...prev,
        error: errorMessage,
        loading: false
      }))
      showError('Error', errorMessage)
    }
  }, [tableName, showError])

  // Create new item
  const create = useCallback(async (data: Omit<T, 'id' | 'created_at' | 'updated_at'>): Promise<T | null> => {
    try {
      setState(prev => ({ ...prev, creating: true, error: null }))

      console.log(`useSupabaseCRUD: Creating item in ${tableName}:`, data)

      const { data: newItem, error } = await supabase
        .from(tableName)
        .insert([data])
        .select()
        .single() as { data: T | null; error: PostgrestError | null }

      if (error) {
        console.error(`useSupabaseCRUD: Error creating in ${tableName}:`, error)
        throw error
      }

      console.log(`useSupabaseCRUD: Created item in ${tableName}:`, newItem)

      setState(prev => ({
        ...prev,
        items: [newItem as T, ...prev.items],
        creating: false
      }))

      success('Success', 'Item created successfully')
      return newItem
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create item'
      setState(prev => ({
        ...prev,
        error: errorMessage,
        creating: false
      }))
      showError('Error', errorMessage)
      return null
    }
  }, [tableName, success, showError])

  // Update existing item
  const update = useCallback(async (id: string, data: Partial<T>): Promise<T | null> => {
    try {
      setState(prev => ({ ...prev, updating: true, error: null }))

      const { data: updatedItem, error } = await supabase
        .from(tableName)
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single() as { data: T | null; error: PostgrestError | null }

      if (error) throw error

      setState(prev => ({
        ...prev,
        items: prev.items.map(item => 
          item.id === id ? updatedItem as T : item
        ),
        updating: false
      }))

      success('Success', 'Item updated successfully')
      return updatedItem
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update item'
      setState(prev => ({
        ...prev,
        error: errorMessage,
        updating: false
      }))
      showError('Error', errorMessage)
      return null
    }
  }, [tableName, success, showError])

  // Delete item
  const deleteItem = useCallback(async (id: string): Promise<boolean> => {
    try {
      setState(prev => ({ ...prev, deleting: true, error: null }))

      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq('id', id)

      if (error) throw error

      setState(prev => ({
        ...prev,
        items: prev.items.filter(item => item.id !== id),
        deleting: false
      }))

      success('Success', 'Item deleted successfully')
      return true
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete item'
      setState(prev => ({
        ...prev,
        error: errorMessage,
        deleting: false
      }))
      showError('Error', errorMessage)
      return false
    }
  }, [tableName, success, showError])

  // Get item by ID
  const getById = useCallback((id: string): T | undefined => {
    return state.items.find(item => item.id === id)
  }, [state.items])

  // Search items
  const search = useCallback((query: string, fields: (keyof T)[]): T[] => {
    if (!query.trim()) return state.items

    const lowercaseQuery = query.toLowerCase()
    return state.items.filter(item =>
      fields.some(field => {
        const value = item[field]
        return value && String(value).toLowerCase().includes(lowercaseQuery)
      })
    )
  }, [state.items])

  // Filter items
  const filter = useCallback((predicate: (item: T) => boolean): T[] => {
    return state.items.filter(predicate)
  }, [state.items])

  // Refresh data
  const refresh = useCallback(async () => {
    await fetchItems()
  }, [fetchItems])

  // Set up real-time subscription
  useEffect(() => {
    void fetchItems()

    if (realtime) {
      const subscription = supabase
        .channel(`${tableName}_changes`)
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: tableName
        }, (payload) => {
          switch (payload.eventType) {
            case 'INSERT':
              setState(prev => ({
                ...prev,
                items: [payload.new as T, ...prev.items]
              }))
              break
            case 'UPDATE':
              setState(prev => ({
                ...prev,
                items: prev.items.map(item =>
                  item.id === (payload.new as T).id ? payload.new as T : item
                )
              }))
              break
            case 'DELETE':
              setState(prev => ({
                ...prev,
                items: prev.items.filter(item => item.id !== (payload.old as T).id)
              }))
              break
          }
        })
        .subscribe()

      return () => {
        void subscription.unsubscribe()
      }
    }
  }, [fetchItems, tableName, realtime])

  return {
    ...state,
    create,
    update,
    delete: deleteItem,
    refresh,
    getById,
    search,
    filter
  }
}
