"use client"

import { useContext, useState } from "react"
import {
  Lock,
  Save,
  Upload,
  User,
  AlertCircle,
  Camera,
  Mail,
  Phone,
  CreditCard,
  Settings,
  Shield,
  CheckCircle2,
} from "lucide-react"
import { AuthContext } from "../../middleware/AuthContext"
import { useMutation } from "@apollo/client"
import { UPDATE_USER_DETAILS } from "../Graphql/mutations/updateUserGql"
import toast from "react-hot-toast"
import { useUploadImage } from "../Functions/UploadImage"

export default function SettingsPage() {
  const { user, refreshUser } = useContext(AuthContext)
  const [personalInfo, setPersonalInfo] = useState({
    fullName: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    esewaId: user?.esewaId || "",
  })
  const { uploadImage } = useUploadImage()
  const [profileImage, setProfileImage] = useState(null)
  const [profileImagePreview, setProfileImagePreview] = useState(user?.profileImg?.secure_url || null)
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [updateDetails] = useMutation(UPDATE_USER_DETAILS)

  const handlePersonalInfoChange = (e) => {
    const { name, value } = e.target
    setPersonalInfo({ ...personalInfo, [name]: value })

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: null })
    }
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]

    // Clear previous errors
    setErrors({ ...errors, profileImage: null })

    if (!file) return

    // Validate file is an image
    if (!file.type.match("image.*")) {
      setErrors({ ...errors, profileImage: "Please select an image file (JPEG, PNG, etc.)" })
      e.target.value = null
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrors({ ...errors, profileImage: "Image size should be less than 5MB" })
      e.target.value = null
      return
    }

    // If validation passes, set the image
    setProfileImage(file)
    setProfileImagePreview(URL.createObjectURL(file))
  }

  const validateForm = () => {
    const formErrors = {}

    // Validate personal info
    if (!personalInfo.fullName.trim()) {
      formErrors.fullName = "Full name is required"
    } else if (personalInfo.fullName.trim().length < 3) {
      formErrors.fullName = "Full name should be at least 3 characters"
    }

    // Validate email
    if (!personalInfo.email.trim()) {
      formErrors.email = "Email is required"
    } else if (!/^[a-zA-Z][a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(personalInfo.email)) {
      formErrors.email = "Invalid email format. Email should not start with a number."
    }

    // Validate phone
    if (!personalInfo.phone.trim()) {
      formErrors.phone = "Phone number is required"
    } else if (!/^\d{10}$/.test(personalInfo.phone.replace(/\D/g, ""))) {
      formErrors.phone = "Phone number should be 10 digits"
    }

    // Validate esewaId if provided
    if (personalInfo.esewaId && !/^\d{10}$/.test(personalInfo.esewaId.replace(/\D/g, ""))) {
      formErrors.esewaId = "Esewa ID should be 10 digits"
    }

    setErrors(formErrors)
    return Object.keys(formErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      toast.error("Please fix the errors in the form")
      return
    }

    setIsSubmitting(true)

    toast
      .promise(
        (async () => {
          try {
            let profileImgData = null

            if (profileImage) {
              profileImgData = await uploadImage(
                profileImage,
                import.meta.env.VITE_SIGNED_UPLOAD_PRESET,
                import.meta.env.VITE_UPLOAD_USER_IMAGE_FOLDER,
              )

              if (!profileImgData) {
                throw new Error("Failed to upload image")
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

            const response = await updateDetails({
              variables: {
                input: {
                  name: personalInfo.fullName,
                  email: personalInfo.email,
                  phone: personalInfo.phone,
                  esewaId: personalInfo.esewaId,
                  profileImg: pfpImageWithoutTypename,
                },
              },
            })

            const { success } = response.data?.updateUserDetails

            if (!success) {
              throw new Error("Failed to update details")
            }
          } catch (error) {
            console.error("Update error:", error)
            throw error
          }
        })(),
        {
          loading: "Updating your profile...",
          success: "Profile updated successfully!",
          error: "Failed to update profile. Please try again.",
        },
      )
      .then(() => {
        refreshUser()
      })
      .finally(() => {
        setIsSubmitting(false)
      })
  }

  const getFieldStatus = (fieldName) => {
    if (errors[fieldName]) return "error"
    if (personalInfo[fieldName]) return "success"
    return "default"
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="bg-teal-100 rounded-full p-3 mr-4">
                <Settings className="h-8 w-8 text-teal-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Account Settings</h1>
                <p className="text-gray-600 mt-1">Manage your profile and account preferences</p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Profile Picture Section */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-8">
                  <div className="text-center">
                    <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center justify-center">
                      <Camera className="h-5 w-5 mr-2 text-teal-600" />
                      Profile Picture
                    </h2>

                    <div className="relative inline-block mb-6">
                      <div className="h-32 w-32 rounded-full overflow-hidden bg-gradient-to-br from-teal-100 to-teal-200 flex items-center justify-center border-4 border-white shadow-lg mx-auto">
                        {profileImagePreview ? (
                          <img
                            src={profileImagePreview || "/placeholder.svg"}
                            alt={personalInfo.fullName || "Profile"}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <User className="h-16 w-16 text-teal-600" />
                        )}
                      </div>
                      <label
                        htmlFor="profile-image"
                        className="absolute bottom-0 right-0 bg-teal-600 hover:bg-teal-700 text-white rounded-full p-2 cursor-pointer shadow-lg transition-colors"
                      >
                        <Camera className="h-4 w-4" />
                        <input
                          id="profile-image"
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                        />
                      </label>
                    </div>

                    <label
                      htmlFor="profile-image-alt"
                      className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-teal-50 text-teal-700 rounded-lg hover:bg-teal-100 transition-colors border border-teal-200 text-sm font-medium"
                    >
                      <Upload className="h-4 w-4" />
                      Change Photo
                      <input
                        id="profile-image-alt"
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>

                    {errors.profileImage && (
                      <div className="mt-3 flex items-center justify-center text-sm text-red-600">
                        <AlertCircle className="h-4 w-4 mr-2" />
                        {errors.profileImage}
                      </div>
                    )}

                    <div className="mt-4 text-xs text-gray-500 space-y-1">
                      <p>Supported: JPEG, PNG, GIF</p>
                      <p>Maximum size: 5MB</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Main Content */}
              <div className="lg:col-span-2 space-y-8">
                {/* Personal Information */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                    <User className="h-5 w-5 mr-2 text-teal-600" />
                    Personal Information
                  </h2>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          name="fullName"
                          id="fullName"
                          value={personalInfo.fullName}
                          onChange={handlePersonalInfoChange}
                          className={`w-full pl-10 pr-10 py-3 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors ${
                            errors.fullName ? "border-red-500" : "border-gray-300"
                          }`}
                          placeholder="Enter your full name"
                        />
                        <User className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                        {getFieldStatus("fullName") === "success" && (
                          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                          </div>
                        )}
                      </div>
                      {errors.fullName && (
                        <div className="mt-2 flex items-center text-sm text-red-600">
                          <AlertCircle className="h-4 w-4 mr-2" />
                          {errors.fullName}
                        </div>
                      )}
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="email"
                          name="email"
                          id="email"
                          value={personalInfo.email}
                          onChange={handlePersonalInfoChange}
                          className={`w-full pl-10 pr-10 py-3 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors ${
                            errors.email ? "border-red-500" : "border-gray-300"
                          }`}
                          placeholder="Enter your email"
                        />
                        <Mail className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                        {getFieldStatus("email") === "success" && (
                          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                          </div>
                        )}
                      </div>
                      {errors.email && (
                        <div className="mt-2 flex items-center text-sm text-red-600">
                          <AlertCircle className="h-4 w-4 mr-2" />
                          {errors.email}
                        </div>
                      )}
                      <p className="mt-1 text-xs text-gray-500">Email should not start with a number</p>
                    </div>

                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="tel"
                          name="phone"
                          id="phone"
                          value={personalInfo.phone}
                          onChange={handlePersonalInfoChange}
                          className={`w-full pl-10 pr-10 py-3 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors ${
                            errors.phone ? "border-red-500" : "border-gray-300"
                          }`}
                          placeholder="Enter phone number"
                        />
                        <Phone className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                        {getFieldStatus("phone") === "success" && (
                          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                          </div>
                        )}
                      </div>
                      {errors.phone && (
                        <div className="mt-2 flex items-center text-sm text-red-600">
                          <AlertCircle className="h-4 w-4 mr-2" />
                          {errors.phone}
                        </div>
                      )}
                      <p className="mt-1 text-xs text-gray-500">Enter a 10-digit phone number</p>
                    </div>

                    <div className="md:col-span-2">
                      <label htmlFor="esewaId" className="block text-sm font-medium text-gray-700 mb-2">
                        eSewa Number
                      </label>
                      <div className="relative">
                        <input
                          type="tel"
                          name="esewaId"
                          id="esewaId"
                          value={personalInfo.esewaId}
                          onChange={handlePersonalInfoChange}
                          className={`w-full pl-10 pr-10 py-3 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors ${
                            errors.esewaId ? "border-red-500" : "border-gray-300"
                          }`}
                          placeholder="Enter eSewa number (optional)"
                        />
                        <CreditCard className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                        {getFieldStatus("esewaId") === "success" && personalInfo.esewaId && (
                          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                          </div>
                        )}
                      </div>
                      {errors.esewaId && (
                        <div className="mt-2 flex items-center text-sm text-red-600">
                          <AlertCircle className="h-4 w-4 mr-2" />
                          {errors.esewaId}
                        </div>
                      )}
                      <p className="mt-1 text-xs text-gray-500">10-digit eSewa number for payments</p>
                    </div>
                  </div>
                </div>

                {/* Security Settings */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                    <Shield className="h-5 w-5 mr-2 text-teal-600" />
                    Security & Account
                  </h2>

                  <div className="space-y-4">
                    {/* Password Management */}
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-center">
                        <Lock className="h-5 w-5 text-gray-600 mr-3" />
                        <div>
                          <h3 className="font-medium text-gray-900">Password</h3>
                          <p className="text-sm text-gray-600">Manage your account password</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 transition-colors text-sm font-medium"
                      >
                        Change Password
                      </button>
                    </div>
                  </div>
                </div>

                {/* Save Button */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Save Changes</h3>
                      <p className="text-sm text-gray-600">Make sure to save your changes before leaving this page</p>
                    </div>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="inline-flex items-center px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="h-5 w-5 mr-2" />
                          Save Changes
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
