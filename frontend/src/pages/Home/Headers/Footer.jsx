import React from "react";
import { NavLink } from "react-router-dom";

const Footer = () => {
  const d = new Date();
  
  return (
    <footer className="bg-gray-800 text-white py-8">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <h3 className="text-xl font-bold">VenueVerse</h3>
            <p className="text-sm">© {d.getFullYear()} VenueVerse. All rights reserved.</p>
          </div>
          <div className="flex space-x-4">
            <NavLink to="#" className="hover:text-gray-300">
              Terms
            </NavLink>
            <NavLink to="#" className="hover:text-gray-300">
              Privacy
            </NavLink>
            <NavLink to="Contact" className="hover:text-gray-300">
              Contact
            </NavLink>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
