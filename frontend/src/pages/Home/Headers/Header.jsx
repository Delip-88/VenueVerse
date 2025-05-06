import { useContext, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Menu, UserCircle, X } from "lucide-react";
import { AuthContext } from "../../../middleware/AuthContext";

const Header = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAuthenticated, user } = useContext(AuthContext);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <header className="bg-lime-100 shadow-md sticky top-0 z-50"> {/* Light lime background */}
      <nav className="container mx-auto px-6 py-3">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <div className="text-xl font-bold text-teal-800"> {/* Dark teal logo text */}
            <a href="/">VenueVerse</a>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-4">
            <NavLink
              to="/"
              className={({ isActive }) =>
                isActive ? "text-teal-600 font-semibold" : "text-gray-700 hover:text-teal-800" /* Teal active, gray hover */
              }
            >
              Home
            </NavLink>
            <NavLink
              to="/Venues"
              className={({ isActive }) =>
                isActive ? "text-teal-600 font-semibold" : "text-gray-700 hover:text-teal-800" /* Teal active, gray hover */
              }
            >
              Venues
            </NavLink>
            <NavLink
              to="/How-it-works"
              className={({ isActive }) =>
                isActive ? "text-teal-600 font-semibold" : "text-gray-700 hover:text-teal-800" /* Teal active, gray hover */
              }
            >
              How It Works
            </NavLink>
            <NavLink
              to="/Contact"
              className={({ isActive }) =>
                isActive ? "text-teal-600 font-semibold" : "text-gray-700 hover:text-teal-800" /* Teal active, gray hover */
              }
            >
              Contact
            </NavLink>
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex space-x-2">
            {isAuthenticated && user ? (
              <button
                className="px-4 py-2 bg-lime-50 hover:text-teal-600 rounded hover:bg-lime-100 cursor-pointer font-medium" /* Lime background, teal hover */
                onClick={() => navigate("/Home")}
              >
                <UserCircle className="inline-block mr-2 text-teal-500" size={20} /> {/* Teal user icon */}
                {user.name}
              </button>
            ) : (
              <>
                <button
                  className="px-4 py-2 text-gray-700 hover:text-teal-800 cursor-pointer" /* Gray text, teal hover */
                  onClick={() => navigate("/Login")}
                >
                  Log In
                </button>
                <button
                  className="px-4 py-2 bg-teal-600 text-white rounded hover:bg-teal-700 cursor-pointer" /* Teal button */
                  onClick={() => navigate("/Signup")}
                >
                  Sign Up
                </button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-lime-200 transition-colors text-teal-600" /* Light lime hover, teal icon */
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
          } overflow-hidden transition-all duration-300 ease-in-out bg-lime-100`} /* Light lime background */
        >
          <div className="pt-4 pb-3 space-y-3">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `block px-2 py-2 rounded-lg transition-colors ${
                  isActive
                    ? "text-teal-600 font-semibold bg-lime-50" /* Teal active, light lime bg */
                    : "text-gray-700 hover:text-teal-800 hover:bg-lime-50" /* Gray text, teal hover, light lime bg */
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
                    ? "text-teal-600 font-semibold bg-lime-50" /* Teal active, light lime bg */
                    : "text-gray-700 hover:text-teal-800 hover:bg-lime-50" /* Gray text, teal hover, light lime bg */
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
                    ? "text-teal-600 font-semibold bg-lime-50" /* Teal active, light lime bg */
                    : "text-gray-700 hover:text-teal-800 hover:bg-lime-50" /* Gray text, teal hover, light lime bg */
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
                    ? "text-teal-600 font-semibold bg-lime-50" /* Teal active, light lime bg */
                    : "text-gray-700 hover:text-teal-800 hover:bg-lime-50" /* Gray text, teal hover, light lime bg */
                }`
              }
              onClick={closeMenu}
            >
              Contact
            </NavLink>

            {/* Mobile Auth Buttons */}
            <div className="grid grid-cols-2 gap-2 pt-2">
              {isAuthenticated && user ? (
                <button
                  className="col-span-2 px-4 py-2 cursor-pointer bg-lime-50 hover:text-teal-600 rounded hover:bg-lime-100 transition-colors font-medium" /* Lime background, teal hover */
                  onClick={() => {
                    navigate("/Home");
                    closeMenu();
                  }}
                >
                  <UserCircle className="inline-block mr-2 text-teal-500" size={20} /> {/* Teal user icon */}
                  {user.name}
                </button>
              ) : (
                <>
                  <button
                    className="px-4 py-2 text-gray-700 hover:text-teal-800 border border-gray-300 rounded hover:bg-lime-50 transition-colors" /* Gray text, teal hover, light lime hover */
                    onClick={() => {
                      navigate("/Login");
                      closeMenu();
                    }}
                  >
                    Log In
                  </button>
                  <button
                    className="px-4 py-2 bg-teal-600 text-white rounded hover:bg-teal-700 transition-colors" /* Teal button */
                    onClick={() => {
                      navigate("/Signup");
                      closeMenu();
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
  );
};

export default Header;