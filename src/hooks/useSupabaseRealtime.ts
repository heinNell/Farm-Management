
import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

interface UseSupabaseRealtimeOptions {
  table: string
  onInsert?: (payload: any) => void
  onUpdate?: (payload: any) => void
  onDelete?: (payload: any) => void
  filter?: string
}

export function useSupabaseRealtime<T>({
  table,
  onInsert,
  onUpdate,
  onDelete,
  filter
}: UseSupabaseRealtimeOptions) {
  const [data, setData] = useState<T[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch initial data
  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      let query = supabase.from(table).select('*')
      
      if (filter) {
        query = query.filter(filter.split(' ')[0], filter.split(' ')[1], filter.split(' ')[2])
      }

      const { data: fetchedData, error: fetchError } = await query.order('created_at', { ascending: false })

      if (fetchError) {
        throw fetchError
      }

      setData(fetchedData || [])
    } catch (err: any) {
      setError(err.message)
      toast.error(`Failed to fetch ${table}: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }, [table, filter])

  // Set up real-time subscription
  useEffect(() => {
    fetchData()

    const channel = supabase
      .channel(`realtime-${table}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: table,
          filter: filter
        },
        (payload) => {
          setData(prev => [payload.new as T, ...prev])
          onInsert?.(payload)
          toast.success(`New ${table.replace('_', ' ')} added`)
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: table,
          filter: filter
        },
        (payload) => {
          setData(prev => prev.map(item => 
            (item as any).id === (payload.new as any).id ? payload.new as T : item
          ))
          onUpdate?.(payload)
          toast.success(`${table.replace('_', ' ')} updated`)
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: table,
          filter: filter
        },
        (payload) => {
          setData(prev => prev.filter(item => (item as any).id !== (payload.old as any).id))
          onDelete?.(payload)
          toast.success(`${table.replace('_', ' ')} deleted`)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [table, filter, onInsert, onUpdate, onDelete, fetchData])

  return { data, loading, error, refetch: fetchData }
}
