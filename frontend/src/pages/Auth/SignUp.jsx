"use client"

import { useState, useEffect } from "react"
import { User, Mail, Lock, Eye, EyeOff, AlertCircle, Check, UserPlus, Shield, CheckCircle2 } from "lucide-react"
import { useMutation } from "@apollo/client"
import { REGISTER_USER } from "../../components/Graphql/mutations/AuthGql"
import { useNavigate } from "react-router-dom"
import toast from "react-hot-toast"

export default function SignUpPage() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [errors, setErrors] = useState({})
  const [fieldTouched, setFieldTouched] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    feedback: [],
    isValid: false,
  })

  const [register] = useMutation(REGISTER_USER)

  // Real-time password strength validation
  const validatePasswordStrength = (password) => {
    const feedback = []
    let score = 0

    // Length check
    if (password.length >= 8) {
      score += 1
      feedback.push({ type: "success", text: "At least 8 characters" })
    } else {
      feedback.push({ type: "error", text: "At least 8 characters required" })
    }

    // Uppercase check
    if (/[A-Z]/.test(password)) {
      score += 1
      feedback.push({ type: "success", text: "Contains uppercase letter" })
    } else {
      feedback.push({ type: "error", text: "Add uppercase letter" })
    }

    // Lowercase check
    if (/[a-z]/.test(password)) {
      score += 1
      feedback.push({ type: "success", text: "Contains lowercase letter" })
    } else {
      feedback.push({ type: "error", text: "Add lowercase letter" })
    }

    // Number check
    if (/\d/.test(password)) {
      score += 1
      feedback.push({ type: "success", text: "Contains number" })
    } else {
      feedback.push({ type: "error", text: "Add number" })
    }

    // Special character check
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      score += 1
      feedback.push({ type: "success", text: "Contains special character" })
    } else {
      feedback.push({ type: "error", text: "Add special character (!@#$%^&*)" })
    }

    return {
      score,
      feedback,
      isValid: score >= 4,
    }
  }

  // Update password strength when password changes
  useEffect(() => {
    if (formData.password) {
      setPasswordStrength(validatePasswordStrength(formData.password))
    } else {
      setPasswordStrength({ score: 0, feedback: [], isValid: false })
    }
  }, [formData.password])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }))

    // Mark field as touched
    setFieldTouched((prev) => ({ ...prev, [name]: true }))

    // Clear errors for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }))
    }
  }

  const handleBlur = (fieldName) => {
    setFieldTouched((prev) => ({ ...prev, [fieldName]: true }))
    validateField(fieldName, formData[fieldName])
  }

  const validateField = (fieldName, value) => {
    const newErrors = { ...errors }

    switch (fieldName) {
      case "name":
        if (!value.trim()) {
          newErrors.name = "Full name is required"
        } else if (value.trim().length < 2) {
          newErrors.name = "Name must be at least 2 characters"
        } else if (!/^[a-zA-Z\s]+$/.test(value.trim())) {
          newErrors.name = "Name can only contain letters and spaces"
        } else if (value.trim().length > 50) {
          newErrors.name = "Name must be less than 50 characters"
        } else {
          delete newErrors.name
        }
        break

      case "email":
        if (!value.trim()) {
          newErrors.email = "Email address is required"
        } else if (!/^[a-zA-Z][a-zA-Z0-9._-]*@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value)) {
          newErrors.email = "Please enter a valid email address (cannot start with number)"
        } else if (value.length > 100) {
          newErrors.email = "Email must be less than 100 characters"
        } else {
          delete newErrors.email
        }
        break

      case "password":
        if (!value) {
          newErrors.password = "Password is required"
        } else if (!passwordStrength.isValid) {
          newErrors.password = "Password does not meet security requirements"
        } else {
          delete newErrors.password
        }
        break

      case "confirmPassword":
        if (!value) {
          newErrors.confirmPassword = "Please confirm your password"
        } else if (value !== formData.password) {
          newErrors.confirmPassword = "Passwords do not match"
        } else {
          delete newErrors.confirmPassword
        }
        break

      default:
        break
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateForm = () => {
    const fields = ["name", "email", "password", "confirmPassword"]
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

    if (!validateForm()) {
      toast.error("Please fix the errors before submitting")
      return
    }

    setIsSubmitting(true)

    try {
      const { data } = await toast.promise(
        register({
          variables: {
            name: formData.name.trim(),
            email: formData.email.toLowerCase().trim(),
            password: formData.password,
          },
        }),
        {
          loading: "Creating your account...",
          success: (res) => res?.data?.register?.message || "Account created successfully!",
          error: (err) => err.message || "Failed to create account",
        },
      )

      const { success } = data?.register || {}
      if (success) {
        // Reset form
        setFormData({ name: "", email: "", password: "", confirmPassword: "" })
        setErrors({})
        setFieldTouched({})

        // Redirect after a short delay
        setTimeout(() => {
          navigate("/OTPVerification", {
            state: { email: formData.email.toLowerCase().trim() },
          })
        }, 500)
      }
    } catch (err) {
      console.error("Registration error:", err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const getFieldStatus = (fieldName) => {
    if (!fieldTouched[fieldName]) return "default"
    if (errors[fieldName]) return "error"
    if (formData[fieldName]) return "success"
    return "default"
  }

  const getPasswordStrengthColor = () => {
    if (passwordStrength.score <= 1) return "bg-red-500"
    if (passwordStrength.score <= 2) return "bg-orange-500"
    if (passwordStrength.score <= 3) return "bg-yellow-500"
    if (passwordStrength.score <= 4) return "bg-emerald-500"
    return "bg-emerald-600"
  }

  const getPasswordStrengthText = () => {
    if (passwordStrength.score <= 1) return "Weak"
    if (passwordStrength.score <= 2) return "Fair"
    if (passwordStrength.score <= 3) return "Good"
    if (passwordStrength.score <= 4) return "Strong"
    return "Very Strong"
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <div className="bg-teal-100 rounded-full p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <UserPlus className="h-8 w-8 text-teal-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Create Your Account</h2>
          <p className="text-gray-600">Join VenueVerse and start discovering amazing venues</p>
        </div>
      </div>

      {/* Main Form */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-sm rounded-xl border border-gray-200 sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Full Name Field */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Full Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User
                    className={`h-5 w-5 ${
                      getFieldStatus("name") === "error"
                        ? "text-red-400"
                        : getFieldStatus("name") === "success"
                          ? "text-emerald-400"
                          : "text-gray-400"
                    }`}
                  />
                </div>
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  className={`w-full pl-10 pr-10 py-3 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors ${
                    getFieldStatus("name") === "error"
                      ? "border-red-500 bg-red-50"
                      : getFieldStatus("name") === "success"
                        ? "border-emerald-500 bg-emerald-50"
                        : "border-gray-300"
                  }`}
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleChange}
                  onBlur={() => handleBlur("name")}
                />
                {getFieldStatus("name") === "success" && (
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  </div>
                )}
              </div>
              {errors.name && fieldTouched.name && (
                <div className="mt-2 flex items-center text-sm text-red-600">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  {errors.name}
                </div>
              )}
            </div>

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
              <p className="mt-1 text-xs text-gray-500">Email cannot start with a number</p>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password <span className="text-red-500">*</span>
              </label>
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
                  autoComplete="new-password"
                  required
                  className={`w-full pl-10 pr-10 py-3 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors ${
                    getFieldStatus("password") === "error"
                      ? "border-red-500 bg-red-50"
                      : getFieldStatus("password") === "success"
                        ? "border-emerald-500 bg-emerald-50"
                        : "border-gray-300"
                  }`}
                  placeholder="Create a strong password"
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

              {/* Password Strength Indicator */}
              {formData.password && (
                <div className="mt-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-gray-700">Password Strength</span>
                    <span
                      className={`text-xs font-medium ${
                        passwordStrength.score <= 2
                          ? "text-red-600"
                          : passwordStrength.score <= 3
                            ? "text-yellow-600"
                            : "text-emerald-600"
                      }`}
                    >
                      {getPasswordStrengthText()}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrengthColor()}`}
                      style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                    ></div>
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-1 text-xs">
                    {passwordStrength.feedback.map((item, index) => (
                      <div
                        key={index}
                        className={`flex items-center ${
                          item.type === "success" ? "text-emerald-600" : "text-gray-500"
                        }`}
                      >
                        {item.type === "success" ? (
                          <Check className="h-3 w-3 mr-1" />
                        ) : (
                          <div className="h-3 w-3 mr-1 rounded-full border border-gray-300"></div>
                        )}
                        <span>{item.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {errors.password && fieldTouched.password && (
                <div className="mt-2 flex items-center text-sm text-red-600">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  {errors.password}
                </div>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Shield
                    className={`h-5 w-5 ${
                      getFieldStatus("confirmPassword") === "error"
                        ? "text-red-400"
                        : getFieldStatus("confirmPassword") === "success"
                          ? "text-emerald-400"
                          : "text-gray-400"
                    }`}
                  />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  className={`w-full pl-10 pr-10 py-3 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors ${
                    getFieldStatus("confirmPassword") === "error"
                      ? "border-red-500 bg-red-50"
                      : getFieldStatus("confirmPassword") === "success"
                        ? "border-emerald-500 bg-emerald-50"
                        : "border-gray-300"
                  }`}
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  onBlur={() => handleBlur("confirmPassword")}
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="text-gray-400 hover:text-gray-500 focus:outline-none focus:text-gray-500"
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
              {errors.confirmPassword && fieldTouched.confirmPassword && (
                <div className="mt-2 flex items-center text-sm text-red-600">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  {errors.confirmPassword}
                </div>
              )}
              {formData.confirmPassword && formData.password === formData.confirmPassword && (
                <div className="mt-2 flex items-center text-sm text-emerald-600">
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Passwords match
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={isSubmitting || Object.keys(errors).length > 0}
                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Creating Account...
                  </>
                ) : (
                  <>
                    <UserPlus className="h-5 w-5 mr-2" />
                    Create Account
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
          <p className="text-sm text-gray-600">
            Already have an account?{" "}
            <a href="/Login" className="font-medium text-teal-600 hover:text-teal-500 transition-colors">
              Sign in here
            </a>
          </p>
          <p className="mt-4 text-xs text-gray-500">
            By creating an account, you agree to our{" "}
            <a href="/terms" className="text-teal-600 hover:text-teal-500">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="/privacy" className="text-teal-600 hover:text-teal-500">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
