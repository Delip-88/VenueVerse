"use client"

import { useState } from "react"
import { NavLink, Outlet } from "react-router-dom"
import { Home, Building, Users, Calendar, BarChart2, User, Settings, LogOut, Menu } from "lucide-react"

export default function SuperAdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Sidebar navigation items
  const navItems = [
    { name: "Dashboard", icon: Home, path: "/super-admin/dashboard" },
    { name: "Venues", icon: Building, path: "/super-admin/venues" },
    { name: "Venue Owners", icon: Users, path: "/super-admin/venue-owners" },
    { name: "Bookings", icon: Calendar, path: "/super-admin/bookings" },
    { name: "Reports", icon: BarChart2, path: "/super-admin/reports" },
    { name: "Users", icon: User, path: "/super-admin/users" },
    { name: "Settings", icon: Settings, path: "/super-admin/settings" },
  ]

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-gray-600 bg-opacity-75 transition-opacity lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-white shadow-lg transform ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 transition duration-300 ease-in-out`}
      >
        <div className="flex items-center justify-center h-16 border-b border-gray-200">
          <h1 className="text-xl font-bold text-blue-600">VenueVerse</h1>
        </div>
        <nav className="mt-5 px-2">
          <div className="space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `w-full text-left ${isActive ? "bg-blue-50 text-blue-700" : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"} group flex items-center px-2 py-2 text-base font-medium rounded-md`
                }
              >
                {({ isActive }) => (
                  <>
                    <item.icon className={`mr-4 h-6 w-6 ${isActive ? "text-blue-500" : "text-gray-500"}`} />
                    {item.name}
                  </>
                )}
              </NavLink>
            ))}
          </div>
        </nav>
        <div className="absolute bottom-0 w-full border-t border-gray-200">
          <div className="flex items-center px-4 py-3">
            <div className="flex-shrink-0">
              <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium">
                SA
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-700">Super Admin</p>
              <p className="text-xs font-medium text-gray-500">admin@venueverse.com</p>
            </div>
            <button className="ml-auto bg-white rounded-full p-1 text-gray-400 hover:text-gray-500">
              <LogOut className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top navigation */}
        <div className="sticky top-0 z-10 flex h-16 flex-shrink-0 bg-white shadow-sm lg:hidden">
          <button
            type="button"
            className="px-4 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="sr-only">Open sidebar</span>
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex flex-1 justify-center px-4">
            <div className="flex flex-1 items-center justify-center">
              <h1 className="text-xl font-bold text-blue-600">VenueVerse</h1>
            </div>
          </div>
        </div>

        {/* Main dashboard content */}
        <main className="py-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

