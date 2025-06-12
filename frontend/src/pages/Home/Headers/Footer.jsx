"use client"

import { useState } from "react"
import { NavLink } from "react-router-dom"
import { Facebook, Instagram, Linkedin, Mail, MapPin, Phone, Twitter, Send } from "lucide-react"

const Footer = () => {
  const [email, setEmail] = useState("")
  const currentYear = new Date().getFullYear()

  const handleNewsletterSubmit = (e) => {
    e.preventDefault()
    // Handle newsletter subscription
    console.log("Newsletter subscription:", email)
    setEmail("")
  }

  return (
    <footer className="bg-gray-900 text-gray-200">
      {/* Main Footer Content */}
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-white">VenueVerse</h3>
            <p className="text-sm text-gray-400 max-w-xs leading-relaxed">
              Discover and book the perfect venue for your events. From intimate gatherings to grand celebrations, we
              connect you with spaces that inspire.
            </p>
            <div className="flex space-x-4 pt-2">
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors duration-200 p-2 hover:bg-gray-800 rounded-full"
                aria-label="Facebook"
              >
                <Facebook size={20} />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors duration-200 p-2 hover:bg-gray-800 rounded-full"
                aria-label="Twitter"
              >
                <Twitter size={20} />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors duration-200 p-2 hover:bg-gray-800 rounded-full"
                aria-label="Instagram"
              >
                <Instagram size={20} />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors duration-200 p-2 hover:bg-gray-800 rounded-full"
                aria-label="LinkedIn"
              >
                <Linkedin size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white">Quick Links</h4>
            <ul className="space-y-3">
              <li>
                <NavLink to="/" className="text-gray-400 hover:text-white transition-colors duration-200 text-sm">
                  Home
                </NavLink>
              </li>
              <li>
                <NavLink to="/venues" className="text-gray-400 hover:text-white transition-colors duration-200 text-sm">
                  Browse Venues
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/how-it-works"
                  className="text-gray-400 hover:text-white transition-colors duration-200 text-sm"
                >
                  How It Works
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/pricing"
                  className="text-gray-400 hover:text-white transition-colors duration-200 text-sm"
                >
                  Pricing
                </NavLink>
              </li>
              <li>
                <NavLink to="/blog" className="text-gray-400 hover:text-white transition-colors duration-200 text-sm">
                  Blog
                </NavLink>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white">Support</h4>
            <ul className="space-y-3">
              <li>
                <NavLink to="/help" className="text-gray-400 hover:text-white transition-colors duration-200 text-sm">
                  Help Center
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/contact"
                  className="text-gray-400 hover:text-white transition-colors duration-200 text-sm"
                >
                  Contact Us
                </NavLink>
              </li>
              <li>
                <NavLink to="/terms" className="text-gray-400 hover:text-white transition-colors duration-200 text-sm">
                  Terms of Service
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/privacy"
                  className="text-gray-400 hover:text-white transition-colors duration-200 text-sm"
                >
                  Privacy Policy
                </NavLink>
              </li>
              <li>
                <NavLink to="/faq" className="text-gray-400 hover:text-white transition-colors duration-200 text-sm">
                  FAQ
                </NavLink>
              </li>
            </ul>
          </div>

          {/* Newsletter & Contact */}
          <div className="space-y-6">
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-white">Stay Updated</h4>
              <p className="text-sm text-gray-400 leading-relaxed">
                Subscribe to our newsletter for the latest venues and event planning tips.
              </p>
              <form onSubmit={handleNewsletterSubmit} className="space-y-3">
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
                >
                  <Send size={16} />
                  Subscribe
                </button>
              </form>
            </div>

            {/* Contact Info */}
            <div className="space-y-3 pt-4 border-t border-gray-800">
              <h5 className="text-sm font-semibold text-white">Contact Info</h5>
              <div className="space-y-2">
                <div className="flex items-center gap-3 text-sm text-gray-400">
                  <Phone size={16} className="flex-shrink-0" />
                  <span>(123) 456-7890</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-400">
                  <Mail size={16} className="flex-shrink-0" />
                  <span>contact@venueverse.com</span>
                </div>
                <div className="flex items-start gap-3 text-sm text-gray-400">
                  <MapPin size={16} className="mt-1 flex-shrink-0" />
                  <span>
                    123 Venue Street, Suite 100
                    <br />
                    San Francisco, CA 94103
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="container mx-auto px-6 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-sm text-gray-500">© {currentYear} VenueVerse. All rights reserved.</p>
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm">
              <NavLink to="/terms" className="text-gray-500 hover:text-white transition-colors duration-200">
                Terms
              </NavLink>
              <NavLink to="/privacy" className="text-gray-500 hover:text-white transition-colors duration-200">
                Privacy
              </NavLink>
              <NavLink to="/cookies" className="text-gray-500 hover:text-white transition-colors duration-200">
                Cookies
              </NavLink>
              <NavLink to="/accessibility" className="text-gray-500 hover:text-white transition-colors duration-200">
                Accessibility
              </NavLink>
              <NavLink to="/sitemap" className="text-gray-500 hover:text-white transition-colors duration-200">
                Sitemap
              </NavLink>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
