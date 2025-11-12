import { RefreshCw, Wifi, WifiOff } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

// Add type for system payload
interface SystemPayload {
  status: string
}

export const RealtimeStatus: React.FC = () => {
  const [isConnected, setIsConnected] = useState(false)
  const [lastSync, setLastSync] = useState<Date | null>(null)
  const [connectionAttempts, setConnectionAttempts] = useState(0)

  useEffect(() => {
    let reconnectTimer: NodeJS.Timeout

    const handleConnectionChange = (status: string) => {
      if (status === 'SUBSCRIBED') {
        setIsConnected(true)
        setLastSync(new Date())
        setConnectionAttempts(0)
      } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
        setIsConnected(false)
        setConnectionAttempts(prev => prev + 1)
        
        // Auto-reconnect with exponential backoff
        const delay = Math.min(1000 * Math.pow(2, connectionAttempts), 30000)
        reconnectTimer = setTimeout(() => {
          // Trigger reconnection by creating a new channel
          supabase.channel('connection-test').subscribe()
        }, delay)
      }
    }

    // Monitor connection status
    const channel = supabase
      .channel('status-monitor')
      .on('system', {}, (payload: SystemPayload) => {
        handleConnectionChange(payload.status)
      })
      .subscribe((status) => {
        handleConnectionChange(status)
      })

    // Cleanup
    return () => {
      if (reconnectTimer) {
        clearTimeout(reconnectTimer)
      }
      void supabase.removeChannel(channel)
    }
  }, [connectionAttempts])

  const handleManualReconnect = () => {
    setConnectionAttempts(0)
    // Force reconnection
    void supabase.channel('manual-reconnect').subscribe()
  }

  return (
    <div className="flex items-center space-x-2 text-sm">
      <div className="flex items-center space-x-1">
        {isConnected ? (
          <>
            <Wifi className="h-4 w-4 text-green-500" />
            <span className="text-green-600 font-medium">Connected</span>
          </>
        ) : (
          <>
            <WifiOff className="h-4 w-4 text-red-500" />
            <span className="text-red-600 font-medium">Disconnected</span>
            <button
              onClick={handleManualReconnect}
              className="ml-2 p-1 hover:bg-gray-100 rounded"
              title="Reconnect"
            >
              <RefreshCw className="h-3 w-3 text-gray-500" />
            </button>
          </>
        )}
      </div>
      
      {lastSync && (
        <div className="text-gray-500 border-l pl-2">
          <span className="text-xs">
            Last sync: {lastSync.toLocaleTimeString()}
          </span>
        </div>
      )}
      
      {connectionAttempts > 0 && !isConnected && (
        <div className="text-orange-500 text-xs">
          Retrying... ({connectionAttempts})
        </div>
      )}
    </div>
  )
}

export default RealtimeStatus
