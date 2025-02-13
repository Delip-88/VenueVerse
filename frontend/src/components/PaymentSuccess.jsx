"use client"

import { useEffect, useState } from "react"
import { useLocation, Link } from "react-router-dom"
import { useMutation } from "@apollo/client"
import { VERIFY_PAYMENT } from "./Graphql/mutations/paymentGql"
import { CheckCircle, AlertCircle, Loader, CreditCard, Calendar, Home } from "lucide-react"

const PaymentSuccess = () => {
  const location = useLocation()
  const [paymentDetails, setPaymentDetails] = useState(null)
  const [verificationError, setVerificationError] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  const [verifyPayment] = useMutation(VERIFY_PAYMENT)

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search)
    const encodedData = searchParams.get("data")

    if (encodedData) {
      try {
        const decodedData = JSON.parse(atob(encodedData))
        setPaymentDetails(decodedData)

        verifyPayment({
          variables: {
            transactionId: decodedData.transaction_uuid,
          },
        })
          .then((res) => {
            if (!res.data.verifyPayment.success) {
              setVerificationError("Payment verification failed.")
            }
            setIsLoading(false)
          })
          .catch((err) => {
            console.error("Verification Error:", err)
            setVerificationError("Failed to verify payment.")
            setIsLoading(false)
          })
      } catch (error) {
        console.error("Error decoding payment data:", error)
        setVerificationError("Invalid payment response.")
        setIsLoading(false)
      }
    } else {
      setVerificationError("No payment data received.")
      setIsLoading(false)
    }
  }, [location.search, verifyPayment])

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <Loader className="w-12 h-12 text-blue-500 animate-spin" />
        <p className="mt-4 text-lg font-semibold text-gray-700">Verifying payment...</p>
      </div>
    )
  }

  if (verificationError) {
    return (
      <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-lg">
        <div className="flex items-center justify-center text-red-500 mb-4">
          <AlertCircle className="w-16 h-16" />
        </div>
        <h2 className="text-2xl font-bold text-center text-red-700 mb-4">Payment Verification Failed</h2>
        <p className="text-center text-gray-600 mb-6">{verificationError}</p>
        <Link
          to="/"
          className="block w-full text-center bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition duration-300"
        >
          <Home className="inline-block mr-2" />
          Back to Home
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-lg">
      <div className="flex items-center justify-center text-green-500 mb-4">
        <CheckCircle className="w-16 h-16" />
      </div>
      <h2 className="text-2xl font-bold text-center text-green-700 mb-4">Payment Successful!</h2>

      {paymentDetails && (
        <div className="space-y-4">
          <div className="flex items-center">
            <CreditCard className="w-6 h-6 text-gray-500 mr-2" />
            <p>
              <span className="font-semibold">Transaction ID:</span> {paymentDetails.transaction_uuid}
            </p>
          </div>
          <div className="flex items-center">
            <Calendar className="w-6 h-6 text-gray-500 mr-2" />
            <p>
              <span className="font-semibold">Amount:</span> NPR {paymentDetails.total_amount}
            </p>
          </div>
          <div className="flex items-center">
            <CheckCircle className="w-6 h-6 text-green-500 mr-2" />
            <p>
              <span className="font-semibold">Status:</span> {paymentDetails.status}
            </p>
          </div>
          <div className="flex items-center">
            <CreditCard className="w-6 h-6 text-gray-500 mr-2" />
            <p>
              <span className="font-semibold">Transaction Code:</span> {paymentDetails.transaction_code}
            </p>
          </div>
        </div>
      )}

      <Link
        to="/"
        className="block w-full text-center mt-8 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition duration-300"
      >
        <Home className="inline-block mr-2" />
        Back to Home
      </Link>
    </div>
  )
}

export default PaymentSuccess

