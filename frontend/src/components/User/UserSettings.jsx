"use client"

import { useContext, useState } from "react"
import { Save, User, Lock, Upload, AlertCircle } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { AuthContext } from "../../middleware/AuthContext"
import toast from "react-hot-toast"
import { useUploadImage } from "../Functions/UploadImage"
import { useMutation } from "@apollo/client"
import { UPDATE_USER_DETAILS } from "../Graphql/mutations/UserGql"

const UserSettingsPage = () => {
  const { user, loading,refreshUser } = useContext(AuthContext)
   const { uploadImage } = useUploadImage ();
  const navigate = useNavigate()

  const [updateUserDetails]  = useMutation(UPDATE_USER_DETAILS)

  const [personalInfo, setPersonalInfo] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
  })

  const [profileImage, setProfileImage] = useState(user?.profileImg?.secure_url || null)
  const [profileImagePreview, setProfileImagePreview] = useState(user?.profileImg?.secure_url || null)
  const [errors, setErrors] = useState({})

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
      e.target.value = null // Reset the input
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrors({ ...errors, profileImage: "Image size should be less than 5MB" })
      e.target.value = null // Reset the input
      return
    }

    // If validation passes, set the image
    setProfileImage(file)
    setProfileImagePreview(URL.createObjectURL(file))
  }

  const validateForm = () => {
    const newErrors = {}

    // Validate name
    if (!personalInfo.name || personalInfo.name.trim() === "") {
      newErrors.name = "Name is required"
    }

    // Validate email
    if (!personalInfo.email || personalInfo.email.trim() === "") {
      newErrors.email = "Email is required"
    } else if (!/^[a-zA-Z][a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(personalInfo.email)) {
      newErrors.email = "Invalid email format. Email should not start with a number."
    }

    // Validate phone
    if (!personalInfo.phone || personalInfo.phone.trim() === "") {
      newErrors.phone = "Phone number is required"
    } else if (!/^\d{10}$/.test(personalInfo.phone.replace(/\D/g, ""))) {
      newErrors.phone = "Phone number should be 10 digits"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit =async (e) => {
    e.preventDefault()

    if (validateForm()) {

      toast.promise(
        (async () => {
          try {
            let profileImgData = null;
      
            if (profileImage) {
              profileImgData = await uploadImage(
                profileImage,
                import.meta.env.VITE_SIGNED_UPLOAD_PRESET,
                import.meta.env.VITE_UPLOAD_USER_IMAGE_FOLDER
              );
              
              if (!profileImgData ) {
                throw new Error("Failed to upload image");
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
                : null;
      
            const pfpImageWithoutTypename = extractImageData(profileImgData);
      
            const response = await updateUserDetails({
              variables: {
                input: {
                  name: personalInfo.name,
                  email: personalInfo.email,
                  phone: personalInfo.phone,
                  profileImg: pfpImageWithoutTypename,
                },
              },
            });
      
            const { success, message } = response.data?.updateUserDetails;
      
            if (!success) throw new Error("Failed to update, try again later");
            
          } catch (error) {
            console.error("Update error:", error);
            throw error;
          }
        })(),
        {
          loading: "Updating...",
          success: "Updated successfully!",
          error: "Failed to update. Please try again.",
        }
      ).then(() => {
        refreshUser();        
      });
      
    } else {
      console.log("Form has validation errors")
    }
  }

  if (loading) return <div>Loading...</div>

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Account Settings</h1>
      {user?.roleApprovalStatus === "PENDING" && (
        <div className="mb-4 p-4 bg-yellow-100 text-yellow-800 rounded-md">
          Your form is in review.
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Profile Picture Upload */}
        <section aria-labelledby="profile-picture-heading">
          <h2 id="profile-picture-heading" className="text-xl font-semibold mb-4 flex items-center">
            <User className="mr-2" />
            Profile Picture
          </h2>
          <div className="flex flex-col items-center space-y-4">
            <div className="relative h-32 w-32 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center border border-gray-300">
              {profileImagePreview ? (
                <img
                  src={profileImagePreview || "/placeholder.svg"}
                  alt={personalInfo.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <User className="h-16 w-16 text-gray-400" />
              )}
            </div>

            <div className="flex flex-col items-center">
              <label
                htmlFor="profile-image"
                className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
              >
                <Upload className="h-4 w-4" />
                Upload Photo
                <input
                  id="profile-image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
              {errors.profileImage && (
                <div className="mt-2 flex items-center text-sm text-red-600">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.profileImage}
                </div>
              )}
              <p className="mt-1 text-xs text-gray-500">Allowed formats: JPEG, PNG, GIF. Max size: 5MB</p>
            </div>
          </div>
        </section>

        {/* Personal Information */}
        <section aria-labelledby="personal-info-heading">
          <h2 id="personal-info-heading" className="text-xl font-semibold mb-4 flex items-center">
            <User className="mr-2" />
            Personal Information
          </h2>
          <div className="grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Full name
              </label>
              <input
                type="text"
                name="name"
                id="name"
                value={personalInfo.name}
                onChange={handlePersonalInfoChange}
                className={`mt-1 block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                  errors.name ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.name && (
                <div className="mt-1 flex items-center text-sm text-red-600">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.name}
                </div>
              )}
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
                className={`mt-1 block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                  errors.email ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.email && (
                <div className="mt-1 flex items-center text-sm text-red-600">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.email}
                </div>
              )}
              <p className="mt-1 text-xs text-gray-500">Email should not start with a number</p>
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
                className={`mt-1 block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                  errors.phone ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.phone && (
                <div className="mt-1 flex items-center text-sm text-red-600">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.phone}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Password Change */}
        <section aria-labelledby="password-heading">
          <h2 id="password-heading" className="text-xl font-semibold mb-4 flex items-center">
            <Lock className="mr-2" />
            Password
          </h2>
          <button
            type="button"
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Change Password
          </button>
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
      <div className="mt-8 flex">
        {user?.roleApprovalStatus !== "PENDING" && (
          <button
            onClick={() => navigate(user?.role === "VenueOwner" ? "/dashboard" : "/home/BecomeVenueOwner")}
            className="px-6 py-2 text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            {user?.role === "VenueOwner" ? "Go To Dashboard" : "Register as Venue Owner"}
          </button>
        )}
      </div>
    </div>
  )
}

export default UserSettingsPage
