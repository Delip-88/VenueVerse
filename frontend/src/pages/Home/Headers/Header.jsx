import { useContext, useState } from "react"
import { NavLink, useNavigate } from "react-router-dom"
import { Menu, UserCircle, X } from "lucide-react"
import { AuthContext } from "../../../middleware/AuthContext"

const Header = () => {
  const navigate = useNavigate()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const {isAuthenticated, user} = useContext(AuthContext)

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const closeMenu = () => {
    setIsMenuOpen(false)
  }

  return (
    <header className="bg-blue-100 shadow-sm sticky top-0 z-50">
      <nav className="container mx-auto px-6 py-3">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <div className="text-xl font-bold text-gray-800">
            <a href="/">VenueVerse</a>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-4">
            <NavLink
              to="/"
              className={({ isActive }) =>
                isActive ? "text-blue-600 font-semibold" : "text-gray-600 hover:text-gray-800"
              }
            >
              Home
            </NavLink>
            <NavLink
              to="/Venues"
              className={({ isActive }) =>
                isActive ? "text-blue-600 font-semibold" : "text-gray-600 hover:text-gray-800"
              }
            >
              Venues
            </NavLink>
            <NavLink
              to="/How-it-works"
              className={({ isActive }) =>
                isActive ? "text-blue-600 font-semibold" : "text-gray-600 hover:text-gray-800"
              }
            >
              How It Works
            </NavLink>
            <NavLink
              to="/Contact"
              className={({ isActive }) =>
                isActive ? "text-blue-600 font-semibold" : "text-gray-600 hover:text-gray-800"
              }
            >
              Contact
            </NavLink>
          </div>

          {/* Desktop Auth Buttons */}
     {/* Desktop Auth */}
     <div className="hidden md:flex space-x-2">
          {isAuthenticated && user ? (
            <button
              className="px-4 py-2 bg-blue-50 hover:text-blue-600  rounded hover:bg-blue-100 cursor-pointer font-medium"
              onClick={() => navigate("/Home")}
            >
              <UserCircle className="inline-block mr-2" size={20} />

              {user.name}
            </button>
          ) : (
            <>
              <button
                className="px-4 py-2 text-gray-600 hover:text-gray-800 cursor-pointer"
                onClick={() => navigate("/Login")}
              >
                Log In
              </button>
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 cursor-pointer"
                onClick={() => navigate("/Signup")}
              >
                Sign Up
              </button>
            </>
          )}
        </div>


          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-blue-200 transition-colors"
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        <div
          className={`md:hidden ${
            isMenuOpen ? "max-h-screen opacity-100" : "max-h-0 opacity-0"
          } overflow-hidden transition-all duration-300 ease-in-out`}
        >
          <div className="pt-4 pb-3 space-y-3">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `block px-2 py-2 rounded-lg transition-colors ${
                  isActive
                    ? "text-blue-600 font-semibold bg-blue-50"
                    : "text-gray-600 hover:text-gray-800 hover:bg-blue-50"
                }`
              }
              onClick={closeMenu}
            >
              Home
            </NavLink>
            <NavLink
              to="/Venues"
              className={({ isActive }) =>
                `block px-2 py-2 rounded-lg transition-colors ${
                  isActive
                    ? "text-blue-600 font-semibold bg-blue-50"
                    : "text-gray-600 hover:text-gray-800 hover:bg-blue-50"
                }`
              }
              onClick={closeMenu}
            >
              Venues
            </NavLink>
            <NavLink
              to="/How-it-works"
              className={({ isActive }) =>
                `block px-2 py-2 rounded-lg transition-colors ${
                  isActive
                    ? "text-blue-600 font-semibold bg-blue-50"
                    : "text-gray-600 hover:text-gray-800 hover:bg-blue-50"
                }`
              }
              onClick={closeMenu}
            >
              How It Works
            </NavLink>
            <NavLink
              to="/Contact"
              className={({ isActive }) =>
                `block px-2 py-2 rounded-lg transition-colors ${
                  isActive
                    ? "text-blue-600 font-semibold bg-blue-50"
                    : "text-gray-600 hover:text-gray-800 hover:bg-blue-50"
                }`
              }
              onClick={closeMenu}
            >
              Contact
            </NavLink>

            {/* Mobile Auth Buttons */}
   {/* Mobile Auth */}
   <div className="grid grid-cols-2 gap-2 pt-2">
              {isAuthenticated && user ? (
                <button
                  className="col-span-2 px-4 py-2 cursor-pointer bg-blue-50 hover:text-blue-600 rounded hover:bg-blue-100 transition-colors font-medium"
                  onClick={() => {
                    navigate("/Home")
                    closeMenu()
                  }}
                >
                  <UserCircle className="inline-block mr-2" size={20} />
                  {user.name}
                </button>
              ) : (
                <>
                  <button
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                    onClick={() => {
                      navigate("/Login")
                      closeMenu()
                    }}
                  >
                    Log In
                  </button>
                  <button
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                    onClick={() => {
                      navigate("/Signup")
                      closeMenu()
                    }}
                  >
                    Sign Up
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>
    </header>
  )
}

export default Header

