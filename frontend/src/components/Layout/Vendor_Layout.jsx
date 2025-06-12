"use client"

import { useState, useEffect, useContext } from "react"
import {
  Menu,
  X,
  Building,
  Calendar,
  PlusCircle,
  Settings,
  LogOut,
  BadgeHelp,
  ChevronRight,
  Home,
  LayoutDashboard,
} from "lucide-react"
import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom"
import { AuthContext } from "../../middleware/AuthContext"
import Loader from "../../pages/common/Loader"

export default function VendorLayout() {
  const { user, loading, logout } = useContext(AuthContext)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = async () => {
    const confirmed = window.confirm("Are you sure you want to sign out?")
    if (!confirmed) return

    logout()
    setTimeout(() => {
      window.location.href = "/"
    }, 200)
  }

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024)
    }
    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  useEffect(() => {
    if (isMobile) {
      setIsSidebarOpen(false)
    } else {
      setIsSidebarOpen(true)
    }
  }, [isMobile])

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  // Get current page title based on path
  const getCurrentPageTitle = () => {
    const path = location.pathname.split("/").pop()

    switch (path) {
      case "Dashboard":
        return "Dashboard"
      case "my-venues":
        return "My Venues"
      case "bookings":
        return "Bookings"
      case "add-venue":
        return "Add New Venue"
      case "settings":
        return "Settings"
      case "help&support":
        return "Help & Support"
      default:
        return "Dashboard"
    }
  }

  if (loading) return <Loader />

  if (!user) return <p>User not found or not logged in.</p>

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 to-gray-100">
      {/* Sidebar */}
      <div
        className={`${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } fixed inset-y-0 left-0 z-30 w-72 bg-white shadow-lg transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 border-r border-gray-200`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-center h-20 border-b border-gray-200">
            <NavLink to="/Dashboard" className="flex items-center space-x-3">
              <img
                className="h-10 w-auto rounded-full overflow-hidden shadow-sm"
                src="https://res.cloudinary.com/dduky37gb/image/upload/v1741271326/VenueVerse/ffq6gdhll1xnbzjaqwnn.png"
                alt="VenueVerse Logo"
              />
            </NavLink>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 mb-2">Main</div>
            <Link href="Dashboard" icon={<LayoutDashboard className="h-5 w-5" />}>
              Dashboard
            </Link>
            <Link href="my-venues" icon={<Building className="h-5 w-5" />}>
              My Venues
            </Link>
            <Link href="bookings" icon={<Calendar className="h-5 w-5" />}>
              Bookings
            </Link>
            <Link href="add-venue" icon={<PlusCircle className="h-5 w-5" />}>
              Add Venue
            </Link>

            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 mb-2 mt-6">Support</div>
            <Link href="help&support" icon={<BadgeHelp className="h-5 w-5" />}>
              Help & Support
            </Link>
            <Link href="settings" icon={<Settings className="h-5 w-5" />}>
              Settings
            </Link>
          </nav>

          {/* User Profile and Logout */}
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center mb-4">
              <div className="h-12 w-12 rounded-full overflow-hidden bg-gradient-to-br from-teal-100 to-teal-200 border-2 border-white shadow-md">
                <img
                  className="h-full w-full object-cover"
                  src={user?.profileImg?.secure_url || "https://picsum.photos/id/237/200/300"}
                  alt={user.name}
                />
              </div>
              <div className="ml-3">
                <div className="text-sm font-medium text-gray-900">{user.name}</div>
                <div className="text-xs text-gray-500">{user.email}</div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center px-4 py-2 text-sm font-medium rounded-lg text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut className="h-5 w-5 mr-3" />
              Sign out
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="px-6 py-4 flex justify-between items-center">
            <div className="flex items-center">
              <button
                onClick={toggleSidebar}
                type="button"
                className="text-gray-500 hover:text-gray-600 focus:outline-none focus:text-gray-600 lg:hidden"
              >
                <span className="sr-only">Toggle sidebar</span>
                {isSidebarOpen ? (
                  <X className="h-6 w-6" aria-hidden="true" />
                ) : (
                  <Menu className="h-6 w-6" aria-hidden="true" />
                )}
              </button>
              <div className="hidden lg:flex items-center text-sm text-gray-500">
                <NavLink to="/" className="hover:text-teal-600 transition-colors">
                  <Home className="h-4 w-4" />
                </NavLink>
                <ChevronRight className="h-4 w-4 mx-2" />
                <span className="font-medium text-gray-900">{getCurrentPageTitle()}</span>
              </div>
              <h1 className="text-xl font-semibold text-gray-900 lg:hidden ml-3">{getCurrentPageTitle()}</h1>
            </div>

            <div className="flex items-center space-x-4">
              <NavLink
                to="/Dashboard/settings"
                className="p-2 text-gray-500 hover:text-teal-600 hover:bg-gray-100 rounded-full transition-colors"
              >
                <Settings className="h-5 w-5" />
              </NavLink>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gradient-to-br from-slate-50 to-gray-100">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Overlay for mobile */}
      {isMobile && isSidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black bg-opacity-50 backdrop-blur-sm lg:hidden"
          onClick={toggleSidebar}
        ></div>
      )}
    </div>
  )
}

function Link({ href, icon, children }) {
  return (
    <NavLink
      to={`/Dashboard/${href}`}
      className={({ isActive }) =>
        `flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
          isActive
            ? "text-teal-600 bg-teal-50 border-l-4 border-teal-600"
            : "text-gray-700 hover:bg-gray-100 hover:text-teal-600"
        }`
      }
      end={href === "Dashboard"}
    >
      <span className={`mr-3 ${(isActive) => (isActive ? "text-teal-600" : "text-gray-500")}`}>{icon}</span>
      <span>{children}</span>
    </NavLink>
  )
}
