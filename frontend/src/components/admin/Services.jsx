"use client"

import { useState } from "react"
import { useQuery, useMutation } from "@apollo/client"

import { Plus, Trash2, Upload, X, Loader2, AlertCircle, ImageIcon, RefreshCw } from "lucide-react"
import toast from "react-hot-toast"
import { ADD_SERVICE, DELETE_SERVICE, GET_ALL_SERVICES } from "../Graphql/query/AdminQuery"
import { useUploadImage } from "../Functions/UploadImage"

export default function AdminServices() {
  const [showAddModal, setShowAddModal] = useState(false)
  const [serviceName, setServiceName] = useState("")
  const [serviceImage, setServiceImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [isUploading, setIsUploading] = useState(false)

  // GraphQL queries and mutations
  const { data, loading, error, refetch } = useQuery(GET_ALL_SERVICES)
  const [addService, { loading: addLoading }] = useMutation(ADD_SERVICE)
  const [deleteService, { loading: deleteLoading }] = useMutation(DELETE_SERVICE)
     const { uploadImage } = useUploadImage ();

  // Handle image selection
  const handleImageChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      setServiceImage(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!serviceName.trim()) {
      toast.error("Service name is required")
      return
    }

    if (!serviceImage) {
      toast.error("Service image is required")
      return
    }

    try {
      setIsUploading(true)

      let ImageData = null;
      
      if (serviceImage) {
        ImageData = await uploadImage(
          serviceImage,
          import.meta.env.VITE_SIGNED_UPLOAD_PRESET,
          import.meta.env.VITE_UPLOAD_USER_IMAGE_FOLDER
        );
        
        if (!ImageData ) {
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

      const ImageWithoutTypename = extractImageData(ImageData);

      // Then create the service with the uploaded image
      const { data } = await addService({
        variables: {
          name: serviceName,
          image:ImageWithoutTypename
        },
      })

      if (data?.addService) {
        toast.success("Service added successfully")
        setShowAddModal(false)
        setServiceName("")
        setServiceImage(null)
        setImagePreview(null)
        refetch()
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add service")
    } finally {
      setIsUploading(false)
    }
  }

  // Handle service deletion
  const handleDeleteService = async (id) => {
    if (window.confirm("Are you sure you want to delete this service?")) {
      try {
        const { data } = await deleteService({
          variables: { id },
        })

        if (data?.deleteService) {
          toast.success("Service deleted successfully")
          refetch()
        }
      } catch (err) {
        toast.error("Failed to delete service")
      }
    }
  }

  // Reset form when modal is closed
  const closeModal = () => {
    setShowAddModal(false)
    setServiceName("")
    setServiceImage(null)
    setImagePreview(null)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Services Management</h1>
            <p className="mt-1 text-sm text-gray-500">Manage the services offered on your platform</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => refetch()}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Service
            </button>
          </div>
        </div>

        {/* Error state */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">Error loading services. Please try refreshing the page.</p>
              </div>
            </div>
          </div>
        )}

        {/* Loading state */}
        {loading && (
          <div className="flex justify-center items-center h-64">
            <div className="flex flex-col items-center">
              <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
              <p className="mt-2 text-gray-500">Loading services...</p>
            </div>
          </div>
        )}

        {/* Empty state */}
        {!loading && data?.services?.length === 0 && (
          <div className="bg-white shadow rounded-lg p-12 text-center">
            <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">No services found</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by adding a new service.</p>
            <div className="mt-6">
              <button
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Service
              </button>
            </div>
          </div>
        )}

        {/* Services grid */}
        {!loading && data?.services?.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {data.services.map((service) => (
              <div key={service.id} className="bg-white rounded-lg shadow overflow-hidden">
                <div className="h-48 w-full relative">
                  <img
                    src={service.image.secure_url || "/placeholder.svg"}
                    alt={service.name}
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={() => handleDeleteService(service.id)}
                    disabled={deleteLoading}
                    className="absolute top-2 right-2 p-1.5 bg-red-100 rounded-full text-red-600 hover:bg-red-200 focus:outline-none"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-medium text-gray-900">{service.name}</h3>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add Service Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Add New Service</h3>
                <button onClick={closeModal} className="text-gray-400 hover:text-gray-500 focus:outline-none">
                  <X className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label htmlFor="serviceName" className="block text-sm font-medium text-gray-700 mb-1">
                    Service Name
                  </label>
                  <input
                    type="text"
                    id="serviceName"
                    value={serviceName}
                    onChange={(e) => setServiceName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter service name"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Service Image</label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                    {imagePreview ? (
                      <div className="w-full relative">
                        <img
                          src={imagePreview || "/placeholder.svg"}
                          alt="Preview"
                          className="mx-auto h-32 object-cover rounded-md"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setServiceImage(null)
                            setImagePreview(null)
                          }}
                          className="absolute top-0 right-0 -mt-2 -mr-2 bg-red-100 rounded-full p-1 text-red-600 hover:bg-red-200 focus:outline-none"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-1 text-center">
                        <Upload className="mx-auto h-12 w-12 text-gray-400" />
                        <div className="flex text-sm text-gray-600">
                          <label
                            htmlFor="serviceImage"
                            className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none"
                          >
                            <span>Upload an image</span>
                            <input
                              id="serviceImage"
                              name="serviceImage"
                              type="file"
                              accept="image/*"
                              className="sr-only"
                              onChange={handleImageChange}
                              required
                            />
                          </label>
                          <p className="pl-1">or drag and drop</p>
                        </div>
                        <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-5 sm:mt-6">
                  <button
                    type="submit"
                    disabled={addLoading || isUploading}
                    className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    {(addLoading || isUploading) && <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />}
                    {addLoading || isUploading ? "Adding..." : "Add Service"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
