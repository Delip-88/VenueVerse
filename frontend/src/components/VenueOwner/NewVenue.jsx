"use client"

import { useState, useEffect } from "react"
import { PlusCircle, X, Upload, Trash2 } from "lucide-react"

const AddNewVenue = () => {
  const [venue, setVenue] = useState({
    name: "",
    description: "",
    location: "",
    price: "",
    capacity: "",
    facilities: [],
    images: [],
  })

  const [facility, setFacility] = useState("")
  const [imagePreviews, setImagePreviews] = useState([])

  useEffect(() => {
    // Clean up object URLs when component unmounts
    return () => {
      imagePreviews.forEach((preview) => URL.revokeObjectURL(preview.url))
    }
  }, [imagePreviews])

  const handleChange = (e) => {
    const { name, value } = e.target
    setVenue((prev) => ({ ...prev, [name]: value }))
  }

  const handleFacilityAdd = () => {
    if (facility.trim()) {
      setVenue((prev) => ({ ...prev, facilities: [...prev.facilities, facility.trim()] }))
      setFacility("")
    }
  }

  const handleFacilityRemove = (index) => {
    setVenue((prev) => ({
      ...prev,
      facilities: prev.facilities.filter((_, i) => i !== index),
    }))
  }

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files)
    setVenue((prev) => ({ ...prev, images: [...prev.images, ...files] }))

    const newPreviews = files.map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }))
    setImagePreviews((prev) => [...prev, ...newPreviews])
  }

  const handleImageRemove = (index) => {
    setVenue((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }))

    URL.revokeObjectURL(imagePreviews[index].url)
    setImagePreviews((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log("Submitting venue:", venue)
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Add New Venue</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={venue.name}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={venue.description}
            onChange={handleChange}
            rows="3"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          ></textarea>
        </div>

        <div>
          <label htmlFor="location" className="block text-sm font-medium text-gray-700">
            Location
          </label>
          <input
            type="text"
            id="location"
            name="location"
            value={venue.location}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          />
        </div>

        <div>
          <label htmlFor="price" className="block text-sm font-medium text-gray-700">
            Price per Hour
          </label>
          <input
            type="number"
            id="price"
            name="price"
            value={venue.price}
            onChange={handleChange}
            required
            min="0"
            step="0.01"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          />
        </div>

        <div>
          <label htmlFor="capacity" className="block text-sm font-medium text-gray-700">
            Capacity
          </label>
          <input
            type="number"
            id="capacity"
            name="capacity"
            value={venue.capacity}
            onChange={handleChange}
            required
            min="1"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Facilities</label>
          <div className="flex items-center mt-1">
            <input
              type="text"
              value={facility}
              onChange={(e) => setFacility(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              placeholder="Add a facility"
            />
            <button
              type="button"
              onClick={handleFacilityAdd}
              className="ml-2 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <PlusCircle className="h-4 w-4 mr-1" /> Add
            </button>
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {venue.facilities.map((fac, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
              >
                {fac}
                <button
                  type="button"
                  onClick={() => handleFacilityRemove(index)}
                  className="ml-1 inline-flex items-center justify-center h-4 w-4 rounded-full bg-indigo-200 text-indigo-500 hover:bg-indigo-300"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Images</label>
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
            <div className="space-y-1 text-center">
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <div className="flex text-sm text-gray-600">
                <label
                  htmlFor="images"
                  className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                >
                  <span>Upload images</span>
                  <input
                    id="images"
                    name="images"
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="sr-only"
                  />
                </label>
                <p className="pl-1">or drag and drop</p>
              </div>
              <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
            </div>
          </div>
          {imagePreviews.length > 0 && (
            <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
              {imagePreviews.map((preview, index) => (
                <div key={index} className="relative group">
                  <img
                    src={preview.url || "/placeholder.svg"}
                    alt={`Preview ${index + 1}`}
                    className="h-24 w-24 object-cover rounded-md"
                  />
                  <button
                    type="button"
                    onClick={() => handleImageRemove(index)}
                    className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 transform translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label={`Remove image ${index + 1}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Add Venue
          </button>
        </div>
      </form>
    </div>
  )
}

export default AddNewVenue

