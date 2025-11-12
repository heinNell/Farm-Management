import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js';

// Define proper types for the payload callbacks
interface RealtimePayload<T = Record<string, unknown>> {
  new?: T;
  old?: T;
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
}

interface UseSupabaseRealtimeOptions<T = Record<string, unknown>> {
  table: string;
  onInsert?: (payload: RealtimePayload<T>) => void;
  onUpdate?: (payload: RealtimePayload<T>) => void;
  onDelete?: (payload: RealtimePayload<T>) => void;
  filter?: string;
}

// Define a base type that all database records should have
interface DatabaseRecord {
  id: string | number;
  created_at?: string;
  [key: string]: unknown;
}

// Define valid filter operators
type FilterOperator = 
  | 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' 
  | 'like' | 'ilike' | 'is' | 'in' | 'cs' | 'cd'
  | 'sl' | 'sr' | 'nxl' | 'nxr' | 'adj' | 'ov'
  | 'fts' | 'plfts' | 'phfts' | 'wfts';

export function useSupabaseRealtime<T extends DatabaseRecord>({
  table,
  onInsert,
  onUpdate,
  onDelete,
  filter
}: UseSupabaseRealtimeOptions<T>) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch initial data
  const fetchData = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase.from(table).select('*');

      // Apply filter if available
      if (filter) {
        const filterParts = filter.split(' ');
        if (filterParts.length >= 3) {
          const column = filterParts[0];
          const operator = filterParts[1] as FilterOperator;
          const value = filterParts[2];
          
          if (column && operator && value !== undefined) {
            query = query.filter(column, operator, value);
          }
        }
      }

      const { data: fetchedData, error: fetchError } = await query.order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      setData((fetchedData as T[]) || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      toast.error(`Failed to fetch ${table}: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  }, [table, filter]);

  // Set up real-time subscription
  useEffect(() => {
    void fetchData();

    const channel = supabase
      .channel(`realtime-${table}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table,
          ...(filter && { filter }),
        },
        (payload: RealtimePostgresChangesPayload<T>) => {
          if (payload.new) {
            setData((prev) => [payload.new as T, ...prev]);
            if (onInsert) {
              onInsert({
                new: payload.new as T,
                eventType: 'INSERT'
              });
            }
            toast.success(`New ${table.replace('_', ' ')} added`);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table,
          ...(filter && { filter }),
        },
        (payload: RealtimePostgresChangesPayload<T>) => {
          if (payload.new) {
            setData((prev) =>
              prev.map((item) => 
                item.id === (payload.new as T).id ? payload.new as T : item
              )
            );
            if (onUpdate) {
              onUpdate({
                new: payload.new as T,
                old: payload.old as T,
                eventType: 'UPDATE'
              });
            }
            toast.success(`${table.replace('_', ' ')} updated`);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table,
          ...(filter && { filter }),
        },
        (payload: RealtimePostgresChangesPayload<T>) => {
          if (payload.old) {
            setData((prev) => prev.filter((item) => item.id !== (payload.old as T).id));
            if (onDelete) {
              onDelete({
                old: payload.old as T,
                eventType: 'DELETE'
              });
            }
            toast.success(`${table.replace('_', ' ')} deleted`);
          }
        }
      )
      .subscribe();

    // Cleanup on unmount
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [table, filter, onInsert, onUpdate, onDelete, fetchData]);

  return { data, loading, error, refetch: fetchData };
}
