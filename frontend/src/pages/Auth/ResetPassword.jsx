"use client"

import { useState } from "react"
import { Eye, EyeOff, Check, X, Shield, Lock } from "lucide-react"
import { useNavigate, useParams } from "react-router-dom"
import toast from "react-hot-toast"
import { useMutation } from "@apollo/client"
import { NEW_PASSWORD } from "../../components/Graphql/mutations/AuthGql"

const ResetPassword = () => {
  const navigate = useNavigate()
  const { token } = useParams()
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [errors, setErrors] = useState({})

  const [newPassword] = useMutation(NEW_PASSWORD)

  // Password requirements
  const requirements = [
    { text: "At least 8 characters long", regex: /.{8,}/ },
    { text: "Contains at least one uppercase letter", regex: /[A-Z]/ },
    { text: "Contains at least one lowercase letter", regex: /[a-z]/ },
    { text: "Contains at least one number", regex: /\d/ },
    {
      text: "Contains at least one special character",
      regex: /[!@#$%^&*(),.?":{}|<>]/,
    },
  ]

  const validatePassword = (password) => {
    return requirements.every((requirement) => requirement.regex.test(password))
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    // Clear errors when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const newErrors = {}

    // Validate password
    if (!formData.password) {
      newErrors.password = "Password is required"
    } else if (!validatePassword(formData.password)) {
      newErrors.password = "Password does not meet requirements"
    }

    // Validate confirm password
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password"
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match"
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    // Mutation request with toast handling
    await toast.promise(
      newPassword({
        variables: {
          token,
          password: formData.password,
        },
      }),
      {
        loading: "Updating password...",
        success: "Password updated successfully!",
        error: (err) => <b>{err.message}</b>,
      },
    )

    // Redirect to login page after successful password reset
    navigate("/login")
  }

  const getPasswordStrength = (password) => {
    if (!password) return { width: "0%", color: "bg-gray-200" }

    const metRequirements = requirements.filter((req) => req.regex.test(password)).length

    const strength = (metRequirements / requirements.length) * 100

    if (strength === 100) return { width: "100%", color: "bg-gradient-to-r from-teal-500 to-teal-600" }
    if (strength >= 60) return { width: `${strength}%`, color: "bg-gradient-to-r from-yellow-400 to-yellow-500" }
    return { width: `${strength}%`, color: "bg-gradient-to-r from-red-400 to-red-500" }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-blue-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Header with Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-teal-600 rounded-full flex items-center justify-center shadow-lg">
            <Shield className="w-8 h-8 text-white" />
          </div>
        </div>

        <h2 className="text-center text-3xl font-bold bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent">
          Set New Password
        </h2>
        <p className="mt-3 text-center text-sm text-gray-600 max-w-sm mx-auto">
          Create a strong password to secure your VenueVerse account
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-xl rounded-2xl border border-gray-100 sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                <Lock className="w-4 h-4 inline mr-2 text-teal-600" />
                New Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border-2 rounded-xl transition-all duration-200 ${
                    errors.password
                      ? "border-red-300 focus:border-red-500 focus:ring-red-200"
                      : "border-gray-200 focus:border-teal-500 focus:ring-teal-200"
                  } focus:outline-none focus:ring-4 focus:ring-opacity-20`}
                  placeholder="Enter your new password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-teal-600 transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  <X className="w-4 h-4 mr-1" />
                  {errors.password}
                </p>
              )}
            </div>

            {/* Password Strength Indicator */}
            {formData.password && (
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <div className="mb-3">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Password Strength</span>
                    <span className="text-xs text-gray-500">
                      {requirements.filter((req) => req.regex.test(formData.password)).length}/{requirements.length}
                    </span>
                  </div>
                  <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${getPasswordStrength(formData.password).color}`}
                      style={{
                        width: getPasswordStrength(formData.password).width,
                      }}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  {requirements.map((requirement, index) => (
                    <div key={index} className="flex items-center text-sm">
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center mr-3 ${
                          requirement.regex.test(formData.password)
                            ? "bg-teal-100 text-teal-600"
                            : "bg-gray-100 text-gray-400"
                        }`}
                      >
                        {requirement.regex.test(formData.password) ? (
                          <Check className="h-3 w-3" />
                        ) : (
                          <X className="h-3 w-3" />
                        )}
                      </div>
                      <span
                        className={`${requirement.regex.test(formData.password) ? "text-teal-700" : "text-gray-600"}`}
                      >
                        {requirement.text}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Confirm Password Field */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-2">
                <Lock className="w-4 h-4 inline mr-2 text-teal-600" />
                Confirm Password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border-2 rounded-xl transition-all duration-200 ${
                    errors.confirmPassword
                      ? "border-red-300 focus:border-red-500 focus:ring-red-200"
                      : "border-gray-200 focus:border-teal-500 focus:ring-teal-200"
                  } focus:outline-none focus:ring-4 focus:ring-opacity-20`}
                  placeholder="Confirm your new password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-teal-600 transition-colors"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  <X className="w-4 h-4 mr-1" />
                  {errors.confirmPassword}
                </p>
              )}

              {/* Password Match Indicator */}
              {formData.confirmPassword && formData.password && (
                <div className="mt-2 flex items-center text-sm">
                  {formData.password === formData.confirmPassword ? (
                    <>
                      <div className="w-5 h-5 rounded-full bg-teal-100 flex items-center justify-center mr-2">
                        <Check className="h-3 w-3 text-teal-600" />
                      </div>
                      <span className="text-teal-700">Passwords match</span>
                    </>
                  ) : (
                    <>
                      <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center mr-2">
                        <X className="h-3 w-3 text-red-600" />
                      </div>
                      <span className="text-red-600">Passwords don't match</span>
                    </>
                  )}
                </div>
              )}
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={!validatePassword(formData.password) || formData.password !== formData.confirmPassword}
                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-lg text-sm font-semibold text-white bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 focus:outline-none focus:ring-4 focus:ring-teal-200 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02]"
              >
                <Shield className="w-5 h-5 mr-2" />
                Reset Password
              </button>
            </div>
          </form>

          {/* Security Notice */}
          <div className="mt-6 p-4 bg-teal-50 rounded-xl border border-teal-100">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <Shield className="h-5 w-5 text-teal-600 mt-0.5" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-teal-800">
                  <span className="font-semibold">Security Tip:</span> Use a unique password that you don't use for
                  other accounts. Consider using a password manager for better security.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ResetPassword
