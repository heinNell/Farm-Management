
import React, { useState } from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthContext } from './auth/AuthProvider'
import { usePermissions } from './auth/RoleGuard'
import {LayoutDashboard, Package, Wrench, ClipboardCheck, Calendar, Settings, Menu, X, Fuel, Shield, Crown, UserCheck} from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, requiredRole: null },
  { name: 'Inventory', href: '/inventory', icon: Package, requiredRole: null },
  { name: 'Repairs', href: '/repairs', icon: Wrench, requiredRole: null },
  { name: 'Jobs', href: '/jobs', icon: ClipboardCheck, requiredRole: null },
  { name: 'Inspections', href: '/inspections', icon: Calendar, requiredRole: null },
  { name: 'Maintenance', href: '/maintenance', icon: Calendar, requiredRole: null },
  { name: 'Fuel Management', href: '/fuel-management', icon: Fuel, requiredRole: null },
  { name: 'Settings', href: '/settings', icon: Settings, requiredRole: 'ADMIN' as const },
]

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()
  const { user, userRole } = useAuthContext()
  const { isAdmin } = usePermissions()

  // Filter navigation based on role
  const filteredNavigation = navigation.filter(item => {
    if (!item.requiredRole) return true
    return item.requiredRole === userRole
  })

  const NavItem = ({ item }: { item: typeof navigation[0] }) => {
    const isActive = location.pathname === item.href
    const Icon = item.icon

    return (
      <Link
        to={item.href}
        onClick={() => setSidebarOpen(false)}
        className={`group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
          isActive
            ? 'bg-blue-100 text-blue-700 shadow-sm'
            : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
        }`}
      >
        <Icon className={`mr-3 h-5 w-5 transition-colors ${
          isActive ? 'text-blue-500' : 'text-gray-500 group-hover:text-gray-700'
        }`} />
        {item.name}
        {item.requiredRole === 'ADMIN' && (
          <Crown className="ml-auto h-4 w-4 text-red-500" />
        )}
      </Link>
    )
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo and Brand */}
      <div className="flex items-center px-4 py-6 border-b border-gray-200">
        <Shield className="h-8 w-8 text-blue-600 mr-3" />
        <div>
          <h1 className="text-lg font-bold text-gray-900">Farm Management</h1>
          <p className="text-xs text-gray-500">Secure System</p>
        </div>
      </div>

      {/* User Info */}
      <div className="px-4 py-4 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
            isAdmin ? 'bg-red-100' : 'bg-blue-100'
          }`}>
            {isAdmin ? (
              <Crown className="h-5 w-5 text-red-600" />
            ) : (
              <UserCheck className="h-5 w-5 text-blue-600" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user?.userName}
            </p>
            <p className={`text-xs truncate ${
              isAdmin ? 'text-red-600' : 'text-blue-600'
            }`}>
              {userRole} Access
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
        {filteredNavigation.map((item) => (
          <NavItem key={item.name} item={item} />
        ))}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-gray-200">
        <div className="text-xs text-gray-500 text-center">
          <p>Secured by Lumi Platform</p>
          <p className="mt-1">© 2024 Farm Management System</p>
        </div>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
        <div className="bg-white shadow-sm border-r border-gray-200">
          <SidebarContent />
        </div>
      </div>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <div className="absolute inset-0 bg-gray-600 opacity-75" />
            </motion.div>

            <motion.div
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              exit={{ x: -320 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl lg:hidden"
            >
              <div className="absolute top-0 right-0 -mr-12 pt-2">
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                >
                  <X className="h-6 w-6 text-white" />
                </button>
              </div>
              <SidebarContent />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="lg:pl-64 flex flex-col flex-1 min-h-0">
        {/* Mobile Header */}
        <div className="lg:hidden bg-white shadow-sm border-b border-gray-200 px-4 py-3">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
            >
              <Menu className="h-6 w-6" />
            </button>
            
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-900">
                {user?.userName}
              </span>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                isAdmin ? 'bg-red-100' : 'bg-blue-100'
              }`}>
                {isAdmin ? (
                  <Crown className="h-3 w-3 text-red-600" />
                ) : (
                  <UserCheck className="h-3 w-3 text-blue-600" />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto focus:outline-none">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
