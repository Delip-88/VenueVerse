import React, { useContext, useState } from "react"
import { Lock, Save } from "lucide-react"
import { AuthContext } from "../../middleware/AuthContext"
import { useMutation } from "@apollo/client"
import { UPDATE_USER_DETAILS } from "../Graphql/mutations/updateUserGql"
import toast from "react-hot-toast"

export default function SettingsPage() {
  const {user,refetch} = useContext(AuthContext)
  const [personalInfo, setPersonalInfo] = useState({
    fullName: user?.name,
    email: user?.email,
    phone: user?.phone || "",
    esewaId: user?.esewaId || ""
  })

  const [errors, setErrors] = useState({})
  const [updateDetails] = useMutation(UPDATE_USER_DETAILS)
  const handlePersonalInfoChange = (e) => {
    setPersonalInfo({ ...personalInfo, [e.target.name]: e.target.value })
  }


  const validateForm = () => {
    const formErrors = {}

    // Validate personal info
    if (!personalInfo.fullName.trim()) formErrors.fullName = "First name is required"
    if (!personalInfo.email.trim()) formErrors.email = "Email is required"
    else if (!/\S+@\S+\.\S+/.test(personalInfo.email)) formErrors.email = "Email is invalid"
    if (!personalInfo.phone.trim()) formErrors.phone = "Phone number is required"


    setErrors(formErrors)
    return Object.keys(formErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (validateForm()) {
      try {
        // Use toast.promise and await updatePromise
        const response = await toast.promise(
          updateDetails({
            variables: {
              input: {
                name: personalInfo.fullName,
                email: personalInfo.email,
                phone: personalInfo.phone,
                esewaId: personalInfo.esewaId
              }
            }
          }),
          {
            pending: "Updating details...",
            success: "Updated successfully! 🎉",
            error: "Failed to update details. ❌"
          }
        );
  
        // Extract response data
        const { success } = response.data?.updateUserDetails;
  
        // If update failed, show toast error
        if (!success) {
          return toast.error("Failed to update details");
        }
  
        // Update context state
        setUser((prev) => ({
          ...prev,
          name: personalInfo.fullName,
          email: personalInfo.email,
          phone: personalInfo.phone,
          esewaId: personalInfo.esewaId
        }));
  
        // Refetch the updated data
        refetch();
  
      } catch (err) {
        console.error("Unexpected error:", err);
      }
    } else {
      console.log("Form has errors");
    }
  };
  
  

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
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                Full name
              </label>
              <input
                type="text"
                name="fullName"
                id="fullName"
                value={personalInfo.fullName}
                onChange={handlePersonalInfoChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
              {errors.fullName && <p className="mt-2 text-sm text-red-600">{errors.fullName}</p>}
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
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                Esewa Number
              </label>
              <input
                type="tel"
                name="esewaId"
                id="esewaId"
                value={personalInfo.esewaId}
                onChange={handlePersonalInfoChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
              {errors.esewaId && <p className="mt-2 text-sm text-red-600">{errors.esewaId}</p>}
            </div>
          </div>
        </section>

        {/* Security Settings */}
        {/* Password Change */}
        <section aria-labelledby="password-heading">
          <h2
            id="password-heading"
            className="text-xl font-semibold mb-4 flex items-center"
          >
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
    </div>
  )
}

