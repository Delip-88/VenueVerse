import React, { useState } from "react"
import { Save, AlertCircle } from "lucide-react"

export default function SettingsPage() {
  const [personalInfo, setPersonalInfo] = useState({
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@example.com",
    phone: "+1 (555) 123-4567",
  })

  const [security, setSecurity] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    smsNotifications: false,
    marketingEmails: true,
  })

  const [paymentInfo, setPaymentInfo] = useState({
    cardNumber: "**** **** **** 1234",
    expiryDate: "12/24",
    cvv: "",
  })

  const [errors, setErrors] = useState({})

  const handlePersonalInfoChange = (e) => {
    setPersonalInfo({ ...personalInfo, [e.target.name]: e.target.value })
  }

  const handleSecurityChange = (e) => {
    setSecurity({ ...security, [e.target.name]: e.target.value })
  }

  const handleNotificationChange = (e) => {
    setNotifications({ ...notifications, [e.target.name]: e.target.checked })
  }

  const handlePaymentInfoChange = (e) => {
    setPaymentInfo({ ...paymentInfo, [e.target.name]: e.target.value })
  }

  const validateForm = () => {
    const formErrors = {}

    // Validate personal info
    if (!personalInfo.firstName.trim()) formErrors.firstName = "First name is required"
    if (!personalInfo.lastName.trim()) formErrors.lastName = "Last name is required"
    if (!personalInfo.email.trim()) formErrors.email = "Email is required"
    else if (!/\S+@\S+\.\S+/.test(personalInfo.email)) formErrors.email = "Email is invalid"
    if (!personalInfo.phone.trim()) formErrors.phone = "Phone number is required"

    // Validate password change
    if (security.newPassword && security.newPassword.length < 8) {
      formErrors.newPassword = "Password must be at least 8 characters long"
    }
    if (security.newPassword !== security.confirmPassword) {
      formErrors.confirmPassword = "Passwords do not match"
    }

    // Validate payment info
    if (paymentInfo.cvv && !/^\d{3,4}$/.test(paymentInfo.cvv)) {
      formErrors.cvv = "CVV must be 3 or 4 digits"
    }

    setErrors(formErrors)
    return Object.keys(formErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (validateForm()) {
      // Here you would typically send the updated data to your backend
      console.log("Form submitted:", { personalInfo, security, notifications, paymentInfo })
      alert("Settings updated successfully!")
    } else {
      console.log("Form has errors")
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Account Settings</h1>
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Personal Information */}
        <section aria-labelledby="personal-info-heading">
          <h2 id="personal-info-heading" className="text-xl font-semibold mb-4">
            Personal Information
          </h2>
          <div className="grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-4">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                First name
              </label>
              <input
                type="text"
                name="firstName"
                id="firstName"
                value={personalInfo.firstName}
                onChange={handlePersonalInfoChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
              {errors.firstName && <p className="mt-2 text-sm text-red-600">{errors.firstName}</p>}
            </div>
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                Last name
              </label>
              <input
                type="text"
                name="lastName"
                id="lastName"
                value={personalInfo.lastName}
                onChange={handlePersonalInfoChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
              {errors.lastName && <p className="mt-2 text-sm text-red-600">{errors.lastName}</p>}
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <input
                type="email"
                name="email"
                id="email"
                value={personalInfo.email}
                onChange={handlePersonalInfoChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
              {errors.email && <p className="mt-2 text-sm text-red-600">{errors.email}</p>}
            </div>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                Phone number
              </label>
              <input
                type="tel"
                name="phone"
                id="phone"
                value={personalInfo.phone}
                onChange={handlePersonalInfoChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
              {errors.phone && <p className="mt-2 text-sm text-red-600">{errors.phone}</p>}
            </div>
          </div>
        </section>

        {/* Security Settings */}
        <section aria-labelledby="security-heading">
          <h2 id="security-heading" className="text-xl font-semibold mb-4">
            Security
          </h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">
                Current password
              </label>
              <input
                type="password"
                name="currentPassword"
                id="currentPassword"
                value={security.currentPassword}
                onChange={handleSecurityChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                New password
              </label>
              <input
                type="password"
                name="newPassword"
                id="newPassword"
                value={security.newPassword}
                onChange={handleSecurityChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
              {errors.newPassword && <p className="mt-2 text-sm text-red-600">{errors.newPassword}</p>}
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirm new password
              </label>
              <input
                type="password"
                name="confirmPassword"
                id="confirmPassword"
                value={security.confirmPassword}
                onChange={handleSecurityChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
              {errors.confirmPassword && <p className="mt-2 text-sm text-red-600">{errors.confirmPassword}</p>}
            </div>
          </div>
        </section>

        {/* Notification Preferences */}
        <section aria-labelledby="notifications-heading">
          <h2 id="notifications-heading" className="text-xl font-semibold mb-4">
            Notification Preferences
          </h2>
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="emailNotifications"
                  name="emailNotifications"
                  type="checkbox"
                  checked={notifications.emailNotifications}
                  onChange={handleNotificationChange}
                  className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="emailNotifications" className="font-medium text-gray-700">
                  Email notifications
                </label>
                <p className="text-gray-500">Receive email notifications about your account and bookings.</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="smsNotifications"
                  name="smsNotifications"
                  type="checkbox"
                  checked={notifications.smsNotifications}
                  onChange={handleNotificationChange}
                  className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="smsNotifications" className="font-medium text-gray-700">
                  SMS notifications
                </label>
                <p className="text-gray-500">Receive text message notifications about your bookings.</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="marketingEmails"
                  name="marketingEmails"
                  type="checkbox"
                  checked={notifications.marketingEmails}
                  onChange={handleNotificationChange}
                  className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="marketingEmails" className="font-medium text-gray-700">
                  Marketing emails
                </label>
                <p className="text-gray-500">Receive emails about new features, promotions, and news.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Payment Information */}
        <section aria-labelledby="payment-heading">
          <h2 id="payment-heading" className="text-xl font-semibold mb-4">
            Payment Information
          </h2>
          <div className="grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-4">
            <div>
              <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700">
                Card number
              </label>
              <input
                type="text"
                name="cardNumber"
                id="cardNumber"
                value={paymentInfo.cardNumber}
                onChange={handlePaymentInfoChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="**** **** **** ****"
              />
            </div>
            <div>
              <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700">
                Expiry date
              </label>
              <input
                type="text"
                name="expiryDate"
                id="expiryDate"
                value={paymentInfo.expiryDate}
                onChange={handlePaymentInfoChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="MM/YY"
              />
            </div>
            <div>
              <label htmlFor="cvv" className="block text-sm font-medium text-gray-700">
                CVV
              </label>
              <input
                type="text"
                name="cvv"
                id="cvv"
                value={paymentInfo.cvv}
                onChange={handlePaymentInfoChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="***"
              />
              {errors.cvv && <p className="mt-2 text-sm text-red-600">{errors.cvv}</p>}
            </div>
          </div>
        </section>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Save className="h-5 w-5 mr-2" />
            Save Changes
          </button>
        </div>
      </form>
    </div>
  )
}

