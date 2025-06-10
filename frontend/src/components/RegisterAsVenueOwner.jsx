"use client"

import { useContext, useState } from "react"
import { User, Mail, Phone, Building, MapPin, Upload, AlertCircle } from "lucide-react"
import { useUploadImage } from "./Functions/UploadImage"
import { AuthContext } from "../middleware/AuthContext"
import toast from "react-hot-toast"
import { useMutation } from "@apollo/client"
import { UPDATE_TO_VENUE_OWNER } from "./Graphql/mutations/updateUserGql"
import { useNavigate } from "react-router-dom"

const BecomeVenueOwnerPage = () => {
  const { user } = useContext(AuthContext)
  const [updateToVenueOwner] = useMutation(UPDATE_TO_VENUE_OWNER)
  const { uploadImage } = useUploadImage()
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email,
    phone: user?.phone || "",
    companyName: "",
    governmentId: null,
    profilePicture: null,
    address: "",
    eSewaId: "",
    termsAccepted: false,
  })

  const [errors, setErrors] = useState({})

  // Email validation function
  const validateEmail = (email) => {
    // Check if email starts with a number
    if (/^[0-9]/.test(email)) {
      return "Email cannot start with a number"
    }

    // Check basic email format
    const emailRegex = /^[a-zA-Z][a-zA-Z0-9._-]*@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    if (!emailRegex.test(email)) {
      return "Please enter a valid email address"
    }

    return null
  }

  // Phone validation function
  const validatePhone = (phone) => {
    // Remove any spaces or special characters for validation
    const cleanPhone = phone.replace(/[\s\-$$$$]/g, "")

    // Check if it's a valid Nepali phone number format
    const phoneRegex = /^(\+977)?[0-9]{10}$/
    if (!phoneRegex.test(cleanPhone)) {
      return "Please enter a valid phone number (10 digits)"
    }

    return null
  }

  // File validation function
  const validateFile = (file, fieldName) => {
    if (!file) return `${fieldName} is required`

    // Check if file is an image
    if (!file.type.startsWith("image/")) {
      return `${fieldName} must be an image file (JPG, PNG, GIF, etc.)`
    }

    // Check file size (max 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB in bytes
    if (file.size > maxSize) {
      return `${fieldName} must be less than 5MB`
    }

    return null
  }

  // eSewa ID validation function
  const validateESewaId = (eSewaId) => {
    // eSewa ID should be either phone number or email format
    const phoneRegex = /^[0-9]{10}$/
    const emailRegex = /^[a-zA-Z][a-zA-Z0-9._-]*@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

    if (!phoneRegex.test(eSewaId) && !emailRegex.test(eSewaId)) {
      return "eSewa ID must be a valid phone number or email address"
    }

    return null
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    const newValue = type === "checkbox" ? checked : value

    setFormData((prev) => ({
      ...prev,
      [name]: newValue,
    }))

    // Real-time validation
    if (errors[name]) {
      let error = null

      switch (name) {
        case "email":
          error = validateEmail(newValue)
          break
        case "phone":
          error = validatePhone(newValue)
          break
        case "eSewaId":
          error = validateESewaId(newValue)
          break
        default:
          error = null
      }

      setErrors((prev) => ({ ...prev, [name]: error }))
    }
  }

  const handleFileChange = (e) => {
    const { name, files } = e.target

    if (files && files.length > 0) {
      const file = files[0]

      // Validate file immediately
      const fieldDisplayName = name === "governmentId" ? "Government ID" : "Profile Picture"
      const fileError = validateFile(file, fieldDisplayName)

      if (fileError) {
        setErrors((prev) => ({ ...prev, [name]: fileError }))
        // Clear the file input
        e.target.value = ""
        return
      }

      setFormData((prev) => ({ ...prev, [name]: file }))

      if (errors[name]) {
        setErrors((prev) => ({ ...prev, [name]: "" }))
      }
    }
  }

  const validateForm = () => {
    const newErrors = {}

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = "Name is required"
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters long"
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = "Email is required"
    } else {
      const emailError = validateEmail(formData.email)
      if (emailError) newErrors.email = emailError
    }

    // Phone validation
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required"
    } else {
      const phoneError = validatePhone(formData.phone)
      if (phoneError) newErrors.phone = phoneError
    }

    // Company name validation
    if (!formData.companyName.trim()) {
      newErrors.companyName = "Company name is required"
    } else if (formData.companyName.trim().length < 2) {
      newErrors.companyName = "Company name must be at least 2 characters long"
    }

    // Address validation
    if (!formData.address.trim()) {
      newErrors.address = "Address is required"
    } else if (formData.address.trim().length < 5) {
      newErrors.address = "Please provide a complete address"
    }

    // eSewa ID validation
    if (!formData.eSewaId.trim()) {
      newErrors.eSewaId = "eSewa ID is required"
    } else {
      const eSewaError = validateESewaId(formData.eSewaId)
      if (eSewaError) newErrors.eSewaId = eSewaError
    }

    // File validations
    const govIdError = validateFile(formData.governmentId, "Government ID")
    if (govIdError) newErrors.governmentId = govIdError

    const profilePicError = validateFile(formData.profilePicture, "Profile Picture")
    if (profilePicError) newErrors.profilePicture = profilePicError

    // Terms validation
    if (!formData.termsAccepted) {
      newErrors.termsAccepted = "You must accept the Terms and Conditions"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      toast.error("Please fix the errors in the form")
      return
    }

    toast
      .promise(
        (async () => {
          try {
            let profileImgData = null
            let legalDocImgData = null

            if (formData.profilePicture && formData.governmentId) {
              profileImgData = await uploadImage(
                formData.profilePicture,
                import.meta.env.VITE_SIGNED_UPLOAD_PRESET,
                import.meta.env.VITE_UPLOAD_USER_IMAGE_FOLDER,
              )

              legalDocImgData = await uploadImage(
                formData.governmentId,
                import.meta.env.VITE_SIGNED_UPLOAD_PRESET,
                import.meta.env.VITE_UPLOAD_USER_DOCS_IMAGE_FOLDER,
              )

              if (!profileImgData || !legalDocImgData) {
                throw new Error("Failed to upload images")
              }
            }

            const extractImageData = (imageData) =>
              imageData
                ? {
                    public_id: imageData.public_id,
                    secure_url: imageData.secure_url,
                    asset_id: imageData.asset_id,
                    version: Number.parseInt(imageData.version, 10),
                    format: imageData.format,
                    width: Number.parseInt(imageData.width, 10),
                    height: Number.parseInt(imageData.height, 10),
                    created_at: imageData.created_at,
                  }
                : null

            const pfpImageWithoutTypename = extractImageData(profileImgData)
            const govIdImageWithoutTypename = extractImageData(legalDocImgData)

            const response = await updateToVenueOwner({
              variables: {
                input: {
                  name: formData.name.trim(),
                  email: formData.email.trim().toLowerCase(),
                  phone: formData.phone.trim(),
                  address: formData.address.trim(),
                  profileImg: pfpImageWithoutTypename,
                  legalDocImg: govIdImageWithoutTypename,
                  esewaId: formData.eSewaId.trim(),
                  companyName: formData.companyName.trim(),
             
                },
              },
            })

            const { success, message } = response.data?.updateToVenueOwner

            if (!success) throw new Error(message || "Failed to update, try again later")
          } catch (error) {
            console.error("Update error:", error)
            throw error
          }
        })(),
        {
          loading: "Processing your application...",
          success: "Application submitted successfully!",
          error: "Failed to submit application. Please try again.",
        },
      )
      .then(() => {
        setFormData({
          name: "",
          email: "",
          phone: "",
          companyName: "",
          governmentId: null,
          profilePicture: null,
          address: "",
          eSewaId: "",
          termsAccepted: false,
        })
        navigate("/Dashboard")
      })
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Become a Venue Owner</h1>
        <p className="text-gray-600">Join our platform and start listing your venues to reach more customers.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {/* Name Input */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Full Name <span className="text-red-500">*</span>
            </label>
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-400" aria-hidden="true" />
              </div>
              <input
                type="text"
                name="name"
                id="name"
                className={`focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border rounded-md ${
                  errors.name ? "border-red-500 focus:ring-red-500 focus:border-red-500" : "border-gray-300"
                }`}
                placeholder="John Doe"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>
            {errors.name && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                {errors.name}
              </p>
            )}
          </div>

          {/* Email Input */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address <span className="text-red-500">*</span>
            </label>
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" aria-hidden="true" />
              </div>
              <input
                type="email"
                name="email"
                id="email"
                className={`focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border rounded-md ${
                  errors.email ? "border-red-500 focus:ring-red-500 focus:border-red-500" : "border-gray-300"
                }`}
                placeholder="john@example.com"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>
            {errors.email && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                {errors.email}
              </p>
            )}
          </div>

          {/* Phone Input */}
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Phone className="h-5 w-5 text-gray-400" aria-hidden="true" />
              </div>
              <input
                type="tel"
                name="phone"
                id="phone"
                className={`focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border rounded-md ${
                  errors.phone ? "border-red-500 focus:ring-red-500 focus:border-red-500" : "border-gray-300"
                }`}
                placeholder="9812345678"
                value={formData.phone}
                onChange={handleInputChange}
                required
              />
            </div>
            {errors.phone && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                {errors.phone}
              </p>
            )}
          </div>

          {/* Company Name Input */}
          <div>
            <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-1">
              Company Name <span className="text-red-500">*</span>
            </label>
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Building className="h-5 w-5 text-gray-400" aria-hidden="true" />
              </div>
              <input
                type="text"
                name="companyName"
                id="companyName"
                className={`focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border rounded-md ${
                  errors.companyName ? "border-red-500 focus:ring-red-500 focus:border-red-500" : "border-gray-300"
                }`}
                placeholder="Awesome Venues Inc."
                value={formData.companyName}
                onChange={handleInputChange}
                required
              />
            </div>
            {errors.companyName && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                {errors.companyName}
              </p>
            )}
          </div>
        </div>

        {/* Address Field */}
        <div>
          <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
            Business Address <span className="text-red-500">*</span>
          </label>
          <div className="relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MapPin className="h-5 w-5 text-gray-400" aria-hidden="true" />
            </div>
            <input
              type="text"
              name="address"
              id="address"
              className={`focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border rounded-md ${
                errors.address ? "border-red-500 focus:ring-red-500 focus:border-red-500" : "border-gray-300"
              }`}
              placeholder="123 Main Street, City, Province"
              value={formData.address}
              onChange={handleInputChange}
              required
            />
          </div>
          {errors.address && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <AlertCircle className="h-4 w-4 mr-1" />
              {errors.address}
            </p>
          )}
        </div>

        {/* eSewa ID */}
        <div>
          <label htmlFor="eSewaId" className="block text-sm font-medium text-gray-700 mb-1">
            eSewa ID <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="eSewaId"
            id="eSewaId"
            className={`focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border rounded-md ${
              errors.eSewaId ? "border-red-500 focus:ring-red-500 focus:border-red-500" : "border-gray-300"
            }`}
            placeholder="9812345678 or your@esewa.com"
            value={formData.eSewaId}
            onChange={handleInputChange}
            required
          />
          {errors.eSewaId && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <AlertCircle className="h-4 w-4 mr-1" />
              {errors.eSewaId}
            </p>
          )}
          <p className="mt-1 text-sm text-gray-500">
            Enter your eSewa phone number or email address for payment processing
          </p>
        </div>

        {/* File Upload Section */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {/* Government-issued ID Upload */}
          <div>
            <label htmlFor="governmentId" className="block text-sm font-medium text-gray-700 mb-1">
              Government-issued ID <span className="text-red-500">*</span>
            </label>
            <div className="mt-1 flex items-center">
              <input
                type="file"
                name="governmentId"
                id="governmentId"
                accept="image/*"
                onChange={handleFileChange}
                className="sr-only"
                required
              />
              <label
                htmlFor="governmentId"
                className={`cursor-pointer bg-white py-2 px-3 border rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                  errors.governmentId ? "border-red-500" : "border-gray-300"
                }`}
              >
                <Upload className="h-5 w-5 inline-block mr-2" />
                Upload ID Image
              </label>
              <span className="ml-3 text-sm text-gray-500">
                {formData.governmentId ? formData.governmentId.name : "No file chosen"}
              </span>
            </div>
            {errors.governmentId && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                {errors.governmentId}
              </p>
            )}
            <p className="mt-1 text-sm text-gray-500">Upload a clear image of your citizenship, license, or passport</p>
          </div>

          {/* Profile Picture Upload */}
          <div>
            <label htmlFor="profilePicture" className="block text-sm font-medium text-gray-700 mb-1">
              Profile Picture <span className="text-red-500">*</span>
            </label>
            <div className="mt-1 flex items-center">
              <input
                type="file"
                name="profilePicture"
                id="profilePicture"
                accept="image/*"
                onChange={handleFileChange}
                className="sr-only"
                required
              />
              <label
                htmlFor="profilePicture"
                className={`cursor-pointer bg-white py-2 px-3 border rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                  errors.profilePicture ? "border-red-500" : "border-gray-300"
                }`}
              >
                <User className="h-5 w-5 inline-block mr-2" />
                Upload Profile Picture
              </label>
              <span className="ml-3 text-sm text-gray-500">
                {formData.profilePicture ? formData.profilePicture.name : "No file chosen"}
              </span>
            </div>
            {errors.profilePicture && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                {errors.profilePicture}
              </p>
            )}
            <p className="mt-1 text-sm text-gray-500">Upload a professional photo for your profile</p>
          </div>
        </div>

        {/* Terms and Conditions Checkbox */}
        <div className="flex items-start">
          <input
            id="termsAccepted"
            name="termsAccepted"
            type="checkbox"
            className={`h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1 ${
              errors.termsAccepted ? "border-red-500" : ""
            }`}
            checked={formData.termsAccepted}
            onChange={handleInputChange}
            required
          />
          <label htmlFor="termsAccepted" className="ml-2 block text-sm text-gray-900">
            I agree to the{" "}
            <a href="#" className="text-blue-600 hover:text-blue-500 underline">
              Terms and Conditions
            </a>{" "}
            and{" "}
            <a href="#" className="text-blue-600 hover:text-blue-500 underline">
              Privacy Policy
            </a>
            <span className="text-red-500 ml-1">*</span>
          </label>
        </div>
        {errors.termsAccepted && (
          <p className="mt-1 text-sm text-red-600 flex items-center">
            <AlertCircle className="h-4 w-4 mr-1" />
            {errors.termsAccepted}
          </p>
        )}

        {/* Submit Button */}
        <div className="pt-4">
          <button
            type="submit"
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Submit Application
          </button>
        </div>
      </form>

      {/* Information Section */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-md p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <AlertCircle className="h-5 w-5 text-blue-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">Application Review Process</h3>
            <div className="mt-2 text-sm text-blue-700">
              <p>
                Your application will be reviewed within 2-3 business days. We'll contact you via email once your
                application is approved. Make sure all information is accurate and documents are clearly visible.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BecomeVenueOwnerPage
