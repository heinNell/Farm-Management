
import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from 'react-query'
import { Toaster } from 'react-hot-toast'
import AuthProvider from './components/auth/AuthProvider'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Inventory from './pages/Inventory'
import Repairs from './pages/Repairs'
import Jobs from './pages/Jobs'
import Inspections from './pages/Inspections'
import Maintenance from './pages/Maintenance'
import Settings from './pages/Settings'
import FuelManagement from './pages/FuelManagement'
import { useOfflineDetection } from './hooks/useOfflineDetection'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 3,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
})

function AppContent() {
  const isOffline = useOfflineDetection()

  return (
    <div className="min-h-screen bg-gray-50">
      {isOffline && (
        <div className="bg-red-500 text-white text-center py-2 text-sm">
          You're currently offline. Data will sync when connection is restored.
        </div>
      )}
      
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="inventory" element={<Inventory />} />
          <Route path="repairs" element={<Repairs />} />
          <Route path="jobs" element={<Jobs />} />
          <Route path="inspections" element={<Inspections />} />
          <Route path="maintenance" element={<Maintenance />} />
          <Route path="fuel-management" element={<FuelManagement />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
      
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
        }}
      />
    </div>
  )
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </Router>
    </QueryClientProvider>
  )
}

export default App
