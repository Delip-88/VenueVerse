"use client"

import { useState } from "react"
import { Mail, Phone, MessageCircle, ChevronDown, HelpCircle, Send, Clock, CheckCircle } from "lucide-react"

const VenueOwnerSupport = () => {
  const [openFaq, setOpenFaq] = useState(null)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  })

  const faqs = [
    {
      question: "How do I list my venue on the platform?",
      answer:
        "To list your venue, log in to your account, click on 'Add New Venue', and fill out the required information including venue details, photos, and availability.",
    },
    {
      question: "How do I manage my bookings?",
      answer:
        "You can manage your bookings through the 'Manage Bookings' page. Here, you can view pending and confirmed bookings, approve or reject requests, and communicate with customers.",
    },
    {
      question: "How do I set my venue's availability?",
      answer:
        "In your venue's settings, you can set regular opening hours and block out specific dates. You can also mark certain time slots as unavailable if needed.",
    },
    {
      question: "How do payouts work?",
      answer:
        "Payouts are processed automatically after each successful booking. The funds will be transferred to your linked bank account within 5-7 business days after the event date.",
    },
    {
      question: "What fees does the platform charge?",
      answer:
        "We charge a 10% commission on each booking. This fee covers payment processing, customer support, and platform maintenance. There are no upfront or monthly fees.",
    },
  ]

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // Here you would typically send the form data to your backend
    console.log("Form submitted:", formData)
    // Reset form after submission
    setFormData({ name: "", email: "", subject: "", message: "" })
    alert("Your support ticket has been submitted. We will get back to you soon!")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-cyan-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full mb-4">
            <HelpCircle className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Help & Support</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Get the help you need to manage your venues successfully
          </p>
        </div>

        {/* Quick Contact Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-xl shadow-lg border border-teal-100 p-6 hover:shadow-xl transition-all duration-300 hover:border-teal-200">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mr-4">
                <Mail className="w-6 h-6 text-teal-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Email Support</h3>
                <p className="text-sm text-gray-600">Get help via email</p>
              </div>
            </div>
            <p className="text-teal-600 font-medium">support@venueverse.com</p>
            <p className="text-sm text-gray-500 mt-2">Response within 24 hours</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg border border-teal-100 p-6 hover:shadow-xl transition-all duration-300 hover:border-teal-200">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mr-4">
                <Phone className="w-6 h-6 text-teal-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Phone Support</h3>
                <p className="text-sm text-gray-600">Call us directly</p>
              </div>
            </div>
            <p className="text-teal-600 font-medium">+1 (555) 123-4567</p>
            <p className="text-sm text-gray-500 mt-2">Mon-Fri, 9AM-6PM EST</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg border border-teal-100 p-6 hover:shadow-xl transition-all duration-300 hover:border-teal-200">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mr-4">
                <Clock className="w-6 h-6 text-teal-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Live Chat</h3>
                <p className="text-sm text-gray-600">Instant assistance</p>
              </div>
            </div>
            <button className="text-teal-600 font-medium hover:text-teal-700 transition-colors">Start Chat</button>
            <p className="text-sm text-gray-500 mt-2">Available 24/7</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* FAQ Section */}
          <div className="bg-white rounded-xl shadow-lg border border-teal-100 p-8">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center mr-3">
                <HelpCircle className="w-5 h-5 text-teal-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Frequently Asked Questions</h2>
            </div>

            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-lg transition-all duration-200 hover:border-teal-200"
                >
                  <button
                    className="flex justify-between items-center w-full p-4 text-left cursor-pointer hover:bg-teal-50 transition-colors rounded-lg"
                    onClick={() => toggleFaq(index)}
                  >
                    <span className="font-medium text-gray-900 pr-4">{faq.question}</span>
                    <div
                      className={`flex-shrink-0 transition-transform duration-200 ${openFaq === index ? "rotate-180" : ""}`}
                    >
                      <ChevronDown className="w-5 h-5 text-teal-600" />
                    </div>
                  </button>
                  {openFaq === index && (
                    <div className="px-4 pb-4">
                      <div className="bg-teal-50 rounded-lg p-4 border-l-4 border-teal-500">
                        <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Support Ticket Form */}
          <div className="bg-white rounded-xl shadow-lg border border-teal-100 p-8">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center mr-3">
                <MessageCircle className="w-5 h-5 text-teal-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Submit a Support Ticket</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                  placeholder="Enter your email address"
                />
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-semibold text-gray-700 mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                  placeholder="Brief description of your issue"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-semibold text-gray-700 mb-2">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                  rows="5"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors resize-none"
                  placeholder="Describe your issue in detail..."
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-teal-600 to-cyan-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-teal-700 hover:to-cyan-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 transition-all duration-200 flex items-center justify-center"
              >
                <Send className="w-5 h-5 mr-2" />
                Submit Support Ticket
              </button>
            </form>
          </div>
        </div>

        {/* Help Resources */}
        <div className="mt-12 bg-white rounded-xl shadow-lg border border-teal-100 p-8">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Additional Resources</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-teal-50 rounded-lg border border-teal-100">
              <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-6 h-6 text-teal-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Getting Started Guide</h4>
              <p className="text-sm text-gray-600 mb-4">Learn how to set up your venue and start accepting bookings</p>
              <button className="text-teal-600 font-medium hover:text-teal-700 transition-colors">View Guide →</button>
            </div>

            <div className="text-center p-6 bg-teal-50 rounded-lg border border-teal-100">
              <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="w-6 h-6 text-teal-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Video Tutorials</h4>
              <p className="text-sm text-gray-600 mb-4">Watch step-by-step tutorials for common tasks</p>
              <button className="text-teal-600 font-medium hover:text-teal-700 transition-colors">
                Watch Videos →
              </button>
            </div>

            <div className="text-center p-6 bg-teal-50 rounded-lg border border-teal-100">
              <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <HelpCircle className="w-6 h-6 text-teal-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Knowledge Base</h4>
              <p className="text-sm text-gray-600 mb-4">Browse our comprehensive help articles</p>
              <button className="text-teal-600 font-medium hover:text-teal-700 transition-colors">
                Browse Articles →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default VenueOwnerSupport
