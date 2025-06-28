"use client"

import { useState } from "react"
import { Mail, ArrowRight, AlertCircle, Shield, CheckCircle } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useMutation } from "@apollo/client"
import { FORGOT_PASSWORD } from "../../components/Graphql/mutations/AuthGql"
import toast from "react-hot-toast"

export default function EmailVerificationPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [isEmailSent, setIsEmailSent] = useState(false)

  const [passwordReset] = useMutation(FORGOT_PASSWORD)

  const validateEmail = (email) => {
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    return re.test(String(email).trim().toLowerCase())
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    const trimmedEmail = email.trim()

    if (!trimmedEmail) {
      setError("Email is required.")
      return
    }

    if (!validateEmail(trimmedEmail)) {
      setError("Please enter a valid email address.")
      return
    }

    if (isLoading) return // Prevent duplicate submissions
    setIsLoading(true)

    try {
      const response = await passwordReset({
        variables: {
          email: trimmedEmail,
        },
      })

      const success = response.data?.passwordReset?.success
      const message = response.data?.passwordReset?.message || "An unknown error occurred."

      if (success) {
        toast.success(message)
        setIsEmailSent(true)
      } else {
        setError(message)
      }
    } catch (err) {
      setError(err.message || "Failed to send verification email. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-blue-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-teal-600 rounded-full flex items-center justify-center shadow-lg">
            <Shield className="w-8 h-8 text-white" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent">
          Verify your email
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">We'll send a verification link to your email address</p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl border border-gray-100 sm:rounded-xl sm:px-10">
          {isEmailSent ? (
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-lg">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <h3 className="mt-4 text-xl font-semibold text-gray-900">Verification Email Sent</h3>
              <p className="mt-2 text-gray-600">
                We've sent a verification code to <span className="font-medium text-teal-600">{email}</span>. Please
                check your inbox and spam folder.
              </p>

              <div className="mt-6 p-4 bg-teal-50 border border-teal-200 rounded-lg">
                <div className="flex items-start">
                  <Mail className="w-5 h-5 text-teal-600 mt-0.5 mr-3 flex-shrink-0" />
                  <div className="text-sm text-teal-700">
                    <p className="font-medium mb-1">Next steps:</p>
                    <ul className="list-disc list-inside space-y-1 text-left">
                      <li>Check your email inbox</li>
                      <li>Click the verification link</li>
                      <li>Follow the instructions to reset your password</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => {
                    setIsEmailSent(false)
                    setEmail("")
                    setError("")
                  }}
                  className="flex-1 px-4 py-2 border border-teal-300 text-teal-700 rounded-lg hover:bg-teal-50 transition-colors duration-200 font-medium"
                >
                  Try Different Email
                </button>
                <button
                  onClick={() => navigate("/login")}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-teal-600 to-teal-700 text-white rounded-lg hover:from-teal-700 hover:to-teal-800 transition-all duration-200 font-medium shadow-md"
                >
                  Back to Login
                </button>
              </div>
            </div>
          ) : (
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" aria-hidden="true" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors duration-200 sm:text-sm"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              {error && (
                <div className="flex items-center p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg">
                  <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <button
                  type="submit"
                  className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-md text-sm font-medium text-white bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Sending...
                    </>
                  ) : (
                    <>
                      Send Verification Code
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </button>
              </div>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => navigate("/login")}
                  className="text-sm text-teal-600 hover:text-teal-700 font-medium transition-colors duration-200"
                >
                  Back to Login
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Security Notice */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start">
            <Shield className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
            <div className="text-sm text-blue-700">
              <p className="font-medium mb-1">Security Notice</p>
              <p>
                For your security, verification links expire after 24 hours. If you don't receive the email within a few
                minutes, please check your spam folder.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
