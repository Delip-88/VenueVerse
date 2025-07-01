"use client"

import { useContext, useState } from "react"
import { useMutation } from "@apollo/client"
import { AuthContext } from "../../middleware/AuthContext"
import { Link, useNavigate } from "react-router-dom"
import { LOGIN_USER } from "../../components/Graphql/mutations/AuthGql"
import { Mail, Lock, Eye, EyeOff, AlertCircle, LogIn, CheckCircle2, DoorClosed, DoorOpenIcon, DoorOpen } from "lucide-react"

const AdminLogin = () => {
  const { login } = useContext(AuthContext)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState({})
  const [fieldTouched, setFieldTouched] = useState({})
  const [loading, setLoading] = useState(false)
  const [generalError, setGeneralError] = useState(null)
  const navigate = useNavigate()

  const [LOGIN] = useMutation(LOGIN_USER, {
    onCompleted: async (data) => {
      setLoading(false)
      const token = data?.login
      if (token) {
        // Decode JWT to get user role
        const payload = JSON.parse(atob(token.split('.')[1]))
        if (payload.role === "Admin") {
          await login(token)
          window.location.href = "/super-admin"
        } else {
          setGeneralError("Incorrect credentials. Admin access only.")
        }
      } else {
        setGeneralError("Login failed. Please check your credentials.")
      }
    },
    onError: (error) => {
      setLoading(false)
      setGeneralError("Login failed. Please check your credentials.")
    },
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Mark field as touched
    setFieldTouched((prev) => ({ ...prev, [name]: true }))

    // Clear errors for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }))
    }

    // Clear general error when user makes changes
    if (generalError) {
      setGeneralError(null)
    }
  }

  const handleBlur = (fieldName) => {
    setFieldTouched((prev) => ({ ...prev, [fieldName]: true }))
    validateField(fieldName, formData[fieldName])
  }

  const validateField = (fieldName, value) => {
    const newErrors = { ...errors }

    switch (fieldName) {
      case "email":
        if (!value.trim()) {
          newErrors.email = "Email address is required"
        } else if (!/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value)) {
          newErrors.email = "Please enter a valid email address"
        } else {
          delete newErrors.email
        }
        break

      case "password":
        if (!value) {
          newErrors.password = "Password is required"
        } else {
          delete newErrors.password
        }
        break

      default:
        break
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateForm = () => {
    const fields = ["email", "password"]
    let isValid = true

    fields.forEach((field) => {
      const fieldValid = validateField(field, formData[field])
      if (!fieldValid) isValid = false
      setFieldTouched((prev) => ({ ...prev, [field]: true }))
    })

    return isValid
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setGeneralError(null)

    if (!validateForm()) {
      return
    }

    setLoading(true)
    try {
      await LOGIN({ variables: { email: formData.email, password: formData.password } })
    } catch (err) {
      console.error("Login error:", err)
      setLoading(false)
    }
  }

  const getFieldStatus = (fieldName) => {
    if (!fieldTouched[fieldName]) return "default"
    if (errors[fieldName]) return "error"
    if (formData[fieldName]) return "success"
    return "default"
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <div className="bg-teal-100 rounded-full p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <DoorClosed className="h-8 w-8 text-teal-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Admin Access Only</h2>
          <p className="text-gray-600">Sign in to the admin account</p>
        </div>
      </div>

      {/* Main Form */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-sm rounded-xl border border-gray-200 sm:px-10">
          {generalError && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-red-500 mr-3" />
                <p className="text-sm text-red-600">{generalError}</p>
              </div>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail
                    className={`h-5 w-5 ${
                      getFieldStatus("email") === "error"
                        ? "text-red-400"
                        : getFieldStatus("email") === "success"
                          ? "text-emerald-400"
                          : "text-gray-400"
                    }`}
                  />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className={`w-full pl-10 pr-10 py-3 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors ${
                    getFieldStatus("email") === "error"
                      ? "border-red-500 bg-red-50"
                      : getFieldStatus("email") === "success"
                        ? "border-emerald-500 bg-emerald-50"
                        : "border-gray-300"
                  }`}
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={() => handleBlur("email")}
                />
                {getFieldStatus("email") === "success" && (
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  </div>
                )}
              </div>
              {errors.email && fieldTouched.email && (
                <div className="mt-2 flex items-center text-sm text-red-600">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  {errors.email}
                </div>
              )}
            </div>

            {/* Password Field */}
            <div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock
                    className={`h-5 w-5 ${
                      getFieldStatus("password") === "error"
                        ? "text-red-400"
                        : getFieldStatus("password") === "success"
                          ? "text-emerald-400"
                          : "text-gray-400"
                    }`}
                  />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  className={`w-full pl-10 pr-10 py-3 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors ${
                    getFieldStatus("password") === "error"
                      ? "border-red-500 bg-red-50"
                      : getFieldStatus("password") === "success"
                        ? "border-emerald-500 bg-emerald-50"
                        : "border-gray-300"
                  }`}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={() => handleBlur("password")}
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-gray-400 hover:text-gray-500 focus:outline-none focus:text-gray-500"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
              {errors.password && fieldTouched.password && (
                <div className="mt-2 flex items-center text-sm text-red-600">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  {errors.password}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Signing in...
                  </>
                ) : (
                  <>
                    <DoorOpen className="h-5 w-5 mr-2 " />
                    Sign in
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <p className="text-xs text-gray-500">
            By signing in, you agree to our{" "}
            <a href="/terms" className="text-teal-600 hover:text-teal-500">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="/privacy" className="text-teal-600 hover:text-teal-500">
              Privacy Policy
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  )
}

export default AdminLogin
