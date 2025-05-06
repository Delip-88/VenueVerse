import { useState } from "react";
import { MapPin, Phone, Mail, Send, Facebook, Twitter, Instagram } from "lucide-react";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would typically send the form data to your backend
    console.log("Form submitted:", formData);
    // Reset form after submission
    setFormData({ name: "", email: "", subject: "", message: "" });
    alert("Thank you for your message. We will get back to you soon!");
  };

  return (
    <div className="min-h-screen bg-lime-50"> {/* Light lime background */}
      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <h1 className="text-4xl font-bold text-center mb-12 text-lime-700">Get in Touch</h1> {/* Teal title */}

        <div className="grid md:grid-cols-2 gap-8">
          {/* Contact Form */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold mb-6 text-teal-600">Send us a message</h2> {/* Teal form title */}
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="name" className="block text-gray-700 font-semibold mb-2">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500" /* Teal focus ring */
                  required
                />
              </div>
              <div className="mb-4">
                <label htmlFor="email" className="block text-gray-700 font-semibold mb-2">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"  /* Teal focus ring */
                  required
                />
              </div>
              <div className="mb-4">
                <label htmlFor="subject" className="block text-gray-700 font-semibold mb-2">
                  Subject <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"  /* Teal focus ring */
                  required
                />
              </div>
              <div className="mb-4">
                <label htmlFor="message" className="block text-gray-700 font-semibold mb-2">
                  Message <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"  /* Teal focus ring */
                  required
                ></textarea>
              </div>
              <button
                type="submit"
                className="w-full bg-teal-600 text-white py-2 px-4 rounded-md hover:bg-teal-700 transition duration-300 flex items-center justify-center" /* Teal button */
              >
                <Send className="w-5 h-5 mr-2" />
                Send Message
              </button>
            </form>
          </div>

          {/* Contact Information */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold mb-6 text-teal-600">Contact Information</h2> {/* Teal info title */}
            <div className="space-y-4">
              <div className="flex items-start">
                <MapPin className="w-6 h-6 text-teal-600 mr-4 mt-1" /> {/* Teal icon */}
                <div>
                  <h3 className="font-semibold text-lime-700">Address</h3> {/* Lime address title */}
                  <p className="text-gray-600">123 Venue Street, Cityville, State 12345, Country</p>
                </div>
              </div>
              <div className="flex items-center">
                <Phone className="w-6 h-6 text-teal-600 mr-4" /> {/* Teal icon */}
                <div>
                  <h3 className="font-semibold text-lime-700">Phone</h3> {/* Lime phone title */}
                  <p className="text-gray-600">+1 (555) 123-4567</p>
                </div>
              </div>
              <div className="flex items-center">
                <Mail className="w-6 h-6 text-teal-600 mr-4" /> {/* Teal icon */}
                <div>
                  <h3 className="font-semibold text-lime-700">Email</h3> {/* Lime email title */}
                  <p className="text-gray-600">contact@venuebook.com</p>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <h3 className="text-xl font-semibold mb-4 text-lime-700">Office Hours</h3> {/* Lime office hours title */}
              <ul className="space-y-2 text-gray-600">
                <li>Monday - Friday: 9:00 AM - 6:00 PM</li>
                <li>Saturday: 10:00 AM - 4:00 PM</li>
                <li>Sunday: Closed</li>
              </ul>
            </div>

            <div className="mt-8">
              <h3 className="text-xl font-semibold mb-4 text-lime-700">Follow Us</h3> {/* Lime follow us title */}
              <div className="flex space-x-4">
                <a href="#" className="text-gray-600 hover:text-blue-600 transition-colors">
                  <Facebook className="w-6 h-6" />
                </a>
                <a href="#" className="text-gray-600 hover:text-blue-400 transition-colors">
                  <Twitter className="w-6 h-6" />
                </a>
                <a href="#" className="text-gray-600 hover:text-pink-600 transition-colors">
                  <Instagram className="w-6 h-6" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}