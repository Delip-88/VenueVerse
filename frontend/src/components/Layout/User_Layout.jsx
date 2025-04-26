import { useContext, useState } from "react"
import { LogOut, Home, Calendar, Star, Settings, Menu, X } from "lucide-react"
import { NavLink, Outlet, useNavigate } from "react-router-dom"
import { AuthContext } from "../../middleware/AuthContext"
import Loader from "../../pages/common/Loader"
import getOptimizedCloudinaryUrl from "../Functions/OptimizedImageUrl"

const User_Layout = () => {
  const {user,logout,loading} = useContext(AuthContext)
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  if(loading) return <Loader/>

  const handleLogout = async () => {
    const confirmed = window.confirm("Are you sure?");
    if (!confirmed) return;
  
    logout();
    setTimeout(() => {
      window.location.href = "/";
    }, 200);
  };
  

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div
        className={`bg-white w-64 shadow-lg fixed h-full z-20 transition-transform duration-300 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0`} 
      >
        <div className="p-4 flex flex-col h-full">
          <div className="flex justify-center items-center">
            <h2 className="text-2xl font-semibold text-gray-800">
              <a href={"/Home"} ><img
                className="h-9 w-auto rounded-full overflow-hidden"
                src={getOptimizedCloudinaryUrl("https://res.cloudinary.com/dduky37gb/image/upload/v1741271326/VenueVerse/ffq6gdhll1xnbzjaqwnn.png")}
                alt="VenueVerse Logo"
                /></a>
            </h2>
            <button onClick={toggleSidebar} className="md:hidden text-gray-500 hover:text-gray-700 ml-10">
              <X size={24} />
            </button>
          </div>
          <nav className="mt-8 flex-grow">
            <NavLink
              to="/Home"
              end
              className={({ isActive }) =>
                isActive
                  ? "flex items-center py-2 px-4 text-blue-500 hover:bg-gray-200 rounded"
                  : "flex items-center py-2 px-4 text-gray-700 hover:bg-gray-200 rounded"
              }
            >
              <Home className="mr-3" size={20} />
              Home
            </NavLink>
            <NavLink
              to="/Home/my-bookings"
              className={({ isActive }) =>
                isActive
                  ? "flex items-center py-2 px-4 text-blue-500 hover:bg-gray-200 rounded"
                  : "flex items-center py-2 px-4 text-gray-700 hover:bg-gray-200 rounded"
              }
            >
              <Calendar className="mr-3" size={20} />
              My Bookings
            </NavLink>
            <NavLink
              to="/Home/favorites"
              className={({ isActive }) =>
                isActive
                  ? "flex items-center py-2 px-4 text-blue-500 hover:bg-gray-200 rounded"
                  : "flex items-center py-2 px-4 text-gray-700 hover:bg-gray-200 rounded"
              }
            >
              <Star className="mr-3" size={20} />
              Favorites
            </NavLink>
            <NavLink
              to="/Home/settings"
              className={({ isActive }) =>
                isActive
                  ? "flex items-center py-2 px-4 text-blue-500 hover:bg-gray-200 rounded"
                  : "flex items-center py-2 px-4 text-gray-700 hover:bg-gray-200 rounded"
              }
            >
              <Settings className="mr-3" size={20} />
              Settings
            </NavLink>
          </nav>
          <div className="mt-auto flex items-center p-4 border-t">
            <img src="https://picsum.photos/200" alt="User Avatar" className="w-10 h-10 rounded-full mr-3" />
            <div>
              <p className="text-gray-800 font-medium">{user && user.name}</p>
              <button className="flex items-center text-gray-700 hover:text-gray-900 mt-1 cursor-pointer" onClick={handleLogout}>
                <LogOut className="mr-2 " size={20} />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden md:ml-64">
        {/* Top bar */}
        <header className="bg-gray-100 shadow-sm">
          <div className="flex items-center justify-between p-4">
            <button onClick={toggleSidebar} className="text-gray-500 hover:text-gray-700 md:hidden">
              <Menu size={24} />
            </button>
            <div className="flex-1 px-4">{/* You can add additional header content here if needed */}</div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100">
          <div className="container mx-auto px-6 py-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}

export default User_Layout

