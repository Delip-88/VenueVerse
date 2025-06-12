"use client"

import { useContext, useState } from "react"
import {
  User,
  Mail,
  Phone,
  Building,
  MapPin,
  Upload,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Check,
  FileText,
  CreditCard,
  UserPlus,
  Camera,
  BadgeIcon as IdCard,
} from "lucide-react"
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
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)

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
  const [governmentIdPreview, setGovernmentIdPreview] = useState(null)
  const [profilePicturePreview, setProfilePicturePreview] = useState(null)

  // Validation functions
  const validateEmail = (email) => {
    if (/^[0-9]/.test(email)) {
      return "Email cannot start with a number"
    }
    const emailRegex = /^[a-zA-Z][a-zA-Z0-9._-]*@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    if (!emailRegex.test(email)) {
      return "Please enter a valid email address"
    }
    return null
  }

  const validatePhone = (phone) => {
    const cleanPhone = phone.replace(/[\s\-()]/g, "")
    const phoneRegex = /^(\+977)?[0-9]{10}$/
    if (!phoneRegex.test(cleanPhone)) {
      return "Please enter a valid phone number (10 digits)"
    }
    return null
  }

  const validateFile = (file, fieldName) => {
    if (!file) return `${fieldName} is required`
    if (!file.type.startsWith("image/")) {
      return `${fieldName} must be an image file (JPG, PNG, GIF, etc.)`
    }
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return `${fieldName} must be less than 5MB`
    }
    return null
  }
  const validateESewaId = (eSewaId) => {
    // Must be exactly 10 digits and start with 9
    const phoneRegex = /^9\d{9}$/
    if (!phoneRegex.test(eSewaId)) {
      return "eSewa ID must be a 10-digit number starting with 9"
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

    // Clear errors when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }))
    }
  }

  const handleFileChange = (e) => {
    const { name, files } = e.target

    if (files && files.length > 0) {
      const file = files[0]
      const fieldDisplayName = name === "governmentId" ? "Government ID" : "Profile Picture"
      const fileError = validateFile(file, fieldDisplayName)

      if (fileError) {
        setErrors((prev) => ({ ...prev, [name]: fileError }))
        e.target.value = ""
        return
      }

      setFormData((prev) => ({ ...prev, [name]: file }))

      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        if (name === "governmentId") {
          setGovernmentIdPreview(e.target.result)
        } else {
          setProfilePicturePreview(e.target.result)
        }
      }
      reader.readAsDataURL(file)

      if (errors[name]) {
        setErrors((prev) => ({ ...prev, [name]: null }))
      }
    }
  }

  const validateStep = (step) => {
    const newErrors = {}

    switch (step) {
      case 1: // Personal Information
        if (!formData.name.trim()) {
          newErrors.name = "Name is required"
        } else if (formData.name.trim().length < 2) {
          newErrors.name = "Name must be at least 2 characters long"
        }

        if (!formData.email.trim()) {
          newErrors.email = "Email is required"
        } else {
          const emailError = validateEmail(formData.email)
          if (emailError) newErrors.email = emailError
        }

        if (!formData.phone.trim()) {
          newErrors.phone = "Phone number is required"
        } else {
          const phoneError = validatePhone(formData.phone)
          if (phoneError) newErrors.phone = phoneError
        }
        break

      case 2: // Business Information
        if (!formData.companyName.trim()) {
          newErrors.companyName = "Company name is required"
        } else if (formData.companyName.trim().length < 2) {
          newErrors.companyName = "Company name must be at least 2 characters long"
        }

        if (!formData.address.trim()) {
          newErrors.address = "Address is required"
        } else if (formData.address.trim().length < 5) {
          newErrors.address = "Please provide a complete address"
        }

        if (!formData.eSewaId.trim()) {
          newErrors.eSewaId = "eSewa ID is required"
        } else {
          const eSewaError = validateESewaId(formData.eSewaId)
          if (eSewaError) newErrors.eSewaId = eSewaError
        }
        break

      case 3: // Document Upload
        const govIdError = validateFile(formData.governmentId, "Government ID")
        if (govIdError) newErrors.governmentId = govIdError

        const profilePicError = validateFile(formData.profilePicture, "Profile Picture")
        if (profilePicError) newErrors.profilePicture = profilePicError
        break

      case 4: // Review & Terms
        if (!formData.termsAccepted) {
          newErrors.termsAccepted = "You must accept the Terms and Conditions"
        }
        break
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1)
      window.scrollTo(0, 0)
    }
  }

  const prevStep = () => {
    setCurrentStep(currentStep - 1)
    window.scrollTo(0, 0)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateStep(currentStep)) {
      toast.error("Please fix the errors in the form")
      return
    }

    setIsSubmitting(true)

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
        navigate("/Home")
      })
      .finally(() => {
        setIsSubmitting(false)
      })
  }

  const totalSteps = 4
  const progress = Math.round((currentStep / totalSteps) * 100)

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="bg-teal-100 rounded-full p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <User className="h-8 w-8 text-teal-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Personal Information</h2>
              <p className="text-gray-600">Let's start with your basic information</p>
            </div>

            <div className="space-y-6">
              {/* Name Input */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="name"
                    id="name"
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors ${
                      errors.name ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={handleInputChange}
                  />
                </div>
                {errors.name && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-2" />
                    {errors.name}
                  </p>
                )}
              </div>

              {/* Email Input */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors ${
                      errors.email ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={handleInputChange}
                  />
                </div>
                {errors.email && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-2" />
                    {errors.email}
                  </p>
                )}
                <p className="mt-1 text-xs text-gray-500">Email cannot start with a number</p>
              </div>

              {/* Phone Input */}
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="tel"
                    name="phone"
                    id="phone"
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors ${
                      errors.phone ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="9812345678"
                    value={formData.phone}
                    onChange={handleInputChange}
                  />
                </div>
                {errors.phone && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-2" />
                    {errors.phone}
                  </p>
                )}
                <p className="mt-1 text-xs text-gray-500">Enter a 10-digit phone number</p>
              </div>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="bg-teal-100 rounded-full p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Building className="h-8 w-8 text-teal-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Business Information</h2>
              <p className="text-gray-600">Tell us about your business and payment details</p>
            </div>

            <div className="space-y-6">
              {/* Company Name */}
              <div>
                <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-2">
                  Company Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Building className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="companyName"
                    id="companyName"
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors ${
                      errors.companyName ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Awesome Venues Inc."
                    value={formData.companyName}
                    onChange={handleInputChange}
                  />
                </div>
                {errors.companyName && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-2" />
                    {errors.companyName}
                  </p>
                )}
              </div>

              {/* Business Address */}
              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                  Business Address <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MapPin className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="address"
                    id="address"
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors ${
                      errors.address ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="123 Main Street, City, Province"
                    value={formData.address}
                    onChange={handleInputChange}
                  />
                </div>
                {errors.address && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-2" />
                    {errors.address}
                  </p>
                )}
              </div>

              {/* eSewa ID */}
              <div>
                <label htmlFor="eSewaId" className="block text-sm font-medium text-gray-700 mb-2">
                  eSewa ID <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <CreditCard className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="eSewaId"
                    id="eSewaId"
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors ${
                      errors.eSewaId ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="98********"
                    value={formData.eSewaId}
                    onChange={handleInputChange}
                  />
                </div>
                {errors.eSewaId && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-2" />
                    {errors.eSewaId}
                  </p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  Enter your eSewa phone number address for payment processing
                </p>
              </div>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="bg-teal-100 rounded-full p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <FileText className="h-8 w-8 text-teal-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Document Upload</h2>
              <p className="text-gray-600">Upload your identification and profile picture</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Government ID Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4">
                  Government-issued ID <span className="text-red-500">*</span>
                </label>
                <div
                  className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors ${
                    errors.governmentId
                      ? "border-red-300 bg-red-50"
                      : governmentIdPreview
                        ? "border-teal-300 bg-teal-50"
                        : "border-gray-300 hover:border-teal-400"
                  }`}
                >
                  {governmentIdPreview ? (
                    <div className="space-y-4">
                      <img
                        src={governmentIdPreview || "/placeholder.svg"}
                        alt="Government ID Preview"
                        className="mx-auto h-32 w-auto rounded-lg object-cover"
                      />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{formData.governmentId?.name}</p>
                        <p className="text-xs text-gray-500">
                          {(formData.governmentId?.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                      <label
                        htmlFor="governmentId"
                        className="inline-flex items-center px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 cursor-pointer transition-colors"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Change File
                      </label>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <IdCard className="mx-auto h-12 w-12 text-gray-400" />
                      <div>
                        <label
                          htmlFor="governmentId"
                          className="inline-flex items-center px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 cursor-pointer transition-colors font-medium"
                        >
                          <Upload className="h-5 w-5 mr-2" />
                          Upload ID Image
                        </label>
                        <p className="mt-2 text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
                      </div>
                    </div>
                  )}
                  <input
                    type="file"
                    name="governmentId"
                    id="governmentId"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>
                {errors.governmentId && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-2" />
                    {errors.governmentId}
                  </p>
                )}
                <p className="mt-2 text-xs text-gray-500">
                  Upload a clear image of your citizenship, license, or passport
                </p>
              </div>

              {/* Profile Picture Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4">
                  Profile Picture <span className="text-red-500">*</span>
                </label>
                <div
                  className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors ${
                    errors.profilePicture
                      ? "border-red-300 bg-red-50"
                      : profilePicturePreview
                        ? "border-teal-300 bg-teal-50"
                        : "border-gray-300 hover:border-teal-400"
                  }`}
                >
                  {profilePicturePreview ? (
                    <div className="space-y-4">
                      <img
                        src={profilePicturePreview || "/placeholder.svg"}
                        alt="Profile Picture Preview"
                        className="mx-auto h-32 w-32 rounded-full object-cover border-4 border-white shadow-lg"
                      />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{formData.profilePicture?.name}</p>
                        <p className="text-xs text-gray-500">
                          {(formData.profilePicture?.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                      <label
                        htmlFor="profilePicture"
                        className="inline-flex items-center px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 cursor-pointer transition-colors"
                      >
                        <Camera className="h-4 w-4 mr-2" />
                        Change Photo
                      </label>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <Camera className="mx-auto h-12 w-12 text-gray-400" />
                      <div>
                        <label
                          htmlFor="profilePicture"
                          className="inline-flex items-center px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 cursor-pointer transition-colors font-medium"
                        >
                          <Camera className="h-5 w-5 mr-2" />
                          Upload Photo
                        </label>
                        <p className="mt-2 text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
                      </div>
                    </div>
                  )}
                  <input
                    type="file"
                    name="profilePicture"
                    id="profilePicture"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>
                {errors.profilePicture && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-2" />
                    {errors.profilePicture}
                  </p>
                )}
                <p className="mt-2 text-xs text-gray-500">Upload a professional photo for your profile</p>
              </div>
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="bg-emerald-100 rounded-full p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Check className="h-8 w-8 text-emerald-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Review & Submit</h2>
              <p className="text-gray-600">Review your information and accept our terms</p>
            </div>

            {/* Application Summary */}
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Application Summary</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Personal Information</p>
                    <p className="text-gray-900">{formData.name}</p>
                    <p className="text-gray-600 text-sm">{formData.email}</p>
                    <p className="text-gray-600 text-sm">{formData.phone}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Business Information</p>
                    <p className="text-gray-900">{formData.companyName}</p>
                    <p className="text-gray-600 text-sm">{formData.address}</p>
                    <p className="text-gray-600 text-sm">eSewa: {formData.eSewaId}</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Documents</p>
                    <div className="flex items-center space-x-4">
                      {profilePicturePreview && (
                        <img
                          src={profilePicturePreview || "/placeholder.svg"}
                          alt="Profile"
                          className="h-16 w-16 rounded-full object-cover border-2 border-gray-200"
                        />
                      )}
                      {governmentIdPreview && (
                        <img
                          src={governmentIdPreview || "/placeholder.svg"}
                          alt="Government ID"
                          className="h-16 w-24 rounded-lg object-cover border-2 border-gray-200"
                        />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Terms and Conditions */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <div className="flex items-start space-x-3">
                <input
                  id="termsAccepted"
                  name="termsAccepted"
                  type="checkbox"
                  className={`h-5 w-5 text-teal-600 focus:ring-teal-500 border-gray-300 rounded mt-1 ${
                    errors.termsAccepted ? "border-red-500" : ""
                  }`}
                  checked={formData.termsAccepted}
                  onChange={handleInputChange}
                />
                <div className="flex-1">
                  <label htmlFor="termsAccepted" className="text-sm text-gray-900">
                    I agree to the{" "}
                    <a href="#" className="text-teal-600 hover:text-teal-500 underline font-medium">
                      Terms and Conditions
                    </a>{" "}
                    and{" "}
                    <a href="#" className="text-teal-600 hover:text-teal-500 underline font-medium">
                      Privacy Policy
                    </a>
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  {errors.termsAccepted && (
                    <p className="mt-2 text-sm text-red-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-2" />
                      {errors.termsAccepted}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Information Section */}
            <div className="bg-teal-50 border border-teal-200 rounded-xl p-6">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <AlertCircle className="h-6 w-6 text-teal-600" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-teal-800">Application Review Process</h3>
                  <div className="mt-2 text-sm text-teal-700">
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

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-center mb-4">
              <div className="bg-teal-100 rounded-full p-3 mr-4">
                <UserPlus className="h-8 w-8 text-teal-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Become a Venue Owner</h1>
                <p className="text-gray-600 mt-1">Join our platform and start listing your venues</p>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="flex justify-between mb-4">
            <span className="text-sm font-medium text-gray-700">
              Step {currentStep} of {totalSteps}
            </span>
            <span className="text-sm font-medium text-gray-700">{progress}% Complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-teal-600 h-3 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Step Indicators */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="flex justify-between">
            {[
              { number: 1, title: "Personal", icon: User },
              { number: 2, title: "Business", icon: Building },
              { number: 3, title: "Documents", icon: FileText },
              { number: 4, title: "Review", icon: Check },
            ].map((step) => {
              const isActive = step.number === currentStep
              const isCompleted = step.number < currentStep

              return (
                <div key={step.number} className="flex flex-col items-center">
                  <div
                    className={`flex items-center justify-center w-12 h-12 rounded-full transition-all duration-200 ${
                      isActive
                        ? "bg-teal-600 text-white shadow-lg"
                        : isCompleted
                          ? "bg-emerald-500 text-white"
                          : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {isCompleted ? <Check className="h-6 w-6" /> : <step.icon className="h-6 w-6" />}
                  </div>
                  <span className="text-sm font-medium text-gray-700 mt-2">{step.title}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Step Content */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <form onSubmit={handleSubmit}>
              {renderStep()}

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
                {currentStep > 1 ? (
                  <button
                    type="button"
                    onClick={prevStep}
                    className="flex items-center px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 transition-colors font-medium"
                  >
                    <ChevronLeft className="h-5 w-5 mr-2" />
                    Previous
                  </button>
                ) : (
                  <div></div>
                )}

                {currentStep < totalSteps ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    className="flex items-center px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 transition-colors font-medium"
                  >
                    Next
                    <ChevronRight className="h-5 w-5 ml-2" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex items-center px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Submitting...
                      </>
                    ) : (
                      <>
                        <UserPlus className="h-5 w-5 mr-2" />
                        Submit Application
                      </>
                    )}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BecomeVenueOwnerPage
