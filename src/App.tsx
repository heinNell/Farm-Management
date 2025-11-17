import { Toaster } from 'react-hot-toast'
import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom'
import AuthProvider from './components/auth/AuthProvider'
import Layout from './components/Layout'
import { useOfflineDetection } from './hooks/useOfflineDetection'
import Dashboard from './pages/Dashboard'
import FuelBunkers from './pages/FuelBunkers'
import FuelManagement from './pages/FuelManagement'
import Inspections from './pages/Inspections'
import Inventory from './pages/Inventory'
import Jobs from './pages/Jobs'
import Maintenance from './pages/Maintenance'
import Repairs from './pages/Repairs'
import Settings from './pages/Settings'

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
          <Route path="fuel-bunkers" element={<FuelBunkers />} />
          <Route path="settings" element={<Settings />} />
          {/* Redirect old stock-items route to inventory */}
          <Route path="stock-items" element={<Navigate to="/inventory" replace />} />
          {/* Catch all unknown routes */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
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
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  )
}

export default App
