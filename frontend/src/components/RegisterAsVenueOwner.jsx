import { useContext, useState } from "react";
import { User, Mail, Phone, Building, FileText, MapPin, Upload } from "lucide-react";
import { useUploadImage } from "./Functions/UploadImage";
import { AuthContext } from "../middleware/AuthContext";
import toast from "react-hot-toast";
import { useMutation } from "@apollo/client";
import { UPDATE_TO_VENUE_OWNER } from "./Graphql/mutations/updateUserGql";
import { useNavigate } from "react-router-dom";

const BecomeVenueOwnerPage = () => {
  const { user} = useContext(AuthContext);
  const [updateToVenueOwner] = useMutation(UPDATE_TO_VENUE_OWNER);
  const { uploadImage } = useUploadImage();
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email,
    phone: user?.phone || "",
    companyName: "",
    description: "",
    governmentId: null,
    profilePicture: null,
    address: "",
    eSewaId: "",
    termsAccepted: false,
  });

  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (files && files.length > 0) {
      setFormData((prev) => ({ ...prev, [name]: files[0] }));
      if (errors[name]) {
        setErrors((prev) => ({ ...prev, [name]: "" }));
      }
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
    if (!formData.companyName.trim()) newErrors.companyName = "Company name is required";
    if (!formData.description.trim()) newErrors.description = "Description is required";
    if (!formData.governmentId) newErrors.governmentId = "Government ID is required";
    if (!formData.address.trim()) newErrors.address = "Address is required";
    if (!formData.eSewaId.trim()) newErrors.eSewaId = "eSewa ID is required";
    if (!formData.termsAccepted) newErrors.termsAccepted = "You must accept the Terms and Conditions";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      console.log("Form has errors");
      return;
    }

    toast.promise(
      (async () => {
        try {
          let profileImgData = null;
          let legalDocImgData = null;
    
          if (formData.profilePicture && formData.governmentId) {
            profileImgData = await uploadImage(
              formData.profilePicture,
              import.meta.env.VITE_SIGNED_UPLOAD_PRESET,
              import.meta.env.VITE_UPLOAD_USER_IMAGE_FOLDER
            );
    
            legalDocImgData = await uploadImage(
              formData.governmentId, // Fix: Upload the correct file
              import.meta.env.VITE_SIGNED_UPLOAD_PRESET,
              import.meta.env.VITE_UPLOAD_USER_DOCS_IMAGE_FOLDER
            );
    
            if (!profileImgData || !legalDocImgData) {
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
          const govIdImageWithoutTypename = extractImageData(legalDocImgData);
    
          const response = await updateToVenueOwner({
            variables: {
              input: {
                name: formData.name,
                email: formData.email,
                description: formData.description,
                phone: formData.phone,
                address: formData.address,
                profileImg: pfpImageWithoutTypename,
                legalDocImg: govIdImageWithoutTypename,
                esewaId: formData.eSewaId,
                companyName: formData.companyName,
              },
            },
          });
    
          const { success, message } = response.data?.updateToVenueOwner;
    
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
      setFormData({
        name: "",
        email: "",
        phone: "",
        companyName: "",
        description: "",
        governmentId: null,
        profilePicture: null,
        address: "",
        eSewaId: "",
        termsAccepted: false,
      });
      navigate('/Dashboard')
    });
    
  };


  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-6">Become a Venue Owner</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {/* Name Input */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Full Name
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-400" aria-hidden="true" />
              </div>
              <input
                type="text"
                name="name"
                id="name"
                className={`focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md ${
                  errors.name ? "border-red-500" : ""
                }`}
                placeholder="John Doe"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>
            {errors.name && <p className="mt-2 text-sm text-red-600">{errors.name}</p>}
          </div>

          {/* Email Input */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" aria-hidden="true" />
              </div>
              <input
                type="email"
                name="email"
                id="email"
                className={`focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md ${
                  errors.email ? "border-red-500" : ""
                }`}
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>
            {errors.email && <p className="mt-2 text-sm text-red-600">{errors.email}</p>}
          </div>

          {/* Phone Input */}
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
              Phone Number
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Phone className="h-5 w-5 text-gray-400" aria-hidden="true" />
              </div>
              <input
                type="tel"
                name="phone"
                id="phone"
                className={`focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md ${
                  errors.phone ? "border-red-500" : ""
                }`}
                placeholder="+977XXXXXXXXXX"
                value={formData.phone}
                onChange={handleInputChange}
                required
              />
            </div>
            {errors.phone && <p className="mt-2 text-sm text-red-600">{errors.phone}</p>}
          </div>

          {/* Company Name Input */}
          <div>
            <label htmlFor="companyName" className="block text-sm font-medium text-gray-700">
              Company Name
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Building className="h-5 w-5 text-gray-400" aria-hidden="true" />
              </div>
              <input
                type="text"
                name="companyName"
                id="companyName"
                className={`focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md ${
                  errors.companyName ? "border-red-500" : ""
                }`}
                placeholder="Awesome Venues Inc."
                value={formData.companyName}
                onChange={handleInputChange}
                required
              />
            </div>
            {errors.companyName && <p className="mt-2 text-sm text-red-600">{errors.companyName}</p>}
          </div>
        </div>


        {/* Location Address Fields */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700">
               Address
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MapPin className="h-5 w-5 text-gray-400" aria-hidden="true" />
              </div>
              <input
                type="text"
                name="address"
                id="address"
                className={`focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md ${
                  errors.address ? "border-red-500" : ""
                }`}
                placeholder="123 Main St"
                value={formData.address}
                onChange={handleInputChange}
                required
              />
            </div>
            {errors.address && <p className="mt-2 text-sm text-red-600">{errors.address}</p>}
          </div>
        </div>

                {/* Description Textarea */}
                <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Description of Your Venue Services
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 pt-3 flex items-start pointer-events-none">
              <FileText className="h-5 w-5 text-gray-400" aria-hidden="true" />
            </div>
            <textarea
              name="description"
              id="description"
              rows={4}
              className={`focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md ${
                errors.description ? "border-red-500" : ""
              }`}
              placeholder="Tell us about your venues and services..."
              value={formData.description}
              onChange={handleInputChange}
              required
            />
          </div>
          {errors.description && <p className="mt-2 text-sm text-red-600">{errors.description}</p>}
        </div>

        {/* Government-issued ID Upload */}
        <div>
          <label htmlFor="governmentId" className="block text-sm font-medium text-gray-700">
            Government-issued ID
          </label>
          <div className="mt-1 flex items-center">
            <input
              type="file"
              name="governmentId"
              id="governmentId"
              accept="image/*,.pdf"
              onChange={handleFileChange}
              className="sr-only"
              required
            />
            <label
              htmlFor="governmentId"
              className={`cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                errors.governmentId ? "border-red-500" : ""
              }`}
            >
              <Upload className="h-5 w-5 inline-block mr-2" />
              Upload ID
            </label>
            <span className="ml-3 text-sm text-gray-500">
              {formData.governmentId ? formData.governmentId.name : "No file chosen"}
            </span>
          </div>
          {errors.governmentId && <p className="mt-2 text-sm text-red-600">{errors.governmentId}</p>}
        </div>

        {/* Profile Picture Upload */}
        <div>
          <label htmlFor="profilePicture" className="block text-sm font-medium text-gray-700">
            Profile Picture
          </label>
          <div className="mt-1 flex items-center">
            <input
              type="file"
              name="profilePicture"
              id="profilePicture"
              accept="image/*"
              onChange={handleFileChange}
              className="sr-only"
            />
            <label
              htmlFor="profilePicture"
              className="cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <User className="h-5 w-5 inline-block mr-2" />
              Upload Profile Picture
            </label>
            <span className="ml-3 text-sm text-gray-500">
              {formData.profilePicture ? formData.profilePicture.name : "No file chosen"}
            </span>
          </div>
        </div>


        {/* eSewa ID */}
        <div>
          <label htmlFor="eSewaId" className="block text-sm font-medium text-gray-700">
            eSewa ID
          </label>
          <input
            type="text"
            name="eSewaId"
            id="eSewaId"
            className={`mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md ${
              errors.eSewaId ? "border-red-500" : ""
            }`}
            placeholder="Your eSewa ID"
            value={formData.eSewaId}
            onChange={handleInputChange}
            required
          />
          {errors.eSewaId && <p className="mt-2 text-sm text-red-600">{errors.eSewaId}</p>}
        </div>

        {/* Terms and Conditions Checkbox */}
        <div className="flex items-center">
          <input
            id="termsAccepted"
            name="termsAccepted"
            type="checkbox"
            className={`h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded ${
              errors.termsAccepted ? "border-red-500" : ""
            }`}
            checked={formData.termsAccepted}
            onChange={handleInputChange}
            required
          />
          <label htmlFor="termsAccepted" className="ml-2 block text-sm text-gray-900">
            I agree to the{" "}
            <a href="#" className="text-blue-600 hover:text-blue-500">
              Terms and Conditions
            </a>
          </label>
        </div>
        {errors.termsAccepted && <p className="mt-2 text-sm text-red-600">{errors.termsAccepted}</p>}

        {/* Submit Button */}
        <div>
          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Register as Venue Owner
          </button>
        </div>
      </form>
    </div>
  )
}

export default BecomeVenueOwnerPage

