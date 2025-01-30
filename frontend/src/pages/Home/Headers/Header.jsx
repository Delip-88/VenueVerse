import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
const Header = () => {
    const navigate = useNavigate()
  return (
    <header className="bg-blue-100 shadow-sm sticky">
      <nav className="container mx-auto px-6 py-3">
        <div className="flex justify-between items-center">
          <div className="text-xl font-bold text-gray-800">VenueBook</div>
          <div className="hidden md:flex space-x-4">
            <NavLink
              to="/"
              className={({ isActive }) =>
                isActive ? 'text-blue-600 font-semibold' : 'text-gray-600 hover:text-gray-800'
              }
            >
              Home
            </NavLink>
            <NavLink
              to="/Venues"
              className={({ isActive }) =>
                isActive ? 'text-blue-600 font-semibold' : 'text-gray-600 hover:text-gray-800'
              }
            >
              Venues
            </NavLink>
            <NavLink
              to="/How-it-works"
              className={({ isActive }) =>
                isActive ? 'text-blue-600 font-semibold' : 'text-gray-600 hover:text-gray-800'
              }
            >
              How It Works
            </NavLink>
            <NavLink
              to="/Contact"
              className={({ isActive }) =>
                isActive ? 'text-blue-600 font-semibold' : 'text-gray-600 hover:text-gray-800'
              }
            >
              Contact
            </NavLink>
          </div>
          <div className="flex space-x-2">
            <button className="px-4 py-2 text-gray-600 hover:text-gray-800 cursor-pointer" onClick={()=>navigate('/Login')}>Log In</button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 cursor-pointer" onClick={()=>navigate('/Signup')}>Sign Up</button>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;
